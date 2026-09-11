"use client";

import { useState, useEffect } from "react";
import { siteConfig, type ShippingTierId } from "@/config/site";
import { AddressForm } from "./AddressForm";
import { PaymentForm } from "./PaymentForm";
import { OrderSummary } from "./OrderSummary";
import { createOrUpdatePaymentIntent } from "../actions";
import { calculateCheckoutTotals } from "../math";
import type { CheckoutDraft, ShippingAddress } from "../schemas";
import type { CartItem } from "@/features/cart/schemas";

interface CheckoutWizardProps {
  initialDraft: CheckoutDraft | null;
  items: CartItem[];
  subtotalCents: number;
  discountCents: number;
  promoCode?: string | null;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
}

export function CheckoutWizard({
  initialDraft,
  items,
  subtotalCents: initialSubtotal,
  discountCents: initialDiscount,
  promoCode,
  shippingCents: initialShipping,
  taxCents: initialTax,
  totalCents: initialTotal,
}: CheckoutWizardProps) {
  // Determine initial step: if a valid active draft with clientSecret exists, can default to payment
  const [step, setStep] = useState<"shipping" | "payment">(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("step") === "payment" && initialDraft?.clientSecret) {
        return "payment";
      }
    }
    return initialDraft?.clientSecret ? "payment" : "shipping";
  });

  const [draft, setDraft] = useState<CheckoutDraft | null>(initialDraft);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(
    initialDraft?.shippingAddress ?? null
  );
  const [selectedTierId, setSelectedTierId] = useState<ShippingTierId>(
    initialDraft?.shippingTierId ?? "standard"
  );

  const [subtotalCents, setSubtotalCents] = useState(
    initialDraft?.subtotalCents ?? initialSubtotal
  );
  const [discountCents, setDiscountCents] = useState(
    initialDraft?.discountCents ?? initialDiscount
  );
  const [shippingCents, setShippingCents] = useState(
    initialDraft?.shippingCents ?? initialShipping
  );
  const [taxCents, setTaxCents] = useState(
    initialDraft?.taxCents ?? initialTax
  );
  const [totalCents, setTotalCents] = useState(
    initialDraft?.totalCents ?? initialTotal
  );

  const [isLoading, setIsLoading] = useState(false);

  // Sync with browser back/forward buttons using native popstate without RSC re-renders
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const urlStep = params.get("step");
      if (urlStep === "payment" && draft?.clientSecret) {
        setStep("payment");
      } else {
        setStep("shipping");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [draft]);

  // Handle advancing from Step 1 (Shipping) to Step 2 (Payment)
  const handleShippingSubmit = async (data: {
    shippingAddress: ShippingAddress;
    shippingTierId: ShippingTierId;
  }) => {
    setIsLoading(true);
    try {
      // Mint client attempt token before initiating mutation
      const clientAttemptToken = crypto.randomUUID();

      const newDraft = await createOrUpdatePaymentIntent({
        shippingAddress: data.shippingAddress,
        shippingTierId: data.shippingTierId,
        clientAttemptToken,
      });

      setDraft(newDraft);
      setShippingAddress(data.shippingAddress);
      setSelectedTierId(data.shippingTierId);
      setSubtotalCents(newDraft.subtotalCents);
      setDiscountCents(newDraft.discountCents);
      setShippingCents(newDraft.shippingCents);
      setTaxCents(newDraft.taxCents);
      setTotalCents(newDraft.totalCents);

      // Update URL bar without triggering Next.js RSC re-fetch
      window.history.pushState(null, "", "?step=payment");
      setStep("payment");
    } catch (err) {
      console.error("Failed to advance to payment:", err);
      alert(err instanceof Error ? err.message : "Failed to initialize payment.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle real-time shipping tier selection change
  const handleTierChange = (tierId: ShippingTierId) => {
    setSelectedTierId(tierId);
    const updated = calculateCheckoutTotals({
      items,
      shippingTierId: tierId,
      stateCode: shippingAddress?.state ?? "CA",
      promoCode,
    });
    setSubtotalCents(updated.subtotalCents);
    setDiscountCents(updated.discountCents);
    setShippingCents(updated.shippingCents);
    setTaxCents(updated.taxCents);
    setTotalCents(updated.totalCents);
  };

  // Handle returning to Step 1 (Shipping)
  const handleReturnToShipping = () => {
    window.history.pushState(null, "", "?step=shipping");
    setStep("shipping");
  };

  const selectedTier = siteConfig.shipping.tiers[selectedTierId];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
      {/* LEFT COLUMN: Active Step Forms (60% -> col-span-7) */}
      <section className="lg:col-span-7 space-y-8">
        {/* Step Progress Indicator */}
        <nav aria-label="Progress" className="border-b border-outline-variant/50 pb-4">
          <ol className="flex items-center gap-3 sm:gap-4 text-xs tracking-[0.14em] font-mono uppercase">
            <li
              className={`flex items-center gap-2 cursor-pointer transition-colors ${
                step === "shipping"
                  ? "text-foreground font-semibold"
                  : "text-on-surface-variant hover:text-foreground"
              }`}
              onClick={handleReturnToShipping}
            >
              <span
                className={`w-5 h-5 inline-flex items-center justify-center text-[10px] ${
                  step === "shipping"
                    ? "bg-secondary text-background font-bold"
                    : "border border-outline-variant"
                }`}
              >
                1
              </span>
              <span>Shipping & Delivery</span>
            </li>

            <li className="text-outline-variant select-none font-mono">/</li>

            <li
              className={`flex items-center gap-2 ${
                step === "payment"
                  ? "text-foreground font-semibold"
                  : "text-on-surface-variant/60"
              }`}
            >
              <span
                className={`w-5 h-5 inline-flex items-center justify-center text-[10px] ${
                  step === "payment"
                    ? "bg-secondary text-background font-bold"
                    : "border border-outline-variant/60"
                }`}
              >
                2
              </span>
              <span>Vault Payment</span>
            </li>
          </ol>
        </nav>

        {/* Dynamic Step View */}
        {step === "shipping" ? (
          <AddressForm
            initialAddress={shippingAddress}
            initialTierId={selectedTierId}
            subtotalCents={subtotalCents}
            isLoading={isLoading}
            onTierChange={handleTierChange}
            onSubmit={handleShippingSubmit}
          />
        ) : draft && draft.clientSecret ? (
          <PaymentForm
            clientSecret={draft.clientSecret}
            orderId={draft.orderId}
            totalCents={totalCents}
            onBack={handleReturnToShipping}
          />
        ) : (
          <div className="py-8 text-center font-mono text-sm text-on-surface-variant">
            Initializing payment authorization...
          </div>
        )}
      </section>

      {/* RIGHT COLUMN: Real-Time Order Summary (40% -> col-span-5) */}
      <section className="lg:col-span-5">
        <OrderSummary
          items={items}
          subtotalCents={subtotalCents}
          discountCents={discountCents}
          promoCode={promoCode}
          shippingCents={shippingCents}
          taxCents={taxCents}
          totalCents={totalCents}
          shippingTierName={selectedTier?.name ?? "Insured Courier"}
        />
      </section>
    </div>
  );
}
