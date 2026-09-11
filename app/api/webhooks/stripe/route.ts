import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { stripe } from "@/lib/payments/stripe";
import { env } from "@/config/env";
import { fulfillOrder, refundOrderByPaymentIntent } from "@/features/orders/actions";
import {
  stripePaymentIntentWebhookSchema,
  stripeChargeRefundedWebhookSchema,
} from "@/features/orders/schemas";
import type Stripe from "stripe";

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
    await fulfillOrder(metadata.orderId, event.id);
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
      await refundOrderByPaymentIntent(paymentIntentId, event.id, reason);
    }
  }

  return NextResponse.json({ received: true });
}
