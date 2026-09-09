"use client";

import * as React from "react";
import { X, Tag } from "lucide-react";
import { formatPrice } from "@/config/site";
import { useCart } from "../context";

export function PromoInput() {
  const { promo, applyPromo, removePromo, isPending } = useCart();
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await applyPromo(cleanCode);
      if (!res.success) {
        setError(res.message || "Invalid promotional code.");
      } else {
        setCode("");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to apply promotional code."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async () => {
    setError(null);
    await removePromo();
  };

  // Case 1: Promo is active and valid
  if (promo && promo.isValid) {
    return (
      <div className="bg-surface-container-low border border-outline p-3 rounded-none flex items-center justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <Tag className="w-3.5 h-3.5 text-accent-olive mt-0.5 shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-on-surface">
                {promo.code}
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-olive" />
              {promo.discountCents > 0 && (
                <span className="font-mono text-xs text-accent-olive font-medium tabular-nums">
                  -{formatPrice(promo.discountCents)}
                </span>
              )}
            </div>
            {promo.description && (
              <p className="text-[11px] text-on-surface-variant mt-0.5 truncate">
                {promo.description}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleRemove}
          disabled={isPending}
          className="p-1 text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none disabled:opacity-50 shrink-0"
          aria-label={`Remove promo code ${promo.code}`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // Case 2: Render flat hairline input (with optional inactive promo callout if promo terms no longer met)
  return (
    <div className="space-y-2">
      {promo && !promo.isValid && (
        <div className="bg-surface-container-low border border-outline p-3 rounded-none flex items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-start gap-2.5 min-w-0">
            <Tag className="w-3.5 h-3.5 text-on-surface-variant mt-0.5 shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-on-surface">
                  {promo.code}
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-on-surface-variant/40" />
                <span className="text-[10px] text-on-surface-variant uppercase font-medium">
                  Requirement Not Met
                </span>
              </div>
              {promo.failureReason && (
                <p className="text-[11px] text-on-surface-variant mt-0.5">
                  {promo.failureReason}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            disabled={isPending}
            className="p-1 text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none disabled:opacity-50 shrink-0"
            aria-label={`Remove inactive promo code ${promo.code}`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            if (error) setError(null);
          }}
          placeholder="PROMO CODE"
          disabled={isSubmitting || isPending}
          className="flex-1 bg-surface-container-lowest border border-outline px-3 py-2 text-xs font-mono uppercase tracking-wider text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-on-surface rounded-none disabled:opacity-50"
          aria-label="Promotional Code"
        />
        <button
          type="submit"
          disabled={!code.trim() || isSubmitting || isPending}
          className="px-4 py-2 bg-on-surface text-white text-xs font-mono uppercase tracking-[0.14em] font-medium hover:bg-[#2A2A28] disabled:opacity-40 disabled:hover:bg-on-surface transition-colors rounded-none focus:outline-none select-none"
        >
          {isSubmitting ? "..." : "APPLY"}
        </button>
      </form>

      {error && (
        <p className="text-[11px] font-mono text-error leading-tight tracking-tight">
          {error}
        </p>
      )}
    </div>
  );
}
