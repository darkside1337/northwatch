import * as React from "react";

export function JournalTelemetryBar() {
  return (
    <section className="w-full bg-surface border-b border-outline py-5">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center divide-y md:divide-y-0 md:divide-x divide-outline">
          <div className="px-3 pt-2 md:pt-0">
            <span className="font-sans text-[10px] text-on-surface-variant uppercase block mb-1">
              TOTAL MONOGRAPHS
            </span>
            <span className="font-mono text-xs sm:text-sm text-on-surface font-semibold">
              48 PUBLISHED
            </span>
          </div>
          <div className="px-3 pt-2 md:pt-0">
            <span className="font-sans text-[10px] text-on-surface-variant uppercase block mb-1">
              CALIBRE SPECIFICATIONS
            </span>
            <span className="font-mono text-xs sm:text-sm text-on-surface font-semibold">
              NW-CAL.01 &amp; NW-CAL.02
            </span>
          </div>
          <div className="px-3 pt-2 md:pt-0">
            <span className="font-sans text-[10px] text-on-surface-variant uppercase block mb-1">
              CHRONOMETRIC RATIO
            </span>
            <span className="font-mono text-xs sm:text-sm text-on-surface font-semibold">
              ±1.8 SEC / 24H
            </span>
          </div>
          <div className="px-3 pt-2 md:pt-0">
            <span className="font-sans text-[10px] text-on-surface-variant uppercase block mb-1">
              PRIMARY MATERIAL
            </span>
            <span className="font-mono text-xs sm:text-sm text-on-surface font-semibold">
              SWEDISH 316L AUSTENITIC
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
