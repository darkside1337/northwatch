import { describe, it, expect } from "vitest";
import { getProductBySlug, getProducts, getRelatedProducts } from "../queries";

describe("Catalog Data Layer Integration (Neon Postgres)", { timeout: 15000 }, () => {

  it("round-trips getProductBySlug with eager variant relations", async () => {
    const product = await getProductBySlug("field-automatic");

    expect(product).not.toBeNull();
    expect(product?.title).toBe("The Field Automatic");
    expect(product?.referenceCode).toBe("NW-01-FLD");
    expect(product?.caseDiameter).toBe("38mm");
    expect(product?.variants).toBeDefined();
    expect(product?.variants.length).toBeGreaterThanOrEqual(2);

    const firstVariant = product?.variants[0];
    expect(firstVariant?.sku).toContain("NW-01-FLD");
    expect(firstVariant?.priceCents).toBeGreaterThan(0);
    expect(firstVariant?.stock).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(firstVariant?.images)).toBe(true);
  });

  it("returns null for non-existent product slug", async () => {
    const product = await getProductBySlug("non-existent-watch-sku-12345");
    expect(product).toBeNull();
  });

  it("executes v1 ILIKE search query (ADR 002)", async () => {
    const results = await getProducts({ query: "monopusher" });

    expect(results.length).toBeGreaterThanOrEqual(1);
    const chrono = results.find((p) => p.referenceCode === "NW-02-CHR");
    expect(chrono).toBeDefined();
    expect(chrono?.title).toBe("The Monopusher Chronograph");
  });

  it("filters by variant attributes (dialColor)", async () => {
    const results = await getProducts({ dialColor: "Arctic White" });

    expect(results.length).toBeGreaterThanOrEqual(1);
    const hasArcticWhite = results.some((p) =>
      p.variants.some((v) => v.dialColor === "Arctic White")
    );
    expect(hasArcticWhite).toBe(true);
  });

  it("sorts by price ascending", async () => {
    const results = await getProducts({ sort: "price_asc", limit: 5 });

    expect(results.length).toBeGreaterThanOrEqual(2);
    // Verify each subsequent product's min price is >= preceding product's min price
    for (let i = 0; i < results.length - 1; i++) {
      const currentMinPrice = Math.min(...results[i].variants.map((v) => v.priceCents));
      const nextMinPrice = Math.min(...results[i + 1].variants.map((v) => v.priceCents));
      expect(currentMinPrice).toBeLessThanOrEqual(nextMinPrice);
    }
  });

  it("recommends related products excluding current product", async () => {
    const source = await getProductBySlug("field-automatic");
    expect(source).not.toBeNull();

    if (source) {
      const related = await getRelatedProducts(source.id, 2);
      expect(related.length).toBeLessThanOrEqual(2);
      expect(related.every((p) => p.id !== source.id)).toBe(true);
    }
  });
});
