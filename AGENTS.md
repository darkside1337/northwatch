<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Northwatch Agent Guidelines

## 0. Task & Tool Transparency & Planning Workflow

When invoking any tool or background task (`run_command`, `view_file`, `replace_file_content`, `invoke_subagent`, etc.):
- Always format `toolAction` with a concise action followed by a brief purpose in parentheses explaining **why** it is being executed.
- Format: `<Action> (<reason>)`
- Examples:
  - `Running command (verifying clean git working tree)`
  - `Viewing file (checking auth session validation logic)`
  - `Editing file (updating cart item quantity)`
  - `Subagent: research (auditing Stripe webhook idempotency)`

### Plan Mode & Implementation Plans
- When creating implementation plans in plan mode (`/plan`), always write or mirror the plan markdown file into the project's `plans/` directory (e.g. `plans/<plan-name>.md` or `plans/NNN-<topic>.md`).
- Because `plans/` is ignored in `.gitignore`, these files remain local reference docs without polluting git tracking or commits.

## 1. Project & Stack Overview

Northwatch is a boutique ecommerce storefront for minimalist men's watches built with production-grade architecture.

- **Framework**: Next.js 16 (App Router)
- **Database / ORM**: Neon Postgres + Drizzle ORM
- **Auth & Payments**: Better Auth, Stripe
- **UI & Styling**: Tailwind CSS v4, shadcn/ui (presentation primitives)
- **Package Manager**: pnpm

## 2. The Golden Architectural Rule

> **Routes compose features; features contain business logic.**

- `app/` stays thin — renders layouts and composes feature calls. Never put business logic in `app/`.
- `features/` encapsulates all domain models, queries, actions, and validation for each domain. Never leak routing into `features/`.
- `components/` is presentation-only — reusable primitives that never import from `features/` and receive all data via props, with no awareness of domain shape (cart, orders, catalog).
- Domain-aware UI (e.g. `CartDrawer`, `CartReviewView`, `PromoInput`) that reads feature-specific state or types belongs inside `features/<domain>/components/`, not the top-level `components/` directory, even though it's still "UI."
- `lib/` contains shared infrastructure clients (db, stripe, auth, cache).

## 3. Non-Negotiable Invariants

1. **Client totals are untrusted**: All calculation of cart amounts, taxes, discounts, shipping, and order totals happens exclusively on the server.
2. **Validate all trust boundaries**: Every server action, route handler, and mutation must validate input via Zod.
3. **Webhooks delegate only**: Webhook handlers (e.g. `app/api/webhooks/stripe/route.ts`) verify signatures and hand off to `features/orders`. No inline fulfillment logic.
4. **Auth gating in proxy.ts**: Route protection for `/account` and `/checkout` lives in `proxy.ts`, **never** `middleware.ts`.
5. **Schema changes via migrations**: Drizzle schema updates must use migration files generated via Drizzle Kit.
6. **Checkout E2E coverage is a hard prerequisite for Phase 5**: Playwright test runner setup and `e2e/checkout.spec.ts` must exist and pass before checkout work is considered complete. Once established, this suite is critical path and must never be left broken across a commit.
7. **Mobile-First Delivery**: All UI primitives, pages, and components must be authored and verified mobile-first. Base Tailwind classes target mobile viewports (<640px), with `md:` and `lg:` reserved strictly for progressive desktop enhancement. No single-column catalog grids on mobile per DESIGN.md.
8. **Componentize Repeated UI & Map Over Data**: Never write duplicate repeating JSX structures inline. Whenever a visual pattern, section layout, or element repeats (or can be reused across views like section headers, product grids, spec matrices, cards), extract it into a dedicated component with typed props and render using `.map()` over structured data.
9. **Prioritize Local Assets (Temporary — Pre-DB Population)**: Always prioritize and use local assets in `public/images/` over remote placeholder URLs. Once the database is populated with production product asset URLs, components will transition to database-backed images.
10. **Verify Next.js 16 API claims against bundled docs**: Any invariant in this file describing Next.js-specific mechanics (cookie write boundaries, `proxy.ts` vs `middleware.ts`, PPR behavior) should be spot-checked against `node_modules/next/dist/docs/` before being extended to new code — this file's authors may be relying on outdated assumptions too.
11. **Signed Session Cookies**: Never hand-roll session cookies in test fixtures. Generate valid signed cookies via Better Auth's `testUtils` plugin (`test.login()`).

## 4. Git & Commit Workflow

1. **No autonomous commits**: Never run `git commit` automatically. When a milestone or logical chunk of work is complete and verified, suggest a conventional commit command with a proposed message and the list of files to stage, then wait for user instruction.
2. **Never push autonomously**: Never run `git push` unless the user explicitly commands it in that exact prompt.

## 5. Progressive Disclosure (Read When Needed)

- **Architecture & request lifecycles**: Read [docs/ARCHITECTURE.md](file:///home/darkside/projects/northwatch/docs/ARCHITECTURE.md) for system boundaries, order lifecycles, webhook idempotency, and database transaction specifications.
- **Feature specs & domain workflows**: Read [docs/PRD.md](file:///home/darkside/projects/northwatch/docs/PRD.md) when building or modifying customer journeys, features (`cart`, `catalog`, `checkout`, `orders`, `reviews`), or database schemas.
- **Design system & visual styling**: Read [docs/DESIGN.md](file:///home/darkside/projects/northwatch/docs/DESIGN.md) for complete design tokens, typography scales, spacing, hairline borders, and component specs.
- **Next.js 16 APIs & breaking changes**: Read the bundled guides in `node_modules/next/dist/docs/`.
- **Edge-case and adversarial review checklist**: Read [docs/edge-case-rules.md](file:///home/darkside/projects/northwatch/docs/edge-case-rules.md) before marking any step group complete that touches money, inventory, or shared/mutable state (cart, checkout, orders, promo logic). Run through it as a self-check, not just a reference.
- **Testing, E2E automation & sandbox integration**: Read [docs/testing/TESTING.md](file:///home/darkside/projects/northwatch/docs/testing/TESTING.md) when writing, refactoring, or debugging unit tests, Playwright specs, or third-party fixtures.

## 6. Key Commands

- `pnpm dev` — Start development server
- `pnpm build` — Production build
- `pnpm lint` — Run ESLint checks
- `pnpm test` — Run unit test suite (Vitest)
- `pnpm drizzle-kit generate` — Generate SQL migrations from schema
- `pnpm drizzle-kit migrate` — Run pending database migrations
- `pnpm db:studio` — Launch visual Drizzle Studio database browser
- `pnpm test:e2e` — Run Playwright checkout E2E test suite
