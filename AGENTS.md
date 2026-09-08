<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Northwatch Agent Guidelines

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
- `components/` is presentation-only — reusable primitives that never import from `features/`.
- `lib/` contains shared infrastructure clients (db, stripe, auth, cache).

## 3. Non-Negotiable Invariants

1. **Client totals are untrusted**: All calculation of cart amounts, taxes, discounts, shipping, and order totals happens exclusively on the server.
2. **Validate all trust boundaries**: Every server action, route handler, and mutation must validate input via Zod.
3. **Webhooks delegate only**: Webhook handlers (e.g. `app/api/webhooks/stripe/route.ts`) verify signatures and hand off to `features/orders`. No inline fulfillment logic.
4. **Auth gating in proxy.ts**: Route protection for `/account` and `/checkout` lives in `proxy.ts`, **never** `middleware.ts`.
5. **Schema changes via migrations**: Drizzle schema updates must use migration files generated via Drizzle Kit.
6. **E2E checkout test must never break**: The checkout flow (`e2e/checkout.spec.ts`) is critical path [TODO: test runner setup pending].

## 4. Progressive Disclosure (Read When Needed)

- **Architecture & request lifecycles**: Read [docs/ARCHITECTURE.md](file:///home/darkside/projects/northwatch/docs/ARCHITECTURE.md) for system boundaries, order lifecycles, webhook idempotency, and database transaction specifications.
- **Feature specs & domain workflows**: Read [docs/PRD.md](file:///home/darkside/projects/northwatch/docs/PRD.md) when building or modifying customer journeys, features (`cart`, `catalog`, `checkout`, `orders`, `reviews`), or database schemas.
- **Design system & visual styling**: Read [docs/DESIGN.md](file:///home/darkside/projects/northwatch/docs/DESIGN.md) for complete design tokens, typography scales, spacing, hairline borders, and component specs.
- **Next.js 16 APIs & breaking changes**: Read the bundled guides in `node_modules/next/dist/docs/`.

## 5. Key Commands

- `pnpm dev` — Start development server
- `pnpm build` — Production build
- `pnpm lint` — Run ESLint checks
- `pnpm test` — Run unit test suite (Vitest)
- `pnpm drizzle-kit generate` — Generate SQL migrations from schema
- `pnpm drizzle-kit migrate` — Run pending database migrations
- `pnpm test:e2e` — [TODO] Run Playwright checkout E2E test suite
