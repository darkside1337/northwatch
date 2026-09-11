import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { orders } from "@/lib/db/schema";
import type { Order } from "./types";

/**
 * Valid completed / finalized statuses for customer-visible order archives.
 * Explicitly omits 'pending_payment' so abandoned checkout drafts never appear.
 */
export const ARCHIVED_ORDER_STATUSES = [
  "paid",
  "shipped",
  "delivered",
  "canceled",
  "refunded",
] as const;

/**
 * Retrieves all finalized orders for a specific collector,
 * ordered by createdAt descending, omitting abandoned draft attempts.
 */
export async function getOrdersForUser(userId: string): Promise<Order[]> {
  const results = await db.query.orders.findMany({
    where: and(
      eq(orders.userId, userId),
      inArray(orders.status, ARCHIVED_ORDER_STATUSES)
    ),
    with: {
      items: true,
    },
    orderBy: [desc(orders.createdAt)],
  });

  return results.map((o) => ({
    ...o,
    items: o.items ?? [],
  })) as unknown as Order[];
}

/**
 * Retrieves an order and its associated item snapshots by ID.
 * If userId is provided, guarantees tenant boundary verification (IDOR protection).
 */
export async function getOrderById(
  orderId: string,
  userId?: string
): Promise<Order | null> {
  const conditions = [eq(orders.id, orderId)];
  if (userId) {
    conditions.push(eq(orders.userId, userId));
  }

  const order = await db.query.orders.findFirst({
    where: and(...conditions),
    with: {
      items: true,
    },
  });

  if (!order) {
    return null;
  }

  return {
    ...order,
    items: order.items ?? [],
  } as unknown as Order;
}
