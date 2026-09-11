import { test, expect } from "@playwright/test";
import { db } from "@/lib/db/client";
import { orders, user } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import {
  loginAsTestCollector,
  setupAuthenticatedCart,
  advanceToPaymentStep,
} from "./auth-helper";

test.describe("Checkout & Payments Modular E2E Suite", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();

    // Ensure pristine test isolation: clean up any dangling pending_payment orders
    const collector = await db.query.user.findFirst({
      where: eq(user.email, "collector@northwatch.ch"),
    });
    if (collector) {
      await db
        .delete(orders)
        .where(
          and(
            eq(orders.userId, collector.id),
            eq(orders.status, "pending_payment")
          )
        );
    }
  });

  test("1. Unauthenticated checkout access redirects to login with redirectTo", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page).toHaveURL(/\/login\?redirectTo=%2Fcheckout/);
    await expect(page.getByRole("heading", { name: /Collector Sign In/i })).toBeVisible();
  });

  test("2. Authenticated user with empty bag sees empty bag state on /checkout", async ({ page, context }) => {
    await loginAsTestCollector(context);

    await page.goto("/checkout");
    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.getByText(/Your Acquisition Bag is Empty/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /Explore Atelier Collection/i })).toBeVisible();
  });

  test("3. Add to bag -> cart drawer -> proceed to checkout redirects unauthenticated user", async ({ page }) => {
    await page.goto("/products/field-automatic");
    const addToBagBtn = page.getByRole("button", { name: /ADD TO BAG/i });
    await expect(addToBagBtn).toBeVisible();
    await addToBagBtn.click();

    const proceedCheckoutBtn = page.getByRole("button", { name: /Proceed to Checkout/i });
    await expect(proceedCheckoutBtn).toBeVisible();
    await proceedCheckoutBtn.click();

    await expect(page).toHaveURL(/\/login\?redirectTo=%2Fcheckout/);
    await expect(page.getByRole("heading", { name: /Collector Sign In/i })).toBeVisible();
  });

  test("4. Shipping form accepts input and advances to payment step", async ({ page, context }) => {
    await setupAuthenticatedCart(context);
    await page.goto("/checkout");

    await expect(page.getByRole("heading", { name: /1\. Shipping Destination/i })).toBeVisible();

    await page.locator('input[name="firstName"]').fill("Marcus");
    await page.locator('input[name="lastName"]').fill("Vance");
    await page.locator('input[name="street"]').fill("Skeppsbron 14");
    await page.locator('input[name="city"]').fill("Stockholm");
    await page.locator('input[name="state"]').fill("Stockholm County");
    await page.locator('input[name="postalCode"]').fill("11130");
    await page.locator('input[name="phone"]').fill("+1 555 019 2834");

    await page.getByText(/Express Air Courier/i).click();
    await page.getByRole("button", { name: /CONTINUE TO VAULT PAYMENT/i }).click();

    await expect(page).toHaveURL(/step=payment/);
    await expect(page.getByRole("heading", { name: /2\. Vault Payment/i })).toBeVisible();
  });

  test("5. Back navigation from payment preserves shipping form state", async ({ page, context }) => {
    await advanceToPaymentStep(page, context);

    const backBtn = page.getByRole("button", { name: /Return to Shipping Details/i });
    await expect(backBtn).toBeVisible();
    await backBtn.click();

    await expect(page.getByRole("heading", { name: /1\. Shipping Destination/i })).toBeVisible();
    await expect(page.locator('input[name="firstName"]')).toHaveValue("Marcus");
    await expect(page.locator('input[name="lastName"]')).toHaveValue("Vance");
    await expect(page.locator('input[name="street"]')).toHaveValue("Skeppsbron 14");
    await expect(page.locator('input[name="phone"]')).toHaveValue("+1 555 019 2834");
  });

  test("6. Declined card in Stripe Elements shows inline error and allows retry", async ({ page, context }) => {
    await advanceToPaymentStep(page, context);

    // Documented stable frame selector excluding the easel layout container frame
    const stripeFrame = page.frameLocator('iframe[title="Secure payment input frame"]:not([src*="easel"])');
    const cardNumberInput = stripeFrame.locator('input[autocomplete="cc-number"]');
    await expect(cardNumberInput).toBeVisible({ timeout: 20000 });

    // Test decline card
    await cardNumberInput.fill("4000 0000 0000 0002");
    await stripeFrame.locator('input[autocomplete="cc-exp"]').fill("12/34");
    await stripeFrame.locator('input[autocomplete="cc-csc"]').fill("123");

    const submitPaymentBtn = page.getByRole("button", { name: /Authorize Payment/i });
    await submitPaymentBtn.click();

    // Verify decline message
    await expect(page.getByText(/Your card (has been|was) declined/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("heading", { name: /2\. Vault Payment/i })).toBeVisible();
  });

  test("7. Successful payment redirects to confirmation and flips DB status to paid", async ({ page, context }) => {
    await advanceToPaymentStep(page, context);

    // Documented stable frame selector excluding the easel layout container frame
    const stripeFrame = page.frameLocator('iframe[title="Secure payment input frame"]:not([src*="easel"])');
    const cardNumberInput = stripeFrame.locator('input[autocomplete="cc-number"]');
    await expect(cardNumberInput).toBeVisible({ timeout: 20000 });

    // Authorized Stripe test card
    await cardNumberInput.fill("4242 4242 4242 4242");
    await stripeFrame.locator('input[autocomplete="cc-exp"]').fill("12/34");
    await stripeFrame.locator('input[autocomplete="cc-csc"]').fill("123");

    const submitPaymentBtn = page.getByRole("button", { name: /Authorize Payment/i });
    await submitPaymentBtn.click();

    // Client-side redirect to confirmation
    await expect(page).toHaveURL(/\/confirmation\//, { timeout: 25000 });
    await expect(page.getByRole("heading", { name: /Acquisition Confirmed|Order Processing/i })).toBeVisible();
    await expect(page.getByText("Skeppsbron 14")).toBeVisible();
    await expect(page.getByText("Express Air Courier", { exact: true })).toBeVisible();

    const orderId = page.url().split("/confirmation/")[1].split("?")[0];

    // Assert that webhook actually reached the server and flipped status to 'paid' in DB
    await expect.poll(async () => {
      const order = await db.query.orders.findFirst({
        where: eq(orders.id, orderId),
      });
      return order?.status;
    }, { timeout: 20000, intervals: [500, 1000] }).toBe("paid");

    // UI updates to confirmed status
    await expect(page.getByText(/VAULT ALLOCATION CONFIRMED/i)).toBeVisible();
  });

  test("8. Bag is empty after successful order", async ({ page, context }) => {
    await loginAsTestCollector(context);
    await page.goto("/checkout");
    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.getByText(/Your Acquisition Bag is Empty/i)).toBeVisible();
  });
});
