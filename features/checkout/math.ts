import { calculateShipping, calculateTax, type ShippingTierId } from "@/config/site";
import { evaluatePromo } from "@/features/cart/math";

export interface CheckoutCalculationInput {
  items: Array<{ priceCents: number; quantity: number }>;
  shippingTierId: ShippingTierId;
  stateCode?: string;
  promoCode?: string | null;
}

export interface CheckoutCalculationResult {
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  promoDescription?: string;
}

/**
 * Server-authoritative checkout totals calculation.
 *
 * INVARIANTS:
 * 1. Untrusted Client Totals: Ignores any client-submitted amounts. Recalculates directly from item prices.
 * 2. Promo Re-validation: Evaluates promo eligibility against authoritative server subtotal.
 * 3. Tax Calculation: Applies regional tax rates via `config/site.ts` to (subtotal - discount).
 * 4. All values in non-negative integer cents.
 */
export function calculateCheckoutTotals(
  input: CheckoutCalculationInput
): CheckoutCalculationResult {
  const subtotalCents = input.items.reduce((acc, item) => {
    const qty = Math.max(0, item.quantity);
    const price = Math.max(0, item.priceCents);
    return acc + price * qty;
  }, 0);

  const baseShippingCents =
    subtotalCents === 0 ? 0 : calculateShipping(input.shippingTierId, subtotalCents);

  const promoResult = evaluatePromo(input.promoCode, subtotalCents, baseShippingCents);

  let discountCents = 0;
  let shippingCents = baseShippingCents;

  if (promoResult && promoResult.isValid) {
    discountCents = promoResult.discountCents;
    if (promoResult.freeShipping) {
      shippingCents = 0;
    }
  }

  const taxableAmountCents = Math.max(0, subtotalCents - discountCents);
  const taxCents =
    taxableAmountCents === 0
      ? 0
      : calculateTax(taxableAmountCents, input.stateCode);

  const totalCents = taxableAmountCents + shippingCents + taxCents;

  return {
    subtotalCents,
    discountCents,
    shippingCents,
    taxCents,
    totalCents,
    promoDescription: promoResult?.isValid ? promoResult.description : undefined,
  };
}
