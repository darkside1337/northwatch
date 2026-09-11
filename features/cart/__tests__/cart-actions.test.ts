import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import type { ThinCart } from "../schemas";

// In-memory cookie store mock
let mockCookieState: ThinCart = { items: [] };

vi.mock("../cookie", () => ({
  getThinCartCookie: vi.fn(async () => JSON.parse(JSON.stringify(mockCookieState))),
  setThinCartCookie: vi.fn(async (cart: ThinCart) => {
    mockCookieState = JSON.parse(JSON.stringify(cart));
  }),
  clearThinCartCookie: vi.fn(async () => {
    mockCookieState = { items: [] };
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Import after mocks
import {
  addToBagAction,
  updateQuantityAction,
  removeFromBagAction,
  applyPromoAction,
  removePromoAction,
  clearCartAction,
  getCartAction,
} from "../actions";
import { db } from "@/lib/db/client";
import { productVariants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

describe("Cart Server Actions Integration", { timeout: 25000 }, () => {
  let inStockVariantId: string;

  beforeAll(async () => {
    const variant = await db.query.productVariants.findFirst({
      where: eq(productVariants.sku, "NW-01-FLD-BLK-CAN"),
    });
    if (!variant) {
      throw new Error("Missing seeded variant NW-01-FLD-BLK-CAN");
    }
    inStockVariantId = variant.id;
  }, 30000);

  beforeEach(() => {
    mockCookieState = { items: [] };
  });

  it("getCartAction rehydrates cart from existing cookie", async () => {
    await addToBagAction({ variantId: inStockVariantId, quantity: 2 });
    const cart = await getCartAction();

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(2);
    expect(cart.totals.itemCount).toBe(2);
  });

  it("getCartAction preserves pure read semantics without writing cookies", async () => {
    mockCookieState = {
      items: [{ variantId: inStockVariantId, quantity: 2 }],
    };
    const { setThinCartCookie } = await import("../cookie");
    await getCartAction();

    // Rehydration read should not trigger cookie writes
    expect(setThinCartCookie).not.toHaveBeenCalled();
  });

  it("addToBagAction adds item to thin cookie and returns rehydrated state", async () => {
    const cart = await addToBagAction({
      variantId: inStockVariantId,
      quantity: 2,
    });

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(2);
    expect(cart.totals.itemCount).toBe(2);
    expect(cart.totals.subtotalCents).toBe(cart.items[0].priceCents * 2);

    // Verify cookie was updated
    expect(mockCookieState.items).toEqual([
      { variantId: inStockVariantId, quantity: 2 },
    ]);
  });

  it("addToBagAction increments existing item quantity up to cap 10 with honest adjustment signal", async () => {
    await addToBagAction({ variantId: inStockVariantId, quantity: 6 });
    const cart = await addToBagAction({ variantId: inStockVariantId, quantity: 7 });

    // Capped at 10, adjustment note and order_cap reason attached
    expect(cart.items[0].quantity).toBe(10);
    expect(cart.items[0].originalQuantity).toBe(13);
    expect(cart.items[0].stockAdjustmentReason).toBe("order_cap");
    expect(cart.items[0].stockAdjustmentNote).toContain("maximum purchase limit per reference is 10");
    expect(mockCookieState.items[0].quantity).toBe(10);
  });

  it("sanitizes intra-payload duplicate entries in cookie before mutating quantity", async () => {
    // Simulate a cookie containing duplicate entries for the same variant
    mockCookieState = {
      items: [
        { variantId: inStockVariantId, quantity: 2 },
        { variantId: inStockVariantId, quantity: 3 },
      ],
    };

    // Customer requests quantity 4
    const cart = await updateQuantityAction({
      variantId: inStockVariantId,
      quantity: 4,
    });

    // Must consolidate to exactly 4 without summing stale duplicates into 7
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(4);
    expect(mockCookieState.items).toEqual([
      { variantId: inStockVariantId, quantity: 4 },
    ]);
  });

  it("updateQuantityAction updates quantity or clamps to maximum", async () => {
    await addToBagAction({ variantId: inStockVariantId, quantity: 2 });
    const cart = await updateQuantityAction({
      variantId: inStockVariantId,
      quantity: 5,
    });

    expect(cart.items[0].quantity).toBe(5);
    expect(mockCookieState.items[0].quantity).toBe(5);
  });

  it("removeFromBagAction eliminates item from cookie and cart state", async () => {
    await addToBagAction({ variantId: inStockVariantId, quantity: 2 });
    const cart = await removeFromBagAction({ variantId: inStockVariantId });

    expect(cart.items).toHaveLength(0);
    expect(cart.totals.itemCount).toBe(0);
    expect(mockCookieState.items).toHaveLength(0);
  });

  it("applyPromoAction validates promo and attaches code to thin cookie", async () => {
    await addToBagAction({ variantId: inStockVariantId, quantity: 1 });
    const cart = await applyPromoAction({ code: "ATELIER10" });

    expect(cart.promo?.code).toBe("ATELIER10");
    expect(cart.totals.discountCents).toBeGreaterThan(0);
    expect(mockCookieState.promoCode).toBe("ATELIER10");
  });

  it("applyPromoAction rejects invalid promo codes gracefully", async () => {
    await addToBagAction({ variantId: inStockVariantId, quantity: 1 });
    const cart = await applyPromoAction({ code: "INVALID99" });

    expect(cart.promo?.isValid).toBe(false);
    expect(cart.promo?.failureReason).toContain("Invalid promotion code");
    expect(cart.totals.discountCents).toBe(0);
  });

  it("removePromoAction strips promo from thin cookie and recalculates", async () => {
    await addToBagAction({ variantId: inStockVariantId, quantity: 1 });
    await applyPromoAction({ code: "ATELIER10" });
    const cart = await removePromoAction();

    expect(cart.promo).toBeNull();
    expect(cart.totals.discountCents).toBe(0);
    expect(mockCookieState.promoCode).toBeUndefined();
  });

  it("clearCartAction empties items and promo code completely", async () => {
    await addToBagAction({ variantId: inStockVariantId, quantity: 2 });
    await applyPromoAction({ code: "FREESHIP" });
    const cart = await clearCartAction();

    expect(cart.items).toHaveLength(0);
    expect(cart.totals.itemCount).toBe(0);
    expect(cart.promo).toBeNull();
    expect(mockCookieState.items).toHaveLength(0);
    expect(mockCookieState.promoCode).toBeUndefined();
  });
});
