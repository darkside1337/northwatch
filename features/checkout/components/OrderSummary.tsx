"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, ShieldCheck, Clock, Award } from "lucide-react";
import { formatPrice } from "@/config/site";
import type { CartItem } from "@/features/cart/schemas";

interface OrderSummaryProps {
  items: CartItem[];
  subtotalCents: number;
  discountCents: number;
  promoCode?: string | null;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  shippingTierName?: string;
}

export function OrderSummary({
  items,
  subtotalCents,
  discountCents,
  promoCode,
  shippingCents,
  taxCents,
  totalCents,
  shippingTierName = "Insured Courier",
}: OrderSummaryProps) {
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <aside className="w-full lg:sticky lg:top-24 space-y-6">
      {/* Mobile Collapsible Header Bar */}
      <div className="lg:hidden w-full border border-outline-variant/60 bg-surface-container-lowest p-4">
        <button
          type="button"
          onClick={() => setIsMobileExpanded(!isMobileExpanded)}
          className="w-full flex items-center justify-between text-left"
          aria-expanded={isMobileExpanded}
        >
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-foreground font-medium">
            <span>Order Summary ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isMobileExpanded ? "rotate-180" : ""
              }`}
            />
          </div>
          <span className="font-mono text-sm font-semibold text-foreground">
            {formatPrice(totalCents)}
          </span>
        </button>

        {/* Collapsible Mobile Content */}
        {isMobileExpanded && (
          <div className="pt-4 mt-4 border-t border-outline-variant/40 space-y-4">
            <LineItemsList items={items} />
            <FinancialLedger
              subtotalCents={subtotalCents}
              discountCents={discountCents}
              promoCode={promoCode}
              shippingCents={shippingCents}
              taxCents={taxCents}
              totalCents={totalCents}
              shippingTierName={shippingTierName}
            />
          </div>
        )}
      </div>

      {/* Desktop Persistent Card */}
      <div className="hidden lg:block border border-outline-variant/60 bg-surface-container-lowest p-6 sm:p-8 space-y-6">
        <div className="flex items-baseline justify-between border-b border-outline-variant/40 pb-4">
          <h2 className="font-serif text-xl font-normal tracking-tight text-foreground">
            Acquisition Summary
          </h2>
          <span className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
            {itemCount} {itemCount === 1 ? "Timepiece" : "Timepieces"}
          </span>
        </div>

        {/* Line Items List */}
        <LineItemsList items={items} />

        {/* Financial Calculation Ledger */}
        <FinancialLedger
          subtotalCents={subtotalCents}
          discountCents={discountCents}
          promoCode={promoCode}
          shippingCents={shippingCents}
          taxCents={taxCents}
          totalCents={totalCents}
          shippingTierName={shippingTierName}
        />

        {/* Horology Guarantees & Badges */}
        <div className="pt-4 border-t border-outline-variant/40 space-y-3 font-mono text-[11px] text-on-surface-variant">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-secondary shrink-0" />
            <span>Fully insured armored courier transit</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-secondary shrink-0" />
            <span>30-day inspection & return guarantee</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Award className="w-4 h-4 text-secondary shrink-0" />
            <span>5-year international atelier warranty</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function LineItemsList({ items }: { items: CartItem[] }) {
  if (items.length === 0) {
    return (
      <div className="py-4 text-center font-mono text-xs text-on-surface-variant">
        Your acquisition bag is currently empty.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-outline-variant/30 max-h-[320px] overflow-y-auto pr-1">
      {items.map((item) => (
        <li key={item.variantId} className="py-3.5 first:pt-0 last:pb-0 flex items-center gap-4">
          {/* Thumbnail */}
          <div className="relative w-14 h-14 bg-surface-container shrink-0 border border-outline-variant/40 overflow-hidden">
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover"
              sizes="56px"
            />
            {item.quantity > 1 && (
              <span className="absolute bottom-0 right-0 bg-foreground text-background text-[10px] font-mono px-1 font-semibold leading-tight">
                ×{item.quantity}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-sm font-medium text-foreground truncate">
              {item.title}
            </h3>
            <p className="text-xs font-mono text-on-surface-variant truncate">
              {item.variantName} {item.caseDiameter ? `• ${item.caseDiameter}` : ""}
            </p>
            <p className="text-[11px] font-mono text-on-surface-variant/70">
              Ref: {item.sku}
            </p>
          </div>

          {/* Price */}
          <div className="text-right font-mono text-xs font-medium text-foreground shrink-0">
            {formatPrice(item.priceCents * item.quantity)}
          </div>
        </li>
      ))}
    </ul>
  );
}

function FinancialLedger({
  subtotalCents,
  discountCents,
  promoCode,
  shippingCents,
  taxCents,
  totalCents,
  shippingTierName,
}: {
  subtotalCents: number;
  discountCents: number;
  promoCode?: string | null;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  shippingTierName: string;
}) {
  return (
    <div className="space-y-2.5 font-mono text-xs border-t border-outline-variant/40 pt-4">
      {/* Subtotal */}
      <div className="flex items-center justify-between text-on-surface-variant">
        <span>Subtotal</span>
        <span className="text-foreground">{formatPrice(subtotalCents)}</span>
      </div>

      {/* Promotional Discount */}
      {discountCents > 0 && (
        <div className="flex items-center justify-between text-secondary">
          <span className="flex items-center gap-1.5">
            <span>Promotion</span>
            {promoCode && (
              <span className="px-1.5 py-0.2 bg-secondary/10 border border-secondary/30 text-[10px] uppercase tracking-wider">
                {promoCode}
              </span>
            )}
          </span>
          <span>-{formatPrice(discountCents)}</span>
        </div>
      )}

      {/* Shipping */}
      <div className="flex items-center justify-between text-on-surface-variant">
        <span>Shipping ({shippingTierName})</span>
        {shippingCents === 0 ? (
          <span className="text-secondary font-medium uppercase tracking-wider text-[11px]">
            Complimentary
          </span>
        ) : (
          <span className="text-foreground">{formatPrice(shippingCents)}</span>
        )}
      </div>

      {/* Estimated Tax */}
      <div className="flex items-center justify-between text-on-surface-variant">
        <span>Estimated Sales Tax</span>
        <span className="text-foreground">
          {taxCents === 0 ? "$0.00" : formatPrice(taxCents)}
        </span>
      </div>

      {/* Grand Total */}
      <div className="flex items-center justify-between pt-3 border-t border-outline-variant/60 font-medium">
        <span className="text-foreground text-sm uppercase tracking-wider">Total</span>
        <span className="text-foreground text-base font-semibold">
          {formatPrice(totalCents)} USD
        </span>
      </div>
    </div>
  );
}
