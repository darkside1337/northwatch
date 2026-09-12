import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { stripe } from "@/lib/payments/stripe";
import { env } from "@/config/env";
import { db } from "@/lib/db/client";
import { orders } from "@/lib/db/schema";
import { fulfillOrder, refundOrderByPaymentIntent } from "@/features/orders/actions.server";
import {
  stripePaymentIntentWebhookSchema,
  stripeChargeRefundedWebhookSchema,
} from "@/features/orders/schemas";
import type Stripe from "stripe";

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: unknown }).code === "23505"
  );
}

/**
 * Idempotent oversell cancel + refund path (Phase 4).
 *
 * Invoked when fulfillOrder rolls back with OUT_OF_STOCK: the charge succeeded
 * but inventory is gone. Guards, in order:
 *  (a) status gate — fresh SELECT; skip stripe.refunds.create unless the order
 *      is still pending_payment (redelivery after cancel is a no-op);
 *  (b) deterministic idempotency key `refund_<orderId>_oos_cancel` so
 *      concurrent duplicate cancel branches produce a single refund;
 *  (c) conditional UPDATE ... WHERE status = 'pending_payment' so the state
 *      transition itself is idempotent (0 rows = already handled).
 */
async function cancelOversoldOrder(orderId: string, paymentIntentId: string) {
  const current = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    columns: { status: true },
  });

  if (!current) {
    console.error(`[Webhook] Oversold order ${orderId} not found; cannot cancel.`);
    return NextResponse.json({ received: true, oversold: true, canceled: false });
  }

  if (current.status !== "pending_payment") {
    return NextResponse.json({ received: true, alreadyProcessed: true });
  }

  try {
    await stripe.refunds.create(
      { payment_intent: paymentIntentId },
      { idempotencyKey: `refund_${orderId}_oos_cancel` }
    );
  } catch (err) {
    console.error(`[Webhook] Oversold refund failed for order ${orderId}:`, err);
    return NextResponse.json({ error: "Refund failed" }, { status: 500 });
  }

  await db
    .update(orders)
    .set({ status: "canceled", updatedAt: new Date() })
    .where(and(eq(orders.id, orderId), eq(orders.status, "pending_payment")));

  return NextResponse.json({ received: true, oversold: true, canceled: true });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Missing stripe-signature or webhook secret configuration" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("❌ Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Golden Invariant: Delegate immediately to domain features; no inline fulfillment logic
  if (event.type === "payment_intent.succeeded") {
    const parseResult = stripePaymentIntentWebhookSchema.safeParse(event.data.object);
    if (!parseResult.success) {
      console.warn("⚠️ Ignored payment_intent.succeeded webhook with missing/invalid orderId:", parseResult.error.flatten());
      return NextResponse.json({ received: true, ignored: true });
    }

    const { metadata } = parseResult.data;

    // Phase 3B: verify the charged amount against the committed order total
    // before fulfilling. Authoritative retrieve wins over the webhook copy.
    try {
      const [paymentIntent, order] = await Promise.all([
        stripe.paymentIntents.retrieve(parseResult.data.id),
        db.query.orders.findFirst({
          where: eq(orders.id, metadata.orderId),
          columns: { totalCents: true, stripePaymentIntentId: true, status: true },
        }),
      ]);

      if (!order) {
        console.warn(`⚠️ Ignored payment_intent.succeeded for unknown order ${metadata.orderId}`);
        return NextResponse.json({ received: true, ignored: true });
      }

      if (
        paymentIntent.status !== "succeeded" ||
        paymentIntent.metadata?.orderId !== metadata.orderId ||
        paymentIntent.amount !== order.totalCents
      ) {
        console.error(
          `[Webhook] Amount/status mismatch for order ${metadata.orderId}: ` +
            `pi=${paymentIntent.id} status=${paymentIntent.status} amount=${paymentIntent.amount} ` +
            `expected=${order.totalCents}`
        );
        return NextResponse.json({ error: "Payment amount mismatch" }, { status: 400 });
      }
    } catch (err) {
      console.error("[Webhook] PaymentIntent verification failed:", err);
      return NextResponse.json({ error: "Verification failed" }, { status: 500 });
    }

    try {
      const result = await fulfillOrder(metadata.orderId, event.id);
      if (!result.success && result.error?.startsWith("OUT_OF_STOCK")) {
        return await cancelOversoldOrder(metadata.orderId, parseResult.data.id);
      }
      return NextResponse.json({ received: true });
    } catch (err) {
      if (err instanceof Error && err.message.startsWith("OUT_OF_STOCK")) {
        return await cancelOversoldOrder(metadata.orderId, parseResult.data.id);
      }
      if (isUniqueViolation(err)) {
        // Lost a concurrent idempotency race — treat as duplicate delivery.
        return NextResponse.json({ received: true, alreadyProcessed: true });
      }
      console.error("[Webhook] Fulfillment failed:", err);
      return NextResponse.json({ error: "Fulfillment failed" }, { status: 500 });
    }
  } else if (event.type === "charge.refunded") {
    const parseResult = stripeChargeRefundedWebhookSchema.safeParse(event.data.object);
    if (!parseResult.success) {
      console.warn("⚠️ Ignored charge.refunded webhook with unparseable payload:", parseResult.error.flatten());
      return NextResponse.json({ received: true, ignored: true });
    }

    const charge = parseResult.data;
    const paymentIntentId =
      typeof charge.payment_intent === "string"
        ? charge.payment_intent
        : charge.payment_intent?.id;
    const reason = charge.refunds?.data?.[0]?.reason ?? undefined;

    if (paymentIntentId) {
      try {
        await refundOrderByPaymentIntent(paymentIntentId, event.id, reason);
      } catch (err) {
        if (isUniqueViolation(err)) {
          return NextResponse.json({ received: true, alreadyProcessed: true });
        }
        console.error("[Webhook] Refund failed:", err);
        return NextResponse.json({ error: "Refund failed" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
