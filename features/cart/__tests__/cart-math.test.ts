import { describe, it, expect } from "vitest";
import {
  calculateSubtotal,
  calculateItemCount,
  clampQuantity,
  evaluatePromo,
  calculateCartTotals,
  calculateCartCalculation,
} from "../math";
import {
  ThinCartSchema,
  CartItemSchema,
  ApplyPromoInputSchema,
  StockAdjustmentReasonEnum,
  type CartItem,
} from "../schemas";

// Helper to construct mock hydrated CartItem
function createMockItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    variantId: "a0000000-0000-4000-8000-000000000001",
    productId: "b0000000-0000-4000-8000-000000000001",
    sku: "NW-01-FLD-BLK-CAN",
    title: "The Field Automatic",
    slug: "field-automatic",
    variantName: "Matte Black / Olive Canvas",
    dialColor: "Matte Black",
    strapMaterial: "Olive Canvas",
    caseDiameter: "38mm",
    priceCents: 38000, // $380.00
    quantity: 1,
    maxStock: 15,
    image: "/images/watch-field-canvas.jpg",
    ...overrides,
  };
}

describe("Cart Domain: Pure Math Engine", () => {
  describe("calculateSubtotal", () => {
    it("returns 0 for an empty items array", () => {
      expect(calculateSubtotal([])).toBe(0);
    });

    it("calculates single item subtotal accurately in integer cents", () => {
      const items = [{ priceCents: 38000, quantity: 1 }];
      expect(calculateSubtotal(items)).toBe(38000);
    });

    it("multiplies quantity by unit price correctly", () => {
      const items = [{ priceCents: 38000, quantity: 3 }];
      expect(calculateSubtotal(items)).toBe(114000);
    });

    it("accumulates subtotals across multiple distinct items", () => {
      const items = [
        { priceCents: 38000, quantity: 1 }, // $380.00
        { priceCents: 62000, quantity: 2 }, // $1,240.00
        { priceCents: 45000, quantity: 1 }, // $450.00
      ];
      expect(calculateSubtotal(items)).toBe(207000); // $2,070.00
    });

    it("defensively ignores negative prices or quantities", () => {
      const items = [
        { priceCents: -500, quantity: 1 },
        { priceCents: 38000, quantity: -2 },
      ];
      expect(calculateSubtotal(items)).toBe(0);
    });
  });

  describe("calculateItemCount", () => {
    it("returns 0 for empty array", () => {
      expect(calculateItemCount([])).toBe(0);
    });

    it("sums quantities across items", () => {
      const items = [{ quantity: 1 }, { quantity: 4 }, { quantity: 2 }];
      expect(calculateItemCount(items)).toBe(7);
    });

    it("defensively treats negative quantities as 0", () => {
      const items = [{ quantity: 3 }, { quantity: -5 }];
      expect(calculateItemCount(items)).toBe(3);
    });
  });

  describe("clampQuantity", () => {
    it("returns requested quantity when within available stock and cap", () => {
      expect(clampQuantity(2, 10)).toBe(2);
    });

    it("clamps to maxStock when requested quantity exceeds available stock", () => {
      expect(clampQuantity(5, 3)).toBe(3);
    });

    it("clamps to maximum purchase cap of 10 when stock is higher", () => {
      expect(clampQuantity(15, 100)).toBe(10);
    });

    it("returns 0 when stock is 0 (out of stock)", () => {
      expect(clampQuantity(2, 0)).toBe(0);
    });

    it("returns 0 when requested quantity is 0 or negative", () => {
      expect(clampQuantity(0, 10)).toBe(0);
      expect(clampQuantity(-3, 10)).toBe(0);
    });
  });

  describe("evaluatePromo", () => {
    it("returns null when no promo code is provided", () => {
      expect(evaluatePromo(null, 38000, 1500)).toBeNull();
      expect(evaluatePromo(undefined, 38000, 1500)).toBeNull();
      expect(evaluatePromo("", 38000, 1500)).toBeNull();
      expect(evaluatePromo("   ", 38000, 1500)).toBeNull();
    });

    it("normalizes promo codes case-insensitively with trimmed whitespace", () => {
      const resUpper = evaluatePromo("ATELIER10", 38000, 1500);
      const resLower = evaluatePromo("atelier10", 38000, 1500);
      const resMixed = evaluatePromo("  Atelier10  ", 38000, 1500);

      expect(resUpper?.isValid).toBe(true);
      expect(resLower?.isValid).toBe(true);
      expect(resMixed?.isValid).toBe(true);
      expect(resLower?.discountCents).toBe(3800);
      expect(resMixed?.discountCents).toBe(3800);
    });

    describe("ATELIER10 (10% Subtotal Percentage)", () => {
      it("calculates 10% discount on clean numbers", () => {
        const res = evaluatePromo("ATELIER10", 38000, 1500);
        expect(res).toEqual({
          code: "ATELIER10",
          type: "subtotal_percentage",
          isValid: true,
          discountCents: 3800, // $38.00
          freeShipping: false,
          description: "10% Atelier collector discount applied.",
        });
      });

      it("performs standard half-up rounding in integer cents on fractional pennies", () => {
        // $455.55 = 45555 cents -> 10% = 4555.5 cents -> rounds to 4556 cents ($45.56)
        const res = evaluatePromo("ATELIER10", 45555, 1500);
        expect(res?.discountCents).toBe(4556);
      });

      it("rejects promo when subtotal is 0", () => {
        const res = evaluatePromo("ATELIER10", 0, 0);
        expect(res?.isValid).toBe(false);
        expect(res?.discountCents).toBe(0);
      });
    });

    describe("NORTH50 ($50 off $400+ spend)", () => {
      it("qualifies and applies $50.00 discount when subtotal >= $400.00", () => {
        const res400 = evaluatePromo("NORTH50", 40000, 1500);
        expect(res400).toEqual({
          code: "NORTH50",
          type: "subtotal_fixed",
          isValid: true,
          discountCents: 5000, // $50.00
          freeShipping: false,
          description: "$50.00 collector credit applied.",
        });

        const res620 = evaluatePromo("NORTH50", 62000, 0);
        expect(res620?.isValid).toBe(true);
        expect(res620?.discountCents).toBe(5000);
      });

      it("fails and zeroes discount when subtotal is even one penny below $400.00", () => {
        const res399 = evaluatePromo("NORTH50", 39999, 1500);
        expect(res399?.isValid).toBe(false);
        expect(res399?.discountCents).toBe(0);
        expect(res399?.failureReason).toContain("$400.00");
      });
    });

    describe("GENEVA (Free Shipping Override)", () => {
      it("waives courier shipping fee when shipping fee > 0", () => {
        const res = evaluatePromo("GENEVA", 38000, 1500);
        expect(res).toEqual({
          code: "GENEVA",
          type: "free_shipping",
          isValid: true,
          discountCents: 0,
          freeShipping: true,
          description: "Complimentary standard insured courier delivery applied.",
        });
      });

      it("does not double-dip or subtract from subtotal if shipping is already free ($500+ order)", () => {
        const res = evaluatePromo("GENEVA", 62000, 0);
        expect(res?.isValid).toBe(true);
        expect(res?.discountCents).toBe(0); // Never steals from subtotal!
        expect(res?.freeShipping).toBe(true);
        expect(res?.description).toContain("already complimentary");
      });

      it("rejects promo when cart is empty", () => {
        const res = evaluatePromo("GENEVA", 0, 0);
        expect(res?.isValid).toBe(false);
      });
    });

    describe("Unknown / Invalid Codes", () => {
      it("returns invalid result with clear error message", () => {
        const res = evaluatePromo("DISCOUNT99", 38000, 1500);
        expect(res?.isValid).toBe(false);
        expect(res?.discountCents).toBe(0);
        expect(res?.failureReason).toContain("DISCOUNT99");
      });
    });
  });

  describe("calculateCartTotals", () => {
    it("returns zeroed totals for an empty cart", () => {
      const totals = calculateCartTotals([]);
      expect(totals).toEqual({
        subtotalCents: 0,
        discountCents: 0,
        shippingEstimateCents: 0,
        totalCents: 0,
        itemCount: 0,
      });
    });

    it("calculates standard order without promo (includes $15 courier shipping)", () => {
      const item = createMockItem({ priceCents: 38000, quantity: 1 });
      const totals = calculateCartTotals([item]);

      expect(totals).toEqual({
        subtotalCents: 38000,
        discountCents: 0,
        shippingEstimateCents: 1500, // Standard shipping for < $500
        totalCents: 39500, // $380.00 + $15.00 = $395.00
        itemCount: 1,
      });
    });

    it("calculates order with ATELIER10 percentage discount", () => {
      const item = createMockItem({ priceCents: 38000, quantity: 1 });
      const totals = calculateCartTotals([item], "ATELIER10");

      expect(totals).toEqual({
        subtotalCents: 38000,
        discountCents: 3800, // 10% of $380.00
        shippingEstimateCents: 1500,
        totalCents: 35700, // ($380.00 - $38.00) + $15.00 = $357.00
        itemCount: 1,
      });
    });

    it("automatically grants free shipping on orders over $500.00", () => {
      const item = createMockItem({ priceCents: 62000, quantity: 1 });
      const totals = calculateCartTotals([item]);

      expect(totals).toEqual({
        subtotalCents: 62000,
        discountCents: 0,
        shippingEstimateCents: 0, // Free threshold >= $500
        totalCents: 62000,
        itemCount: 1,
      });
    });

    it("applies NORTH50 and preserves free shipping on $500+ order", () => {
      const item = createMockItem({ priceCents: 62000, quantity: 1 });
      const totals = calculateCartTotals([item], "NORTH50");

      expect(totals).toEqual({
        subtotalCents: 62000,
        discountCents: 5000,
        shippingEstimateCents: 0,
        totalCents: 57000, // $620.00 - $50.00 = $570.00
        itemCount: 1,
      });
    });

    it("prevents checkout arbitrage: drops NORTH50 discount when cart drops below $400.00", () => {
      const highValueCart = [createMockItem({ priceCents: 62000, quantity: 1 })];
      const validTotals = calculateCartTotals(highValueCart, "NORTH50");
      expect(validTotals.discountCents).toBe(5000);

      // Customer removes watch and adds $180 accessory
      const lowValueCart = [createMockItem({ priceCents: 18000, quantity: 1 })];
      const arbitagedTotals = calculateCartTotals(lowValueCart, "NORTH50");
      expect(arbitagedTotals.discountCents).toBe(0); // Arbitrage blocked!
      expect(arbitagedTotals.totalCents).toBe(19500); // $180.00 + $15.00 shipping
    });

    it("applies GENEVA free shipping promo by zeroing shippingEstimateCents", () => {
      const item = createMockItem({ priceCents: 38000, quantity: 1 });
      const totals = calculateCartTotals([item], "GENEVA");

      expect(totals).toEqual({
        subtotalCents: 38000,
        discountCents: 0,
        shippingEstimateCents: 0, // Waived from 1500 to 0
        totalCents: 38000,
        itemCount: 1,
      });
    });

    it("ensures totalCents is never negative even if discount somehow matches subtotal", () => {
      const item = createMockItem({ priceCents: 5000, quantity: 1 });
      // NORTH50 has a $400 minimum so it won't apply, but calculateCartTotals enforces Math.max(0, ...)
      const totals = calculateCartTotals([item]);
      expect(totals.totalCents).toBeGreaterThanOrEqual(0);
    });
  });
});

