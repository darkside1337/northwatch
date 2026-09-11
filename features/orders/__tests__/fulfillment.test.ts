import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db/client";
import {
  orders,
  orderItems,
  productVariants,
  processedWebhookEvents,
} from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { fulfillOrder, refundOrder, refundOrderByPaymentIntent } from "../actions";
import {
  orderStatusSchema,
  orderItemSchema,
  refundOrderInputSchema,
} from "../schemas";

describe("Orders Domain: Schemas & Validation", () => {
  it("validates all PostgreSQL order_status enum values", () => {
    const validStatuses = [
      "pending_payment",
      "paid",
      "shipped",
      "delivered",
      "canceled",
      "refunded",
    ];

    for (const status of validStatuses) {
      expect(orderStatusSchema.safeParse(status).success).toBe(true);
    }

    expect(orderStatusSchema.safeParse("draft").success).toBe(false);
    expect(orderStatusSchema.safeParse("processing").success).toBe(false);
  });

  it("validates historical order item snapshot format", () => {
    const validItem = {
      id: "a0000000-0000-4000-8000-000000000001",
      orderId: "b0000000-0000-4000-8000-000000000001",
      productId: "prod-1",
      variantId: "var-1",
      quantity: 2,
      unitPriceCents: 74000,
      title: "The Field Chronograph",
      variantName: "Basalt Black / Horween Calf",
    };

    expect(orderItemSchema.safeParse(validItem).success).toBe(true);

    // Negative unit price or zero quantity must fail
    expect(
      orderItemSchema.safeParse({ ...validItem, quantity: 0 }).success
    ).toBe(false);
    expect(
      orderItemSchema.safeParse({ ...validItem, unitPriceCents: -100 }).success
    ).toBe(false);
  });

  it("validates refund input schemas", () => {
    expect(
      refundOrderInputSchema.safeParse({
        orderId: "b0000000-0000-4000-8000-000000000001",
        reason: "Customer changed mind",
      }).success
    ).toBe(true);

    // Invalid UUID
    expect(
      refundOrderInputSchema.safeParse({
        orderId: "invalid-uuid",
      }).success
    ).toBe(false);
  });
});

