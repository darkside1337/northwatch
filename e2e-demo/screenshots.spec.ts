import { test, expect } from "@playwright/test";
import { db } from "../lib/db/client";
import { orders, user, productVariants } from "../lib/db/schema";
import { and, eq } from "drizzle-orm";
import { setupAuthenticatedCart } from "../e2e/auth-helper";

test.describe("Northwatch High-DPI README Demo Screenshots", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();

    // Inject CSS to eliminate Next.js dev overlay, dev indicator, toast, etc.
    await page.addInitScript(() => {
      const style = document.createElement("style");
      style.id = "hide-dev-overlays";
      style.innerHTML = `
        nextjs-portal,
        #nextjs-dev-indicator,
        [data-nextjs-toast],
        [data-nextjs-dialog-overlay],
        div[data-nextjs-route-announcer],
        .__next-dev-indicator,
        [class*="dev-indicator"],
        [id*="dev-indicator"],
        button[aria-label="Open Next.js Dev Tools"] {
          display: none !important;
          opacity: 0 !important;
          pointer-events: none !important;
          visibility: hidden !important;
        }
      `;
      document.documentElement.appendChild(style);
    });

    // Clean up any pending_payment orders for test collector to avoid lingering state
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

  test("1. Hero homepage shot (full-bleed, above the fold, clean)", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Refined by restraint/i })).toBeVisible();

    const heroImg = page.locator('img[alt*="Extreme macro study"]');
    await expect(heroImg).toBeVisible();

    // Measure the exact bottom of the hero section so no next section text bleeds into frame
    const heroSection = page.locator("section").first();
    const heroBox = await heroSection.boundingBox();
    const clipHeight = heroBox ? Math.ceil(heroBox.y + heroBox.height) : 780;

    await page.screenshot({
      path: "public/demo/screenshots/01-hero-homepage.png",
      clip: { x: 0, y: 0, width: 1440, height: clipHeight },
      animations: "disabled",
    });
  });

  test("2. Product detail page (Horween Calfskin variant, fully in-stock)", async ({ page }) => {
    // Ensure viewport is high enough so the entire split grid fits without vertical truncation
    await page.setViewportSize({ width: 1440, height: 1300 });
    await page.goto("/products/field-automatic");
    await expect(page.getByRole("heading", { name: /The Field Automatic/i })).toBeVisible();

    // Select Horween Calfskin strap variant
    const horweenBtn = page.getByRole("button", { name: /Horween Calfskin/i }).first();
    await expect(horweenBtn).toBeVisible();
    await horweenBtn.click();
    await expect(page.getByText(/In Stock — Dispatches in 24h/i)).toBeVisible();
    await expect(page.getByText(/\$410\.00/i).first()).toBeVisible();

    // Wait for the primary gallery watch photo to update and settle
    const mainWatchImg = page.locator('img[alt*="front dial elevation"]');
    await expect(mainWatchImg).toBeVisible();

    // Measure the bottom of the split presentation grid (contains gallery + thumbnails on left, controls on right)
    const presentationGrid = page.locator("div.grid.grid-cols-1.lg\\:grid-cols-12").first();
    const gridBox = await presentationGrid.boundingBox();
    const clipHeight = gridBox ? Math.ceil(gridBox.y + gridBox.height + 40) : 1180;

    // Ensure viewport height accommodates clipHeight
    if (clipHeight > 1300) {
      await page.setViewportSize({ width: 1440, height: clipHeight + 60 });
    }

    await page.screenshot({
      path: "public/demo/screenshots/02-product-detail.png",
      clip: { x: 0, y: 0, width: 1440, height: clipHeight },
      animations: "disabled",
    });
  });

  test("3. Spec Matrix close-up (Calibre SW200-1 Elaboré, 28,800 VPH)", async ({ page }) => {
    await page.goto("/products/field-automatic");
    const specHeading = page.getByRole("heading", { name: /Technical Specification Matrix/i });
    await expect(specHeading).toBeVisible();

    // Select Horween Calfskin strap variant so Block 06 reflects Horween leather
    const horweenBtn = page.getByRole("button", { name: /Horween Calfskin/i }).first();
    if (await horweenBtn.isVisible()) {
      await horweenBtn.click();
      await page.waitForTimeout(100);
    }

    await specHeading.scrollIntoViewIfNeeded();

    // Capture the full 6-block specification matrix container as an element screenshot
    const specContainer = page
      .locator("div.w-full")
      .filter({ has: specHeading })
      .last();

    await specContainer.screenshot({
      path: "public/demo/screenshots/03-spec-matrix.png",
      animations: "disabled",
    });
  });

  test("4. Cart drawer, fully loaded (qty stepper, ATELIER10 promo, 100% shipping)", async ({ page, context }) => {
    // 1. Fetch Horween variant from DB
    const horweenVariant = await db.query.productVariants.findFirst({
      where: eq(productVariants.sku, "NW-01-FLD-BLK-LEA"),
    });
    if (!horweenVariant) throw new Error("Horween variant not found in database");

    // 2. Pre-seed the thin cart cookie with 2 units of Horween Calfskin + ATELIER10 promo
    await context.addCookies([
      {
        name: "northwatch_cart",
        value: JSON.stringify({
          items: [{ variantId: horweenVariant.id, quantity: 2 }],
          promoCode: "ATELIER10",
        }),
        domain: "localhost",
        path: "/",
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);

    // 3. Navigate to PDP
    await page.goto("/products/field-automatic");

    // 4. Open the Cart Drawer via the Bag trigger in navbar
    const bagBtn = page.getByRole("button", { name: /Shopping Bag/i });
    await expect(bagBtn).toBeVisible({ timeout: 10000 });
    await bagBtn.click();

    // 5. Ensure cart drawer is open and fully loaded
    const drawer = page.getByRole("dialog");
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText(/Your Selection/i)).toBeVisible();
    await expect(drawer.getByText(/Complimentary insured express delivery unlocked/i)).toBeVisible();
    await expect(drawer.getByText(/100%/i)).toBeVisible();
    await expect(drawer.getByText(/Discount \(ATELIER10\)/i)).toBeVisible();
    await expect(drawer.locator("span.line-through").first()).toBeVisible();

    await page.waitForTimeout(400);

    // Capture the cart drawer cleanly as an element screenshot
    await drawer.screenshot({
      path: "public/demo/screenshots/04-cart-drawer.png",
      animations: "disabled",
    });
  });

  test("5. Checkout — shipping tier selection (Step 1, courier tiers, address, no payment data)", async ({ page, context }) => {
    await setupAuthenticatedCart(context);
    
    // Set a generous viewport height so all fields and actions render fully
    await page.setViewportSize({ width: 1440, height: 1400 });
    await page.goto("/checkout");

    await expect(page.getByRole("heading", { name: /1\. Shipping Destination/i })).toBeVisible({ timeout: 15000 });

    // Fill address fields
    await page.locator('input[name="firstName"]').fill("Marcus");
    await page.locator('input[name="lastName"]').fill("Vance");
    await page.locator('input[name="street"]').fill("Skeppsbron 14");
    await page.locator('input[name="city"]').fill("Stockholm");
    await page.locator('input[name="state"]').fill("Stockholm County");
    await page.locator('input[name="postalCode"]').fill("11130");
    await page.locator('input[name="phone"]').fill("+1 555 019 2834");

    // Select Priority Vault Delivery
    const priorityTier = page.getByText(/Priority Vault Delivery/i).first();
    await expect(priorityTier).toBeVisible();
    await priorityTier.click();

    // Verify real-time reactive sync in Acquisition Summary on the right
    await expect(page.getByText(/Shipping \(Priority Vault Delivery\)/i)).toBeVisible();
    await expect(page.getByText(/\$75\.00/i).first()).toBeVisible();
    await expect(page.getByText(/\$557\.63 USD/i)).toBeVisible();

    // Measure the bottom of both the action button and order summary grid
    const continueBtn = page.getByRole("button", { name: /Continue to Vault Payment/i });
    await expect(continueBtn).toBeVisible();
    const btnBox = await continueBtn.boundingBox();

    const checkoutGrid = page.locator("div.grid.grid-cols-1.lg\\:grid-cols-12").first();
    const gridBox = await checkoutGrid.boundingBox();

    const maxY = Math.max(
      btnBox ? btnBox.y + btnBox.height : 0,
      gridBox ? gridBox.y + gridBox.height : 0
    );
    const clipHeight = Math.ceil(maxY + 48);

    if (clipHeight > 1400) {
      await page.setViewportSize({ width: 1440, height: clipHeight + 60 });
    }

    await page.screenshot({
      path: "public/demo/screenshots/05-checkout-shipping.png",
      clip: { x: 0, y: 0, width: 1440, height: clipHeight },
      animations: "disabled",
    });
  });

  test("6. Mobile PDP with sticky Add to Bag bar (iPhone 16 Pro Max, scrolled to sticky dock)", async ({ browser }) => {
    const mobileContext = await browser.newContext({
      viewport: { width: 440, height: 956 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();

    await mobilePage.addInitScript(() => {
      const style = document.createElement("style");
      style.innerHTML = `
        nextjs-portal, #nextjs-dev-indicator, [data-nextjs-toast] {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
        }
      `;
      document.documentElement.appendChild(style);
    });

    await mobilePage.goto("/products/field-automatic");
    await expect(mobilePage.getByRole("heading", { name: /The Field Automatic/i })).toBeVisible();

    // Select Horween Calfskin ($410)
    const horweenBtn = mobilePage.getByRole("button", { name: /Horween Calfskin/i }).first();
    if (await horweenBtn.isVisible()) {
      await horweenBtn.click();
      await mobilePage.waitForTimeout(200);
    }

    // Reset scroll back to the top so the watch dial hero plate and sticky bottom bar are both in view
    await mobilePage.evaluate(() => window.scrollTo(0, 0));
    await mobilePage.waitForTimeout(300);

    const stickyBar = mobilePage.locator('div.md\\:hidden button:has-text("ADD TO BAG")');
    await expect(stickyBar).toBeVisible();

    await mobilePage.screenshot({
      path: "public/demo/screenshots/06-mobile-pdp.png",
      animations: "disabled",
    });
    await mobileContext.close();
  });

  test("7. Editorial/manufacture page (Caliber NW-CAL.01 architecture split)", async ({ page }) => {
    await page.goto("/manufacture");
    const caliberHeading = page.getByRole("heading", { name: /The Architecture of Caliber NW-CAL.01/i });
    await expect(caliberHeading).toBeVisible();

    // Target the complete Caliber Architecture section as an element screenshot
    const caliberSection = page
      .locator("section")
      .filter({ has: caliberHeading })
      .first();

    await caliberSection.screenshot({
      path: "public/demo/screenshots/07-editorial-manufacture.png",
      animations: "disabled",
    });
  });
});
