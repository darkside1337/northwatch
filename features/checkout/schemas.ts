import { z } from "zod";
import { SHIPPING_TIER_IDS } from "@/config/site";

/**
 * -----------------------------------------------------------------------------
 * Shipping Address Schema
 * -----------------------------------------------------------------------------
 * Strict recipient coordinates validation for courier dispatch.
 */
export const ShippingAddressSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(64, "First name too long"),
  lastName: z.string().trim().min(1, "Last name is required").max(64, "Last name too long"),
  street: z.string().trim().min(1, "Street address is required").max(128, "Street address too long"),
  apartment: z.string().trim().max(64, "Apartment/suite too long").optional().default(""),
  city: z.string().trim().min(1, "City is required").max(64, "City too long"),
  state: z.string().trim().min(2, "State or province is required").max(32, "State too long"),
  postalCode: z.string().trim().min(3, "Postal code is required").max(16, "Postal code too long"),
  country: z.string().trim().min(2, "Country is required").max(32).default("US"),
  phone: z.string().trim().min(7, "Valid contact number required").max(24, "Phone number too long"),
});

export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;

/**
 * -----------------------------------------------------------------------------
 * Checkout Mutation Schemas
 * -----------------------------------------------------------------------------
 */
export const InitCheckoutInputSchema = z.object({
  shippingAddress: ShippingAddressSchema,
  shippingTierId: z.enum(SHIPPING_TIER_IDS),
  clientAttemptToken: z.string().uuid("Invalid client attempt token"),
});

export type InitCheckoutInput = z.infer<typeof InitCheckoutInputSchema>;

/**
 * -----------------------------------------------------------------------------
 * Active Draft Schemas
 * -----------------------------------------------------------------------------
 */
export const CheckoutDraftSchema = z.object({
  orderId: z.string().uuid(),
  shippingAddress: ShippingAddressSchema,
  shippingTierId: z.enum(SHIPPING_TIER_IDS),
  clientSecret: z.string().min(1),
  subtotalCents: z.number().int().nonnegative(),
  discountCents: z.number().int().nonnegative(),
  promoCode: z.string().nullable().optional(),
  shippingCents: z.number().int().nonnegative(),
  taxCents: z.number().int().nonnegative(),
  totalCents: z.number().int().nonnegative(),
});

export type CheckoutDraft = z.infer<typeof CheckoutDraftSchema>;
