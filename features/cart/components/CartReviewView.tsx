"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Package,
  RotateCcw,
  AlertCircle,
  Clock,
  Compass,
  X,
} from "lucide-react";
import { formatPrice, FREE_SHIPPING_THRESHOLD_CENTS } from "@/config/site";
import { useCart, useIsHydrated } from "../context";
import { LineItem } from "./LineItem";
import { PromoInput } from "./PromoInput";

export function CartReviewView() {
  const {
    items,
    removedItems,
    totals,
    promo,
    itemCount,
    isPending,
    closeCart,
  } = useCart();
  const isHydrated = useIsHydrated();
  const [dismissedVariantIds, setDismissedVariantIds] = React.useState<string[]>([]);
  const visibleRemovedItems = removedItems.filter(
    (item) => !dismissedVariantIds.includes(item.variantId)
  );

  // Ensure drawer is closed while viewing full cart page
  React.useEffect(() => {
    closeCart();
  }, [closeCart]);

  // Zero-layout-shift hydration skeleton
  if (!isHydrated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 animate-pulse">
        <div className="h-4 w-36 bg-surface-container-low mb-6" />
        <div className="h-10 w-80 bg-surface-container-low mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-7 space-y-6">
            <div className="h-40 bg-surface-container-lowest border border-outline" />
            <div className="h-40 bg-surface-container-lowest border border-outline" />
          </div>
          <div className="lg:col-span-5">
            <div className="h-80 bg-surface-container-lowest border border-outline p-6" />
          </div>
        </div>
      </div>
    );
  }

  // High-luxury minimalist empty state
  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <div className="max-w-md mx-auto flex flex-col items-center">
          {/* Horological reticle mark */}
          <div className="w-16 h-16 border border-outline flex items-center justify-center mb-6 text-on-surface-variant bg-surface-container-lowest">
            <Compass className="w-8 h-8 stroke-[1.2]" />
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl text-on-surface uppercase tracking-[0.04em] mb-3">
            Your Selection is Empty
          </h1>

          <p className="text-sm text-on-surface-variant leading-relaxed mb-8">
            You have not added any horological references to your bag. Explore
            our permanent collection of Swiss-assembled field, dive, and dress
            instruments.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-on-surface text-white text-xs uppercase tracking-[0.16em] font-medium hover:bg-[#2A2A28] active:scale-[0.99] transition-all"
            >
              Explore the Collection
            </Link>
          </div>

          {/* Curated Collection Shortcuts */}
          <div className="mt-14 pt-8 border-t border-outline w-full text-left">
            <p className="text-[11px] font-mono text-on-surface-variant uppercase tracking-[0.14em] mb-4">
              Permanent Horological Series:
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <Link
                href="/products"
                className="p-3 border border-outline bg-surface-container-lowest hover:border-on-surface transition-colors block"
              >
                <span className="font-serif text-sm block mb-1">Field Automatic</span>
                <span className="font-mono text-[10px] text-on-surface-variant uppercase">
                  38mm · 10 ATM
                </span>
              </Link>
              <Link
                href="/products"
                className="p-3 border border-outline bg-surface-container-lowest hover:border-on-surface transition-colors block"
              >
                <span className="font-serif text-sm block mb-1">Monopusher Chrono</span>
                <span className="font-mono text-[10px] text-on-surface-variant uppercase">
                  40mm · Bi-Compax
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isFreeShipping =
    totals.shippingEstimateCents === 0 || promo?.freeShipping;
  const progressPercent = Math.min(
    100,
    Math.round((totals.subtotalCents / FREE_SHIPPING_THRESHOLD_CENTS) * 100)
  );
  const remainingForFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD_CENTS - totals.subtotalCents
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-28 lg:pb-12">
      {/* 1. Breadcrumb / Back Link */}
      <nav className="mb-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.14em] text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span>←</span>
          <span>Continue Exploring Catalog</span>
        </Link>
      </nav>

      {/* 2. Page Header */}
      <header className="border-b border-outline pb-6 mb-8 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <h1 className="font-serif text-3xl sm:text-4xl text-on-surface uppercase tracking-[0.03em]">
          Your Horological Selection
        </h1>
        <span className="font-mono text-xs text-on-surface-variant uppercase tracking-wider tabular-nums">
          [{itemCount} {itemCount === 1 ? "Reference" : "References"} Selected]
        </span>
      </header>

      {/* 3. 60/40 Split Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* LEFT COLUMN (60% on desktop) */}
        <section className="lg:col-span-7 space-y-6" aria-label="Cart Items">
          {/* Inventory Updates / Retired Items Alert */}
          {visibleRemovedItems.length > 0 && (
            <div className="p-4 bg-surface-container-low border border-outline space-y-2">
              <div className="flex items-center justify-between text-xs font-mono font-medium text-accent-olive uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Inventory Adjustment Notice</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setDismissedVariantIds((prev) => [
                      ...prev,
                      ...visibleRemovedItems.map((i) => i.variantId),
                    ])
                  }
                  className="text-on-surface-variant hover:text-on-surface p-0.5 transition-colors focus:outline-none"
                  aria-label="Dismiss inventory adjustment notice"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ul className="space-y-1 text-xs font-mono text-on-surface-variant leading-relaxed">
                {visibleRemovedItems.map((ri, idx) => (
                  <li key={`${ri.variantId}-${idx}`}>
                    {ri.reason === "out_of_stock"
                      ? `${ri.title || "A reference"} (Ref: ${ri.sku || "N/A"}) has depleted from reserve and was removed.`
                      : `${ri.title || "A reference"} is no longer active in our archive and was removed.`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Line Items Container with Hairline Dividers */}
          <div className="border border-outline bg-surface-container-lowest divide-y divide-outline px-4 sm:px-6">
            {items.map((item) => (
              <LineItem key={item.variantId} item={item} />
            ))}
          </div>

          {/* Horological Manufacture Inclusions */}
          <div className="border border-outline bg-surface-container-lowest p-6">
            <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-[0.14em] text-on-surface mb-3 font-semibold">
              <Package className="w-4 h-4 stroke-[1.5]" />
              <span>Included With Every Timepiece</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Every Northwatch instrument is delivered in a solid European oak
              presentation case, accompanied by a hand-signed Certificate of
              Origin, chronometric precision certificate (–4/+6s/day), and an
              engraved 316L steel sizing tool.
            </p>
          </div>
        </section>

        {/* RIGHT COLUMN (40% on desktop) */}
        <aside className="lg:col-span-5" aria-label="Order Summary">
          <div className="sticky top-24 border border-outline bg-surface-container-lowest p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="border-b border-outline pb-4 flex items-center justify-between">
              <h2 className="text-xs font-mono font-semibold uppercase tracking-[0.16em] text-on-surface">
                Order Summary
              </h2>
              <span className="font-mono text-xs text-on-surface-variant tabular-nums">
                {itemCount} {itemCount === 1 ? "Item" : "Items"}
              </span>
            </div>

            {/* Complimentary Shipping Progress Track */}
            <div className="space-y-2">
              <div className="flex justify-between items-baseline text-[11px] font-mono uppercase tracking-wider">
                <span className="text-on-surface-variant">Insured Courier</span>
                <span className="text-accent-olive font-medium">
                  {isFreeShipping ? "Unlocked" : `${formatPrice(remainingForFreeShipping)} away`}
                </span>
              </div>
              <div className="h-1 w-full bg-outline/40 overflow-hidden">
                <div
                  className="h-full bg-accent-olive transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-on-surface-variant">
                {isFreeShipping
                  ? "Complimentary expedited courier dispatch applied to your order."
                  : "Orders of $500 or more qualify for complimentary worldwide expedited delivery."}
              </p>
            </div>

            {/* Financial Breakdown Table */}
            <div className="space-y-3 pt-2 border-t border-outline text-xs">
              <div className="flex justify-between items-baseline">
                <span className="text-on-surface-variant">Subtotal</span>
                <span className="font-mono font-medium text-on-surface tabular-nums">
                  {formatPrice(totals.subtotalCents)}
                </span>
              </div>

              {totals.discountCents > 0 && (
                <div className="flex justify-between items-baseline text-accent-olive">
                  <span className="flex items-center gap-1.5">
                    <span>Atelier Promo</span>
                    {promo?.code && (
                      <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 border border-accent-olive/30 bg-accent-olive/10">
                        {promo.code}
                      </span>
                    )}
                  </span>
                  <span className="font-mono font-medium tabular-nums">
                    –{formatPrice(totals.discountCents)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-baseline">
                <span className="text-on-surface-variant">Insured Courier Delivery</span>
                <span className="font-mono text-on-surface uppercase">
                  {isFreeShipping ? (
                    <span className="text-accent-olive">Complimentary</span>
                  ) : (
                    formatPrice(totals.shippingEstimateCents)
                  )}
                </span>
              </div>

              <div className="flex justify-between items-baseline pt-4 border-t border-outline text-sm font-semibold uppercase tracking-[0.12em] text-on-surface">
                <span>Estimated Total</span>
                <span className="font-mono text-xl font-medium text-on-surface tabular-nums">
                  {formatPrice(totals.totalCents)}
                </span>
              </div>

              <p className="text-[10px] text-on-surface-variant leading-relaxed">
                Taxes, customs duties, and local tariffs are calculated during
                checkout. Dispatches directly from Geneva Atelier.
              </p>
            </div>

            {/* Promo Code Input Block */}
            <div className="pt-2 border-t border-outline">
              <PromoInput />
            </div>

            {/* Primary Action Button */}
            <div>
              <Link
                href="/checkout"
                className="w-full py-4 bg-on-surface text-white text-xs uppercase tracking-[0.16em] font-medium hover:bg-[#2A2A28] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group select-none shadow-sm"
              >
                <span>{isPending ? "Updating Selection..." : "Proceed to Checkout"}</span>
                <span className="font-mono text-white/80">—</span>
                <span className="font-mono tabular-nums font-medium">
                  {formatPrice(totals.totalCents)}
                </span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Atelier Horological Guarantees */}
            <div className="pt-4 border-t border-outline/70 space-y-3">
              <div className="flex items-start gap-2.5 text-[11px] text-on-surface-variant">
                <ShieldCheck className="w-4 h-4 text-accent-olive flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-on-surface font-medium block">
                    5-Year Atelier Warranty
                  </strong>
                  <span>Comprehensive mechanical movement coverage worldwide.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-[11px] text-on-surface-variant">
                <RotateCcw className="w-4 h-4 text-accent-olive flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-on-surface font-medium block">
                    14-Day Examination Period
                  </strong>
                  <span>Complimentary returns with prepaid insured shipping.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-[11px] text-on-surface-variant">
                <Clock className="w-4 h-4 text-accent-olive flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-on-surface font-medium block">
                    Pre-Dispatch Regulation
                  </strong>
                  <span>Tested for 72 hours in 5 positions before secure courier release.</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile Sticky Checkout Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface/95 backdrop-blur-sm border-t border-outline lg:hidden z-30 flex items-center justify-between gap-4">
        <div>
          <span className="block text-[10px] font-mono uppercase tracking-wider text-on-surface-variant">
            Estimated Total
          </span>
          <span className="font-mono text-base font-medium text-on-surface tabular-nums">
            {formatPrice(totals.totalCents)}
          </span>
        </div>
        <Link
          href="/checkout"
          className="flex-1 max-w-[240px] py-3.5 bg-on-surface text-white text-xs uppercase tracking-[0.14em] font-medium hover:bg-[#2A2A28] active:scale-[0.99] transition-all flex items-center justify-center gap-2 select-none shadow-sm"
        >
          <span>{isPending ? "Updating..." : "Proceed to Checkout"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
