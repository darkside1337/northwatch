# Playwright E2E Automation Conventions

Guidelines and patterns for maintaining the Playwright E2E test suite in `e2e/`.

---

## 1. Environment & Dedicated Ports
- **Dedicated Test Port**: Run tests against a dedicated local port (`http://localhost:3333`) to prevent collisions with default developer servers on port 3000 in WSL2/Linux.
- **`playwright.config.ts` Configuration**:
  ```ts
  webServer: {
    command: "pnpm exec next dev -p 3333",
    url: "http://localhost:3333",
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: "http://localhost:3333",
  },
  ```

---

## 2. Diagnostic Runtime Inspection Protocol
When an automation step or iframe fails:
1. **Never guess selectors repeatedly**.
2. **Execute a diagnostic inspection** to print the live frames and inputs:
   ```ts
   const frames = page.frames();
   for (const f of frames) {
     console.log("FRAME:", f.name(), "| url:", f.url());
     const inputs = await f.locator("input").all();
     for (const inp of inputs) {
       console.log("  Input:", await inp.getAttribute("id"), await inp.getAttribute("autocomplete"));
     }
   }
   ```
3. **Inspect the Playwright error-context artifact**:
   Review `test-results/<test-name>/error-context.md` for the exact accessibility snapshot and HTML tree generated at the moment of failure.

---

## 3. Resilient Selector Standards
- **Strict Mode Disambiguation**: Playwright enforces strict mode (1 locator = 1 matching element). If a locator matches multiple elements, disambiguate with:
  - Exact text matching: `page.getByText('Express Air Courier', { exact: true })`
  - Structural filtering: `page.frameLocator('iframe[title="Secure payment input frame"]:not([src*="easel"])')`
  - Scoped role selectors: `page.getByRole("button", { name: /Authorize Payment/i })`
- **Never rely on private third-party names**: Avoid `__privateStripeFrame*` or ephemeral vendor generated IDs that change between SDK patch releases.

---

## 4. Synchronization & Polling Rules
- **No arbitrary sleeps**: Never write `await page.waitForTimeout(5000)` to wait for backend state or webhook processing.
- **Database polling**: Use `expect.poll()` to verify background transactions:
  ```ts
  await expect.poll(async () => {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });
    return order?.status;
  }, { timeout: 20000, intervals: [500, 1000] }).toBe("paid");
  ```
- **UI State updates**: Assert against user-visible text or status seals (`page.getByText(/VAULT ALLOCATION CONFIRMED/i)`) once database assertions resolve.

---

## 5. Fixtures, Scenarios & State Isolation
- **Authentication Subordination**: Mount signed session cookies using `loginAsTestCollector(context)` from `e2e/auth-helper.ts`. This helper must strictly delegate to Better Auth's official `testUtils` plugin; never copy session construction logic into test helpers.
- **Focused Scenarios**: Avoid tests whose failure diagnosis depends on a long chain of unrelated actions. Structure tests around a single primary behavior or failure mode. Shared pre-conditions belong in fixtures, not duplicated UI navigation clicks.
- **Cart Pre-Population**: Add items directly to the thin cart cookie (`northwatch_cart`) via `setupAuthenticatedCart(context)` rather than clicking through catalog navigation on every test.
- **Multi-Plane Cleanup**: In `beforeEach`, ensure both browser cookies are cleared and any lingering test orders for the test collector are cleaned up in the database.
