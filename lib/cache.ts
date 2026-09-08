import { cacheTag as nextCacheTag, cacheLife as nextCacheLife, revalidateTag } from "next/cache";

/**
 * Standardized cache tags for Northwatch domain entities.
 */
export const CACHE_TAGS = {
  catalog: "catalog",
  product: (slug: string) => `product:${slug}`,
  related: (id: string) => `related:${id}`,
} as const;

export type CacheProfile = "default" | "seconds" | "minutes" | "hours" | "days" | "weeks" | "max";

/**
 * Safe wrapper around Next.js cacheTag() that gracefully no-ops outside
 * the Next.js runtime (e.g. during Vitest or standalone scripts).
 */
export function safeCacheTag(...tags: string[]): void {
  try {
    nextCacheTag(...tags);
  } catch {
    // Outside of Next.js cacheComponents context, safely no-op
  }
}

/**
 * Safe wrapper around Next.js cacheLife() that gracefully no-ops outside
 * the Next.js runtime.
 */
export function safeCacheLife(profile: CacheProfile): void {
  try {
    nextCacheLife(profile as "hours");
  } catch {
    // Outside of Next.js cacheComponents context, safely no-op
  }
}

/**
 * Revalidates all cached catalog queries.
 * In Next.js 16, revalidateTag accepts (tag, profile), defaulting to 'max'.
 */
export async function revalidateCatalog(profile: string = "max"): Promise<void> {
  try {
    revalidateTag(CACHE_TAGS.catalog, profile);
  } catch {
    // Outside of Next.js runtime, safely no-op
  }
}

/**
 * Revalidates a specific product's cached detail page and variants.
 */
export async function revalidateProduct(slug: string, profile: string = "max"): Promise<void> {
  try {
    revalidateTag(CACHE_TAGS.product(slug), profile);
  } catch {
    // Outside of Next.js runtime, safely no-op
  }
}
