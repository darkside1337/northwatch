"use client";

import { Printer } from "lucide-react";

export function PrintReceiptButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-4 py-2 border border-outline hover:border-on-surface bg-surface-bright text-on-surface text-[11px] font-mono uppercase tracking-[0.14em] transition-colors cursor-pointer"
    >
      <Printer className="w-3.5 h-3.5" />
      <span>Print Receipt</span>
    </button>
  );
}
