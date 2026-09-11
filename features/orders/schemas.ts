import { z } from "zod";
import { ShippingAddressSchema } from "@/features/checkout/schemas";

/**
 * -----------------------------------------------------------------------------
 * Order Domain Status Enum
 * -----------------------------------------------------------------------------
 * Matches the PostgreSQL order_status enum strictly.
 */
export const orderStatusSchema = z.enum([
  "pending_payment",
  "paid",
  "shipped",
  "delivered",
  "canceled",
  "refunded",
]);

/**
 * -----------------------------------------------------------------------------
 * Order Item Snapshot Schema
 * -----------------------------------------------------------------------------
 * Immutable purchase snapshot of product title, variant name, and price at checkout.
 */
export const orderItemSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  productId: z.string().min(1),
  variantId: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPriceCents: z.number().int().nonnegative(),
  title: z.string().min(1),
  variantName: z.string().min(1),
});

/**
 * -----------------------------------------------------------------------------
 * Order Schema
 * -----------------------------------------------------------------------------
 * Full order representation with monetary cents and shipping destination.
 */
export const orderSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().nullable().optional(),
  email: z.string().email(),
  status: orderStatusSchema,
  subtotalCents: z.number().int().nonnegative(),
  discountCents: z.number().int().nonnegative().default(0),
  promoCode: z.string().nullable().optional(),
  shippingCents: z.number().int().nonnegative(),
  taxCents: z.number().int().nonnegative(),
  totalCents: z.number().int().nonnegative(),
  shippingTierId: z.string().min(1),
  shippingAddress: ShippingAddressSchema.or(z.record(z.string(), z.unknown())),
  stripePaymentIntentId: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  items: z.array(orderItemSchema).default([]),
});

/**
 * -----------------------------------------------------------------------------
 * Fulfillment & Refund Mutation Schemas
 * -----------------------------------------------------------------------------
 */
export const fulfillOrderResultSchema = z.object({
  success: z.boolean(),
  alreadyProcessed: z.boolean(),
  error: z.string().optional(),
});

export const refundOrderInputSchema = z.object({
  orderId: z.string().uuid("Invalid order ID"),
  reason: z.string().max(256).optional(),
  stripeRefundId: z.string().optional(),
});

export const refundOrderResultSchema = z.object({
  success: z.boolean(),
  alreadyProcessed: z.boolean(),
  restockedItemsCount: z.number().int().nonnegative().optional(),
  error: z.string().optional(),
});
