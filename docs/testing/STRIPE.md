# Stripe Dahlia Integration & Testing Guide

Specifications for developing, testing, and debugging Stripe Dahlia (`2026-08-26.dahlia`) in Northwatch.

---

## 1. SDK Versioning & Startup Invariants
- **API Version**: Locked to `"2026-08-26.dahlia"` matching `stripe@22.6.2`.
- **Zero Mock Clients**: Never instantiate mock Stripe proxies or fallback simulators in `lib/payments/stripe.ts`.
- **Strict Startup Validation**: `config/env.ts` enforces `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` with `z.string().min(1)`.

---

## 2. Dahlia Iframe Composition
In modern Stripe Dahlia with `<PaymentElement options={{ layout: "tabs" }} />`, Stripe mounts multiple iframes with identical titles (`Secure payment input frame`):

1. **Accessory Target Frame**:
   - `src*="elements-inner-accessory-target"`
   - Contains card inputs: `#payment-numberInput` (`autocomplete="cc-number"`), `#payment-expiryInput` (`autocomplete="cc-exp"`), `#payment-cvcInput` (`autocomplete="cc-csc"`).
2. **Easel Frame**:
   - `src*="elements-inner-easel"`
   - Layout and container frame.

### Disambiguating Selectors in Automation
To avoid Playwright strict-mode violations without relying on private names (`__privateStripeFrame`):
```ts
const stripeFrame = page.frameLocator('iframe[title="Secure payment input frame"]:not([src*="easel"])');
const cardNumberInput = stripeFrame.locator('input[autocomplete="cc-number"]');
```

---

## 3. Test Card Matrix
Always use Stripe's documented test cards:
- **Authorized / Succeeded**: `4242 4242 4242 4242`
  - Expiry: Any future date (e.g. `12/34`)
  - CVC: `123`
  - Expected Behavior: Payment authorizes, redirects to `/confirmation/[orderId]`.
- **Card Declined**: `4000 0000 0000 0002`
  - Expiry: Any future date (e.g. `12/34`)
  - CVC: `123`
  - Expected Behavior: Inline alert renders *"Your card has been declined"*, form remains active for retry without full page reload.

---

## 4. Local Webhook Forwarding
Stripe webhooks require the Stripe CLI to receive real test events locally:
```bash
stripe listen --forward-to localhost:3333/api/webhooks/stripe
```
1. Copy the printed `whsec_...` into `STRIPE_WEBHOOK_SECRET` in `.env`.
2. Webhook handler (`app/api/webhooks/stripe/route.ts`) verifies HMAC signature with `stripe.webhooks.constructEvent()`.
3. Handler delegates `payment_intent.succeeded` immediately to `fulfillOrder(orderId, event.id)`.

---

## 5. Idempotency & Database Transactions
- **PaymentIntent Idempotency**:
  `idempotencyKey = checkout_${user.id}_${clientAttemptToken}` prevents duplicate payment charges on network retries.
- **Order Fulfillment Idempotency**:
  `UPDATE orders SET status = 'paid' WHERE id = :orderId AND status = 'pending_payment'`.
  If 0 rows are affected (duplicate event), `fulfillOrder` gracefully short-circuits.
