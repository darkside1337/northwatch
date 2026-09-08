import { describe, it, expect } from "vitest";
import {
  ProductSchema,
  ProductVariantSchema,
  ProductWithVariantsSchema,
  ProductFilterSchema,
  formatPriceCents,
} from "../schemas";

describe("Catalog Schemas & Utilities", () => {
  describe("formatPriceCents", () => {
    it("formats standard amounts in USD", () => {
      expect(formatPriceCents(38000)).toBe("$380.00");
      expect(formatPriceCents(125050)).toBe("$1,250.50");
      expect(formatPriceCents(0)).toBe("$0.00");
    });
  });

  describe("ProductVariantSchema", () => {
    const validVariant = {
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      productId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
      sku: "NW-01-FLD-BLK",
      name: "Matte Black / Olive Canvas",
      dialColor: "Matte Black",
      strapMaterial: "Olive Canvas",
      caseFinish: "Brushed 316L Steel",
      priceCents: 38000,
      stock: 10,
      images: ["https://example.com/watch.jpg"],
    };

    it("accepts valid variant attributes", () => {
      const result = ProductVariantSchema.safeParse(validVariant);
      expect(result.success).toBe(true);
    });

    it("rejects negative prices", () => {
      const result = ProductVariantSchema.safeParse({
        ...validVariant,
        priceCents: -500,
      });
      expect(result.success).toBe(false);
    });

    it("rejects negative stock", () => {
      const result = ProductVariantSchema.safeParse({
        ...validVariant,
        stock: -1,
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid image URLs", () => {
      const result = ProductVariantSchema.safeParse({
        ...validVariant,
        images: ["not-a-url"],
      });
      expect(result.success).toBe(false);
    });
  });

  describe("ProductSchema", () => {
    const validProduct = {
      id: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
      title: "The Field Automatic",
      slug: "field-automatic",
      referenceCode: "NW-01-FLD",
      description: "A minimalist field watch.",
      caseDiameter: "38mm",
      movement: "Automatic 4Hz",
      waterResistance: "100m",
      editorialQuote: "Purity in form.",
      quoteAuthor: "Horological Digest",
      featured: true,
    };

    it("accepts valid product attributes", () => {
      const result = ProductSchema.safeParse(validProduct);
      expect(result.success).toBe(true);
    });

    it("rejects non-kebab-case slugs", () => {
      const result = ProductSchema.safeParse({
        ...validProduct,
        slug: "Field Automatic_Watch!",
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing reference codes", () => {
      const result = ProductSchema.safeParse({
        ...validProduct,
        referenceCode: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("ProductWithVariantsSchema", () => {
    it("validates a product with nested variants", () => {
      const result = ProductWithVariantsSchema.safeParse({
        id: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
        title: "The Field Automatic",
        slug: "field-automatic",
        referenceCode: "NW-01-FLD",
        description: "A minimalist field watch.",
        caseDiameter: "38mm",
        movement: "Automatic 4Hz",
        waterResistance: "100m",
        editorialQuote: "Purity in form.",
        quoteAuthor: "Horological Digest",
        featured: true,
        variants: [
          {
            id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            productId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
            sku: "NW-01-FLD-BLK",
            name: "Matte Black / Olive Canvas",
            dialColor: "Matte Black",
            strapMaterial: "Olive Canvas",
            caseFinish: "Brushed 316L Steel",
            priceCents: 38000,
            stock: 10,
            images: ["https://example.com/watch.jpg"],
          },
        ],
      });
      expect(result.success).toBe(true);
    });
  });

  describe("ProductFilterSchema", () => {
    it("applies sensible defaults for empty filter objects", () => {
      const result = ProductFilterSchema.parse({});
      expect(result.sort).toBe("featured");
      expect(result.limit).toBe(24);
      expect(result.offset).toBe(0);
    });

    it("coerces numeric limits, offsets, and prices", () => {
      const result = ProductFilterSchema.parse({
        limit: "12",
        offset: "24",
        minPrice: "30000",
        maxPrice: "70000",
      });
      expect(result.limit).toBe(12);
      expect(result.offset).toBe(24);
      expect(result.minPrice).toBe(30000);
      expect(result.maxPrice).toBe(70000);
    });

    it("rejects limits exceeding 100", () => {
      const result = ProductFilterSchema.safeParse({
        limit: 150,
      });
      expect(result.success).toBe(false);
    });

    it("rejects unknown sort options", () => {
      const result = ProductFilterSchema.safeParse({
        sort: "cheapest_first",
      });
      expect(result.success).toBe(false);
    });
  });
});
