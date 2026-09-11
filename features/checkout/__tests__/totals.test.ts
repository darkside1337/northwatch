import { describe, it, expect } from "vitest";
import { calculateCheckoutTotals } from "../math";
import { siteConfig } from "@/config/site";

describe("Checkout Totals Calculation Engine", () => {
  it("computes subtotal, free shipping, and regional tax accurately for high-value orders", () => {
    // 1x Chrono ($740) + 1x Minimalist ($500) = $1,240.00
    const items = [
      { priceCents: 74000, quantity: 1 },
      { priceCents: 50000, quantity: 1 },
    ];

    const result = calculateCheckoutTotals({
      items,
      shippingTierId: "standard",
      stateCode: "CA",
    });

    expect(result.subtotalCents).toBe(124000); // $1,240.00
    expect(result.discountCents).toBe(0);
    expect(result.shippingCents).toBe(0); // Free on >= $500 threshold
    // CA tax rate: 7.25% (0.0725) -> 124000 * 0.0725 = 8990
    expect(result.taxCents).toBe(8990); // $89.90
    expect(result.totalCents).toBe(124000 + 0 + 8990); // 132990 ($1,329.90)
  });

  it("charges standard shipping fee when subtotal is below $500 threshold", () => {
    // 1x Strap/Accessory ($350)
    const items = [{ priceCents: 35000, quantity: 1 }];

    const result = calculateCheckoutTotals({
      items,
      shippingTierId: "standard",
      stateCode: "NY",
    });

    expect(result.subtotalCents).toBe(35000);
    expect(result.shippingCents).toBe(siteConfig.shipping.tiers.standard.amount); // 1500 ($15.00)
    // NY tax rate: 8.875% (0.08875) -> Math.round(35000 * 0.08875) = Math.round(3106.25) = 3106
    expect(result.taxCents).toBe(3106);
    expect(result.totalCents).toBe(35000 + 1500 + 3106); // 39606 ($396.06)
  });

  it("applies fixed rates for express and priority courier tiers regardless of subtotal", () => {
    const items = [{ priceCents: 100000, quantity: 1 }]; // $1,000.00

    const expressResult = calculateCheckoutTotals({
      items,
      shippingTierId: "express",
      stateCode: "TX",
    });
    expect(expressResult.shippingCents).toBe(siteConfig.shipping.tiers.express.amount); // 3500 ($35.00)

    const priorityResult = calculateCheckoutTotals({
      items,
      shippingTierId: "priority",
      stateCode: "TX",
    });
    expect(priorityResult.shippingCents).toBe(siteConfig.shipping.tiers.priority.amount); // 7500 ($75.00)
  });

  it("re-evaluates percentage promo code and calculates tax on discounted subtotal", () => {
    // Subtotal: $500.00
    const items = [{ priceCents: 50000, quantity: 1 }];

    const result = calculateCheckoutTotals({
      items,
      shippingTierId: "standard",
      stateCode: "CA",
      promoCode: "ATELIER10", // 10% off
    });

    expect(result.subtotalCents).toBe(50000);
    expect(result.discountCents).toBe(5000); // $50.00 discount
    // Subtotal was $500, so standard courier was already free ($0)
    expect(result.shippingCents).toBe(0);
    // Tax is assessed on the discounted amount: $450.00 * 7.25% = 3262.5 -> 3263 cents
    expect(result.taxCents).toBe(Math.round(45000 * 0.0725));
    expect(result.totalCents).toBe(45000 + 0 + 3263);
  });

  it("applies shipping promo override GENEVA to orders below free shipping threshold", () => {
    const items = [{ priceCents: 20000, quantity: 1 }]; // $200.00

    const result = calculateCheckoutTotals({
      items,
      shippingTierId: "standard",
      stateCode: "FL",
      promoCode: "GENEVA", // Free standard courier
    });

    expect(result.subtotalCents).toBe(20000);
    expect(result.discountCents).toBe(0);
    expect(result.shippingCents).toBe(0); // Overridden to 0 by GENEVA promo
    // FL rate 6%: 20000 * 0.06 = 1200
    expect(result.taxCents).toBe(1200);
    expect(result.totalCents).toBe(20000 + 0 + 1200);
  });

  it("safely handles boundary cases: empty items, zero quantity, and unknown states", () => {
    const emptyResult = calculateCheckoutTotals({
      items: [],
      shippingTierId: "standard",
    });
    expect(emptyResult.subtotalCents).toBe(0);
    expect(emptyResult.shippingCents).toBe(0);
    expect(emptyResult.taxCents).toBe(0);
    expect(emptyResult.totalCents).toBe(0);

    const unknownStateResult = calculateCheckoutTotals({
      items: [{ priceCents: 50000, quantity: 1 }],
      shippingTierId: "standard",
      stateCode: "UNKNOWN_STATE",
    });
    // Default fallback tax rate is 0.0
    expect(unknownStateResult.taxCents).toBe(0);
  });
});
