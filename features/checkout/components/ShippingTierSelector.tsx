"use client";

import { siteConfig, type ShippingTierId, formatPrice } from "@/config/site";

interface ShippingTierSelectorProps {
  selectedTier: ShippingTierId;
  onSelectTier: (tierId: ShippingTierId) => void;
  subtotalCents: number;
}

const TIER_KEYS: ShippingTierId[] = ["standard", "express", "priority"];

export function ShippingTierSelector({
  selectedTier,
  onSelectTier,
  subtotalCents,
}: ShippingTierSelectorProps) {
  return (
    <div className="space-y-4 pt-4 border-t border-outline-variant/40">
      <div className="flex items-baseline justify-between">
        <h2 className="font-serif text-xl sm:text-2xl font-normal tracking-tight text-foreground">
          2. Insured Transit Method
        </h2>
        <span className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
          Armored Signature Delivery
        </span>
      </div>

      <div className="space-y-3">
        {TIER_KEYS.map((tierId) => {
          const tier = siteConfig.shipping.tiers[tierId];
          const isSelected = selectedTier === tierId;
          const isFree =
            tier.freeThreshold !== null &&
            tier.freeThreshold !== undefined &&
            subtotalCents >= tier.freeThreshold;

          return (
            <label
              key={tierId}
              className={`flex items-start justify-between p-4 border rounded-none cursor-pointer transition-colors ${
                isSelected
                  ? "border-foreground bg-surface-container-lowest"
                  : "border-outline-variant/60 bg-surface-container-lowest/50 hover:border-outline"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="shippingTier"
                  value={tierId}
                  checked={isSelected}
                  onChange={() => onSelectTier(tierId)}
                  className="mt-1 accent-foreground"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {tier.name}
                    </span>
                    {isFree && (
                      <span className="px-1.5 py-0.2 bg-secondary/15 text-secondary border border-secondary/30 text-[10px] font-mono uppercase tracking-wider">
                        Complimentary
                      </span>
                    )}
                    {tierId === "priority" && (
                      <span className="px-1.5 py-0.2 bg-surface border border-outline-variant text-[10px] font-mono text-on-surface-variant uppercase tracking-wider">
                        Armored Escrow
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {tier.description} ({tier.estimatedDays})
                  </p>
                </div>
              </div>
              <div className="font-mono text-xs font-semibold text-foreground pl-4 shrink-0">
                {isFree ? "FREE" : formatPrice(tier.amount)}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
