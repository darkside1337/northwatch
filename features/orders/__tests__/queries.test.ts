import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db/client";
import { orders, orderItems, productVariants, user } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getOrdersForUser, getOrderById, ARCHIVED_ORDER_STATUSES } from "../queries";

describe("Orders Domain: Queries & Access Isolation", { timeout: 35000 }, () => {
  const userA = `user_test_queries_a_${Date.now()}`;
  const userB = `user_test_queries_b_${Date.now()}`;

  const orderA1_paid = crypto.randomUUID();
  const orderA2_shipped = crypto.randomUUID();
  const orderA3_pending = crypto.randomUUID();
  const orderB1_paid = crypto.randomUUID();

  let targetProductId: string;
  let targetVariantId: string;

  beforeAll(async () => {
    // 0. Insert test users
    await db.insert(user).values([
      {
        id: userA,
        name: "Collector Alpha",
        email: `${userA}@northwatch.ch`,
        emailVerified: true,
      },
      {
        id: userB,
        name: "Collector Beta",
        email: `${userB}@northwatch.ch`,
        emailVerified: true,
      },
    ]);

    // Find a real seeded variant
    const variant = await db.query.productVariants.findFirst({
      where: eq(productVariants.sku, "NW-01-FLD-BLK-CAN"),
    });
    if (!variant) {
      throw new Error("Seed variant NW-01-FLD-BLK-CAN not found");
    }
    targetProductId = variant.productId;
    targetVariantId = variant.id;

    // 1. Insert User A's paid order (older)
    await db.insert(orders).values({
      id: orderA1_paid,
      userId: userA,
      email: "collector_a@northwatch.ch",
      status: "paid",
      subtotalCents: 74000,
      discountCents: 0,
      shippingCents: 0,
      taxCents: 5000,
      totalCents: 79000,
      shippingTierId: "standard",
      shippingAddress: {
        firstName: "Collector",
        lastName: "Alpha",
        street: "Skeppsbron 14",
        city: "Stockholm",
        state: "Stockholm",
        postalCode: "11130",
        country: "SE",
      },
      createdAt: new Date(Date.now() - 60000), // 1 min ago
    });

    await db.insert(orderItems).values({
      id: crypto.randomUUID(),
      orderId: orderA1_paid,
      productId: targetProductId,
      variantId: targetVariantId,
      quantity: 1,
      unitPriceCents: 74000,
      title: "Field Automatic",
      variantName: "Black Canvas",
    });

    // 2. Insert User A's shipped order (newer)
    await db.insert(orders).values({
      id: orderA2_shipped,
      userId: userA,
      email: "collector_a@northwatch.ch",
      status: "shipped",
      subtotalCents: 120000,
      discountCents: 0,
      shippingCents: 2500,
      taxCents: 8500,
      totalCents: 131000,
      shippingTierId: "express",
      shippingAddress: {
        firstName: "Collector",
        lastName: "Alpha",
        street: "Skeppsbron 14",
        city: "Stockholm",
        state: "Stockholm",
        postalCode: "11130",
        country: "SE",
      },
      createdAt: new Date(Date.now()), // now
    });

    await db.insert(orderItems).values({
      id: crypto.randomUUID(),
      orderId: orderA2_shipped,
      productId: targetProductId,
      variantId: targetVariantId,
      quantity: 1,
      unitPriceCents: 120000,
      title: "Precision Diver",
      variantName: "Titanium Bracelet",
    });

    // 3. Insert User A's pending draft order (must be omitted from archive)
    await db.insert(orders).values({
      id: orderA3_pending,
      userId: userA,
      email: "collector_a@northwatch.ch",
      status: "pending_payment",
      subtotalCents: 74000,
      discountCents: 0,
      shippingCents: 0,
      taxCents: 5000,
      totalCents: 79000,
      shippingTierId: "standard",
      shippingAddress: {
        firstName: "Collector",
        lastName: "Alpha",
        street: "Skeppsbron 14",
        city: "Stockholm",
        state: "Stockholm",
        postalCode: "11130",
        country: "SE",
      },
      createdAt: new Date(Date.now()),
    });

    // 4. Insert User B's paid order (isolation check)
    await db.insert(orders).values({
      id: orderB1_paid,
      userId: userB,
      email: "collector_b@northwatch.ch",
      status: "paid",
      subtotalCents: 85000,
      discountCents: 0,
      shippingCents: 0,
      taxCents: 6000,
      totalCents: 91000,
      shippingTierId: "standard",
      shippingAddress: {
        firstName: "Collector",
        lastName: "Beta",
        street: "Bahnhofstrasse 1",
        city: "Zurich",
        state: "ZH",
        postalCode: "8001",
        country: "CH",
      },
      createdAt: new Date(Date.now()),
    });

    await db.insert(orderItems).values({
      id: crypto.randomUUID(),
      orderId: orderB1_paid,
      productId: targetProductId,
      variantId: targetVariantId,
      quantity: 1,
      unitPriceCents: 85000,
      title: "Heritage Chronometer",
      variantName: "Calf Leather",
    });
  });

  afterAll(async () => {
    // Teardown created test orders and cascade line items
    await db.delete(orders).where(
      inArray(orders.id, [orderA1_paid, orderA2_shipped, orderA3_pending, orderB1_paid])
    );
    // Teardown test users
    await db.delete(user).where(inArray(user.id, [userA, userB]));
  });

  describe("getOrdersForUser", () => {
    it("returns verified orders for the user and excludes pending_payment drafts", async () => {
      const ordersForA = await getOrdersForUser(userA);

      // Should contain exactly 2 orders (paid and shipped), NOT pending_payment
      expect(ordersForA.length).toBe(2);
      const orderIds = ordersForA.map((o) => o.id);
      expect(orderIds).toContain(orderA1_paid);
      expect(orderIds).toContain(orderA2_shipped);
      expect(orderIds).not.toContain(orderA3_pending);

      // Verified status filtering
      for (const order of ordersForA) {
        expect(ARCHIVED_ORDER_STATUSES).toContain(order.status);
      }
    });

    it("returns orders ordered by createdAt descending (newest first)", async () => {
      const ordersForA = await getOrdersForUser(userA);
      expect(ordersForA[0].id).toBe(orderA2_shipped);
      expect(ordersForA[1].id).toBe(orderA1_paid);
    });

    it("eager loads associated order item snapshots", async () => {
      const ordersForA = await getOrdersForUser(userA);
      const order2 = ordersForA.find((o) => o.id === orderA2_shipped);
      expect(order2).toBeDefined();
      expect(order2?.items).toBeDefined();
      expect(order2?.items?.length).toBe(1);
      expect(order2?.items?.[0].title).toBe("Precision Diver");
    });

    it("guarantees tenant isolation: User A does not see User B's orders", async () => {
      const ordersForA = await getOrdersForUser(userA);
      const ordersForB = await getOrdersForUser(userB);

      const aIds = ordersForA.map((o) => o.id);
      const bIds = ordersForB.map((o) => o.id);

      expect(aIds).not.toContain(orderB1_paid);
      expect(bIds).toContain(orderB1_paid);
      expect(bIds.length).toBe(1);
    });

    it("returns an empty array for a user with no orders", async () => {
      const emptyUserOrders = await getOrdersForUser("non_existent_user_999");
      expect(emptyUserOrders).toEqual([]);
    });
  });

  describe("getOrderById", () => {
    it("returns the full order and items when orderId exists", async () => {
      const order = await getOrderById(orderA1_paid);
      expect(order).not.toBeNull();
      expect(order?.id).toBe(orderA1_paid);
      expect(order?.items?.length).toBe(1);
      expect(order?.items?.[0].variantName).toBe("Black Canvas");
    });

    it("returns the order when userId matches the order owner", async () => {
      const order = await getOrderById(orderA1_paid, userA);
      expect(order).not.toBeNull();
      expect(order?.id).toBe(orderA1_paid);
    });

    it("enforces IDOR protection: returns null when userId does not match order owner", async () => {
      // User B attempts to access User A's order
      const order = await getOrderById(orderA1_paid, userB);
      expect(order).toBeNull();
    });

    it("returns null for nonexistent order IDs", async () => {
      const nonExistent = await getOrderById(crypto.randomUUID());
      expect(nonExistent).toBeNull();
    });
  });
});
