import { calculateShipping, type ShippingTierId } from "@/config/site";
import type { CartItem, CartTotals, PromoResult } from "./schemas";

/**
 * -----------------------------------------------------------------------------
 * Pure Cart Calculation Engine
 * -----------------------------------------------------------------------------
 * ARCHITECTURAL INVARIANT:
 * All math in this module is 100% pure (zero side-effects, zero I/O, deterministic).
 * All money is represented and computed exclusively in POSITIVE INTEGER CENTS.
 * Floating point operations are immediately rounded using standard half-up rounding.
 */

/**
 * Calculates raw subtotal in integer cents by summing (priceCents * quantity) for all items.
 */
export function calculateSubtotal(
  items: Array<{ priceCents: number; quantity: number }>
): number {
  return items.reduce((acc, item) => {
    const qty = Math.max(0, item.quantity);
    return acc + Math.max(0, item.priceCents) * qty;
  }, 0);
}

/**
 * Calculates total item count across all line items.
 */
export function calculateItemCount(
  items: Array<{ quantity: number }>
): number {
  return items.reduce((acc, item) => acc + Math.max(0, item.quantity), 0);
}

/**
 * Clamps a requested quantity within safe operational boundaries:
 * - Minimum: 0 (or 1 for active cart items)
 * - Maximum available stock
 * - Maximum absolute purchase cap per reference (default 10)
 */
export function clampQuantity(
  requestedQty: number,
  maxStock: number,
  maxPerReference = 10
): number {
  if (requestedQty <= 0 || maxStock <= 0) {
    return 0;
  }
  return Math.min(requestedQty, maxStock, maxPerReference);
}

/**
 * Evaluates promotional code eligibility against current subtotal and shipping context.
 *
 * ARBITRAGE-PREVENTION INVARIANT:
 * This function is re-evaluated on every state change. If an item is removed
 * or quantity decreased such that order minimums are broken, the discount drops to 0.
 *
 * TYPED PROMO EFFECT:
 * Promos either affect items subtotal (percentage/fixed) or shipping fee (free shipping),
 * preventing contradictory double-dipping on $500+ orders.
 */
export function evaluatePromo(
  rawPromoCode: string | undefined | null,
  subtotalCents: number,
  baseShippingCents: number
): PromoResult | null {
  if (!rawPromoCode) {
    return null;
  }

  const code = rawPromoCode.trim().toUpperCase();
  if (code.length === 0) {
    return null;
  }

  switch (code) {
    // 1. ATELIER10: 10% off subtotal with half-up rounding in integer cents
    case "ATELIER10": {
      if (subtotalCents <= 0) {
        return {
          code,
          type: "subtotal_percentage",
          isValid: false,
          discountCents: 0,
          freeShipping: false,
          failureReason: "Cannot apply discount to an empty bag.",
        };
      }

      // Standard half-up penny rounding: Math.round(cents * 0.10)
      const discountCents = Math.round(subtotalCents * 0.1);
      return {
        code,
        type: "subtotal_percentage",
        isValid: true,
        discountCents,
        freeShipping: false,
        description: "10% Atelier collector discount applied.",
      };
    }

    // 2. NORTH50: $50.00 off orders over $400.00 (40,000 cents)
    case "NORTH50": {
      const MINIMUM_SPEND_CENTS = 40000;
      if (subtotalCents < MINIMUM_SPEND_CENTS) {
        return {
          code,
          type: "subtotal_fixed",
          isValid: false,
          discountCents: 0,
          freeShipping: false,
          failureReason: "Minimum order subtotal of $400.00 required for NORTH50.",
        };
      }

      // Discount cannot exceed subtotal (guarantee non-negative subtotal)
      const discountCents = Math.min(5000, subtotalCents);
      return {
        code,
        type: "subtotal_fixed",
        isValid: true,
        discountCents,
        freeShipping: false,
        description: "$50.00 collector credit applied.",
      };
    }

    // 3. GENEVA: Free standard courier shipping
    case "GENEVA": {
      if (subtotalCents <= 0) {
        return {
          code,
          type: "free_shipping",
          isValid: false,
          discountCents: 0,
          freeShipping: false,
          failureReason: "Cannot apply shipping promotion to an empty bag.",
        };
      }

      const isAlreadyFree = baseShippingCents === 0;
      return {
        code,
        type: "free_shipping",
        isValid: true,
        discountCents: 0,
        freeShipping: true,
        description: isAlreadyFree
          ? "Standard insured courier delivery is already complimentary for this order."
          : "Complimentary standard insured courier delivery applied.",
      };
    }

    default:
      return {
        code,
        type: "subtotal_fixed",
        isValid: false,
        discountCents: 0,
        freeShipping: false,
        failureReason: `Invalid promotion code "${code}".`,
      };
  }
}

/**
 * Assembles complete server-authoritative totals for the cart.
 */
export function calculateCartTotals(
  items: CartItem[],
  promoCode?: string | null,
  shippingTierId: ShippingTierId = "standard"
): CartTotals {
  const subtotalCents = calculateSubtotal(items);
  const itemCount = calculateItemCount(items);

  // Empty cart has zero shipping
  const baseShippingCents = items.length === 0 ? 0 : calculateShipping(shippingTierId, subtotalCents);

  // Evaluate promo against subtotal and shipping context
  const promo = evaluatePromo(promoCode, subtotalCents, baseShippingCents);

  let discountCents = 0;
  let shippingEstimateCents = baseShippingCents;

  if (promo && promo.isValid) {
    discountCents = promo.discountCents;
    if (promo.freeShipping) {
      shippingEstimateCents = 0;
    }
  }

  // Net total = max(0, subtotal - discount) + shippingEstimate
  const discountedSubtotal = Math.max(0, subtotalCents - discountCents);
  const totalCents = discountedSubtotal + shippingEstimateCents;

  return {
    subtotalCents,
    discountCents,
    shippingEstimateCents,
    totalCents,
    itemCount,
  };
}
