import { cookies } from "next/headers";
import { ThinCartSchema, type ThinCart } from "./schemas";

export const CART_COOKIE_NAME = "northwatch_cart";
export const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days in seconds

/**
 * Reads and validates the thin cart cookie from the incoming request.
 * If the cookie is missing or malformed, gracefully returns an empty cart.
 */
export async function getThinCartCookie(): Promise<ThinCart> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(CART_COOKIE_NAME)?.value;
    if (!raw) {
      return { items: [] };
    }

    const parsedJson = JSON.parse(raw);
    const validated = ThinCartSchema.safeParse(parsedJson);
    if (validated.success) {
      return validated.data;
    }
  } catch {
    // Malformed JSON or cookie read error — fall back to empty cart
  }

  return { items: [] };
}

/**
 * Serializes and sets the validated thin cart cookie.
 * Can only be called from Server Actions or Route Handlers.
 */
export async function setThinCartCookie(cart: ThinCart): Promise<void> {
  const cookieStore = await cookies();
  const validated = ThinCartSchema.parse(cart);

  cookieStore.set(CART_COOKIE_NAME, JSON.stringify(validated), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: CART_COOKIE_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
}

/**
 * Clears the cart cookie.
 */
export async function clearThinCartCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CART_COOKIE_NAME);
}
