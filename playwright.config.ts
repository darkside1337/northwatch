import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.BASE_URL || "http://localhost:3333";
const port = process.env.PORT || "3333";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  ...(process.env.NO_WEBSERVER
    ? {}
    : {
        webServer: {
          command: `stripe listen --forward-to localhost:${port}/api/webhooks/stripe & pnpm exec next dev -p ${port}`,
          url: baseURL,
          reuseExistingServer: true,
          timeout: 120000,
        },
      }),
});
