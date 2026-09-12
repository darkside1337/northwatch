import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  orders,
  orderItems,
  productVariants,
  processedWebhookEvents,
} from "@/lib/db/schema";

// Stripe network boundary is mocked; Postgres stays real so the
// cancel-path status gate + idempotency key are exercised for real.
const stripeMocks = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  retrieve: vi.fn(),
  refundsCreate: vi.fn(),
}));

vi.mock("@/lib/payments/stripe", () => ({
  stripe: {
    webhooks: { constructEvent: stripeMocks.constructEvent },
    paymentIntents: { retrieve: stripeMocks.retrieve },
    refunds: { create: stripeMocks.refundsCreate },
  },
}));

import { POST } from "../route";
import type { NextRequest } from "next/server";

function webhookRequest(): NextRequest {
  return new Request("http://localhost/api/webhooks/stripe", {
    method: "POST",
    body: "{}",
    headers: { "stripe-signature": "t=1,v1=test" },
  }) as unknown as NextRequest;
}

describe("Stripe webhook route: oversell redelivery", { timeout: 35000 }, () => {
  let variantId: string;
  let productId: string;
  const orderId = crypto.randomUUID();
  const eventId = `evt_guard_redelivery_${Date.now()}`;
  const paymentIntentId = `pi_guard_redelivery_${Date.now()}`;
  const totalCents = 79365;

  beforeAll(async () => {
    const variant = await db.query.productVariants.findFirst({
      where: eq(productVariants.sku, "NW-01-FLD-BLK-CAN"),
    });
    if (!variant) throw new Error("Seed variant NW-01-FLD-BLK-CAN not found");
    variantId = variant.id;
    productId = variant.productId;

    // Order MORE than current stock so fulfillment deterministically hits
    // OUT_OF_STOCK. Shared seed stock is never mutated by this file, so it
    // stays safe to run in parallel with other DB-backed suites.
    const oversellQty = variant.stock + 5;

    await db.insert(orders).values({
      id: orderId,
      email: "redelivery-test@northwatch.ch",
      status: "pending_payment",
      subtotalCents: 74000,
      discountCents: 0,
      shippingCents: 0,
      taxCents: 5365,
      totalCents,
      shippingTierId: "standard",
      shippingAddress: {
        firstName: "Redelivery",
        lastName: "Test",
        street: "Bahnhofstrasse 1",
        city: "Zurich",
        state: "ZH",
        postalCode: "8001",
        country: "CH",
      },
      stripePaymentIntentId: paymentIntentId,
    });
    await db.insert(orderItems).values({
      id: crypto.randomUUID(),
      orderId,
      productId,
      variantId,
      quantity: oversellQty,
      unitPriceCents: 74000,
      title: "Redelivery Test",
      variantName: "Redelivery Variant",
    });

    stripeMocks.constructEvent.mockReturnValue({
      id: eventId,
      type: "payment_intent.succeeded",
      data: { object: { id: paymentIntentId, metadata: { orderId } } },
    });
    stripeMocks.retrieve.mockResolvedValue({
      id: paymentIntentId,
      status: "succeeded",
      amount: totalCents,
      metadata: { orderId },
    });
    stripeMocks.refundsCreate.mockResolvedValue({ id: "re_guard_1", status: "succeeded" });
  });

  afterAll(async () => {
    await db.delete(orderItems).where(eq(orderItems.orderId, orderId));
    await db.delete(orders).where(eq(orders.id, orderId));
    await db.delete(processedWebhookEvents).where(
      inArray(processedWebhookEvents.id, [eventId])
    );
    vi.restoreAllMocks();
  });

  it("delivers the same evt_* twice but calls stripe.refunds.create exactly once", async () => {
    const first = await POST(webhookRequest());
    expect(first.status).toBe(200);
    expect(await first.json()).toMatchObject({ received: true, oversold: true, canceled: true });

    // Second delivery short-circuits inside fulfillOrder's conditional
    // status transition (order is no longer pending) and never reaches the
    // cancel path — so no second refund is even attempted.
    const second = await POST(webhookRequest());
    expect(second.status).toBe(200);
    expect(await second.json()).toMatchObject({ received: true });

    // THE regression assertion: status gate + idempotency key mean one refund,
    // not one per delivery. A second refunds.create would double-refund.
    expect(stripeMocks.refundsCreate).toHaveBeenCalledTimes(1);
    expect(stripeMocks.refundsCreate).toHaveBeenCalledWith(
      { payment_intent: paymentIntentId },
      { idempotencyKey: `refund_${orderId}_oos_cancel` }
    );

    const order = await db.query.orders.findFirst({ where: eq(orders.id, orderId) });
    expect(order?.status).toBe("canceled");
  });
});

describe("Stripe webhook route: amount mismatch", { timeout: 35000 }, () => {
  const orderId = crypto.randomUUID();
  const eventId = `evt_guard_mismatch_${Date.now()}`;
  const paymentIntentId = `pi_guard_mismatch_${Date.now()}`;
  const totalCents = 79365;

  beforeAll(async () => {
    const variant = await db.query.productVariants.findFirst({
      where: eq(productVariants.sku, "NW-01-FLD-BLK-CAN"),
    });
    if (!variant) throw new Error("Seed variant NW-01-FLD-BLK-CAN not found");

    await db.insert(orders).values({
      id: orderId,
      email: "mismatch-test@northwatch.ch",
      status: "pending_payment",
      subtotalCents: 74000,
      discountCents: 0,
      shippingCents: 0,
      taxCents: 5365,
      totalCents,
      shippingTierId: "standard",
      shippingAddress: {
        firstName: "Mismatch",
        lastName: "Test",
        street: "Bahnhofstrasse 1",
        city: "Zurich",
        state: "ZH",
        postalCode: "8001",
        country: "CH",
      },
      stripePaymentIntentId: paymentIntentId,
    });
    await db.insert(orderItems).values({
      id: crypto.randomUUID(),
      orderId,
      productId: variant.productId,
      variantId: variant.id,
      quantity: 1,
      unitPriceCents: 74000,
      title: "Mismatch Test",
      variantName: "Mismatch Variant",
    });
  });

  afterAll(async () => {
    await db.delete(orderItems).where(eq(orderItems.orderId, orderId));
    await db.delete(orders).where(eq(orders.id, orderId));
    await db.delete(processedWebhookEvents).where(
      inArray(processedWebhookEvents.id, [eventId])
    );
  });

  it("returns 400 and leaves the order pending when the PI amount differs", async () => {
    stripeMocks.constructEvent.mockReturnValue({
      id: eventId,
      type: "payment_intent.succeeded",
      data: { object: { id: paymentIntentId, metadata: { orderId } } },
    });
    // Charged 1000c against a 79365c order — must never fulfill.
    stripeMocks.retrieve.mockResolvedValue({
      id: paymentIntentId,
      status: "succeeded",
      amount: 1000,
      metadata: { orderId },
    });

    const res = await POST(webhookRequest());
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: "Payment amount mismatch" });

    const order = await db.query.orders.findFirst({ where: eq(orders.id, orderId) });
    expect(order?.status).toBe("pending_payment");
  });
});
