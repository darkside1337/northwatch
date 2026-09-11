import * as React from "react";

export function ArchiveTechBanner() {
  return (
    <section className="w-full bg-surface-container border-y border-outline">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-on-surface">
            <span className="font-semibold">TOLERANCE: ±0.02MM</span>
            <span className="text-outline">{"//"}</span>
            <span>ALLOY: 316L AUSTENITIC STAINLESS STEEL</span>
            <span className="text-outline">{"//"}</span>
            <span>CALIBRATION: REGULATED IN SWITZERLAND</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-on-surface-variant">
            <span className="inline-block w-2 h-2 border border-on-surface-variant" />
            <span>NORTHWATCH CERTIFICATION NORMS DIN-8309</span>
          </div>
        </div>
      </div>
    </section>
  );
}
