# N O R T H W A T C H

<p align="center">
  <strong>Minimalist Men's Horology & Boutique Ecommerce Storefront</strong><br>
  <em>Engineered under Scandinavian architectural restraint and Swiss mechanical precision.</em>
</p>

<p align="center">
  <a href="#4-architectural--security-invariants"><img src="https://img.shields.io/badge/Next.js-16.3%20(App%20Router)-black?style=flat-square&logo=next.js" alt="Next.js 16" /></a>
  <a href="#4-architectural--security-invariants"><img src="https://img.shields.io/badge/React-19.2-black?style=flat-square&logo=react" alt="React 19" /></a>
  <a href="#5-tech-stack"><img src="https://img.shields.io/badge/Neon-Serverless%20Postgres-00E599?style=flat-square&logo=postgresql&logoColor=black" alt="Neon Postgres" /></a>
  <a href="#5-tech-stack"><img src="https://img.shields.io/badge/Drizzle-ORM%200.45-C5F74F?style=flat-square&logo=drizzle" alt="Drizzle ORM" /></a>
  <a href="#5-tech-stack"><img src="https://img.shields.io/badge/Better%20Auth-1.7-black?style=flat-square" alt="Better Auth" /></a>
  <a href="#5-tech-stack"><img src="https://img.shields.io/badge/Stripe-Elements%20%26%20Webhooks-635BFF?style=flat-square&logo=stripe&logoColor=white" alt="Stripe" /></a>
  <a href="#6-test-suite--quality-assurance"><img src="https://img.shields.io/badge/Playwright-21%20E2E%20Passing-45ba4b?style=flat-square&logo=playwright&logoColor=white" alt="Playwright E2E" /></a>
  <a href="#6-test-suite--quality-assurance"><img src="https://img.shields.io/badge/Vitest-157%20Tests%20Passing-6E9F18?style=flat-square&logo=vitest&logoColor=white" alt="Vitest Tests" /></a>
</p>

---

<p align="center">
  <img src="public/demo/screenshots/01-hero-homepage.png" alt="Northwatch Homepage Hero" width="100%" />
</p>

---

## 1. Overview & Horological Philosophy

**Northwatch** is a boutique digital storefront for mechanical timepieces designed under Scandinavian architectural reduction and assembled with Swiss horological tolerances.

Rather than resembling a generic high-volume retail platform, the experience is conceived as a tactile collector's journal. Every interaction echoes the cold-rolled **316L stainless steel**, sapphire crystal optics, and regulated Sellita calibres of the instruments themselves:

- **Strict Aesthetic Restraint**: Zero decorative gradients, zero glassmorphism blurs, zero drop shadows. Structure and elevation are achieved entirely through hairline borders (`1px border-outline`), authentic white space, and high-contrast typography.
- **Micro-Typographic Precision**: Wordmarks and technical specifications are set in monospaced tabular numerals (`JetBrains Mono`), editorial serif titles (`Cormorant Garamond`), and clean Swiss grotesk bodies (`Inter`).
- **Tactile State Transitions**: Hardware pips pulse green on real-time inventory allocation, courier transit ledgers recalculate interactively, and drawer transitions feel balanced and physical.

---

## 2. Interactive Feature Flows & Media

### Flow 1 — Variant Customizer & Technical Spec Matrix
> Dynamic caliber and strap customization, real-time inventory allocation pips, exhibition caseback plate inspection, and regulated Swiss movement specifications.

<video src="public/demo/flow1-customizer.mp4" controls="controls" width="100%" poster="public/demo/screenshots/02-product-detail.png">
  <p>Your browser does not support the video tag. View the recording directly at <code>public/demo/flow1-customizer.mp4</code>.</p>
</video>

<table width="100%">
  <tr>
    <td width="50%" valign="top">
      <img src="public/demo/screenshots/02-product-detail.png" alt="Product Detail View" width="100%" />
      <p align="center"><sub><strong>Product Detail Page:</strong> The Field Automatic in Horween Calfskin ($410) with live stock verification.</sub></p>
    </td>
    <td width="50%" valign="top">
      <img src="public/demo/screenshots/03-spec-matrix.png" alt="Technical Spec Matrix" width="100%" />
      <p align="center"><sub><strong>Spec Matrix:</strong> Sellita SW200-1 Elaboré grade, 28,800 VPH, 316L surgical steel, and double sapphire crystal.</sub></p>
    </td>
  </tr>
</table>

---

### Flow 2 — Vault Checkout Wizard & Real-Time Dispatch
> Thin-cookie cart hydration, slide-out acquisition drawer with strikethrough promotional discounts, armored courier selection, and cryptographic Stripe authorization.

<video src="public/demo/flow2-checkout.mp4" controls="controls" width="100%" poster="public/demo/screenshots/05-checkout-shipping.png">
  <p>Your browser does not support the video tag. View the recording directly at <code>public/demo/flow2-checkout.mp4</code>.</p>
