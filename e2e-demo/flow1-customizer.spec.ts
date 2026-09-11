import { test, expect } from "@playwright/test";
import * as fs from "node:fs";
import { injectVisualCursor, smoothClick, smoothMove } from "./cursor-helper";

test.describe("Flow 1: Variant Customizer & Spec Matrix", () => {
  test.afterEach(async ({ page }, testInfo) => {
    await page.close();
    const video = page.video();
    if (video) {
      const videoPath = await video.path();
      fs.mkdirSync("./demo-recordings", { recursive: true });
      fs.copyFileSync(videoPath, "./demo-recordings/flow1-customizer.webm");
      return;
    }
    const attachment = testInfo.attachments.find((a) => a.name === "video");
    if (attachment?.path) {
      fs.mkdirSync("./demo-recordings", { recursive: true });
      fs.copyFileSync(attachment.path, "./demo-recordings/flow1-customizer.webm");
    }
  });

  test("Record Flow 1 - Customizer and Spec Matrix", async ({ page }) => {
    // 1. Inject macOS cursor
    await injectVisualCursor(page);

    // 2. Land on /products/field-automatic, hold 0.5s on hero shot
    await page.goto("/products/field-automatic");
    await expect(page.getByRole("heading", { name: /The Field Automatic/i })).toBeVisible();
    await smoothMove(page, 720, 380, 20);
    await page.waitForTimeout(500);

    // 3. Click strap variant Olive Canvas ($380) → note price update
    const oliveBtn = page.getByRole("button", { name: /Olive Canvas/i }).first();
    await expect(oliveBtn).toBeVisible();
    await smoothClick(page, oliveBtn, 18);
    await page.waitForTimeout(600);

    // 4. Click strap variant Horween Calfskin ($410) → price updates, inventory pip pulses green
    const horweenBtn = page.getByRole("button", { name: /Horween Calfskin/i }).first();
    await expect(horweenBtn).toBeVisible();
    await smoothClick(page, horweenBtn, 18);
    await expect(page.getByText(/In Stock — Dispatches in 24h/i)).toBeVisible();
    await page.waitForTimeout(600);

    // 5. Click strap variant Milanese Mesh → pip switches to gray ("Archive Depleted")
    const milaneseBtn = page.getByRole("button", { name: /Milanese Mesh/i }).first();
    await expect(milaneseBtn).toBeVisible();
    await smoothClick(page, milaneseBtn, 18);
    await expect(page.getByText(/Archive Depleted/i)).toBeVisible();
    await page.waitForTimeout(700);

    // 6. Switch back to Horween Calfskin (leave on an in-stock, purchasable state)
    await smoothClick(page, horweenBtn, 18);
    await page.waitForTimeout(600);

    // 7. Scroll gallery through 2–3 plates
    // Plate 02: Exhibition Caseback (Geneva stripes)
    const plate2 = page.getByRole("button", { name: /EXHIBITION CASEBACK/i }).first();
    if (await plate2.isVisible()) {
      await smoothClick(page, plate2, 18);
      await page.waitForTimeout(700);
    }

    // Plate 04: Flank Architecture
    const plate4 = page.getByRole("button", { name: /FLANK ARCHITECTURE/i }).first();
    if (await plate4.isVisible()) {
      await smoothClick(page, plate4, 18);
      await page.waitForTimeout(700);
    }

    // Plate 05: Macro Loupe dial detail
    const plate5 = page.getByRole("button", { name: /HOROLOGY MACRO LOUPE/i }).first();
    if (await plate5.isVisible()) {
      await smoothClick(page, plate5, 18);
      await page.waitForTimeout(700);
    }

    // 8. Scroll to Technical Spec Matrix
    await page.mouse.wheel(0, 520);
    await page.waitForTimeout(400);

    // Hover/pause over Calibre row
    const calibreRow = page.getByText(/Sellita SW200/i).first();
    if (await calibreRow.isVisible()) {
      const box = await calibreRow.boundingBox();
      if (box) await smoothMove(page, box.x + box.width / 2, box.y + box.height / 2, 18);
      await page.waitForTimeout(600);
    }

    // Hover/pause over Frequency row
    const freqRow = page.getByText(/28,800 VPH/i).first();
    if (await freqRow.isVisible()) {
      const box = await freqRow.boundingBox();
      if (box) await smoothMove(page, box.x + box.width / 2, box.y + box.height / 2, 18);
      await page.waitForTimeout(600);
    }

    // 9. Hold final frame 0.5s
    await page.waitForTimeout(500);
  });
});