describe("Orders Domain: Fulfillment, Webhook Idempotency & Refunds", { timeout: 35000 }, () => {
  let targetVariantId: string;
  let targetProductId: string;
  let initialStock: number;

  const testOrderId = crypto.randomUUID();
  const testPendingOrderId = crypto.randomUUID();
  const testStripeEventId = `evt_test_${Date.now()}_fulfill`;
  const testStripeRefundId = `evt_test_${Date.now()}_refund`;
  const testPaymentIntentId = `pi_test_${Date.now()}`;

  beforeAll(async () => {
    // 1. Fetch a real seeded product & variant
    const variant = await db.query.productVariants.findFirst({
      where: eq(productVariants.sku, "NW-01-FLD-BLK-CAN"),
    });
    if (!variant) {
      throw new Error("Seed variant NW-01-FLD-BLK-CAN not found");
    }
    targetVariantId = variant.id;
    targetProductId = variant.productId;
    initialStock = variant.stock;

    // 2. Create an isolated test order in 'pending_payment'
    await db.insert(orders).values({
      id: testOrderId,
      email: "fulfillment-test@northwatch.ch",
      status: "pending_payment",
      subtotalCents: 74000,
      discountCents: 0,
      shippingCents: 0,
      taxCents: 5365,
      totalCents: 79365,
      shippingTierId: "standard",
      shippingAddress: {
        firstName: "Test",
        lastName: "Collector",
        street: "Bahnhofstrasse 1",
        city: "Zurich",
        state: "ZH",
        postalCode: "8001",
        country: "CH",
        phone: "+41 44 123 45 67",
      },
      stripePaymentIntentId: testPaymentIntentId,
    });

    // 3. Attach order line item (quantity = 1)
    await db.insert(orderItems).values({
      id: crypto.randomUUID(),
      orderId: testOrderId,
      productId: targetProductId,
      variantId: targetVariantId,
      quantity: 1,
      unitPriceCents: 74000,
      title: "Field Automatic Test",
      variantName: "Black Canvas Test",
    });

    // 4. Create second order for non-refundable test
    await db.insert(orders).values({
      id: testPendingOrderId,
      email: "pending-test@northwatch.ch",
      status: "pending_payment",
      subtotalCents: 74000,
      discountCents: 0,
      shippingCents: 0,
      taxCents: 5365,
      totalCents: 79365,
      shippingTierId: "standard",
      shippingAddress: {
        firstName: "Test",
        lastName: "Pending",
        street: "Bahnhofstrasse 1",
        city: "Zurich",
        state: "ZH",
        postalCode: "8001",
        country: "CH",
        phone: "+41 44 123 45 67",
      },
    });
  }, 35000);

  afterAll(async () => {
    // Clean up created test orders and events
    await db.delete(orderItems).where(eq(orderItems.orderId, testOrderId));
    await db.delete(orders).where(inArray(orders.id, [testOrderId, testPendingOrderId]));
    await db.delete(processedWebhookEvents).where(
      inArray(processedWebhookEvents.id, [testStripeEventId, testStripeRefundId])
    );
    // Restore variant stock if needed
    if (targetVariantId) {
      await db
        .update(productVariants)
        .set({ stock: initialStock })
        .where(eq(productVariants.id, targetVariantId));
    }
  });

  it("fulfills an order: transitions status to paid and decrements stock", async () => {
    const result = await fulfillOrder(testOrderId, testStripeEventId);

    expect(result.success).toBe(true);
    expect(result.alreadyProcessed).toBe(false);

    // Verify order status flipped to paid
    const updatedOrder = await db.query.orders.findFirst({
      where: eq(orders.id, testOrderId),
    });
    expect(updatedOrder?.status).toBe("paid");

    // Verify stock decremented by 1
    const updatedVariant = await db.query.productVariants.findFirst({
      where: eq(productVariants.id, targetVariantId),
    });
    expect(updatedVariant?.stock).toBe(initialStock - 1);

    // Verify event recorded in processed_webhook_events
    const event = await db.query.processedWebhookEvents.findFirst({
      where: eq(processedWebhookEvents.id, testStripeEventId),
    });
    expect(event).toBeDefined();
    expect(event?.eventType).toBe("payment_intent.succeeded");
  });

  it("is strictly idempotent: replaying webhook with seen event ID does not double decrement", async () => {
    const replayResult = await fulfillOrder(testOrderId, testStripeEventId);

    expect(replayResult.success).toBe(true);
    expect(replayResult.alreadyProcessed).toBe(true);

    // Verify stock remained unchanged (still initialStock - 1)
    const variant = await db.query.productVariants.findFirst({
      where: eq(productVariants.id, targetVariantId),
    });
    expect(variant?.stock).toBe(initialStock - 1);
  });

  it("is idempotent when called without event ID on an already paid order", async () => {
    const secondCall = await fulfillOrder(testOrderId);

    expect(secondCall.success).toBe(true);
    expect(secondCall.alreadyProcessed).toBe(true);

    // Stock unchanged
    const variant = await db.query.productVariants.findFirst({
      where: eq(productVariants.id, targetVariantId),
    });
    expect(variant?.stock).toBe(initialStock - 1);
  });

  it("rejects refund on an order still in pending_payment status", async () => {
    const result = await refundOrder(testPendingOrderId);

    expect(result.success).toBe(false);
    expect(result.alreadyProcessed).toBe(false);
    expect(result.error).toContain("cannot be refunded");
  });

  it("refunds a paid order: transitions status to refunded and restores stock", async () => {
    const refundResult = await refundOrder(
      testOrderId,
      testStripeRefundId,
      "Customer requested cancellation"
    );

    expect(refundResult.success).toBe(true);
    expect(refundResult.alreadyProcessed).toBe(false);
    expect(refundResult.restockedItemsCount).toBe(1);

    // Verify order status is refunded
    const refundedOrder = await db.query.orders.findFirst({
      where: eq(orders.id, testOrderId),
    });
    expect(refundedOrder?.status).toBe("refunded");

    // Verify variant stock restored back to initialStock
    const restoredVariant = await db.query.productVariants.findFirst({
      where: eq(productVariants.id, targetVariantId),
    });
    expect(restoredVariant?.stock).toBe(initialStock);

    // Verify refund event logged
    const refundEvent = await db.query.processedWebhookEvents.findFirst({
      where: eq(processedWebhookEvents.id, testStripeRefundId),
    });
    expect(refundEvent).toBeDefined();
    expect(refundEvent?.eventType).toBe("charge.refunded");
  });

  it("is strictly idempotent on refund: repeating refund short-circuits without double restocking", async () => {
    const replayRefund = await refundOrder(testOrderId, testStripeRefundId);

    expect(replayRefund.success).toBe(true);
    expect(replayRefund.alreadyProcessed).toBe(true);

    // Stock must not increase past initialStock
    const restoredVariant = await db.query.productVariants.findFirst({
      where: eq(productVariants.id, targetVariantId),
    });
    expect(restoredVariant?.stock).toBe(initialStock);
  });

  it("supports refundOrderByPaymentIntent lookup", async () => {
    // Calling on an already-refunded order via payment_intent ID should return alreadyProcessed
    const result = await refundOrderByPaymentIntent(testPaymentIntentId);

    expect(result.success).toBe(true);
    expect(result.alreadyProcessed).toBe(true);
  });

  it("handles non-existent order gracefully", async () => {
    const fakeId = crypto.randomUUID();
    const result = await refundOrder(fakeId);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Order not found");
  });
});
