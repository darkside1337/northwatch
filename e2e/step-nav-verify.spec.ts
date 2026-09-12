import { test, expect } from "@playwright/test";
import { advanceToPaymentStep } from "./auth-helper";

// Manual verification spec for the Phase 5 hydration fix:
// exercises real browser-chrome back/forward (popstate) after the step
// changes, plus direct load of /checkout?step=payment (server initialStep).
test.describe("CheckoutWizard browser step navigation (manual verification)", () => {
  test("chrome back/forward toggles steps; direct ?step=payment renders payment", async ({
    page,
    context,
  }) => {
    await advanceToPaymentStep(page, context);
    await expect(page).toHaveURL(/step=payment/);

    // Browser-chrome back returns to the pre-pushState URL (/checkout, no
    // ?step=) -> popstate else-branch -> shipping step, form state preserved
    await page.goBack();
    await expect(page).toHaveURL(/\/checkout$/);
    await expect(page.getByRole("heading", { name: /1\. Shipping Destination/i })).toBeVisible();
    await expect(page.locator('input[name="firstName"]')).toHaveValue("Marcus");

    // Browser-chrome forward -> popstate -> payment step again
    await page.goForward();
    await expect(page).toHaveURL(/step=payment/);
    await expect(page.getByRole("heading", { name: /2\. Vault Payment/i })).toBeVisible();

    // No hydration errors on any navigation
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.reload();
    await expect(page.getByRole("heading", { name: /2\. Vault Payment/i })).toBeVisible();
    expect(errors.filter((m) => /hydrat/i.test(m))).toEqual([]);
  });
});
