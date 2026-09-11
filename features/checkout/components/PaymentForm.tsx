"use client";

import { useState } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Lock, ShieldAlert, ArrowLeft } from "lucide-react";
import { formatPrice } from "@/config/site";
import { env } from "@/config/env";

const stripePromise = loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

interface PaymentFormProps {
  clientSecret: string;
  orderId: string;
  totalCents: number;
  onBack: () => void;
}

export function PaymentForm({
  clientSecret,
  orderId,
  totalCents,
  onBack,
}: PaymentFormProps) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "flat",
          variables: {
            fontFamily: "Inter, -apple-system, sans-serif",
            fontSizeBase: "14px",
            colorText: "#141413",
            colorBackground: "#FFFFFF",
            colorPrimary: "#141413",
            colorDanger: "#BA1A1A",
            borderRadius: "0px",
            spacingUnit: "4px",
          },
          rules: {
            ".Input": {
              border: "1px solid #DCD8D0",
              boxShadow: "none",
              padding: "12px 14px",
            },
            ".Input:focus": {
              borderColor: "#141413",
              boxShadow: "none",
            },
            ".Label": {
              fontFamily: "JetBrains Mono, SF Mono, monospace",
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "#595854",
              marginBottom: "6px",
            },
          },
        },
      }}
    >
      <PaymentElementForm
        orderId={orderId}
        totalCents={totalCents}
        onBack={onBack}
      />
    </Elements>
  );
}

function PaymentElementForm({
  orderId,
  totalCents,
  onBack,
}: {
  orderId: string;
  totalCents: number;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const returnUrl = `${window.location.origin}/confirmation/${orderId}`;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setErrorMessage(error.message ?? "Your payment could not be authorized.");
      } else {
        setErrorMessage("An unexpected transmission error occurred. Please retry.");
      }
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="flex items-baseline justify-between border-b border-outline-variant/40 pb-3">
        <h2 className="font-serif text-xl sm:text-2xl font-normal tracking-tight text-foreground">
          2. Vault Payment Authorization
        </h2>
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-secondary">
          <Lock className="w-3.5 h-3.5" />
          <span>TLS 1.3 SECURE</span>
        </div>
      </div>

      <div className="border border-outline-variant/60 bg-surface-container-lowest p-4 sm:p-6 rounded-none">
        <PaymentElement options={{ layout: "tabs" }} />
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="border border-error/50 bg-error/10 p-4 rounded-none flex items-start gap-3 text-error font-mono text-xs"
        >
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">{errorMessage}</div>
        </div>
      )}

      <div className="pt-2 space-y-3">
        <button
          type="submit"
          disabled={isProcessing || !stripe || !elements}
          className="w-full bg-foreground text-background py-4 px-8 text-xs font-mono font-semibold uppercase tracking-[0.18em] hover:bg-foreground/90 active:bg-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-none flex items-center justify-between group"
        >
          <span className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-secondary" />
            <span>{isProcessing ? "Authorizing Escrow..." : "Authorize Payment"}</span>
          </span>
          <span className="font-mono text-sm tracking-normal font-medium">
            {formatPrice(totalCents)} USD
          </span>
        </button>

        <button
          type="button"
          onClick={onBack}
          disabled={isProcessing}
          className="w-full py-2.5 px-4 text-xs font-mono uppercase tracking-wider text-on-surface-variant hover:text-foreground transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Shipping Details</span>
        </button>
      </div>
    </form>
  );
}
