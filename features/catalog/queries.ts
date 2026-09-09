import { cache } from "react";
import { db } from "@/lib/db/client";
import { products, productVariants } from "@/lib/db/schema";
import { eq, ne, and, or, ilike, gte, lte, sql, desc, asc, inArray } from "drizzle-orm";
import {
  ProductFilter,
  ProductFilterSchema,
  ProductWithVariants,
  ProductWithVariantsSchema,
} from "./schemas";
import { CACHE_TAGS, safeCacheTag, safeCacheLife } from "@/lib/cache";

/**
 * Escape wildcard characters in user-provided search strings for ILIKE queries.
 */
function escapeLike(str: string): string {
  return str.replace(/[%_\\]/g, "\\$&");
}

/**
 * Fetch a list of products with their variants based on filters and sorting.
 *
 * NOTE: Per ADR 002, the 'query' free-text search is temporary in v1 backed by
 * Postgres ILIKE and will be swapped for a dedicated Algolia search index in a later phase.
 * Do not add pg_trgm indexes or database-specific search optimizations here.
 */
export async function getProducts(rawFilters?: ProductFilter): Promise<ProductWithVariants[]> {
  "use cache";
  safeCacheTag(CACHE_TAGS.catalog);
  safeCacheLife("hours");

  const filters = ProductFilterSchema.parse(rawFilters ?? {});

  // 1. Build product-level WHERE conditions
  const productConditions = [];

  // Free-text search across title, referenceCode, and description (ADR 002, temporary ILIKE)
  if (filters.query) {
    const searchPattern = `%${escapeLike(filters.query)}%`;
    productConditions.push(
      or(
        ilike(products.title, searchPattern),
        ilike(products.referenceCode, searchPattern),
        ilike(products.description, searchPattern)
      )
    );
  }

  // Exact-match specification filters
  if (filters.caseDiameter) {
    productConditions.push(eq(products.caseDiameter, filters.caseDiameter));
  }

  if (filters.movement) {
    productConditions.push(
      or(
        eq(products.movement, filters.movement),
        ilike(products.movement, `%${escapeLike(filters.movement)}%`)
      )
    );
  }

  // 2. Build variant-level subquery conditions if variant filters are present
  const hasVariantFilters = Boolean(
    filters.dialColor ||
    filters.strapMaterial ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined
  );

  if (hasVariantFilters) {
    const variantConditions = [];

    if (filters.dialColor) {
      variantConditions.push(eq(productVariants.dialColor, filters.dialColor));
    }
    if (filters.strapMaterial) {
      variantConditions.push(eq(productVariants.strapMaterial, filters.strapMaterial));
    }
    if (filters.minPrice !== undefined) {
      variantConditions.push(gte(productVariants.priceCents, filters.minPrice));
    }
    if (filters.maxPrice !== undefined) {
      variantConditions.push(lte(productVariants.priceCents, filters.maxPrice));
    }

    const matchingProductIds = db
      .selectDistinct({ productId: productVariants.productId })
      .from(productVariants)
      .where(and(...variantConditions));

    productConditions.push(inArray(products.id, matchingProductIds));
  }

  const whereClause = productConditions.length > 0 ? and(...productConditions) : undefined;

  // 3. Determine sorting
  let orderByClause;
  switch (filters.sort) {
    case "price_asc":
      // Sort by the lowest price among variants
      orderByClause = [
        asc(
          sql`(SELECT MIN(pv.price_cents) FROM product_variants pv WHERE pv.product_id = ${products.id})`
        ),
      ];
      break;
    case "price_desc":
      // Sort by the highest price among variants
      orderByClause = [
        desc(
          sql`(SELECT MAX(pv.price_cents) FROM product_variants pv WHERE pv.product_id = ${products.id})`
        ),
      ];
      break;
    case "newest":
      orderByClause = [desc(products.createdAt)];
      break;
    case "featured":
    default:
      orderByClause = [desc(products.featured), desc(products.createdAt)];
      break;
  }

  // 4. Query products with relations
  const results = await db.query.products.findMany({
    where: whereClause,
    orderBy: orderByClause,
    limit: filters.limit,
    offset: filters.offset,
    with: {
      variants: {
        orderBy: [asc(productVariants.priceCents)],
      },
    },
  });

  // Validate and return typed models
  return zValidateProducts(results);
}

/**
 * Fetch a single product by its unique slug, including all variants.
 */
export const getProductBySlug = cache(
  async (slug: string): Promise<ProductWithVariants | null> => {
    "use cache";
    safeCacheTag(CACHE_TAGS.catalog, CACHE_TAGS.product(slug));
    safeCacheLife("hours");

    const result = await db.query.products.findFirst({
      where: eq(products.slug, slug),
      with: {
        variants: {
          orderBy: [asc(productVariants.priceCents)],
        },
      },
    });

    if (!result) {
      return null;
    }

    const parsed = ProductWithVariantsSchema.safeParse(result);
    if (!parsed.success) {
      console.error("Failed to parse product schema for slug:", slug, parsed.error);
      throw new Error(`Data integrity error: product '${slug}' failed schema validation.`);
    }

    return parsed.data;
  }
);

/**
 * Fetch related products for a given product ID.
 * Heuristic: matches on movement or case diameter first, falling back to other products.
 */
export const getRelatedProducts = cache(
  async (productId: string, limit: number = 4): Promise<ProductWithVariants[]> => {
    "use cache";
    safeCacheTag(CACHE_TAGS.catalog, CACHE_TAGS.related(productId));
    safeCacheLife("hours");

    const sourceProduct = await db.query.products.findFirst({
      where: eq(products.id, productId),
    });

    if (!sourceProduct) {
      return [];
    }

    // Find products matching either movement or case diameter (excluding self)
    const similarProducts = await db.query.products.findMany({
      where: and(
        ne(products.id, productId),
        or(
          sourceProduct.movement ? eq(products.movement, sourceProduct.movement) : undefined,
          sourceProduct.caseDiameter ? eq(products.caseDiameter, sourceProduct.caseDiameter) : undefined
        )
      ),
      limit,
      with: {
        variants: {
          orderBy: [asc(productVariants.priceCents)],
        },
      },
    });

    if (similarProducts.length >= limit) {
      return zValidateProducts(similarProducts.slice(0, limit));
    }

    // If not enough, fill with other products
    const existingIds = [productId, ...similarProducts.map((p) => p.id)];
    const remainingLimit = limit - similarProducts.length;

    const fallbackProducts = await db.query.products.findMany({
      where: notInArray(products.id, existingIds),
      limit: remainingLimit,
      with: {
        variants: {
          orderBy: [asc(productVariants.priceCents)],
        },
      },
    });

    return zValidateProducts([...similarProducts, ...fallbackProducts]);
  }
);

// ============================================================================
// Internal Helpers
// ============================================================================

function zValidateProducts(data: unknown[]): ProductWithVariants[] {
  return data.map((item) => {
    const parsed = ProductWithVariantsSchema.safeParse(item);
    if (!parsed.success) {
      console.error("Data integrity error: product failed schema validation", parsed.error);
      throw new Error("Data integrity error: product failed schema validation.");
    }
    return parsed.data;
  });
}

function notInArray(column: typeof products.id, values: string[]) {
  if (values.length === 0) return undefined;
  return sql`${column} NOT IN ${values}`;
}
