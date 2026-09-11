import { test, expect } from "@playwright/test";
import * as fs from "node:fs";
import { db } from "../lib/db/client";
import { orders, user } from "../lib/db/schema";
import { and, eq } from "drizzle-orm";
import { loginAsTestCollector } from "../e2e/auth-helper";
import { injectVisualCursor, smoothClick, smoothType } from "./cursor-helper";

test.describe("Flow 2: Vault Checkout Wizard", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();

    // Clean up any lingering pending_payment orders for test collector
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

  test.afterEach(async ({ page }, testInfo) => {
    await page.close();
    const video = page.video();
    if (video) {
      const videoPath = await video.path();
      fs.mkdirSync("./demo-recordings", { recursive: true });
      fs.copyFileSync(videoPath, "./demo-recordings/flow2-checkout.webm");
      return;
    }
    const attachment = testInfo.attachments.find((a) => a.name === "video");
    if (attachment?.path) {
      fs.mkdirSync("./demo-recordings", { recursive: true });
      fs.copyFileSync(attachment.path, "./demo-recordings/flow2-checkout.webm");
    }
  });

  test("Record Flow 2 - Vault Checkout Wizard", async ({ page, context }) => {
    test.setTimeout(60000);

    // 1. Authenticate collector session
    await loginAsTestCollector(context);

    // 2. Inject macOS cursor
    await injectVisualCursor(page);

    // 3. Land on /products/field-automatic with Horween Calfskin selected
    await page.goto("/products/field-automatic");
    await expect(page.getByRole("heading", { name: /The Field Automatic/i })).toBeVisible();

    const horweenBtn = page.getByRole("button", { name: /Horween Calfskin/i }).first();
    if (await horweenBtn.isVisible()) {
      await smoothClick(page, horweenBtn, 15);
      await page.waitForTimeout(400);
    }

    // 4. Click ADD TO BAG → CartDrawer slides out
    const addToBagBtn = page.getByRole("button", { name: /ADD TO BAG/i });
    await expect(addToBagBtn).toBeVisible();
    await smoothClick(page, addToBagBtn, 20);

    const drawerTitle = page.getByText(/Your Selection/i);
    await expect(drawerTitle).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500);

    // 5. Click Proceed to Checkout
    const checkoutBtn = page.getByRole("button", { name: /Proceed to Checkout/i });
    await expect(checkoutBtn).toBeVisible();
    await smoothClick(page, checkoutBtn, 20);

    // 6. Arrive at /checkout — pause 0.5s on distraction-free layout
    await expect(page.getByRole("heading", { name: /1\. Shipping Destination/i })).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(500);

    // 7. Autofill/type collector details (brief typing on name & city)
    await smoothType(page, 'input[name="firstName"]', "Marcus", 40);
    await page.locator('input[name="lastName"]').fill("Vance");
    await page.locator('input[name="street"]').fill("Skeppsbron 14");
    await smoothType(page, 'input[name="city"]', "Stockholm", 40);
    await page.locator('input[name="state"]').fill("Stockholm County");
    await page.locator('input[name="postalCode"]').fill("11130");
    await page.locator('input[name="phone"]').fill("+1 555 019 2834");
    await page.waitForTimeout(400);

    // 8. Toggle shipping tiers in sequence: Insured Ground ($15) → Express Air ($35) → Priority Vault Courier ($75)
    const groundTier = page.getByText(/Insured Ground/i).first();
    if (await groundTier.isVisible()) {
      await smoothClick(page, groundTier, 15);
      await page.waitForTimeout(400);
    }

    const expressTier = page.getByText(/Express Air Courier/i).first();
    if (await expressTier.isVisible()) {
      await smoothClick(page, expressTier, 15);
      await page.waitForTimeout(400);
    }

    const priorityTier = page.getByText(/Priority Vault Courier/i).first();
    if (await priorityTier.isVisible()) {
      await smoothClick(page, priorityTier, 15);
      await page.waitForTimeout(500);
    }

    // 9. Advance to Step 2 (Vault Payment)
    const continueBtn = page.getByRole("button", { name: /CONTINUE TO VAULT PAYMENT/i });
    await expect(continueBtn).toBeVisible();
    await smoothClick(page, continueBtn, 20);

    // 10. Step 2 (Vault Payment) — show Stripe Elements + SSL indicator
    await expect(page.getByRole("heading", { name: /2\. Vault Payment/i })).toBeVisible({ timeout: 15000 });
    const stripeFrame = page.frameLocator('iframe[title="Secure payment input frame"]:not([src*="easel"])');
    const cardNumberInput = stripeFrame.locator('input[autocomplete="cc-number"]');
    await expect(cardNumberInput).toBeVisible({ timeout: 20000 });
    await page.waitForTimeout(500);

    // Fill Stripe card inputs
    await cardNumberInput.fill("4242 4242 4242 4242");
    await stripeFrame.locator('input[autocomplete="cc-exp"]').fill("12/34");
    await stripeFrame.locator('input[autocomplete="cc-csc"]').fill("123");
    await page.waitForTimeout(400);

    // 11. Submit Payment
    const submitPaymentBtn = page.getByRole("button", { name: /Authorize Payment/i });
    await expect(submitPaymentBtn).toBeVisible();
    await smoothClick(page, submitPaymentBtn, 20);

    // 12. Land on /confirmation/[orderId], hold 0.8s on confirmation voucher
    await expect(page).toHaveURL(/\/confirmation\//, { timeout: 25000 });
    await expect(page.getByRole("heading", { name: /Acquisition Confirmed|Order Processing/i })).toBeVisible();
    await page.waitForTimeout(800);
  });
});
