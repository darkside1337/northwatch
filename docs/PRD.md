# Northwatch — Product Requirements Document

## 1. Overview

Northwatch is a full-stack ecommerce storefront for a premium men's watch brand. It is a personal project built to production standards: realistic scope, clean architecture, and a boutique/editorial visual identity rather than a generic ecommerce template.

**Product**: A curated collection of minimalist men's watches.
**Positioning**: Scandinavian minimalism, precision, understated luxury, timeless design.
**Scope for v1**: Streamlined core feature set — catalog, cart, checkout, payments, orders, search (Postgres ILIKE / full-text), auth. Verified user reviews and external Algolia search index are planned for Phase 2.

## 2. Architectural Principle

> **Routes compose features; features contain business logic.**

This is the single most important rule of the codebase. `app/` must stay thin — it renders layouts and composes calls into `features/`. All domain logic, validation, and data access for a given capability lives inside its feature folder. `app/` should never contain business logic, and `features/` should never contain routing concerns.

### Directory structure

```
app/          → routes, layouts, page composition (thin)
features/     → business/domain logic, organized by feature
lib/          → database, Stripe, auth, caching (infrastructure)
components/   → reusable, presentation-only UI primitives
config/       → environment and site configuration
docs/         → product requirements and architectural decisions
e2e/          → critical end-to-end tests (checkout must never break)
```

### app/ layout

```
app/
  (shop)/
    page.tsx                          # homepage — thin, imports from features/catalog
    products/
      page.tsx                        # listing — imports features/catalog
      [slug]/
        page.tsx                      # PDP — imports features/catalog (editorial quotes in v1; reviews in Phase 2)
        loading.tsx
    cart/
      page.tsx                        # imports features/cart
    checkout/
      layout.tsx                      # strips nav/footer, adds trust badges
      page.tsx                        # checkout entry / order summary
      shipping/page.tsx               # shipping & address form
      payment/page.tsx                # Stripe payment collection (Elements)
      confirmation/[orderId]/page.tsx
  (account)/
    login/page.tsx                    # OAuth actions via Better Auth
    orders/page.tsx                   # order history → features/orders
    orders/[orderId]/page.tsx
  api/
    auth/[...all]/route.ts            # Better Auth catch-all handler
    webhooks/
      stripe/route.ts                 # signature verify only, delegates to features/orders
  layout.tsx
```

### features/ modules

