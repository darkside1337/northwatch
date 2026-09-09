import { inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { productVariants } from "@/lib/db/schema";
import {
  calculateItemCount,
  calculateCartCalculation,
  clampQuantity,
} from "./math";
import type {
  ThinCart,
  CartState,
  CartItem,
  RemovedCartItem,
  StockAdjustmentReason,
} from "./schemas";

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
 *    diagnostic notes (`originalQuantity`, `stockAdjustmentReason`, `stockAdjustmentNote`).
 * 4. Tracks removed items with explicit reasons (`out_of_stock` vs `discontinued`).
 * 5. Fallback honesty: Fallback images strictly use an unbranded, neutral horology
 *    schematic (`/images/watch-placeholder.svg`) rather than sibling variants.
 * 6. Single-pass calculation: Evaluates totals and promos concurrently without double-evaluation traps.
 */
export async function rehydrateCart(thinCart: ThinCart): Promise<CartState> {
  // Fast path: Empty cart evaluates promo on zero subtotal without DB query
  if (!thinCart.items || thinCart.items.length === 0) {
    const { totals: emptyTotals, promo } = calculateCartCalculation(
      [],
      thinCart.promoCode
    );
    return {
      items: [],
      removedItems: [],
      totals: emptyTotals,
      promo,
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

  /**
   * Complete Variant State Taxonomy for Database Rehydration:
   * 1. UNLISTED / MISSING: Variant ID not found in product_variants table.
   *    -> Treat as discontinued/unlisted, omit from active items, track in removedItems.
   * 2. ORPHANED RELATION (Defensive runtime guard — unreachable under active FK constraints):
   *    -> Variant row exists but parent product relation is null. Fallback safely without throwing.
   * 3. DEPLETED / OUT OF STOCK: Variant exists, availableStock <= 0.
   *    -> Short-circuit immediately to removedItems with reason "out_of_stock". Never add to items.
   * 4. CLAMPED (STOCK LIMIT): 0 < availableStock < requestedQty, availableStock < maxPerReference (10).
   *    -> Clamp to availableStock, mark stockAdjustmentReason: "stock_limit".
   * 5. CLAMPED (ORDER CAP): requestedQty > maxPerReference (10), availableStock >= maxPerReference (10).
   *    -> Clamp to 10, mark stockAdjustmentReason: "order_cap".
   * 6. ACTIVE & AVAILABLE: 0 < requestedQty <= min(availableStock, maxPerReference).
   *    -> Include in hydratedItems at authoritative live price without adjustments.
   */
  for (const item of mergedItems) {
    const dbVariant = variantMap.get(item.variantId);

    // State 1: Variant not found in catalog
    if (!dbVariant) {
      removedItems.push({
        variantId: item.variantId,
        reason: "discontinued",
      });
      continue;
    }

    // State 2 Defensive Fallback: Product relation null-guard
    const title = dbVariant.product?.title ?? "Unknown Reference";
    const slug = dbVariant.product?.slug ?? "";
    const caseDiameter = dbVariant.product?.caseDiameter ?? undefined;

    const requestedQty = item.quantity;
    const availableStock = dbVariant.stock;

    // Advisory clamping using pure clampQuantity formula
    const clampedQty = clampQuantity(requestedQty, availableStock);

    // State 3: Zero-stock short-circuit (MUST execute BEFORE clamp reason classification)
    if (clampedQty <= 0) {
      removedItems.push({
        variantId: item.variantId,
        reason: "out_of_stock",
        title,
        sku: dbVariant.sku,
      });
      continue;
    }

    // States 4 & 5: Differentiated Clamping Reason (Only reachable when clampedQty > 0)
    const isClamped = clampedQty !== requestedQty;
    const isStockLimited =
      isClamped && availableStock < requestedQty && availableStock < 10;
    const isCapLimited =
      isClamped && requestedQty > 10 && availableStock >= 10;

    const stockAdjustmentReason: StockAdjustmentReason | undefined = isStockLimited
      ? "stock_limit"
      : isCapLimited
      ? "order_cap"
      : undefined;

    const stockAdjustmentNote = isStockLimited
      ? `Allocation adjusted from ${requestedQty} to ${clampedQty} due to limited reserve stock.`
      : isCapLimited
      ? `Allocation adjusted from ${requestedQty} to ${clampedQty} (maximum purchase limit per reference is 10).`
      : undefined;

    // Spec honesty: variant image first, otherwise neutral schematic placeholder
    const image = dbVariant.images?.[0] || "/images/watch-placeholder.svg";

    // State 6: Valid active item
    hydratedItems.push({
      variantId: dbVariant.id,
      productId: dbVariant.productId,
      sku: dbVariant.sku,
      title,
      slug,
      variantName: dbVariant.name,
      dialColor: dbVariant.dialColor,
      strapMaterial: dbVariant.strapMaterial,
      caseDiameter,
      priceCents: dbVariant.priceCents, // Real-time authoritative price from DB
      quantity: clampedQty,
      maxStock: availableStock,
      image,
      originalQuantity: isClamped ? requestedQty : undefined,
      stockAdjustmentReason,
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

