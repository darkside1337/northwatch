import "server-only";

import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  orders,
  orderItems,
  productVariants,
  processedWebhookEvents,
} from "@/lib/db/schema";
import type { FulfillOrderResult, RefundOrderResult } from "./types";
import {
  fulfillOrderInputSchema,
  refundOrderInputSchema,
  refundOrderByPaymentIntentInputSchema,
} from "./schemas";

/**
 * Fulfills an order upon receiving a verified Stripe payment_intent.succeeded webhook.
 *
 * ARCHITECTURAL INVARIANTS:
 * 1. Durable Idempotency: Checks and records `stripeEventId` in `processed_webhook_events`
 *    via SELECT + INSERT ... ON CONFLICT DO NOTHING. Replayed Stripe webhooks
 *    short-circuit immediately (0-row insert = lost race = duplicate).
 * 2. Conditional State Transition: `UPDATE WHERE id = :orderId AND status = 'pending_payment'`.
 *    If 0 rows affected, it short-circuits gracefully without mutating inventory.
 * 3. Guarded Stock Decrement: `UPDATE ... WHERE stock >= qty`; shortfall throws
 *    OUT_OF_STOCK so the paid flip rolls back and the route can cancel + refund.
 */
export async function fulfillOrder(
  orderId: string,
  stripeEventId?: string
): Promise<FulfillOrderResult> {
  const parseResult = fulfillOrderInputSchema.safeParse({
    orderId,
    stripeEventId,
  });

  if (!parseResult.success) {
    return {
      success: false,
      alreadyProcessed: false,
      error: parseResult.error.issues[0]?.message ?? "Invalid fulfillment parameters",
    };
  }

  if (stripeEventId) {
    console.info(`[Fulfillment] Processing order ${orderId} for Stripe event ${stripeEventId}`);
  }

  return await db.transaction(async (tx) => {
    // 1. Check & record Stripe webhook event replay guard.
    // Concurrent duplicate deliveries can both miss the SELECT under READ
    // COMMITTED, so the INSERT uses ON CONFLICT DO NOTHING; a 0-row insert
    // means we lost the race and this delivery is a duplicate.
    if (stripeEventId) {
      const existingEvent = await tx.query.processedWebhookEvents.findFirst({
        where: eq(processedWebhookEvents.id, stripeEventId),
      });

      if (existingEvent) {
        console.info(`[Fulfillment] Event ${stripeEventId} already recorded, short-circuiting.`);
        return { success: true, alreadyProcessed: true };
      }

      const inserted = await tx.insert(processedWebhookEvents).values({
        id: stripeEventId,
        eventType: "payment_intent.succeeded",
        processedAt: new Date(),
      }).onConflictDoNothing({ target: processedWebhookEvents.id }).returning({ id: processedWebhookEvents.id });

      if (inserted.length === 0) {
        console.info(`[Fulfillment] Event ${stripeEventId} recorded concurrently, short-circuiting.`);
        return { success: true, alreadyProcessed: true };
      }
    }

    // 2. Attempt status transition
    const updated = await tx
      .update(orders)
      .set({
        status: "paid",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(orders.id, orderId),
          eq(orders.status, "pending_payment")
        )
      )
      .returning({ id: orders.id });

    // Idempotent short-circuit: already processed or not pending
    if (updated.length === 0) {
      return { success: true, alreadyProcessed: true };
    }

    // 3. Fetch line items to decrement stock
    const items = await tx
      .select({
        variantId: orderItems.variantId,
        quantity: orderItems.quantity,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    // 4. Decrement inventory atomically, guarded against oversell.
    // WHERE stock >= qty makes the decrement conditional; a 0-row result
    // means insufficient stock (concurrent sell-through). Throw OUT_OF_STOCK
    // so the whole transaction (including the paid flip above) rolls back —
    // the webhook route then auto-cancels + refunds instead of relying on the
    // stock_non_negative CHECK constraint, which would strand a paid order.
    for (const item of items) {
      const decremented = await tx
        .update(productVariants)
        .set({
          stock: sql`${productVariants.stock} - ${item.quantity}`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(productVariants.id, item.variantId),
            sql`${productVariants.stock} >= ${item.quantity}`
          )
        )
        .returning({ id: productVariants.id });

      if (decremented.length === 0) {
        throw new Error(
          `OUT_OF_STOCK: variant ${item.variantId} has insufficient stock for quantity ${item.quantity}`
        );
      }
    }

    return { success: true, alreadyProcessed: false };
  });
}

/**
 * Refunds an order and atomically restores inventory back to product_variants.
 *
 * ARCHITECTURAL INVARIANTS:
 * 1. Eligible State Gating: Only orders in 'paid' or 'shipped' state can be refunded.
 * 2. Durable Idempotency: Logs `stripeRefundId` in `processed_webhook_events`.
 * 3. Atomic Restocking: Increments variant stock by line item quantity within the same transaction.
 */
export async function refundOrder(
  orderId: string,
  stripeRefundId?: string,
  reason?: string
): Promise<RefundOrderResult> {
  const parseResult = refundOrderInputSchema.safeParse({
    orderId,
    stripeRefundId,
    reason,
  });

  if (!parseResult.success) {
    return {
      success: false,
      alreadyProcessed: false,
      error: parseResult.error.issues[0]?.message ?? "Invalid refund parameters",
    };
  }

  return await db.transaction(async (tx) => {
    // 1. Check & record Stripe refund event replay guard (same ON CONFLICT
    // pattern as fulfillOrder — see above).
    if (stripeRefundId) {
      const existingEvent = await tx.query.processedWebhookEvents.findFirst({
        where: eq(processedWebhookEvents.id, stripeRefundId),
      });

      if (existingEvent) {
        console.info(`[Refund] Event ${stripeRefundId} already recorded, short-circuiting.`);
        return { success: true, alreadyProcessed: true };
      }

      const inserted = await tx.insert(processedWebhookEvents).values({
        id: stripeRefundId,
        eventType: "charge.refunded",
        processedAt: new Date(),
      }).onConflictDoNothing({ target: processedWebhookEvents.id }).returning({ id: processedWebhookEvents.id });

      if (inserted.length === 0) {
        console.info(`[Refund] Event ${stripeRefundId} recorded concurrently, short-circuiting.`);
        return { success: true, alreadyProcessed: true };
      }
    }

    // 2. Attempt conditional transition from 'paid' or 'shipped' to 'refunded'
    const updated = await tx
      .update(orders)
      .set({
        status: "refunded",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(orders.id, orderId),
          inArray(orders.status, ["paid", "shipped"])
        )
      )
      .returning({ id: orders.id });

    // Handle when no row was updated
    if (updated.length === 0) {
      const existing = await tx.query.orders.findFirst({
        where: eq(orders.id, orderId),
        columns: { status: true },
      });

      if (!existing) {
        return {
          success: false,
          alreadyProcessed: false,
          error: "Order not found",
        };
      }

      if (existing.status === "refunded") {
        return { success: true, alreadyProcessed: true };
      }

      return {
        success: false,
        alreadyProcessed: false,
        error: `Order with status '${existing.status}' cannot be refunded`,
      };
    }

    // 3. Restock inventory for each order item
    const items = await tx
      .select({
        variantId: orderItems.variantId,
        quantity: orderItems.quantity,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    for (const item of items) {
      await tx
        .update(productVariants)
        .set({
          stock: sql`${productVariants.stock} + ${item.quantity}`,
          updatedAt: new Date(),
        })
        .where(eq(productVariants.id, item.variantId));
    }

    console.info(`[Refund] Order ${orderId} refunded successfully. Restocked ${items.length} item(s).`);

    return {
      success: true,
      alreadyProcessed: false,
      restockedItemsCount: items.length,
    };
  });
}

/**
 * Helper to refund an order when notified via Stripe webhook with a PaymentIntent ID.
 */
export async function refundOrderByPaymentIntent(
  paymentIntentId: string,
  stripeRefundId?: string,
  reason?: string
): Promise<RefundOrderResult> {
  const parseResult = refundOrderByPaymentIntentInputSchema.safeParse({
    paymentIntentId,
    stripeRefundId,
    reason,
  });

  if (!parseResult.success) {
    return {
      success: false,
      alreadyProcessed: false,
      error: parseResult.error.issues[0]?.message ?? "Invalid refund parameters",
    };
  }

  const order = await db.query.orders.findFirst({
    where: eq(orders.stripePaymentIntentId, paymentIntentId),
    columns: { id: true },
  });

  if (!order) {
    console.warn(`[Refund] No order found matching payment_intent '${paymentIntentId}'`);
    return {
      success: false,
      alreadyProcessed: false,
      error: `Order with payment_intent ${paymentIntentId} not found`,
    };
  }

  return refundOrder(order.id, stripeRefundId, reason);
}
