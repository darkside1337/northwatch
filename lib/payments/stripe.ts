import Stripe from "stripe";
import { env } from "@/config/env";

/**
 * Modern scoped Stripe client wrapper.
 * Strictly conforms to `stripe-best-practices`:
 * - Scoped client instantiation (no deprecated global/module-level key configuration).
 * - Pinned to Stripe API version 2026-08-26.dahlia.
 * - Supports Restricted API Keys (RAKs) with prefix `rk_`.
 */
export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-08-26.dahlia",
  typescript: true,
  appInfo: {
    name: "Northwatch Storefront",
    version: "0.1.0",
    url: "https://northwatch.store",
  },
});
