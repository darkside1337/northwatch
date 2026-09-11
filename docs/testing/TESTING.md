# Testing Architecture & Layering

Northwatch organizes automated verification across three distinct layers, balancing execution velocity with real-world fidelity:

1. **Unit Tests (`vitest run`)**:
   - **Scope**: Pure domain math (cart, tax, shipping, and order calculations), Zod schema boundaries, and state reducers.
   - **Characteristics**: Fast, in-memory, zero network or database I/O.
   - **Mocking**: Internal module boundaries may be mocked when the test is specifically testing isolated local logic.

2. **Integration Tests (`vitest run`)**:
   - **Scope**: Server actions, database queries, and repository mutations executing against live Postgres.
   - **Characteristics**: Real database state, schema constraints, and advisory lock verification without browser overhead.

3. **End-to-End Tests (`playwright test`)**:
   - **Scope**: Complete customer journeys in a real browser context.
   - **Characteristics**: Real Stripe Dahlia `<PaymentElement />` iframes, authoritatively signed Better Auth session cookies, and asynchronous webhook delivery.

---

## Non-Negotiable Invariants

All test development is strictly governed by the **Testing & Automation Policy** in `AGENTS.md`:

1. **No Fake Third-Party Boundaries**: Integration and E2E suites exercise real vendor sandboxes (e.g., Stripe Dahlia test mode). Zero simulated clients or mock payment forms.
2. **Authoritative Security Fixtures**: Never forge, decode, or hand-roll session cookies. All auth fixtures must delegate to official framework test utilities.
3. **Diagnose Before Patching**: Do not enter speculative trial-and-error loops when automation selectors fail. Inspect live runtime structure (`page.frames()`, accessibility snapshots) before modifying code.
4. **Multi-Plane Isolation**: Isolate both client storage (cookies/storage) and persistent backend state (database drafts, pending orders).
5. **Focused Scenarios**: Avoid monolithic tests whose failure diagnosis depends on a long chain of unrelated actions. Structure tests around a single primary behavior or failure mode.
6. **Eventual Consistency**: Use bounded polling (`expect.poll()`) for asynchronous webhook settlements; never rely on arbitrary sleeps (`waitForTimeout`).

---

## Detailed Guides & Mechanics

- **[Playwright Automation Conventions](./PLAYWRIGHT.md)** — Test runner configuration, dedicated port pinning (`3333`), strict mode selector disambiguation, and diagnostic inspection protocols.
- **[Stripe Dahlia Testing](./STRIPE.md)** — Dahlia iframe composition (`accessory` vs. `easel`), test card matrix, local webhook forwarding, and payment idempotency.
- **[Better Auth Security Fixtures](./AUTH.md)** — Official `testUtils` integration, HMAC cookie signatures, the subordination contract for helpers, and dual-plane session persistence.
