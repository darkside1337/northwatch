import * as React from "react";

interface ArchiveHeaderProps {
  specimenCount: number;
}

export function ArchiveHeader({ specimenCount }: ArchiveHeaderProps) {
  return (
    <section className="w-full bg-surface border-b border-outline">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12 md:pt-16 pb-8 md:pb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 bg-accent-olive inline-block" />
              <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
                Series Archive / Permanent Collection
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal text-on-surface tracking-tight mb-2">
              The Archive
            </h1>
            <p className="font-sans text-sm md:text-base text-on-surface-variant max-w-xl leading-relaxed">
              Timepieces engineered with cold-rolled 316L austenitic steel and
              Swiss automatic calibers. Constructed with quiet Nordic restraint.
            </p>
          </div>
          <div className="flex items-center gap-4 pb-1 md:self-end">
            <div className="flex items-center gap-2 bg-surface-container px-3 py-1.5 border border-outline">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-olive inline-block" />
              <span className="font-mono text-xs text-on-surface tracking-wider uppercase font-semibold">
                {specimenCount} Active Specimens
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1 font-mono text-xs text-on-surface-variant">
              <span>INDEX // NW-ARC-26</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