- **catalog/** — components (ProductCard, ProductGallery, VariantPicker), queries (getProduct, getRelatedProducts, `'use cache'`), Zod schemas (Product, Variant, Price), types
- **cart/** — components (CartDrawer, LineItem, PromoInput), server actions (addItem, applyPromo — `'use server'`), client cart state (Zustand/Context), schemas
- **checkout/** — components (AddressForm, PaymentForm, OrderSummary), actions (createPaymentIntent, placeOrder), strict Zod schemas — **this is where bugs cost money**
- **orders/** — actions (fulfillOrder, refund — called by webhook + admin), queries, types
- **reviews/** — *(Phase 2)* components, actions (submitReview, with purchase-verification check), schemas. In v1, PDPs display curated editorial quotes from catalog data.
- **search/** — *(Phase 2)* queries (wraps Algolia client), components. In v1, search is integrated directly into `features/catalog/queries.ts` via SQL ILIKE / full-text search.
- **auth/** — actions (Better Auth OAuth dispatch: Google, GitHub), schemas

### lib/ modules

- **db/** — schema.ts (Drizzle: products, orders, users), client.ts
- **payments/** — stripe.ts (thin SDK wrapper, no business logic)
- **auth/** — session.ts
- **cache.ts**

### components/ and config/

- **components/ui/** — shadcn primitives (Button, Dialog, Skeleton)
- **config/** — env.ts (typed env: shipping API keys, Stripe keys), site.ts (currency, tax rules per region)

### Root-level files

- `AGENTS.md` — managed by `next dev` (16.3+), points to bundled docs
- `CLAUDE.md` — thin pointer: "See AGENTS.md"
- `docs/PRD.md` — this file
- `docs/DESIGN.md` — design system (Horological Restraint), tokens, typography, component specs
- `proxy.ts` — auth gate for `/account`, `/checkout`; **not** `middleware.ts`

## 3. Core Customer Journey

```
Homepage → Browse Watches → Product Page → Choose Variant → Add to Cart
  → Checkout → Shipping → Payment → Order Confirmation → Account / Order History
```

## 4. Features

### 4.1 Catalog

- Product listing with filtering
- Product detail pages
- Watch variants (case size, strap, dial color, etc.)
- Product image galleries
- Related products
- Zod validation and shared types for all product data

### 4.2 Cart

- Client-side cart state
- Add / remove / update line items
- Promo codes
- Cart drawer (slide-out, not a full page redirect)

### 4.3 Checkout

- Shipping information form
- Payment form
- Order summary
- Strict server-side validation (Zod)
- Server-side price, tax, and shipping calculations — **never trust client-submitted totals**

### 4.4 Payments

- Stripe integration
- Payment intents
- Webhook signature verification (`api/webhooks/stripe/route.ts` verifies only, delegates fulfillment to `features/orders`)
- Order fulfillment and refunds

### 4.5 Orders

- Order creation
- Order history (account area)
- Order detail pages
- Fulfillment logic, triggered by webhook or admin action

### 4.6 Reviews (Phase 2)

- In v1, product detail pages display curated editorial quotes directly from catalog data / static layout.
- Phase 2: Full user-submitted reviews with purchase verification before submission.

### 4.7 Search

- In v1, search is handled natively via SQL `ILIKE` (or Postgres full-text search) in `features/catalog/queries.ts` across watch title, reference code, and dial parameters.
- Phase 2: Dedicated Algolia search index if catalog size or query complexity grows.

### 4.8 Auth

- Better Auth with OAuth only — Google and GitHub (no email/password)
- Sign in / sign up
- Protected routes: `/account/*` and `/checkout/*`, enforced via `proxy.ts` (edge presence check) with authoritative session resolution in layouts/actions

## 5. Technical Stack

| Layer         | Choice                                        |
| ------------- | --------------------------------------------- |
| Framework     | Next.js 16 (App Router)                       |
| Database      | Neon (Postgres)                               |
| ORM           | Drizzle                                       |
| Payments      | Stripe                                        |
| Search        | Postgres ILIKE / FTS (v1); Algolia (Phase 2)   |
| Auth          | Better Auth (OAuth: Google, GitHub)           |
| UI primitives | shadcn/ui                                     |
| Validation    | Zod                                           |
| Deployment    | TBD                                           |

## 6. Visual Direction

The storefront should read as a **premium watch boutique / editorial site**, not a generic ecommerce template.

**Palette**

- Warm off-white / ivory (base)
- Near-black (typography)
- Charcoal and brushed-metal gray (secondary)
- Restrained dark olive or navy (accent — used sparingly)

**Design language**

- Large, high-quality watch photography
- Strong, confident typography
- Generous whitespace
- Thin borders over shadows
- Minimal shadows, subtle interactions/transitions

**Explicitly avoid**: purple/blue gradients, neon colors, glassmorphism, "AI SaaS" aesthetics.

> For complete design tokens, typography scales, spacing rules, and component interaction states, refer to [docs/DESIGN.md](file:///home/darkside/projects/northwatch/docs/DESIGN.md).

## 7. Non-Negotiable Rules for Agentic Development

1. Routes compose features; features contain business logic. Never put business logic in `app/`.
2. All checkout math (price, tax, shipping) is computed server-side. Client-submitted totals are never trusted.
3. All external data crossing a trust boundary (form input, API responses, webhook payloads) is validated with Zod before use.
4. Stripe webhook route only verifies signatures and delegates — it does not contain fulfillment logic itself.
5. Auth gating for `/account` and `/checkout` lives in `proxy.ts`, not `middleware.ts`.
6. `components/` imports nothing from `features/`. If a component needs feature data, it receives it as props — this keeps it presentation-only and reusable, and is mechanically checkable.
7. Drizzle schema changes are made through migrations only, never a manual/direct edit to the database. Checkout, orders, and payments all depend on schema integrity.
8. `e2e/checkout.spec.ts` protects the critical purchase flow and must be kept passing — this is the one flow that must never break.

### Conventions (guidance, not hard rules)

- Keep files small and scoped to one responsibility — flag any file that grows past ~200 lines for a possible split.

## 8. Open Questions

- Deployment target not yet decided.
- Tax/shipping calculation provider (self-computed vs third-party API) not yet decided.
