"use server";

import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { orders, orderItems, productVariants } from "@/lib/db/schema";

/**
 * Fulfills an order upon receiving a verified Stripe payment_intent.succeeded webhook.
 *
 * ARCHITECTURAL INVARIANTS:
 * 1. Idempotency: Conditional UPDATE `WHERE id = :orderId AND status = 'pending_payment'`.
 *    If 0 rows affected (already processed or event replayed), it short-circuits gracefully.
 * 2. Atomic Stock Decrement: In the same transaction, decrements variant stock for each item.
 */
export async function fulfillOrder(orderId: string, stripeEventId?: string) {
  if (stripeEventId) {
    console.info(`Fulfilling order ${orderId} from Stripe event ${stripeEventId}`);
  }
  return await db.transaction(async (tx) => {
    // 1. Attempt status transition
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

    // 2. Fetch line items to decrement stock
    const items = await tx
      .select({
        variantId: orderItems.variantId,
        quantity: orderItems.quantity,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    // 3. Decrement inventory atomically
    for (const item of items) {
      await tx
        .update(productVariants)
        .set({
          stock: sql`${productVariants.stock} - ${item.quantity}`,
          updatedAt: new Date(),
        })
        .where(eq(productVariants.id, item.variantId));
    }

    return { success: true, alreadyProcessed: false };
  });
}
