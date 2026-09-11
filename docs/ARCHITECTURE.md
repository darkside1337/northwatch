# Northwatch Architecture Specification (Streamlined v1)

Architectural boundaries, directory structure, and data flow invariants for Northwatch.

---

## 1. Core Architectural Invariants

1. **Thin Routes**: `app/` handles page composition, routing segments, and layouts only. It must contain zero raw database calls, Stripe calls, or checkout math.
2. **Feature Encapsulation**: Domain business logic, actions, queries, and schemas live strictly in `features/[domain]`.
3. **Pure Presentation Primitives**: `components/ui/` components are domain-agnostic. They receive data only through props and never import from `features/` or `lib/`.
4. **Server-Owned Math**: Prices, taxes, promotions, and shipping fees are calculated and verified exclusively on the server. Client totals are untrusted.
5. **Delegated Webhooks**: Stripe webhook routes verify signatures only and immediately delegate fulfillment to `features/orders`.
6. **Edge Auth Gate**: Route protection for `/account/*` and `/checkout/*` is defined in `proxy.ts`, not `middleware.ts`.
7. **Validate All Trust Boundaries**: Every server action, route handler, and webhook payload is validated with Zod before use — no exceptions.
8. **Migrations-Only Schema Changes**: Drizzle schema updates are made exclusively through migration files generated via Drizzle Kit (`pnpm drizzle-kit generate` → `pnpm drizzle-kit migrate`). No manual/direct database edits.
9. **Checkout E2E Is Critical Path**: `e2e/checkout.spec.ts` protects the purchase flow end-to-end and must be kept passing [TODO: test runner setup pending]. A failing checkout test blocks merge.
10. **Mobile-First Delivery**: All UI primitives, pages, and components must be authored and verified mobile-first. Base Tailwind classes target mobile viewports (<640px), with `md:` and `lg:` reserved strictly for progressive desktop enhancement. No single-column catalog grids on mobile per DESIGN.md.

---

## 2. Directory Structure

northwatch/
├── AGENTS.md # Managed by next dev (16.3+), points to docs
├── CLAUDE.md # Agent pointer ("See AGENTS.md")
├── proxy.ts # Edge auth gate for /account and /checkout
├── app/
│ ├── (shop)/
│ │ ├── page.tsx # Homepage → features/catalog
│ │ ├── products/
│ │ │ ├── page.tsx # Listing & search query filter → features/catalog
│ │ │ └── [slug]/page.tsx # PDP → features/catalog
│ │ ├── cart/page.tsx # Cart review → features/cart
│ │ └── checkout/
│ │ ├── layout.tsx # Minimal checkout layout (strips nav/footer)
│ │ ├── page.tsx # Checkout entry / order summary
│ │ ├── shipping/page.tsx # Shipping & address form
│ │ ├── payment/page.tsx # Stripe payment collection (Elements)
│ │ └── confirmation/[orderId]/page.tsx
│ ├── (account)/
│ │ ├── login/page.tsx # OAuth actions
│ │ └── orders/
│ │ ├── page.tsx # Order history → features/orders
│ │ └── [orderId]/page.tsx
│ ├── api/
│ │ ├── auth/[...all]/route.ts # Better Auth catch-all handler
│ │ └── webhooks/stripe/route.ts # Signature verification only
│ └── layout.tsx # Root HTML, fonts, global providers
├── features/
│ ├── catalog/ # components/, queries.ts (Drizzle ILIKE search + fetch), schemas.ts
│ ├── cart/ # components/ (CartDrawer), context.tsx (React Context), actions.ts
│ ├── checkout/ # components/, actions.ts (Stripe PaymentIntent), schemas.ts (Zod)
│ ├── orders/ # actions.ts (fulfillOrder), queries.ts, types.ts
│ └── auth/ # actions.ts (OAuth dispatch via Better Auth), schemas.ts
├── lib/
│ ├── db/ # schema.ts (Drizzle), client.ts (Neon Postgres — see note below)
│ ├── payments/ # stripe.ts (thin Stripe client instance)
│ ├── auth/ # session.ts (session cookie resolution via Better Auth)
│ └── cache.ts # 'use cache' helpers, cache tags & revalidation for catalog queries
├── components/
│ └── ui/ # Presentation primitives (shadcn Button, Dialog, Input)
├── config/
│ ├── env.ts # Typed Zod schema for process.env
│ └── site.ts # Currency definitions, tax rates, shipping tiers
├── docs/
│ ├── PRD.md # Requirements
│ ├── DESIGN.md # Design system & tokens
│ └── ARCHITECTURE.md # This specification
└── e2e/
└── checkout.spec.ts # [TODO] End-to-end checkout flow test — critical path, see Invariant 9

