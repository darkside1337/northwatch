import { test, expect } from "@playwright/test";
import * as fs from "node:fs";
import { injectVisualCursor, smoothClick, smoothMove } from "./cursor-helper";

test.describe("Flow 3: Mobile-First Viewport", () => {
  test.afterEach(async ({ page }, testInfo) => {
    await page.close();
    const video = page.video();
    if (video) {
      const videoPath = await video.path();
      fs.mkdirSync("./demo-recordings", { recursive: true });
      fs.copyFileSync(videoPath, "./demo-recordings/flow3-mobile.webm");
      return;
    }
    const attachment = testInfo.attachments.find((a) => a.name === "video");
    if (attachment?.path) {
      fs.mkdirSync("./demo-recordings", { recursive: true });
      fs.copyFileSync(attachment.path, "./demo-recordings/flow3-mobile.webm");
    }
  });

  test("Record Flow 3 - Mobile-First Experience", async ({ page }) => {
    test.setTimeout(45000);

    // 1. Inject mobile cursor/touch indicator
    await injectVisualCursor(page);

    // 2. Mobile homepage load, pause 0.4s
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Refined by restraint/i })).toBeVisible();
    await smoothMove(page, 220, 320, 15);
    await page.waitForTimeout(400);

    // 3. Tap hamburger icon → slide-in nav reveals, pause 0.4s
    const hamburger = page.getByRole("button", { name: /Open Navigation Menu/i });
    await expect(hamburger).toBeVisible();
    await smoothClick(page, hamburger, 15);
    await expect(page.getByText("Search Collection")).toBeVisible();
    await page.waitForTimeout(400);

    // 4. Tap Catalog link inside mobile nav → navigate to mobile catalog
    const catalogLink = page.locator('nav[aria-label="Mobile Navigation"] a[href="/products"]').or(page.getByRole("link", { name: /Catalog/i })).first();
    await smoothClick(page, catalogLink, 15);

    // 5. Arrive on mobile catalog (/products) → scroll 2-column product grid briefly
    await expect(page.getByRole("heading", { name: /Active Collection/i })).toBeVisible();
    await page.mouse.wheel(0, 260);
    await page.waitForTimeout(400);

    // 6. Tap filter icon → bottom-sheet filter drawer slides up, pause 0.4s, dismiss
    const filterBtn = page.getByRole("button", { name: /Filters & Sort/i });
    await expect(filterBtn).toBeVisible();
    await smoothClick(page, filterBtn, 15);
    await page.waitForTimeout(400);

    const applyFilterBtn = page.getByRole("button", { name: "Apply", exact: true });
    if (await applyFilterBtn.isVisible()) {
      await smoothClick(page, applyFilterBtn, 15);
      await page.waitForTimeout(400);
    }

    // 7. Tap into a product → mobile PDP
    const productCard = page.locator('a[href="/products/field-automatic"]').first();
    await expect(productCard).toBeVisible();
    await smoothClick(page, productCard, 15);

    // 8. On mobile PDP, scroll past gallery to reveal sticky bottom Add to Bag bar
    await expect(page.getByRole("heading", { name: /The Field Automatic/i })).toBeVisible();
    await page.mouse.wheel(0, 320);
    await page.waitForTimeout(400);

    // 9. Tap Add to Bag on the sticky bottom bar → full-screen mobile cart drawer slides up
    const stickyAddToBag = page.locator('div.md\\:hidden button:has-text("ADD TO BAG")').first();
    await expect(stickyAddToBag).toBeVisible();
    await smoothClick(page, stickyAddToBag, 15);

    // 10. Hold final frame 0.6s on the mobile cart contents
    await expect(page.getByText(/Your Selection/i)).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(600);
  });
});
