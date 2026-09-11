import { test, expect } from "@playwright/test";
import { db } from "@/lib/db/client";
import { orders, orderItems, productVariants, user } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { loginAsTestCollector } from "./auth-helper";

test.describe("Collector Portal & Order History E2E Suite", () => {
  const testOrderId = crypto.randomUUID();
  const otherUserOrderId = crypto.randomUUID();
  const otherUserId = `other_collector_${Date.now()}`;

  test.beforeAll(async () => {
    // 1. Get or create primary test collector
    const primaryEmail = "collector@northwatch.ch";
    let primaryCollector = await db.query.user.findFirst({
      where: eq(user.email, primaryEmail),
    });
    if (!primaryCollector) {
      const [created] = await db
        .insert(user)
        .values({
          id: "collector_dev_" + crypto.randomUUID().slice(0, 8),
          name: "Marcus Vance",
          email: primaryEmail,
          emailVerified: true,
        })
        .returning();
      primaryCollector = created;
    }

    // 2. Create secondary test user for IDOR testing
    await db.insert(user).values({
      id: otherUserId,
      name: "Other Collector",
      email: `${otherUserId}@northwatch.ch`,
      emailVerified: true,
    });

    // 3. Find seed variant
    const variant = await db.query.productVariants.findFirst({
      where: eq(productVariants.sku, "NW-01-FLD-BLK-CAN"),
    });
    if (!variant) {
      throw new Error("Seed variant NW-01-FLD-BLK-CAN not found");
    }

    // 4. Create verified order for primary collector
    await db.insert(orders).values({
      id: testOrderId,
      userId: primaryCollector.id,
      email: primaryEmail,
      status: "paid",
      subtotalCents: 74000,
      discountCents: 0,
      shippingCents: 0,
      taxCents: 5365,
      totalCents: 79365,
      shippingTierId: "standard",
      shippingAddress: {
        firstName: "Marcus",
        lastName: "Vance",
        street: "Skeppsbron 14",
        city: "Stockholm",
        state: "Stockholm County",
        postalCode: "11130",
        country: "SE",
        phone: "+1 555 019 2834",
      },
    });

    await db.insert(orderItems).values({
      id: crypto.randomUUID(),
      orderId: testOrderId,
      productId: variant.productId,
      variantId: variant.id,
      quantity: 1,
      unitPriceCents: 74000,
      title: "Field Automatic",
      variantName: "Black Canvas",
    });

    // 5. Create order for other collector
    await db.insert(orders).values({
      id: otherUserOrderId,
      userId: otherUserId,
      email: `${otherUserId}@northwatch.ch`,
      status: "paid",
      subtotalCents: 98000,
      discountCents: 0,
      shippingCents: 0,
      taxCents: 7000,
      totalCents: 105000,
      shippingTierId: "standard",
      shippingAddress: {
        firstName: "Other",
        lastName: "Collector",
        street: "Bahnhofstrasse 1",
        city: "Zurich",
        state: "ZH",
        postalCode: "8001",
        country: "CH",
      },
    });
  });

  test.afterAll(async () => {
    await db.delete(orders).where(inArray(orders.id, [testOrderId, otherUserOrderId]));
    await db.delete(user).where(eq(user.id, otherUserId));
  });

  test("1. Unauthenticated access to /account redirects to /login", async ({ page }) => {
    await page.goto("/account");
    await expect(page).toHaveURL(/\/login\?redirectTo=%2Faccount/);
    await expect(page.getByRole("heading", { name: /Collector Sign In/i })).toBeVisible();
  });

  test("2. Unauthenticated access to /account/orders redirects to /login", async ({ page }) => {
    await page.goto("/account/orders");
    await expect(page).toHaveURL(/\/login\?redirectTo=%2Faccount%2Forders/);
    await expect(page.getByRole("heading", { name: /Collector Sign In/i })).toBeVisible();
  });

  test("3. Unauthenticated access to /orders redirects to /login", async ({ page }) => {
    await page.goto("/orders");
    await expect(page).toHaveURL(/\/login\?redirectTo=%2Forders/);
    await expect(page.getByRole("heading", { name: /Collector Sign In/i })).toBeVisible();
  });

  test("4. Authenticated collector can access Collector Portal overview at /account", async ({ page, context }) => {
    await loginAsTestCollector(context);
    await page.goto("/account");

    await expect(page).toHaveURL(/\/account/);
    await expect(page.getByRole("heading", { name: /Collector Registry/i })).toBeVisible();
    await expect(page.getByText(/AUTHENTICATED \/\/ ACTIVE SESSION/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /VIEW ORDER ARCHIVE/i })).toBeVisible();
  });

  test("5. Authenticated collector can view Order Archive with allocated order", async ({ page, context }) => {
    await loginAsTestCollector(context);
    await page.goto("/account/orders");

    await expect(page).toHaveURL(/\/account\/orders/);
    await expect(page.getByRole("heading", { name: /Order Archive/i })).toBeVisible();

    const orderRef = `NW-${testOrderId.slice(0, 8).toUpperCase()}`;
    const orderCard = page.locator("article", { hasText: orderRef });
    await expect(orderCard).toBeVisible();
    await expect(orderCard.getByText(/ALLOCATED \/\/ PAID/i)).toBeVisible();
    await expect(orderCard.getByText("Field Automatic")).toBeVisible();
  });

  test("6. Collector can click through to Order Detail and view complete manifest and transit info", async ({ page, context }) => {
    await loginAsTestCollector(context);
    await page.goto(`/account/orders/${testOrderId}`);

    await expect(page).toHaveURL(new RegExp(`/account/orders/${testOrderId}`));
    const orderRef = `NW-${testOrderId.slice(0, 8).toUpperCase()}`;
    await expect(page.getByRole("heading", { name: orderRef })).toBeVisible();
    await expect(page.getByText("Skeppsbron 14")).toBeVisible();
    await expect(page.getByText(/Allocation Manifest/i)).toBeVisible();
    await expect(page.getByText(/Fulfillment Lifecycle/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Print Receipt/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Concierge Inquiry/i })).toBeVisible();
  });

  test("7. IDOR Protection: Collector cannot view another collector's order", async ({ page, context }) => {
    await loginAsTestCollector(context);
    // Attempt to access other user's order
    await page.goto(`/account/orders/${otherUserOrderId}`);

    // Should return 404 (not found)
    await expect(page.getByText(/404|Not Found|Timepiece Not Located/i)).toBeVisible();
  });
});