</video>

<table width="100%">
  <tr>
    <td width="50%" valign="top">
      <img src="public/demo/screenshots/04-cart-drawer.png" alt="Cart Drawer Slideout" width="100%" />
      <p align="center"><sub><strong>Acquisition Drawer:</strong> ATELIER10 discount voucher, struck-through original price, and 100% complimentary delivery progress bar.</sub></p>
    </td>
    <td width="50%" valign="top">
      <img src="public/demo/screenshots/05-checkout-shipping.png" alt="Checkout Shipping Selection" width="100%" />
      <p align="center"><sub><strong>Shipping Method:</strong> Priority Vault Delivery ($75.00) selected with real-time reactive financial recalculation.</sub></p>
    </td>
  </tr>
</table>

---

### Flow 3 — Mobile-First PDP & Editorial Monograph
> Dedicated mobile dock navigation on iPhone 16 Pro Max viewports, touch-first specimen browsing, and manufacture provenance articles.

<video src="public/demo/flow3-mobile.mp4" controls="controls" width="100%" poster="public/demo/screenshots/06-mobile-pdp.png">
  <p>Your browser does not support the video tag. View the recording directly at <code>public/demo/flow3-mobile.mp4</code>.</p>
</video>

<table width="100%">
  <tr>
    <td width="50%" valign="top">
      <img src="public/demo/screenshots/06-mobile-pdp.png" alt="Mobile Viewport on iPhone 16 Pro Max" width="100%" />
      <p align="center"><sub><strong>Mobile PDP:</strong> Responsive single-column layout with sticky bottom acquisition dock and price indicator.</sub></p>
    </td>
    <td width="50%" valign="top">
      <img src="public/demo/screenshots/07-editorial-manufacture.png" alt="Editorial Manufacture View" width="100%" />
      <p align="center"><sub><strong>Manufacture Journal:</strong> Stockholm design philosophy and Geneva chronometer testing standards.</sub></p>
    </td>
  </tr>
</table>

---

## 3. The Golden Architectural Rule

> **Routes compose features; features contain business logic.**

```
northwatch/
├── app/                  # Routing shell (thin layouts & page composition only)
│   ├── (shop)/           # Public catalog, PDP, cart review, & checkout routes
│   ├── (account)/        # Collector profile & authenticated order archives
│   ├── api/auth/         # Better Auth API catch-all
│   └── api/webhooks/     # Cryptographic Stripe webhook signature verification
├── features/             # Isolated domain boundaries (business logic, queries, actions)
│   ├── catalog/          # Timepiece queries, variant matrices, search filters
│   ├── cart/             # Thin-cookie session sync, calculations, slide-out drawer
│   ├── checkout/         # Multi-step checkout wizard, courier pricing, Stripe intent
│   ├── orders/           # Atomic order fulfillment transactions, invoice generation
│   └── auth/             # Session helpers, collector login, OAuth integrations
├── components/           # Domain-agnostic UI primitives (shadcn, buttons, sheets, inputs)
├── config/               # Typed site configurations, courier tiers, regional tax rules
└── lib/                  # Shared infrastructure (Neon DB pooler, Stripe, Better Auth)
```

1. **`app/` stays thin**: Renders layouts and composes feature calls. Zero direct database queries, Stripe API calls, or financial calculations exist in route files.
2. **`features/` encapsulates domain models**: Queries, Server Actions, Zod validation schemas, and domain-specific components (e.g. `CartDrawer`, `CheckoutWizard`) belong inside their respective domain directory.
3. **`components/ui/` is presentation-only**: Reusable primitives receive all data via props and have zero knowledge of cart, checkout, or catalog shapes.
4. **`lib/` handles infrastructure clients**: Cached connection pools for serverless Neon Postgres, Stripe client, and auth helpers.

---

## 4. Architectural & Security Invariants

### 1. Server-Authoritative Financial Math
All cart amounts, taxes, shipping rates, and promotional discounts are calculated exclusively on the server in non-negative integer cents. Client-submitted prices and totals are treated as completely untrusted.

### 2. Decoupled Order & Stripe Transaction Model
To prevent race conditions, duplicate charges, and connection starvation on serverless Neon Postgres:
```
User clicks "Continue to Payment"
   │
   ├─► Transaction 1 (Postgres Atomic):
   │   ├── Acquires advisory lock: pg_advisory_xact_lock(hashtext('draft_order_' || userId))
   │   ├── Verifies stock & re-evaluates authoritative totals from database
   │   ├── Upserts orders row in 'pending_payment' status
   │   └── Commits & immediately releases DB connection back to pool
   │
   ├─► Unlocked Stripe API Call (External):
   │   ├── Invokes stripe.paymentIntents.create() / .update() outside DB transaction
   │   ├── Deterministic idempotency key: create_pi_${orderId} (eliminates double charges)
   │   └── Attaches committed total & orderId metadata
   │
   └─► Transaction 2 (Postgres Atomic):
       ├── Records returned stripePaymentIntentId on draft order row
       └── Returns clientSecret to client payment wizard
```

