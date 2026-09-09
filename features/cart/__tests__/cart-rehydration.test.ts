import { describe, it, expect, beforeAll } from "vitest";
import { db } from "@/lib/db/client";
import { productVariants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { rehydrateCart, getCartItemCount } from "../queries";
import type { ThinCart } from "../schemas";

describe("Cart Domain: Rehydration & Stock Clamping", { timeout: 25000 }, () => {
  let inStockVariantId: string;
  let outOfStockVariantId: string;

  beforeAll(async () => {
    // Look up real seeded variants from Neon Postgres
    const inStock = await db.query.productVariants.findFirst({
      where: eq(productVariants.sku, "NW-01-FLD-BLK-CAN"), // stock: 15
    });
    if (!inStock) {
      throw new Error("Seed data missing: NW-01-FLD-BLK-CAN");
    }
    inStockVariantId = inStock.id;

    const outOfStock = await db.query.productVariants.findFirst({
      where: eq(productVariants.sku, "NW-01-FLD-BLK-MSH"), // stock: 0
    });
    if (!outOfStock) {
      throw new Error("Seed data missing: NW-01-FLD-BLK-MSH");
    }
    outOfStockVariantId = outOfStock.id;
  }, 25000);

  describe("getCartItemCount (0-DB Badge)", () => {
    it("returns 0 for empty thin cart without querying database", () => {
      expect(getCartItemCount({ items: [] })).toBe(0);
    });

    it("sums quantities in memory from cookie payload", () => {
      const thinCart: ThinCart = {
        items: [
          { variantId: "a0000000-0000-4000-8000-000000000001", quantity: 2 },
          { variantId: "a0000000-0000-4000-8000-000000000002", quantity: 3 },
        ],
      };
      expect(getCartItemCount(thinCart)).toBe(5);
    });
  });

  describe("rehydrateCart against Database", () => {
    it("returns zeroed state immediately for empty items array without DB query", async () => {
      const cart = await rehydrateCart({ items: [] });
      expect(cart.items).toHaveLength(0);
      expect(cart.totals.totalCents).toBe(0);
      expect(cart.totals.itemCount).toBe(0);
      expect(cart.promo).toBeNull();
    });

    it("rehydrates valid variant from database with live price, title, and stock", async () => {
      const thinCart: ThinCart = {
        items: [{ variantId: inStockVariantId, quantity: 1 }],
      };

      const cart = await rehydrateCart(thinCart);
      expect(cart.items).toHaveLength(1);

      const item = cart.items[0];
      expect(item.variantId).toBe(inStockVariantId);
      expect(item.sku).toBe("NW-01-FLD-BLK-CAN");
      expect(item.title).toBe("The Field Automatic");
      expect(item.priceCents).toBe(38000); // $380.00
      expect(item.quantity).toBe(1);
      expect(item.maxStock).toBeGreaterThanOrEqual(10);
      expect(item.image).toContain("watch-field-canvas");
      expect(item.originalQuantity).toBeUndefined();
      expect(item.stockAdjustmentNote).toBeUndefined();

      // Totals check: $380 + $15 standard courier shipping = $395.00
      expect(cart.totals.subtotalCents).toBe(38000);
      expect(cart.totals.shippingEstimateCents).toBe(1500);
      expect(cart.totals.totalCents).toBe(39500);
    });

    it("clamps requested quantity to maximum purchase cap (10) and attaches order_cap note", async () => {
      const thinCart: ThinCart = {
        items: [{ variantId: inStockVariantId, quantity: 25 }],
      };

      const cart = await rehydrateCart(thinCart);
      expect(cart.items).toHaveLength(1);

      const item = cart.items[0];
      expect(item.quantity).toBe(10); // Clamped to 10
      expect(item.originalQuantity).toBe(25);
      expect(item.stockAdjustmentReason).toBe("order_cap");
      expect(item.stockAdjustmentNote).toContain("maximum purchase limit per reference is 10");
    });

    it("omits out-of-stock items (stock: 0) from active purchasable items and asserts reason", async () => {
      const thinCart: ThinCart = {
        items: [{ variantId: outOfStockVariantId, quantity: 1 }],
      };

      const cart = await rehydrateCart(thinCart);
      expect(cart.items).toHaveLength(0);
      expect(cart.totals.itemCount).toBe(0);
      expect(cart.totals.totalCents).toBe(0);
      expect(cart.removedItems).toHaveLength(1);
      expect(cart.removedItems[0]).toMatchObject({
        variantId: outOfStockVariantId,
        reason: "out_of_stock",
      });
    });

    it("strictly short-circuits availableStock === 0 to removedItems and NEVER enters cart.items with clamp reason", async () => {
      const thinCart: ThinCart = {
        items: [{ variantId: outOfStockVariantId, quantity: 5 }],
      };

      const cart = await rehydrateCart(thinCart);
      expect(cart.items).toHaveLength(0);
      // Assert zero-stock item never appears in cart.items with a clamp reason attached
      expect(cart.items.some((i) => i.variantId === outOfStockVariantId)).toBe(false);
      expect(cart.removedItems).toHaveLength(1);
      expect(cart.removedItems[0].reason).toBe("out_of_stock");
    });

    it("gracefully omits non-existent or deleted variant IDs without crashing and reports discontinued", async () => {
      const ghostId = "00000000-0000-4000-8000-000000000999";
      const thinCart: ThinCart = {
        items: [
          { variantId: ghostId, quantity: 1 },
          { variantId: inStockVariantId, quantity: 1 },
        ],
      };

      const cart = await rehydrateCart(thinCart);
      // Only the real variant survives
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].variantId).toBe(inStockVariantId);
      expect(cart.removedItems).toHaveLength(1);
      expect(cart.removedItems[0]).toMatchObject({
        variantId: ghostId,
        reason: "discontinued",
      });
    });

    it("evaluates promo code on empty cart rehydration without swallowing failureReason", async () => {
      const cart = await rehydrateCart({ items: [], promoCode: "ATELIER10" });
      expect(cart.items).toHaveLength(0);
      expect(cart.promo).not.toBeNull();
      expect(cart.promo?.isValid).toBe(false);
      expect(cart.promo?.failureReason).toBe("Cannot apply discount to an empty bag.");
    });

    it("evaluates promo code deterministically against rehydrated database totals", async () => {
      const thinCart: ThinCart = {
        items: [{ variantId: inStockVariantId, quantity: 1 }],
        promoCode: "ATELIER10",
      };

      const cart = await rehydrateCart(thinCart);
      expect(cart.promo?.isValid).toBe(true);
      expect(cart.totals.discountCents).toBe(3800); // 10% of 38000
      expect(cart.totals.totalCents).toBe(35700); // (38000 - 3800) + 1500
    });
  });

  // ---------------------------------------------------------------
  // Bug 1: removed items disappear with no explanation surfaced
  // ---------------------------------------------------------------
  describe("removedItems tracking", () => {
    it("reports WHY an out-of-stock item was dropped, not just that it's gone", async () => {
      const thinCart: ThinCart = {
        items: [{ variantId: outOfStockVariantId, quantity: 1 }],
      };

      const cart = await rehydrateCart(thinCart);

      expect(cart.items).toHaveLength(0);
      expect(cart.removedItems).toBeDefined();
      expect(cart.removedItems).toHaveLength(1);
      expect(cart.removedItems?.[0]).toMatchObject({
        variantId: outOfStockVariantId,
        reason: "out_of_stock",
      });
    });

    it("reports a deleted/non-existent variant as removed, distinct from out-of-stock", async () => {
      const ghostId = "00000000-0000-4000-8000-000000000999";
      const thinCart: ThinCart = {
        items: [{ variantId: ghostId, quantity: 1 }],
      };

      const cart = await rehydrateCart(thinCart);

      expect(cart.items).toHaveLength(0);
      expect(cart.removedItems).toBeDefined();
      expect(cart.removedItems?.[0]).toMatchObject({
        variantId: ghostId,
        reason: "discontinued",
      });
    });

    it("mixed cart: keeps the valid item, reports the removed one, doesn't conflate the two", async () => {
      const thinCart: ThinCart = {
        items: [
          { variantId: inStockVariantId, quantity: 1 },
          { variantId: outOfStockVariantId, quantity: 2 },
        ],
      };

      const cart = await rehydrateCart(thinCart);

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].variantId).toBe(inStockVariantId);
      expect(cart.removedItems).toHaveLength(1);
      expect(cart.removedItems?.[0].variantId).toBe(outOfStockVariantId);
    });
  });

  // ---------------------------------------------------------------
  // Bug 2: promo re-evaluated against already-adjusted totals
  // ---------------------------------------------------------------
  describe("promo double-evaluation consistency", () => {
    it("GENEVA: cart.promo still says 'waived' even after shipping is zeroed by totals", async () => {
      const thinCart: ThinCart = {
        items: [{ variantId: inStockVariantId, quantity: 1 }], // under $500, would normally pay shipping
        promoCode: "GENEVA",
      };

      const cart = await rehydrateCart(thinCart);

      expect(cart.totals.shippingEstimateCents).toBe(0);
      expect(cart.promo?.description).not.toContain("already complimentary");
      expect(cart.promo?.description).toContain("Complimentary");
    });

    it("promo validity/discount in cart.promo must match what cart.totals actually applied", async () => {
      const thinCart: ThinCart = {
        items: [{ variantId: inStockVariantId, quantity: 1 }],
        promoCode: "ATELIER10",
      };

      const cart = await rehydrateCart(thinCart);

      const expectedDiscount = Math.round(cart.totals.subtotalCents * 0.1);
      expect(cart.promo?.discountCents).toBe(cart.totals.discountCents);
      expect(cart.totals.discountCents).toBe(expectedDiscount);
    });

    it("promo discount must be computed against the CLAMPED subtotal, not the requested one", async () => {
      const thinCart: ThinCart = {
        items: [{ variantId: inStockVariantId, quantity: 25 }], // will clamp to 10
        promoCode: "ATELIER10",
      };

      const cart = await rehydrateCart(thinCart);
      const item = cart.items[0];

      expect(item.quantity).toBe(10); // confirms clamping happened

      const correctSubtotal = item.priceCents * 10;
      const wrongSubtotal = item.priceCents * 25;

      expect(cart.totals.subtotalCents).toBe(correctSubtotal);
      expect(cart.totals.discountCents).toBe(Math.round(correctSubtotal * 0.1));
      expect(cart.totals.discountCents).not.toBe(Math.round(wrongSubtotal * 0.1));
    });
  });

  // ---------------------------------------------------------------
  // Bug 3 (lower priority): duplicate variantId entries aren't merged
  // ---------------------------------------------------------------
  describe("duplicate line items in thin cart", () => {
    it("merges two entries for the same variant into one line item", async () => {
      const thinCart: ThinCart = {
        items: [
          { variantId: inStockVariantId, quantity: 1 },
          { variantId: inStockVariantId, quantity: 2 }, // duplicate, e.g. from a race between two tabs
        ],
      };

      const cart = await rehydrateCart(thinCart);

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(3);
    });

    it("clamps the AGGREGATE quantity after merging duplicates, not before, and records order_cap reason", async () => {
      const thinCart: ThinCart = {
        items: [
          { variantId: inStockVariantId, quantity: 6 },
          { variantId: inStockVariantId, quantity: 7 },
        ],
      };

      const cart = await rehydrateCart(thinCart);

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(10); // merged to 13, clamped to 10
      expect(cart.items[0].originalQuantity).toBe(13);
      expect(cart.items[0].stockAdjustmentReason).toBe("order_cap");
      expect(cart.items[0].stockAdjustmentNote).toContain("maximum purchase limit");
    });
  });

  describe("Adversarial Combinations: Promo Threshold Invalidation upon Clamping", () => {
    it("deactivates NORTH50 when clamped subtotal drops below $400.00 requirement", async () => {
      // NW-01-FLD-BLK-CAN is $380.00 (38000 cents).
      // Requesting 1x item produces $380.00 subtotal, which is < $400.00 threshold for NORTH50.
      const thinCart: ThinCart = {
        items: [{ variantId: inStockVariantId, quantity: 1 }],
        promoCode: "NORTH50",
      };

      const cart = await rehydrateCart(thinCart);
      expect(cart.totals.subtotalCents).toBe(38000);
      expect(cart.promo?.isValid).toBe(false);
      expect(cart.promo?.discountCents).toBe(0);
      expect(cart.promo?.failureReason).toContain("$400.00");
      expect(cart.totals.discountCents).toBe(0);
      expect(cart.totals.shippingEstimateCents).toBe(1500); // Standard shipping applied
      expect(cart.totals.totalCents).toBe(39500); // 38000 + 1500
    });
  });
});
