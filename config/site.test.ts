import { describe, it, expect } from "vitest";
import {
  siteConfig,
  formatPrice,
  calculateShipping,
  calculateTax,
  SHIPPING_TIER_IDS,
} from "./site";

describe("siteConfig", () => {
  it("defines standard, express, and priority shipping tier IDs", () => {
    expect(SHIPPING_TIER_IDS).toEqual(["standard", "express", "priority"]);
  });

  it("has valid metadata and currency configuration", () => {
    expect(siteConfig.name).toBe("Northwatch");
    expect(siteConfig.currency.code).toBe("USD");
    expect(siteConfig.currency.symbol).toBe("$");
  });
});

describe("formatPrice", () => {
  it("formats integer cents to standard USD currency string", () => {
    expect(formatPrice(74000)).toBe("$740.00");
    expect(formatPrice(1500)).toBe("$15.00");
    expect(formatPrice(0)).toBe("$0.00");
  });

  it("handles large amounts with commas", () => {
    expect(formatPrice(148000)).toBe("$1,480.00");
  });
});

describe("calculateShipping", () => {
  it("grants free standard shipping at exactly the $500 threshold (inclusive)", () => {
    expect(calculateShipping("standard", 50000)).toBe(0);
  });

  it("grants free standard shipping above the $500 threshold", () => {
    expect(calculateShipping("standard", 74000)).toBe(0);
  });

  it("charges standard shipping fee 1 cent below threshold ($499.99)", () => {
    expect(calculateShipping("standard", 49999)).toBe(1500);
  });

  it("always charges fee for express tier even above threshold", () => {
    expect(calculateShipping("express", 100000)).toBe(3500);
  });

  it("always charges fee for priority vault delivery tier", () => {
    expect(calculateShipping("priority", 200000)).toBe(7500);
  });
});

describe("calculateTax", () => {
  it("calculates CA tax with explicit round-half-up integer cent rounding", () => {
    // 5125 cents * 0.0725 = 371.5625 -> rounds to 372
    expect(calculateTax(5125, "CA")).toBe(372);
  });

  it("calculates NY tax correctly", () => {
    // 10000 cents ($100.00) * 0.08875 = 887.5 -> rounds to 888
    expect(calculateTax(10000, "NY")).toBe(888);
  });

  it("falls back cleanly to 0 tax for unknown region codes without NaN", () => {
    expect(calculateTax(10000, "XX")).toBe(0);
    expect(calculateTax(10000, "")).toBe(0);
    expect(calculateTax(10000, undefined)).toBe(0);
  });

  it("is case-insensitive for region codes", () => {
    expect(calculateTax(10000, "ca")).toBe(calculateTax(10000, "CA"));
  });
});