### 3. Edge Route Protection Defense-in-Depth (`proxy.ts`)
Route guarding for `/account/*` and `/checkout/*` executes at the edge in `proxy.ts` (Next.js 16) using an ultra-low-latency cookie presence check. The authoritative, cryptographically verified database session lookup (`requireAuth()`) is executed downstream in server actions and layouts.

### 4. Canonical React 19 Hydration
The cart context utilizes React 19's canonical `useSyncExternalStore` pattern. Cart identifiers are persisted via thin `httpOnly`-safe cookies without reading `localStorage` synchronously during initial render, preventing cascading hydration flashes or SSR mismatches.

---

## 5. Tech Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | React Server Components, Server Actions, and proxy edge middleware |
| **Frontend Runtime** | React 19 | `useSyncExternalStore`, native transitions, and action state hooks |
| **Database** | Neon Postgres | Serverless Postgres with PgBouncer connection pooling |
| **ORM** | Drizzle ORM | Type-safe SQL dialect, zero-overhead queries, automated migrations |
| **Authentication** | Better Auth | HMAC signed session cookies, OAuth (Google/GitHub), test utilities |
| **Payments** | Stripe | Custom Payment Elements and signature-verified webhook fulfillment |
| **Styling** | Tailwind CSS v4 | CSS variables, custom horology design tokens, zero build overhead |
| **Component Primitives** | shadcn/ui & Base UI | Unstyled, fully accessible presentation primitives |
| **Testing** | Playwright & Vitest | E2E checkout critical path testing, full domain math test suite |

---

## 6. Test Suite & Quality Assurance

The codebase enforces strict test-driven boundaries across all business logic and user journeys.

```bash
# Run unit & domain math tests (157 passing tests)
pnpm test

# Run critical path Playwright checkout E2E tests (21 passing tests)
pnpm test:e2e

# Run demo recording & screenshot generation suite
pnpm demo:screenshots
```

- **Domain Financial Math**: 100% test coverage over volume discounts, tiered courier shipping calculations, state-level sales tax matrices, and coupon re-validation.
- **E2E Critical Path**: Comprehensive automated Playwright specifications verifying unauthenticated checkout gating, cart drawer mutations, address autofill, declined card error handling, 3D Secure / Stripe test cards, and webhook-driven database status flips (`pending_payment` → `paid`).

---

## 7. Getting Started

### Prerequisites
- Node.js 20+
- pnpm (`corepack enable && corepack prepare pnpm@latest --activate`)
- Neon Postgres account (or local PostgreSQL instance)
- Stripe developer account & Stripe CLI

### 1. Clone & Install
```bash
git clone https://github.com/darkside1337/northwatch.git
cd northwatch
pnpm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
# Database (Neon Serverless Postgres)
DATABASE_URL="postgresql://neondb_owner:password@ep-crimson-sky-pooler.region.neon.tech/neondb?sslmode=verify-full"

# Better Auth
BETTER_AUTH_SECRET="your-32-byte-random-secret"
BETTER_AUTH_URL="http://localhost:3000"

# OAuth Providers (Optional for local dev)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Stripe Payments
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### 3. Database Migration & Seed
Apply Drizzle schema migrations and seed the catalog with horological references:
```bash
# Push schema migrations
pnpm drizzle-kit migrate

# Seed catalog references, movements, variants, and test users
pnpm db:seed
```

### 4. Run Development Server
```bash
# Terminal 1: Next.js dev server
pnpm dev

# Terminal 2: Stripe webhook event forwarding (for checkout testing)
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Open [http://localhost:3000](http://localhost:3000) to explore the storefront.

---

## 8. Available Scripts

| Script | Purpose |
| :--- | :--- |
| `pnpm dev` | Starts the Next.js 16 development server with hot-reloading |
| `pnpm build` | Compiles the production application bundle |
| `pnpm start` | Boots the optimized production server |
| `pnpm lint` | Runs ESLint rules across all routes and features |
| `pnpm test` | Executes the Vitest unit test suite (157 tests) |
| `pnpm test:e2e` | Runs Playwright end-to-end checkout and portal tests (21 tests) |
| `pnpm demo:screenshots` | Captures high-DPI README demo screenshots via Playwright |
| `pnpm test:demo` | Executes video demo recording flows and encodes MP4s |
| `pnpm db:studio` | Launches visual Drizzle Studio database browser |
| `pnpm db:seed` | Re-populates catalog timepieces, specifications, and sample collector accounts |

---

<p align="center">
  <sub>Designed & Developed with Scandinavian Restraint. © 2026 Northwatch Horology. All rights reserved.</sub>
</p>
