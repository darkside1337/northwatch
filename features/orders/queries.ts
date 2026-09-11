import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { orders } from "@/lib/db/schema";

/**
 * Retrieves an order and its associated item snapshots by ID.
 * Optionally verifies that the order belongs to the specified userId.
 */
export async function getOrderById(orderId: string, userId?: string) {
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

  return order ?? null;
}
