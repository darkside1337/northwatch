export const SHIPPING_TIER_IDS = ["standard", "express", "priority"] as const;
export type ShippingTierId = (typeof SHIPPING_TIER_IDS)[number];

export interface ShippingTier {
  id: ShippingTierId;
  name: string;
  description: string;
  amount: number; // in integer cents
  estimatedDays: string;
  freeThreshold: number | null; // in integer cents, or null if never free
}

export interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  url: string;
  currency: {
    code: string;
    symbol: string;
    locale: string;
  };
  shipping: {
    defaultTierId: ShippingTierId;
    tiers: Record<ShippingTierId, ShippingTier>;
  };
  tax: {
    defaultRate: number;
    regions: Record<string, number>;
  };
}

export const siteConfig: SiteConfig = {
  name: "Northwatch",
  tagline: "Minimalist Men's Horology",
  description:
    "Boutique storefront for minimalist men's watches built with Scandinavian restraint and Swiss precision.",
  url: "https://northwatch.store",
  currency: {
    code: "USD",
    symbol: "$",
    locale: "en-US",
  },
  shipping: {
    defaultTierId: "standard",
    tiers: {
      standard: {
        id: "standard",
        name: "Insured Ground Courier",
        description:
          "Secure, insured delivery via armored ground transport (3–5 business days).",
        amount: 1500, // $15.00
        estimatedDays: "3–5 business days",
        freeThreshold: 50000, // Free on orders >= $500.00
      },
      express: {
        id: "express",
        name: "Express Air Courier",
        description:
          "Expedited air transit with full transit loss insurance (2 business days).",
        amount: 3500, // $35.00
        estimatedDays: "2 business days",
        freeThreshold: null,
      },
      priority: {
        id: "priority",
        name: "Priority Vault Delivery",
        description:
          "Next-business-day armored courier with direct recipient signature and tamper-evident packaging.",
        amount: 7500, // $75.00
        estimatedDays: "1 business day",
        freeThreshold: null,
      },
    },
  },
  // V1 STUB NOTE: Flat rates by region are for local development and demonstration only.
  // Real US/EU sales tax requires automated nexus tracking, destination-based multi-tier
  // rates, and product exemptions (e.g. Stripe Tax / TaxJar) before processing live payments.
  tax: {
    defaultRate: 0.0,
    regions: {
      CA: 0.0725, // California base rate: 7.25%
      NY: 0.08875, // New York base state + local rate: 8.875%
      TX: 0.0625, // Texas state rate: 6.25%
      FL: 0.06, // Florida state rate: 6.00%
      IL: 0.0625, // Illinois state rate: 6.25%
      WA: 0.065, // Washington state rate: 6.50%
      GB: 0.2, // UK VAT: 20%
      EU: 0.2, // EU Standard VAT fallback: 20%
    },
  },
};

/**
 * Formats an amount in integer cents into a localized currency string.
 * @example formatPrice(74000) => "$740.00"
 */
export function formatPrice(cents: number, locale = siteConfig.currency.locale): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: siteConfig.currency.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

/**
 * Calculates shipping fee in integer cents based on tier and subtotal.
 * Boundary rule: Free shipping is inclusive (subtotalCents >= freeThreshold).
 */
export function calculateShipping(tierId: ShippingTierId, subtotalCents: number): number {
  const tier = siteConfig.shipping.tiers[tierId] ?? siteConfig.shipping.tiers[siteConfig.shipping.defaultTierId];
  if (tier.freeThreshold !== null && subtotalCents >= tier.freeThreshold) {
    return 0;
  }
  return tier.amount;
}

/**
 * Calculates tax in integer cents based on subtotal and 2-letter state/country code.
 * Rounding strategy: Explicit round half away from zero (Math.round) to produce integer cents.
 */
export function calculateTax(subtotalCents: number, regionCode?: string): number {
  const code = regionCode?.trim().toUpperCase();
  const rate = (code ? siteConfig.tax.regions[code] : undefined) ?? siteConfig.tax.defaultRate;
  return Math.round(subtotalCents * rate);
}
