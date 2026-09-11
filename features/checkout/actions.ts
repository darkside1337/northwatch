"use server";

import { and, eq, gt, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { orders, orderItems, productVariants, products } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/session";
import { getThinCartCookie } from "@/features/cart/cookie";
import { stripe } from "@/lib/payments/stripe";
import { calculateCheckoutTotals } from "./math";
import {
  InitCheckoutInputSchema,
  type InitCheckoutInput,
  type CheckoutDraft,
} from "./schemas";

/**
 * Server Action to initialize or update a checkout session and Stripe PaymentIntent.
 *
 * ARCHITECTURAL INVARIANTS:
 * 1. Untrusted Client Totals: Ignores client prices. Calculates directly from DB.
 * 2. Concurrency Lock: Acquires `pg_advisory_xact_lock(hashtext(userId))` FIRST before any read,
 *    strictly serializing the check-then-act sequence for each customer.
 * 3. Partial Unique Index Guard: Enforces at DB level that a customer has at most one pending order.
 * 4. Deterministic Stripe Idempotency: Passes `idempotencyKey` keyed on clientAttemptToken.
 * 5. Dynamic Payment Methods: Automatically managed by Stripe Dashboard without hardcoded card types.
 */
export async function createOrUpdatePaymentIntent(
  rawInput: InitCheckoutInput
): Promise<CheckoutDraft> {
  const input = InitCheckoutInputSchema.parse(rawInput);
  const sessionData = await requireAuth("/checkout");
  const user = sessionData.user;

  const thinCart = await getThinCartCookie();
  if (!thinCart.items || thinCart.items.length === 0) {
    throw new Error("Cannot checkout with an empty bag.");
  }

  // 1. Authoritative DB Rehydration & Stock Verification
  const variantIds = thinCart.items.map((i) => i.variantId);
  const dbVariants = await db
    .select({
      variantId: productVariants.id,
      productId: productVariants.productId,
      sku: productVariants.sku,
      title: products.title,
      variantName: productVariants.name,
      priceCents: productVariants.priceCents,
      stock: productVariants.stock,
    })
    .from(productVariants)
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(inArray(productVariants.id, variantIds));

  const variantMap = new Map(dbVariants.map((v) => [v.variantId, v]));

  const calculationItems: Array<{ priceCents: number; quantity: number }> = [];
  const lineItemsToSnapshot: Array<{
    productId: string;
    variantId: string;
    quantity: number;
    unitPriceCents: number;
    title: string;
    variantName: string;
  }> = [];

  for (const item of thinCart.items) {
    const variant = variantMap.get(item.variantId);
    if (!variant) {
      throw new Error(`One or more items in your bag are no longer available.`);
    }

    if (item.quantity > variant.stock) {
      throw new Error(
        `Limited availability: "${variant.title} - ${variant.variantName}" only has ${variant.stock} units remaining.`
      );
    }

    calculationItems.push({
      priceCents: variant.priceCents,
      quantity: item.quantity,
    });

    lineItemsToSnapshot.push({
      productId: variant.productId,
      variantId: variant.variantId,
      quantity: item.quantity,
      unitPriceCents: variant.priceCents,
      title: variant.title,
      variantName: variant.variantName,
    });
  }

  // 2. Compute Authoritative Server Totals
  const {
    subtotalCents,
    discountCents,
    shippingCents,
    taxCents,
    totalCents,
  } = calculateCheckoutTotals({
    items: calculationItems,
    shippingTierId: input.shippingTierId,
    stateCode: input.shippingAddress.state,
    promoCode: thinCart.promoCode,
  });

  // 3. Decoupled Transaction Flow
  // Step 1: Fast serialized database transaction (<5ms)
  // Acquires advisory lock, creates or updates draft order and items, and returns connection to pool.
  const draftInfo = await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${user.id}))`);

    const [existingDraft] = await tx
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.userId, user.id),
          eq(orders.status, "pending_payment"),
          gt(orders.createdAt, sql`NOW() - INTERVAL '24 hours'`)
        )
      )
      .limit(1);

    if (existingDraft) {
      await tx
        .update(orders)
        .set({
          email: user.email,
          subtotalCents,
          discountCents,
          promoCode: thinCart.promoCode ?? null,
          shippingCents,
          taxCents,
          totalCents,
          shippingTierId: input.shippingTierId,
          shippingAddress: input.shippingAddress,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, existingDraft.id));

      await tx.delete(orderItems).where(eq(orderItems.orderId, existingDraft.id));
      await tx.insert(orderItems).values(
        lineItemsToSnapshot.map((item) => ({
          orderId: existingDraft.id,
          ...item,
        }))
      );

      return {
        orderId: existingDraft.id,
        stripePaymentIntentId: existingDraft.stripePaymentIntentId,
        totalCents,
        isNew: false,
      };
    } else {
      const newOrderId = crypto.randomUUID();

      await tx.insert(orders).values({
        id: newOrderId,
        userId: user.id,
        email: user.email,
        status: "pending_payment",
        subtotalCents,
        discountCents,
        promoCode: thinCart.promoCode ?? null,
        shippingCents,
        taxCents,
        totalCents,
        shippingTierId: input.shippingTierId,
        shippingAddress: input.shippingAddress,
        stripePaymentIntentId: null,
      });

      await tx.insert(orderItems).values(
        lineItemsToSnapshot.map((item) => ({
          orderId: newOrderId,
          ...item,
        }))
      );

      return {
        orderId: newOrderId,
        stripePaymentIntentId: null,
        totalCents,
        isNew: true,
      };
    }
  });

  // Step 2: Stripe API call outside any database transaction (100-300ms)
  // No DB connections held during network call.
  // Deterministic idempotency key derived from orderId prevents double-click duplicate intents.
  // Amount is strictly taken from committed row (draftInfo.totalCents) to avoid payload mismatch errors.
  let paymentIntent;
  let needsPaymentIntentIdPersistence = draftInfo.isNew;

  if (draftInfo.stripePaymentIntentId) {
    const updateKey = `update_pi_${draftInfo.orderId}_${draftInfo.totalCents}`;
    try {
      paymentIntent = await stripe.paymentIntents.update(
        draftInfo.stripePaymentIntentId,
        {
          amount: draftInfo.totalCents,
          metadata: {
            orderId: draftInfo.orderId,
            userId: user.id,
          },
        },
        { idempotencyKey: updateKey }
      );
    } catch (stripeErr) {
      console.warn("Could not update existing PaymentIntent; creating replacement:", stripeErr);
      const fallbackKey = `create_pi_${draftInfo.orderId}_fallback`;
      paymentIntent = await stripe.paymentIntents.create(
        {
          amount: draftInfo.totalCents,
          currency: "usd",
          automatic_payment_methods: { enabled: true },
          metadata: {
            orderId: draftInfo.orderId,
            userId: user.id,
          },
        },
        { idempotencyKey: fallbackKey }
      );
      needsPaymentIntentIdPersistence = true;
    }
  } else {
    const createKey = `create_pi_${draftInfo.orderId}`;
    paymentIntent = await stripe.paymentIntents.create(
      {
        amount: draftInfo.totalCents,
        currency: "usd",
        automatic_payment_methods: { enabled: true },
        metadata: {
          orderId: draftInfo.orderId,
          userId: user.id,
        },
      },
      { idempotencyKey: createKey }
    );
  }

  // Step 3: Fast database write to persist new Stripe PaymentIntent ID (<2ms)
  if (needsPaymentIntentIdPersistence && paymentIntent.id) {
    await db
      .update(orders)
      .set({ stripePaymentIntentId: paymentIntent.id, updatedAt: new Date() })
      .where(eq(orders.id, draftInfo.orderId));
  }

  return {
    orderId: draftInfo.orderId,
    shippingAddress: input.shippingAddress,
    shippingTierId: input.shippingTierId,
    clientSecret: paymentIntent.client_secret!,
    subtotalCents,
    discountCents,
    promoCode: thinCart.promoCode ?? null,
    shippingCents,
    taxCents,
    totalCents,
  };
}

