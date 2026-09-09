"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ShopErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ShopError({ error, reset }: ShopErrorProps) {
  useEffect(() => {
    console.error("Shop route error caught by boundary:", error);
  }, [error]);

  return (
    <div className="flex-1 min-h-[70vh] flex items-center justify-center px-4 py-16 md:py-24">
      <div className="relative w-full max-w-xl bg-surface-container-lowest border border-outline p-8 sm:p-12 mx-auto text-center flex flex-col items-center">
        {/* Corner Crosshairs */}
        <span
          aria-hidden="true"
          className="absolute -top-2.5 -left-2.5 font-mono text-[10px] text-on-surface-variant bg-surface px-1 select-none"
        >
          +
        </span>
        <span
          aria-hidden="true"
          className="absolute -top-2.5 -right-2.5 font-mono text-[10px] text-on-surface-variant bg-surface px-1 select-none"
        >
          +
        </span>
        <span
          aria-hidden="true"
          className="absolute -bottom-2.5 -left-2.5 font-mono text-[10px] text-on-surface-variant bg-surface px-1 select-none"
        >
          +
        </span>
        <span
          aria-hidden="true"
          className="absolute -bottom-2.5 -right-2.5 font-mono text-[10px] text-on-surface-variant bg-surface px-1 select-none"
        >
          +
        </span>

        {/* Eyebrow */}
        <div className="inline-flex items-center space-x-2 border border-outline bg-surface-container-low px-3 py-1 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#A33B3B]" />
          <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-on-surface font-medium">
            CALIBRE FAULT // EXCEPTION
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-serif text-3xl sm:text-4xl text-on-surface font-normal mb-3">
          Oscillation Interrupted
        </h1>

        <p className="font-mono text-[10px] tracking-widest text-[#A33B3B] uppercase mb-4">
          CODE: {error.digest || "ERR_SHOP_ROUTE_FAILURE"}
        </p>

        <p className="font-sans text-[14px] leading-relaxed text-on-surface-variant max-w-md mb-8">
          A synchronization error occurred while resolving this horological record. The atelier
          cadence has been halted to preserve state integrity.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto flex-1 bg-on-surface text-white text-[12px] font-semibold tracking-[0.14em] uppercase py-3.5 px-6 rounded-none hover:bg-[#2A2A28] transition-colors"
          >
            RETRY CALIBRATION
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto flex-1 bg-transparent border border-outline text-on-surface text-[12px] font-semibold tracking-[0.14em] uppercase py-3.5 px-6 rounded-none hover:bg-surface-container-low transition-colors"
          >
            RETURN HOME
          </Link>
        </div>
      </div>
    </div>
  );
}
