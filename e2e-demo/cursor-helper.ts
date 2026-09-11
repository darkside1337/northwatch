import { type Page, type Locator } from "@playwright/test";

export async function injectVisualCursor(page: Page) {
  await page.addInitScript(() => {
    function setupCursor() {
      if (document.getElementById("playwright-demo-cursor")) return;

      const initX = window.innerWidth / 2;
      const initY = window.innerHeight / 2;
      let lastX = initX;
      let lastY = initY;

      // Authentic macOS Arrow Pointer SVG
      const cursor = document.createElement("div");
      cursor.id = "playwright-demo-cursor";
      cursor.style.position = "fixed";
      cursor.style.top = "0";
      cursor.style.left = "0";
      cursor.style.width = "26px";
      cursor.style.height = "26px";
      cursor.style.pointerEvents = "none";
      cursor.style.zIndex = "2147483647";
      cursor.style.transformOrigin = "1px 1px";
      cursor.style.filter = "drop-shadow(0 2px 5px rgba(0, 0, 0, 0.4))";
      cursor.style.transition = "transform 0.08s cubic-bezier(0.2, 0, 0, 1)";
      cursor.style.transform = `translate(${initX - 1}px, ${initY - 1}px)`;

      cursor.innerHTML = `
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1 L1 19 L6 14.5 L10.5 24 L13.5 22.5 L9 13.5 L15 13.5 Z" 
                fill="#111111" 
                stroke="#FFFFFF" 
                stroke-width="1.35" 
                stroke-linejoin="round" 
                stroke-linecap="round"/>
        </svg>
      `;

      // Apple-style click / tap ripple ping
      const ripple = document.createElement("div");
      ripple.id = "playwright-demo-ripple";
      ripple.style.position = "fixed";
      ripple.style.top = "0";
      ripple.style.left = "0";
      ripple.style.width = "28px";
      ripple.style.height = "28px";
      ripple.style.borderRadius = "50%";
      ripple.style.border = "2px solid rgba(20, 20, 19, 0.45)";
      ripple.style.backgroundColor = "rgba(20, 20, 19, 0.08)";
      ripple.style.pointerEvents = "none";
      ripple.style.zIndex = "2147483646";
      ripple.style.transform = `translate(${initX}px, ${initY}px) scale(0)`;
      ripple.style.opacity = "0";
      ripple.style.transition = "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease";

      document.body.appendChild(cursor);
      document.body.appendChild(ripple);

      // Desktop Mouse tracking
      window.addEventListener("mousemove", (e) => {
        lastX = e.clientX;
        lastY = e.clientY;
        cursor.style.transform = `translate(${lastX - 1}px, ${lastY - 1}px)`;
      });

      window.addEventListener("mousedown", () => {
        cursor.style.transform = `translate(${lastX - 1}px, ${lastY - 1}px) scale(0.92)`;
        ripple.style.transform = `translate(${lastX}px, ${lastY}px) scale(1.4)`;
        ripple.style.opacity = "1";
      });

      window.addEventListener("mouseup", () => {
        cursor.style.transform = `translate(${lastX - 1}px, ${lastY - 1}px) scale(1)`;
        ripple.style.transform = `translate(${lastX}px, ${lastY}px) scale(2)`;
        ripple.style.opacity = "0";
      });

      // Mobile Touch tracking
      window.addEventListener("touchstart", (e) => {
        if (e.touches.length > 0) {
          lastX = e.touches[0].clientX;
          lastY = e.touches[0].clientY;
          cursor.style.transform = `translate(${lastX - 1}px, ${lastY - 1}px) scale(0.92)`;
          ripple.style.transform = `translate(${lastX}px, ${lastY}px) scale(1.4)`;
          ripple.style.opacity = "1";
        }
      });

      window.addEventListener("touchmove", (e) => {
        if (e.touches.length > 0) {
          lastX = e.touches[0].clientX;
          lastY = e.touches[0].clientY;
          cursor.style.transform = `translate(${lastX - 1}px, ${lastY - 1}px)`;
        }
      });

      window.addEventListener("touchend", () => {
        cursor.style.transform = `translate(${lastX - 1}px, ${lastY - 1}px) scale(1)`;
        ripple.style.transform = `translate(${lastX}px, ${lastY}px) scale(2)`;
        ripple.style.opacity = "0";
      });
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", setupCursor);
    } else {
      setupCursor();
    }
  });
}

export async function smoothMove(page: Page, targetX: number, targetY: number, steps = 25) {
  await page.mouse.move(targetX, targetY, { steps });
}

export async function smoothClick(page: Page, target: Locator | string, steps = 25) {
  const locator = typeof target === "string" ? page.locator(target) : target;
  await locator.scrollIntoViewIfNeeded();
  await page.waitForTimeout(120);

  const box = await locator.boundingBox();
  if (box) {
    const targetX = box.x + box.width / 2;
    const targetY = box.y + box.height / 2;
    await smoothMove(page, targetX, targetY, steps);
    await page.waitForTimeout(140);
  }
  await locator.click();
  await page.waitForTimeout(200);
}

export async function smoothType(page: Page, target: Locator | string, text: string, delay = 60) {
  const locator = typeof target === "string" ? page.locator(target) : target;
  await smoothClick(page, locator, 20);
  await page.waitForTimeout(120);
  await page.keyboard.type(text, { delay });
  await page.waitForTimeout(180);
}
