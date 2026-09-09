import { z } from "zod";

// ============================================================================
// Core Domain Schemas
// ============================================================================

export const ProductVariantSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Variant name is required"),
  dialColor: z.string().nullable().optional(),
  strapMaterial: z.string().nullable().optional(),
  caseFinish: z.string().nullable().optional(),
  priceCents: z.number().int().nonnegative("Price must be a non-negative integer in cents"),
  stock: z.number().int().nonnegative("Stock count cannot be negative"),
  images: z
    .array(
      z.string().refine(
        (val) => val.startsWith("/") || z.string().url().safeParse(val).success,
        { message: "Image must be a valid URL or path starting with /" }
      )
    )
    .default([]),
  createdAt: z.date().or(z.string().datetime({ offset: true })).optional(),
  updatedAt: z.date().or(z.string().datetime({ offset: true })).optional(),
});

export const ProductSpecsSchema = z.object({
  movement: z
    .object({
      calibre: z.string().optional(),
      frequency: z.string().optional(),
      jewels: z.string().optional(),
      powerReserve: z.string().optional(),
      origin: z.string().optional(),
    })
    .optional(),
  caseArchitecture: z
    .object({
      material: z.string().optional(),
      finish: z.string().optional(),
      construction: z.string().optional(),
      bezel: z.string().optional(),
    })
    .optional(),
  dimensions: z
    .object({
      diameter: z.string().optional(),
      height: z.string().optional(),
      lugToLug: z.string().optional(),
      lugWidth: z.string().optional(),
    })
    .optional(),
  crystalOptics: z
    .object({
      crystal: z.string().optional(),
      coating: z.string().optional(),
      caseback: z.string().optional(),
    })
    .optional(),
  waterResistance: z
    .object({
      depth: z.string().optional(),
      crown: z.string().optional(),
      gaskets: z.string().optional(),
    })
    .optional(),
  leatherwork: z
    .object({
      strap: z.string().optional(),
      origin: z.string().optional(),
      buckle: z.string().optional(),
    })
    .optional(),
  tolerance: z.string().optional(),
  edition: z.string().optional(),
});

export type ProductSpecs = z.infer<typeof ProductSpecsSchema>;

export const ProductSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be kebab-case"),
  description: z.string().nullable().optional(),
  referenceCode: z.string().min(1, "Reference code is required"),
  caseDiameter: z.string().nullable().optional(),
  movement: z.string().nullable().optional(),
  waterResistance: z.string().nullable().optional(),
  editorialQuote: z.string().nullable().optional(),
  quoteAuthor: z.string().nullable().optional(),
  specs: ProductSpecsSchema.nullable().optional(),
  featured: z.boolean().default(false),
  createdAt: z.date().or(z.string().datetime({ offset: true })).optional(),
  updatedAt: z.date().or(z.string().datetime({ offset: true })).optional(),
});

export const ProductWithVariantsSchema = ProductSchema.extend({
  variants: z.array(ProductVariantSchema),
});

// ============================================================================
// Query & Filter Schemas
// ============================================================================

export const ProductSortOption = z.enum(["featured", "price_asc", "price_desc", "newest"]);
export type ProductSortOption = z.infer<typeof ProductSortOption>;

export const ProductFilterSchema = z.object({
  // Note: 'query' is temporary in v1 per ADR 002 and will be replaced by Algolia in a later phase
  query: z.string().trim().optional(),
  dialColor: z.string().trim().optional(),
  strapMaterial: z.string().trim().optional(),
  caseDiameter: z.string().trim().optional(),
  movement: z.string().trim().optional(),
  minPrice: z.coerce.number().int().nonnegative().optional(),
  maxPrice: z.coerce.number().int().nonnegative().optional(),
  sort: ProductSortOption.default("featured").optional(),
  limit: z.coerce.number().int().positive().max(100).default(24).optional(),
  offset: z.coerce.number().int().nonnegative().default(0).optional(),
});

// ============================================================================
// Types
// ============================================================================

export type Product = z.infer<typeof ProductSchema>;
export type ProductVariant = z.infer<typeof ProductVariantSchema>;
export type ProductWithVariants = z.infer<typeof ProductWithVariantsSchema>;
export type ProductFilter = z.infer<typeof ProductFilterSchema>;

// ============================================================================
// Helper Utilities
// ============================================================================

/**
 * Formats an integer cent amount into a formatted currency string (e.g. 42000 -> "$420.00").
 */
export function formatPriceCents(cents: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}
