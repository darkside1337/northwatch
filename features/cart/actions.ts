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
} from "./schemas";

/**
 * Reads the thin cookie and rehydrates the full cart against Neon Postgres.
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

  const existingIndex = thinCart.items.findIndex(
    (item) => item.variantId === input.variantId
  );

  if (existingIndex >= 0) {
    const existing = thinCart.items[existingIndex];
    thinCart.items[existingIndex] = {
      ...existing,
      quantity: Math.min(10, existing.quantity + input.quantity),
    };
  } else {
    thinCart.items.push({
      variantId: input.variantId,
      quantity: Math.min(10, input.quantity),
    });
  }

  // Rehydrate against DB (which performs real-time stock clamping)
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

  if (input.quantity <= 0) {
    thinCart.items = thinCart.items.filter(
      (item) => item.variantId !== input.variantId
    );
  } else {
    const existingIndex = thinCart.items.findIndex(
      (item) => item.variantId === input.variantId
    );
    if (existingIndex >= 0) {
      thinCart.items[existingIndex].quantity = Math.min(10, input.quantity);
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

  thinCart.items = thinCart.items.filter(
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
