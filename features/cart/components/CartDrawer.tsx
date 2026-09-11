"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, ArrowRight, AlertCircle } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { formatPrice, FREE_SHIPPING_THRESHOLD_CENTS } from "@/config/site";
import { useCart } from "../context";
import { LineItem } from "./LineItem";
import { PromoInput } from "./PromoInput";

export function CartDrawer() {
  const router = useRouter();
  const {
    isOpen,
    closeCart,
    items,
    removedItems,
    totals,
    promo,
    itemCount,
    isPending,
  } = useCart();
  const [dismissedVariantIds, setDismissedVariantIds] = React.useState<string[]>([]);
  const visibleRemovedItems = removedItems.filter(
    (item) => !dismissedVariantIds.includes(item.variantId)
  );

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

  const handleCheckoutClick = () => {
    closeCart();
    // Route directly to unified checkout flow
    router.push("/checkout");
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full sm:max-w-[440px] p-0 flex flex-col justify-between bg-surface border-l border-outline shadow-none rounded-none overflow-hidden"
      >
        {/* 1. DRAWER HEADER */}
        <div className="flex-none px-7 h-20 border-b border-outline flex items-center justify-between bg-surface shrink-0">
          <div className="flex items-baseline gap-2.5">
            <SheetTitle className="font-serif text-2xl font-normal tracking-[0.04em] text-on-surface uppercase m-0">
              Your Selection
            </SheetTitle>
            <span className="font-mono text-xs text-on-surface-variant font-medium tracking-wider tabular-nums">
              [{itemCount}]
            </span>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="w-10 h-10 -mr-2 flex items-center justify-center text-on-surface hover:text-on-surface-variant transition-colors focus:outline-none"
            aria-label="Close cart drawer"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* 2. FREE SHIPPING INCENTIVE METER (Stitch Reference) */}
        {items.length > 0 && (
          <div className="flex-none px-7 py-3.5 bg-surface-container-low border-b border-outline">
            <div className="flex items-center justify-between text-[11px] mb-2 font-mono">
              <span className="flex items-center gap-1.5 font-medium text-on-surface tracking-[0.02em]">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isFreeShipping ? "bg-accent-olive" : "bg-on-surface-variant/40"
                  }`}
                />
                {isFreeShipping
                  ? "Complimentary insured express delivery unlocked"
                  : `Add ${formatPrice(
                      remainingForFreeShipping
                    )} for complimentary insured delivery`}
              </span>
              <span className="text-accent-olive font-medium tabular-nums">
                {isFreeShipping ? "100%" : `${progressPercent}%`}
              </span>
            </div>
            {/* Hairline meter */}
            <div className="w-full h-[2px] bg-outline overflow-hidden">
              <div
                className="h-full bg-accent-olive transition-all duration-500 ease-out"
                style={{ width: `${isFreeShipping ? 100 : progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* 3. REMOVED ITEMS NOTICES (Depleted / Discontinued) */}
        {visibleRemovedItems.length > 0 && (
          <div className="mx-7 mt-4 p-3 bg-surface-container-low border border-outline space-y-2">
            <div className="flex items-center justify-between text-xs font-mono uppercase text-on-surface font-semibold tracking-wider">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-accent-olive" />
                <span>Inventory Notice</span>
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
                aria-label="Dismiss inventory notice"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <ul className="space-y-1 text-[11px] font-mono text-on-surface-variant leading-relaxed">
              {visibleRemovedItems.map((removed, idx) => (
                <li key={`${removed.variantId}-${idx}`}>
                  {removed.reason === "out_of_stock"
                    ? `${
                        removed.title || "A reference"
                      } (Ref: ${removed.sku || "N/A"}) has depleted from reserve and was removed.`
                    : "A reference that is no longer active in our archive was removed."}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 4. MAIN CONTENT AREA (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-7 py-6 divide-y divide-outline">
          {items.length === 0 ? (
            /* Empty State */
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center py-12 animate-in fade-in duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:animate-none">
              <div className="w-16 h-16 mb-4 rounded-full border border-outline flex items-center justify-center text-on-surface-variant/40">
                <svg
                  className="w-8 h-8"
                  viewBox="0 0 80 80"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <circle cx="40" cy="40" r="28" strokeDasharray="3 3" />
                  <line x1="40" y1="40" x2="40" y2="24" strokeWidth="2" />
                  <line x1="40" y1="40" x2="52" y2="40" strokeWidth="1.5" />
                  <circle cx="40" cy="40" r="2" fill="currentColor" />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-normal text-on-surface uppercase tracking-wide mb-2">
                Your Bag is Empty
              </h3>
              <p className="text-xs text-on-surface-variant max-w-[240px] leading-relaxed mb-6">
                Explore our collection of minimalist field, dress, and dual-time
                mechanical instruments.
              </p>
              <Link
                href="/products"
                onClick={closeCart}
                className="inline-flex items-center gap-2 px-6 py-3 bg-on-surface text-white text-xs font-mono uppercase tracking-[0.16em] hover:bg-[#2A2A28] transition-colors rounded-none focus:outline-none"
              >
                <span>Explore Timepieces</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            /* Line Items List */
            <>
              <div className="divide-y divide-outline pb-4">
                {items.map((item) => (
                  <LineItem
                    key={item.variantId}
                    item={item}
                    onItemClick={closeCart}
                  />
                ))}
              </div>

              {/* Inline Promo Code Input */}
              <div className="pt-6 pb-2">
                <PromoInput />
              </div>
            </>
          )}
        </div>

        {/* 5. STICKY DRAWER FOOTER (Stitch Reference) */}
        {items.length > 0 && (
          <div className="flex-none p-7 bg-surface border-t border-outline space-y-4 shrink-0">
            {/* Ledger Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between items-baseline text-xs uppercase tracking-[0.12em] text-on-surface">
                <span className="font-medium">Subtotal</span>
                <span className="font-mono text-base font-medium text-on-surface tabular-nums">
                  {formatPrice(totals.subtotalCents)}
                </span>
              </div>

              {totals.discountCents > 0 && (
                <div className="flex justify-between items-baseline text-xs text-accent-olive font-mono">
                  <span>Discount ({promo?.code})</span>
                  <span className="tabular-nums font-medium">
                    -{formatPrice(totals.discountCents)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-baseline text-[11px] text-on-surface-variant">
                <span>Insured Courier Delivery</span>
                <span className="font-mono text-accent-olive uppercase font-medium">
                  {isFreeShipping
                    ? "Complimentary"
                    : formatPrice(totals.shippingEstimateCents)}
                </span>
              </div>

              <div className="flex justify-between items-baseline text-sm uppercase tracking-[0.12em] text-on-surface pt-2 border-t border-outline font-semibold">
                <span>Estimated Total</span>
                <div className="flex items-baseline gap-2.5">
                  {totals.discountCents > 0 && (
                    <span className="font-mono text-xs font-normal text-on-surface-variant/70 line-through tabular-nums">
                      {formatPrice(totals.subtotalCents + (isFreeShipping ? 0 : totals.shippingEstimateCents))}
                    </span>
                  )}
                  <span className="font-mono text-lg font-medium text-on-surface tabular-nums">
                    {formatPrice(totals.totalCents)}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-on-surface-variant/80 pt-1 leading-normal">
                Taxes and duties calculated at checkout. Dispatches from Geneva Atelier.
              </p>
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={handleCheckoutClick}
              disabled={isPending}
              className="w-full py-4 bg-on-surface text-white text-xs uppercase tracking-[0.16em] font-medium hover:bg-[#2A2A28] active:scale-[0.99] transition-all focus:outline-none rounded-none flex items-center justify-center gap-2 select-none disabled:opacity-50"
            >
              <span>{isPending ? "Updating..." : "Proceed to Checkout"}</span>
              <span className="font-mono text-white/80">—</span>
              <span className="font-mono tabular-nums font-medium inline-flex items-center gap-2">
                {totals.discountCents > 0 && (
                  <span className="line-through text-white/50 text-[11px] font-normal">
                    {formatPrice(totals.subtotalCents + (isFreeShipping ? 0 : totals.shippingEstimateCents))}
                  </span>
                )}
                <span>{formatPrice(totals.totalCents)}</span>
              </span>
            </button>

            {/* Secondary Link to Full Cart Review */}
            <Link
              href="/cart"
              onClick={closeCart}
              className="block text-center text-[11px] font-mono uppercase tracking-[0.12em] text-on-surface-variant hover:text-on-surface underline underline-offset-4 decoration-outline hover:decoration-on-surface transition-colors"
            >
              View Detailed Specification Review →
            </Link>

            {/* Horological Trust Microtags */}
            <div className="pt-2 border-t border-outline/60 text-center">
              <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-on-surface-variant">
                30-Day Complimentary Returns · Fully Insured
              </p>
              <div className="flex items-center justify-center gap-3 text-[9px] text-on-surface-variant/70 tracking-wider uppercase pt-1">
                <span>316L Steel Guarantee</span>
                <span>·</span>
                <span>Sellita Certified</span>
                <span>·</span>
                <span>Encrypted</span>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
