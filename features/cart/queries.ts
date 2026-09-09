import { inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { productVariants } from "@/lib/db/schema";
import {
  calculateItemCount,
  calculateCartCalculation,
  clampQuantity,
} from "./math";
import type { ThinCart, CartState, CartItem, RemovedCartItem } from "./schemas";

/**
 * -----------------------------------------------------------------------------
 * 0-DB Cart Badge Calculation
 * -----------------------------------------------------------------------------
 * Computes total item count directly in memory from the thin cookie payload.
 * ZERO database connections are consumed, preserving sub-millisecond response
 * times on general catalog navigation.
 */
export function getCartItemCount(thinCart: ThinCart): number {
  return calculateItemCount(thinCart.items);
}

/**
 * -----------------------------------------------------------------------------
 * Database Cart Rehydration Engine
 * -----------------------------------------------------------------------------
 * Reconciles lightweight cookie items against Neon Postgres:
 * 1. Merges duplicate variant entries to prevent split line items or stock race conditions.
 * 2. Queries live prices and current available stock from `product_variants`.
 * 3. Real-time stock clamping: Clamps quantities using `clampQuantity()` and attaches
 *    diagnostic notes (`originalQuantity`, `stockAdjustmentNote`) if allocation changed.
 * 4. Tracks removed items with explicit reasons (`out_of_stock` vs `discontinued`).
 * 5. Fallback honesty: Fallback images strictly use an unbranded, neutral horology
 *    schematic (`/images/watch-placeholder.svg`) rather than sibling variants.
 * 6. Single-pass calculation: Evaluates totals and promos concurrently without double-evaluation traps.
 */
export async function rehydrateCart(thinCart: ThinCart): Promise<CartState> {
  // Fast path: Empty cart requires 0 database queries
  if (!thinCart.items || thinCart.items.length === 0) {
    const { totals: emptyTotals } = calculateCartCalculation([]);
    return {
      items: [],
      removedItems: [],
      totals: emptyTotals,
      promo: null,
      isPending: false,
    };
  }

  // 1. Merge duplicate line items (e.g. multi-tab race or duplicate cookie entries)
  const mergedItemsMap = new Map<string, number>();
  for (const item of thinCart.items) {
    mergedItemsMap.set(
      item.variantId,
      (mergedItemsMap.get(item.variantId) ?? 0) + item.quantity
    );
  }
  const mergedItems = Array.from(mergedItemsMap.entries()).map(
    ([variantId, quantity]) => ({ variantId, quantity })
  );

  const variantIds = mergedItems.map((i) => i.variantId);

  // Query matching variants with their parent product specifications
  const dbVariants = await db.query.productVariants.findMany({
    where: inArray(productVariants.id, variantIds),
    with: {
      product: true,
    },
  });

  const variantMap = new Map(dbVariants.map((v) => [v.id, v]));

  const hydratedItems: CartItem[] = [];
  const removedItems: RemovedCartItem[] = [];

  for (const item of mergedItems) {
    const dbVariant = variantMap.get(item.variantId);

    // If variant no longer exists in catalog, report as discontinued
    if (!dbVariant) {
      removedItems.push({
        variantId: item.variantId,
        reason: "discontinued",
      });
      continue;
    }

    const requestedQty = item.quantity;
    const availableStock = dbVariant.stock;

    // Advisory clamping using pure clampQuantity formula
    const clampedQty = clampQuantity(requestedQty, availableStock);

    // If completely out of stock, omit from active purchasable items and report reason
    if (clampedQty <= 0) {
      removedItems.push({
        variantId: item.variantId,
        reason: "out_of_stock",
        title: dbVariant.product.title,
        sku: dbVariant.sku,
      });
      continue;
    }

    const isClamped = clampedQty !== requestedQty;
    const stockAdjustmentNote = isClamped
      ? `Allocation adjusted from ${requestedQty} to ${clampedQty} due to limited stock.`
      : undefined;

    // Spec honesty: variant image first, otherwise neutral schematic placeholder
    const image = dbVariant.images?.[0] || "/images/watch-placeholder.svg";

    hydratedItems.push({
      variantId: dbVariant.id,
      productId: dbVariant.productId,
      sku: dbVariant.sku,
      title: dbVariant.product.title,
      slug: dbVariant.product.slug,
      variantName: dbVariant.name,
      dialColor: dbVariant.dialColor,
      strapMaterial: dbVariant.strapMaterial,
      caseDiameter: dbVariant.product.caseDiameter ?? undefined,
      priceCents: dbVariant.priceCents, // Real-time authoritative price from DB
      quantity: clampedQty,
      maxStock: availableStock,
      image,
      originalQuantity: isClamped ? requestedQty : undefined,
      stockAdjustmentNote,
    });
  }

  // Single-pass authoritative calculation for totals and promo
  const { totals, promo } = calculateCartCalculation(
    hydratedItems,
    thinCart.promoCode
  );

  return {
    items: hydratedItems,
    removedItems,
    totals,
    promo,
    isPending: false,
  };
}

