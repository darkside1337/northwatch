"use server";

import { revalidatePath } from "next/cache";
import {
  getThinCartCookie,
  setThinCartCookie,
  clearThinCartCookie,
} from "./cookie";
import { rehydrateCart } from "./queries";
import {
  AddToCartInputSchema,
  UpdateQuantityInputSchema,
  RemoveFromCartInputSchema,
  ApplyPromoInputSchema,
  type AddToCartInput,
  type UpdateQuantityInput,
  type RemoveFromCartInput,
  type ApplyPromoInput,
  type CartState,
  type ThinCart,
  type ThinCartItem,
} from "./schemas";

/**
 * Sanitizes thin cart items by consolidating duplicate entries for the same variantId.
 * Sums quantities across duplicate entries without premature clamping.
 */
function deduplicateThinCartItems(items: ThinCartItem[]): ThinCartItem[] {
  const map = new Map<string, number>();
  for (const item of items) {
    map.set(item.variantId, (map.get(item.variantId) ?? 0) + item.quantity);
  }
  return Array.from(map.entries()).map(([variantId, quantity]) => ({
    variantId,
    quantity,
  }));
}

/**
 * Reads the thin cookie and rehydrates the full cart against Neon Postgres.
 * INVARIANT: Passive read-only operation — never writes cookies during read paths.
 */
export async function getCartAction(): Promise<CartState> {
  const thinCart = await getThinCartCookie();
  return rehydrateCart(thinCart);
}

/**
 * Adds an item to the bag or increments quantity if already present.
 * Rehydrates against database, clamps to live stock, updates cookie,
 * and revalidates `/cart` to close the Server Component cache gap.
 */
export async function addToBagAction(
  rawInput: AddToCartInput
): Promise<CartState> {
  const input = AddToCartInputSchema.parse(rawInput);
  const thinCart = await getThinCartCookie();
  const items = deduplicateThinCartItems(thinCart.items);

  const existingIndex = items.findIndex(
    (item) => item.variantId === input.variantId
  );

  if (existingIndex >= 0) {
    // Preserve requested sum without premature clamping so rehydrateCart detects adjustments!
    items[existingIndex] = {
      variantId: input.variantId,
      quantity: items[existingIndex].quantity + input.quantity,
    };
  } else {
    items.push({
      variantId: input.variantId,
      quantity: input.quantity,
    });
  }

  thinCart.items = items;

  // Rehydrate against DB (which performs real-time stock clamping and attaches signals)
  const freshCart = await rehydrateCart(thinCart);

  // Sync reconciled quantities back to thin cookie
  const reconciledThinCart: ThinCart = {
    items: freshCart.items.map((i) => ({
      variantId: i.variantId,
      quantity: i.quantity,
    })),
    promoCode: thinCart.promoCode,
  };
  await setThinCartCookie(reconciledThinCart);

  // Revalidate Server Components that might render cart data
  revalidatePath("/cart");

  return freshCart;
}

/**
 * Updates quantity of an existing line item. Quantity 0 removes the item.
 */
export async function updateQuantityAction(
  rawInput: UpdateQuantityInput
): Promise<CartState> {
  const input = UpdateQuantityInputSchema.parse(rawInput);
  const thinCart = await getThinCartCookie();
  const items = deduplicateThinCartItems(thinCart.items);

  if (input.quantity <= 0) {
    thinCart.items = items.filter(
      (item) => item.variantId !== input.variantId
    );
  } else {
    const existingIndex = items.findIndex(
      (item) => item.variantId === input.variantId
    );
    if (existingIndex >= 0) {
      items[existingIndex] = {
        variantId: input.variantId,
        quantity: input.quantity,
      };
      thinCart.items = items;
    } else {
      items.push({
        variantId: input.variantId,
        quantity: input.quantity,
      });
      thinCart.items = items;
    }
  }

  const freshCart = await rehydrateCart(thinCart);

  const reconciledThinCart: ThinCart = {
    items: freshCart.items.map((i) => ({
      variantId: i.variantId,
      quantity: i.quantity,
    })),
    promoCode: thinCart.promoCode,
  };
  await setThinCartCookie(reconciledThinCart);

  revalidatePath("/cart");
  return freshCart;
}

/**
 * Removes an item completely from the bag.
 */
export async function removeFromBagAction(
  rawInput: RemoveFromCartInput
): Promise<CartState> {
  const input = RemoveFromCartInputSchema.parse(rawInput);
  const thinCart = await getThinCartCookie();
  const items = deduplicateThinCartItems(thinCart.items);

  thinCart.items = items.filter(
    (item) => item.variantId !== input.variantId
  );

  const freshCart = await rehydrateCart(thinCart);

  const reconciledThinCart: ThinCart = {
    items: freshCart.items.map((i) => ({
      variantId: i.variantId,
      quantity: i.quantity,
    })),
    promoCode: thinCart.promoCode,
  };
  await setThinCartCookie(reconciledThinCart);

  revalidatePath("/cart");
  return freshCart;
}

/**
 * Applies a promotional code. Code is normalized to uppercase at schema boundary.
 */
export async function applyPromoAction(
  rawInput: ApplyPromoInput
): Promise<CartState> {
  const input = ApplyPromoInputSchema.parse(rawInput);
  const thinCart = await getThinCartCookie();
  thinCart.items = deduplicateThinCartItems(thinCart.items);

  thinCart.promoCode = input.code;

  const freshCart = await rehydrateCart(thinCart);

  const reconciledThinCart: ThinCart = {
    items: freshCart.items.map((i) => ({
      variantId: i.variantId,
      quantity: i.quantity,
    })),
    promoCode: thinCart.promoCode,
  };
  await setThinCartCookie(reconciledThinCart);

  revalidatePath("/cart");
  return freshCart;
}

/**
 * Removes active promotional code.
 */
export async function removePromoAction(): Promise<CartState> {
  const thinCart = await getThinCartCookie();
  thinCart.items = deduplicateThinCartItems(thinCart.items);
  delete thinCart.promoCode;

  const freshCart = await rehydrateCart(thinCart);

  const reconciledThinCart: ThinCart = {
    items: freshCart.items.map((i) => ({
      variantId: i.variantId,
      quantity: i.quantity,
    })),
  };
  await setThinCartCookie(reconciledThinCart);

  revalidatePath("/cart");
  return freshCart;
}

/**
 * Completely clears the cart cookie and returns an empty cart.
 */
export async function clearCartAction(): Promise<CartState> {
  await clearThinCartCookie();
  revalidatePath("/cart");
  return {
    items: [],
    removedItems: [],
    totals: {
      subtotalCents: 0,
      discountCents: 0,
      shippingEstimateCents: 0,
      totalCents: 0,
      itemCount: 0,
    },
    promo: null,
    isPending: false,
  };
}
