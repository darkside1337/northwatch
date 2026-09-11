import { and, desc, eq, gt, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { orders } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { stripe } from "@/lib/payments/stripe";
import type { CheckoutDraft, ShippingAddress } from "./schemas";
import type { ShippingTierId } from "@/config/site";

export type GetActiveDraftResult =
  | { type: "draft"; draft: CheckoutDraft }
  | { type: "redirect"; redirectTo: string }
  | { type: "none" };

/**
 * Authoritative Server Component read path.
 *
 * Checks if the customer has an active unexpired (under 24h) checkout draft.
 * Inspects the live Stripe PaymentIntent status to route accordingly:
 * - 'succeeded' / 'processing': redirects directly to confirmation receipt
 * - 'requires_payment_method': rehydrates Step 2 with existing clientSecret
 * - 'canceled': marks the draft canceled in DB and returns none
 */
export async function getActiveCheckoutDraft(): Promise<GetActiveDraftResult> {
  const sessionData = await getSession();
  if (!sessionData || !sessionData.session || !sessionData.user) {
    return { type: "none" };
  }

  const userId = sessionData.user.id;

  try {
    const [draft] = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.userId, userId),
          eq(orders.status, "pending_payment"),
          gt(orders.createdAt, sql`NOW() - INTERVAL '24 hours'`)
        )
      )
      .orderBy(desc(orders.createdAt))
      .limit(1);

    if (!draft || !draft.stripePaymentIntentId) {
      return { type: "none" };
    }

    // Retrieve live intent state directly from Stripe
    const intent = await stripe.paymentIntents.retrieve(draft.stripePaymentIntentId);

    if (intent.status === "succeeded" || intent.status === "processing") {
      return {
        type: "redirect",
        redirectTo: `/confirmation/${draft.id}`,
      };
    }

    if (intent.status === "requires_payment_method" && intent.client_secret) {
      return {
        type: "draft",
        draft: {
          orderId: draft.id,
          shippingAddress: draft.shippingAddress as ShippingAddress,
          shippingTierId: draft.shippingTierId as ShippingTierId,
          clientSecret: intent.client_secret,
          subtotalCents: draft.subtotalCents,
          discountCents: draft.discountCents,
          promoCode: draft.promoCode,
          shippingCents: draft.shippingCents,
          taxCents: draft.taxCents,
          totalCents: draft.totalCents,
        },
      };
    }

    if (intent.status === "canceled") {
      await db
        .update(orders)
        .set({ status: "canceled", updatedAt: new Date() })
        .where(eq(orders.id, draft.id));
      return { type: "none" };
    }

    return { type: "none" };
  } catch (error) {
    console.error("Error checking active checkout draft:", error);
    return { type: "none" };
  }
}