> **`lib/db/client.ts` serverless connection pooling**: Neon Postgres uses an external PgBouncer connection pooler (`-pooler.region.neon.tech`). To prevent connection exhaustion across warm serverless functions (e.g. Vercel Lambdas), `lib/db/client.ts` caches the `pg.Pool` instance on `globalThis` (`globalForDb.pool`) and bounds concurrency with `max: 3` connections in production (`max: 10` in development). Interactive transactions (`db.transaction`) and session-level locks (`pg_advisory_xact_lock`) execute reliably in transaction-mode pooling because locks auto-release on transaction commit or rollback.

---

## 3. Simplified Domain Scopes

These are deliberate v1 scope reductions aligned with `docs/PRD.md`. Both documents establish that Algolia search and full verified reviews are Phase 2 candidates rather than cut features, keeping the implementation surface focused on the boutique catalog MVP.

- **Search**: Built directly into `features/catalog/queries.ts` using SQL `ILIKE` (or Postgres full-text search) across watch title, reference code, and dial parameters. Algolia is omitted for v1 — a boutique catalog of dozens of SKUs doesn't need an external search index, and dropping it removes an external dependency and its associated cost/ops surface. Revisit if/when catalog size or query complexity grows.
- **Reviews**: Deferred post-launch. Product detail pages display curated editorial quotes directly from the product database record or a static section. Full user reviews with purchase verification (`features/reviews/`) are Phase 2.
- **Cart State**: Powered by native React Context (`features/cart/context.tsx`), consistent with the PRD's Zustand/Context option — no external state library dependency. See Section 4 for required hydration handling, since this is a client boundary wrapping a server-rendered root layout.
- **Checkout & Orders**: Retains strict isolation. `features/checkout` manages server validation, totals, and Stripe PaymentIntent initialization. `features/orders` fulfills orders and logs line items inside database transactions.

---

## 4. Key Request Lifecycles

### Catalog Browse & Search

User visits /products?q=chrono
└─► app/(shop)/products/page.tsx (passes searchParams)
└─► features/catalog/queries.ts: getProducts({ query: 'chrono' })
└─► lib/db/client.ts (Drizzle query with ILIKE filters, `'use cache'` + cache tags from lib/cache.ts)
└─► features/catalog/components/ProductCard.tsx
└─► components/ui/card.tsx (stateless presentation)

### Cart Management (Native Context)

User clicks "Add to Bag"
└─► features/cart/context.tsx: dispatch({ type: 'ADD_ITEM', payload })
├─► Updates local React state
├─► Persists cart ID to a cookie (not read synchronously from localStorage during initial render)
└─► Opens CartDrawer slide-over UI

> **Hydration note**: `CartProvider` is a client boundary mounted below the root layout. It must not read `localStorage` synchronously during first render — Next.js 16 + React 19 will produce a hydration mismatch, since the server has no access to the client's storage. Cart identity is carried via an httpOnly-safe cookie set on first "Add to Bag," and line-item state is (re)hydrated client-side inside `useEffect`, not during the initial render pass.

### Route Protection (Defense in Depth)

Request to /account/_ or /checkout/_
└─► proxy.ts (edge)
├─► Fast presence check only: does the `better-auth.session_token` cookie exist?
├─► Missing → redirect to /login?redirectTo=...
└─► Present → allow the request through (no DB/session lookup at the edge)
│
└─► (account)/layout.tsx or the target Server Action
└─► lib/auth/session.ts: auth.api.getSession({ headers }) — authoritative, cryptographically verified, hits the database
├─► Invalid/expired → redirect to /login
└─► Valid → render / execute with the resolved session

> **Why two checks**: `proxy.ts` runs at the edge on every matched request, so it stays cheap — a cookie-presence check, not a database session lookup, to avoid adding DB round-trip latency (and load) to every `/account` and `/checkout` request. It is a routing-level gate, not the security boundary. The authoritative check — full cryptographic/database session resolution via `lib/auth/session.ts` — happens in the account layout and in each checkout Server Action, which is where it actually matters for correctness. `proxy.ts` keeps out unauthenticated traffic early; the server-side check is what checkout and order logic actually trust.

### Order Placement & Webhook Processing (Decoupled Transaction Model)

