import { z } from "zod";

/**
 * -----------------------------------------------------------------------------
 * 1. Thin-Cookie Storage Schemas
 * -----------------------------------------------------------------------------
 * Only minimal identifiers and quantities are stored in the client cookie
 * ("Thin-Cookie" architecture). Titles, images, and authoritative prices
 * are rehydrated from the Neon database on read.
 */
export const ThinCartItemSchema = z.object({
  variantId: z.string().uuid("Invalid variant ID"),
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .max(10, "Maximum 10 units per reference"),
});
export type ThinCartItem = z.infer<typeof ThinCartItemSchema>;

export const ThinCartSchema = z.object({
  items: z.array(ThinCartItemSchema).default([]),
  promoCode: z.string().trim().max(32).optional(),
});
export type ThinCart = z.infer<typeof ThinCartSchema>;

/**
 * -----------------------------------------------------------------------------
 * 2. Hydrated Display Item Schema
 * -----------------------------------------------------------------------------
 * Fully populated item after database rehydration. Includes optional stock
 * adjustment signals for graceful UI degradation when stock is reduced.
 */
export const CartItemSchema = z.object({
  variantId: z.string().uuid("Invalid variant ID"),
  productId: z.string().uuid("Invalid product ID"),
  sku: z.string().min(1, "SKU is required"),
  title: z.string().min(1, "Product title is required"),
  slug: z.string().min(1, "Slug is required"),
  variantName: z.string().min(1, "Variant name is required"),
  dialColor: z.string().nullable().optional(),
  strapMaterial: z.string().nullable().optional(),
  caseDiameter: z.string().optional(),
  priceCents: z.number().int().nonnegative("Price must be non-negative integer in cents"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  maxStock: z.number().int().nonnegative("Max stock cannot be negative"),
  image: z.string().min(1, "Image path is required"),

  // Reconciliation signals populated during rehydration if stock changed
  originalQuantity: z.number().int().optional(),
  stockAdjustmentNote: z.string().optional(),
});
export type CartItem = z.infer<typeof CartItemSchema>;

/**
 * -----------------------------------------------------------------------------
 * 3. Promotional Engine & Totals Schemas
 * -----------------------------------------------------------------------------
 * Promotions are typed by effect: subtotal percentage, subtotal fixed, or
 * shipping override. This prevents double-dipping and ensures honest customer copy.
 */
export const PromoEffectTypeEnum = z.enum([
  "subtotal_percentage",
  "subtotal_fixed",
  "free_shipping",
]);
export type PromoEffectType = z.infer<typeof PromoEffectTypeEnum>;

export const PromoResultSchema = z.object({
  code: z.string(),
  type: PromoEffectTypeEnum,
  isValid: z.boolean(),
  discountCents: z.number().int().nonnegative("Discount must be non-negative integer in cents"),
  freeShipping: z.boolean(),
  description: z.string().optional(),
  failureReason: z.string().optional(),
});
export type PromoResult = z.infer<typeof PromoResultSchema>;

export const CartTotalsSchema = z.object({
  subtotalCents: z.number().int().nonnegative(),
  discountCents: z.number().int().nonnegative(),
  shippingEstimateCents: z.number().int().nonnegative(),
  totalCents: z.number().int().nonnegative(),
  itemCount: z.number().int().nonnegative(),
});
export type CartTotals = z.infer<typeof CartTotalsSchema>;

export const RemovedCartItemReasonEnum = z.enum(["out_of_stock", "discontinued"]);
export type RemovedCartItemReason = z.infer<typeof RemovedCartItemReasonEnum>;

export const RemovedCartItemSchema = z.object({
  variantId: z.string().uuid("Invalid variant ID"),
  reason: RemovedCartItemReasonEnum,
  title: z.string().optional(),
  sku: z.string().optional(),
});
export type RemovedCartItem = z.infer<typeof RemovedCartItemSchema>;

export const CartStateSchema = z.object({
  items: z.array(CartItemSchema),
  removedItems: z.array(RemovedCartItemSchema).default([]),
  totals: CartTotalsSchema,
  promo: PromoResultSchema.nullable().optional(),
  isPending: z.boolean().default(false),
});
export type CartState = z.infer<typeof CartStateSchema>;

/**
 * -----------------------------------------------------------------------------
 * 4. Action Input Mutation Schemas
 * -----------------------------------------------------------------------------
 * Validates all mutation requests across server boundaries.
 */
export const AddToCartInputSchema = z.object({
  variantId: z.string().uuid("Invalid variant ID"),
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(1, "Minimum quantity is 1")
    .max(10, "Maximum 10 units per reference")
    .default(1),
});
export type AddToCartInput = z.infer<typeof AddToCartInputSchema>;

export const UpdateQuantityInputSchema = z.object({
  variantId: z.string().uuid("Invalid variant ID"),
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(0, "Quantity cannot be negative")
    .max(10, "Maximum 10 units per reference"),
});
export type UpdateQuantityInput = z.infer<typeof UpdateQuantityInputSchema>;

export const RemoveFromCartInputSchema = z.object({
  variantId: z.string().uuid("Invalid variant ID"),
});
export type RemoveFromCartInput = z.infer<typeof RemoveFromCartInputSchema>;

export const ApplyPromoInputSchema = z.object({
  code: z
    .string()
    .trim()
    .transform((val) => val.toUpperCase())
    .pipe(
      z
        .string()
        .min(1, "Promotion code cannot be empty")
        .max(32, "Promotion code too long")
    ),
});
export type ApplyPromoInput = z.infer<typeof ApplyPromoInputSchema>;
