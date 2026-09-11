import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.BASE_URL || "http://localhost:3333";

export default defineConfig({
  testDir: "./e2e-demo",
  outputDir: "./demo-recordings",
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  use: {
    baseURL,
    trace: "off",
  },
  projects: [
    {
      name: "demo-desktop",
      testMatch: ["**/flow1-customizer.spec.ts", "**/flow2-checkout.spec.ts"],
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1920, height: 1080 },
        video: {
          mode: "on",
          size: { width: 1920, height: 1080 },
        },
        deviceScaleFactor: 1,
      },
    },
    {
      name: "demo-mobile",
      testMatch: ["**/flow3-mobile.spec.ts"],
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 440, height: 956 },
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
        isMobile: true,
        hasTouch: true,
        video: {
          mode: "on",
          size: { width: 440, height: 956 },
        },
        deviceScaleFactor: 2,
      },
    },
    {
      name: "demo-screenshots",
      testMatch: ["**/screenshots.spec.ts"],
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 2,
        video: "off",
      },
    },
  ],
});