User submits Shipping & Payment
├─► features/checkout/actions.ts: createOrUpdateDraftOrderAction()
│ ├─► Validates items via features/checkout/schemas.ts (Zod)
│ ├─► Transaction 1 (DB, Atomic):
│ │ ├─► Acquires advisory lock: pg_advisory_xact_lock(hashtext('draft_order_' || userId))
│ │ ├─► Checks for existing draft order in `pending_payment` status
│ │ ├─► Validates live prices, discounts, and inventory against catalog
│ │ ├─► Computes server-authoritative totals (subtotal, shipping, tax, discounts)
│ │ ├─► Upserts `orders` row in `pending_payment` status & line items
│ │ └─► Commits transaction and releases DB connection back to the serverless pool
│ ├─► Unlocked External Stripe API Call:
│ │ ├─► Invokes `stripe.paymentIntents.create` (or `.update`) outside DB transaction
│ │ ├─► Deterministic idempotency key: `create_pi_${draftInfo.orderId}` (prevents double-click races)
│ │ ├─► Uses committed `draftInfo.totalCents` to eliminate Stripe payload mismatch errors
│ │ └─► Passes `orderId` in Stripe PaymentIntent metadata
│ ├─► Transaction 2 (DB, Atomic):
│ │ ├─► Persists returned `stripePaymentIntentId` to the draft order row
│ │ └─► Returns `clientSecret` to client checkout wizard
│
User is redirected to confirmation/[orderId]/page.tsx
└─► Page reads the order + order_items by orderId (both already exist) and renders OrderConfirmationView; while status is `pending_payment` OrderSettlementPoller polls the server until finalized
│
Stripe fires payment_intent.succeeded (at-least-once delivery — may be retried)
├─► app/api/webhooks/stripe/route.ts
│ ├─► Verifies Stripe cryptographic webhook signature (`stripe.webhooks.constructEvent`)
│ ├─► Validates payload using narrow, forward-compatible Zod schemas (`.passthrough()`)
│ └─► Delegates to `fulfillOrder(orderId, stripeEventId)` (no inline business logic)
├─► features/orders/actions.ts: fulfillOrder(orderId, stripeEventId)
│ ├─► Validates inputs via `fulfillOrderInputSchema`
│ ├─► Transaction (DB, Atomic):
│ │ ├─► Checks `processed_webhook_events` table for idempotency
│ │ ├─► Conditional update: `UPDATE orders SET status = 'paid' WHERE id = :orderId AND status = 'pending_payment'`
│ │ ├─► Decrements product variant stock inside the same transaction
│ │ └─► Records `stripeEventId` in `processed_webhook_events`
│ └─► If already processed: short-circuits gracefully with success

> **Why external API calls are decoupled from DB transactions**: Holding database connections open across third-party network calls (like Stripe API requests) ties up connections during latency spikes, quickly exhausting small serverless connection pools (`max: 3`). Splitting the checkout flow into Transaction 1 (DB order creation) -> Stripe API call -> Transaction 2 (DB payment intent link) preserves connection pool headroom while the deterministic Stripe idempotency key (`create_pi_${orderId}`) prevents duplicate charges if concurrent requests race during the unlocked interval.

> **Why line items are written at creation, not in the webhook**: `fulfillOrder(orderId)` needs the line items to decrement stock and render the confirmation summary. Reconstructing them from Stripe PaymentIntent metadata isn't viable — metadata is capped at 50 keys / 500 characters per value, which a multi-item cart can easily exceed — and re-reading the live cart is unsafe, since the cart may have been modified or cleared in another tab by the time the webhook fires. Writing `orders` + `order_items` atomically inside `createOrUpdateDraftOrderAction()` means the confirmation page always has a complete, stable order record to show, independent of webhook timing, and `fulfillOrder()` only ever needs to flip status and adjust stock.

> **Why pre-create the order**: Creating the order (in `pending_payment` state) at PaymentIntent-creation time — rather than inside the webhook handler — closes the race condition where a user reaches the confirmation page before the webhook has been delivered. The confirmation page always has a real `orderId` to look up; it just may briefly show a pending state until `payment_intent.succeeded` arrives and `fulfillOrder()` flips it to `paid`.

> **Webhook idempotency**: Stripe guarantees at-least-once webhook delivery, so `fulfillOrder()` must be safe to run more than once for the same event. The combination of event ID deduplication in `processed_webhook_events` and conditional status transitions (`WHERE status = 'pending_payment'`) guarantees zero duplicate fulfillments or inventory double-decrements on replay.
