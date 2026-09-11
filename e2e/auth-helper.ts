import { testAuth } from "@/lib/auth/test-auth";
import { db } from "@/lib/db/client";
import { user, productVariants } from "@/lib/db/schema";
import { eq, gt } from "drizzle-orm";
import { expect, type BrowserContext, type Page } from "@playwright/test";

/**
 * Authenticates a Playwright test context using Better Auth's native testUtils plugin.
 * Generates an authoritatively signed HMAC session cookie accepted by both proxy edge checks
 * and server-side requireAuth() calls.
 */
export async function loginAsTestCollector(context: BrowserContext) {
  const email = "collector@northwatch.ch";
  let existingUser = await db.query.user.findFirst({
    where: eq(user.email, email),
  });

  if (!existingUser) {
    const [created] = await db
      .insert(user)
      .values({
        id: "collector_dev_" + crypto.randomUUID().slice(0, 8),
        name: "Marcus Vance (Test Collector)",
        email,
        emailVerified: true,
      })
      .returning();
    existingUser = created;
  }

  const ctx = await testAuth.$context;
  const { cookies } = await ctx.test.login({ userId: existingUser.id });

  const playwrightCookies = cookies.map((c) => ({
    name: c.name,
    value: c.value,
    domain: "localhost",
    path: c.path || "/",
    httpOnly: c.httpOnly ?? true,
    secure: c.secure ?? false,
    sameSite: (c.sameSite === "Lax" || c.sameSite === "Strict" || c.sameSite === "None" ? c.sameSite : "Lax") as "Lax" | "Strict" | "None",
  }));

  await context.addCookies(playwrightCookies);
  return existingUser;
}

/**
 * Sets up an authenticated session and pre-populates the thin cart cookie directly.
 */
export async function setupAuthenticatedCart(context: BrowserContext) {
  const collector = await loginAsTestCollector(context);

  const variant = await db.query.productVariants.findFirst({
    where: gt(productVariants.stock, 0),
  });

  if (!variant) {
    throw new Error("No in-stock timepiece variant found in catalog database.");
  }

  await context.addCookies([
    {
      name: "northwatch_cart",
      value: JSON.stringify({
        items: [{ variantId: variant.id, quantity: 1 }],
      }),
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);

  return { collector, variant };
}

/**
 * Helper to advance an authenticated cart directly through shipping to the payment step.
 */
export async function advanceToPaymentStep(page: Page, context: BrowserContext) {
  const setup = await setupAuthenticatedCart(context);
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

  return setup;
}