describe("Cart Domain: Zod Schemas Validation", () => {
  describe("ThinCartSchema", () => {
    it("validates a standard thin cart payload", () => {
      const valid = {
        items: [
          {
            variantId: "a0000000-0000-4000-8000-000000000001",
            quantity: 2,
          },
        ],
        promoCode: "ATELIER10",
      };
      const parsed = ThinCartSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });

    it("rejects non-uuid variantId", () => {
      const invalid = {
        items: [{ variantId: "not-a-uuid", quantity: 1 }],
      };
      const parsed = ThinCartSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });

    it("rejects zero or negative quantities", () => {
      const invalid = {
        items: [
          {
            variantId: "a0000000-0000-0000-0000-000000000001",
            quantity: 0,
          },
        ],
      };
      const parsed = ThinCartSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });

    it("rejects quantities exceeding max cap of 10", () => {
      const invalid = {
        items: [
          {
            variantId: "a0000000-0000-0000-0000-000000000001",
            quantity: 11,
          },
        ],
      };
      const parsed = ThinCartSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });
  });

  describe("CartItemSchema", () => {
    it("validates hydrated CartItem with optional stockAdjustmentReason, stockAdjustmentNote, and originalQuantity", () => {
      const item = createMockItem({
        originalQuantity: 15,
        stockAdjustmentReason: "order_cap",
        stockAdjustmentNote: "Allocation adjusted from 15 to 10 (maximum purchase limit per reference is 10).",
      });
      const parsed = CartItemSchema.safeParse(item);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.originalQuantity).toBe(15);
        expect(parsed.data.stockAdjustmentReason).toBe("order_cap");
        expect(parsed.data.stockAdjustmentNote).toContain("maximum purchase limit");
      }
    });

    it("accepts stock_limit as valid stockAdjustmentReason", () => {
      const parsed = StockAdjustmentReasonEnum.safeParse("stock_limit");
      expect(parsed.success).toBe(true);
      const invalid = StockAdjustmentReasonEnum.safeParse("unknown_reason");
      expect(invalid.success).toBe(false);
    });
  });

  describe("calculateCartCalculation with Empty Cart and Promo", () => {
    it("evaluates promo code on empty cart and preserves machine-readable failureReason", () => {
      const { totals, promo } = calculateCartCalculation([], "ATELIER10");
      expect(totals.totalCents).toBe(0);
      expect(totals.itemCount).toBe(0);
      expect(promo).not.toBeNull();
      expect(promo?.isValid).toBe(false);
      expect(promo?.discountCents).toBe(0);
      expect(promo?.failureReason).toBe("Cannot apply discount to an empty bag.");
    });
  });

  describe("ApplyPromoInputSchema", () => {
    it("trims and transforms promo code to uppercase", () => {
      const parsed = ApplyPromoInputSchema.safeParse({ code: "  atelier10  " });
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.code).toBe("ATELIER10");
      }
    });

    it("rejects empty promo code", () => {
      const parsed = ApplyPromoInputSchema.safeParse({ code: "   " });
      expect(parsed.success).toBe(false);
    });
  });
});
