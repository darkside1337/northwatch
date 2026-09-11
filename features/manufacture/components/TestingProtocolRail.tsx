import * as React from "react";
import { TESTING_PHASES } from "../data";

export function TestingProtocolRail() {
  return (
    <section className="mb-20 md:mb-28">
      {/* Section Divider Eyebrow */}
      <div className="flex items-center justify-between pb-4 mb-8 md:mb-10 border-b border-outline">
        <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-on-surface-variant">
          SECTION 03 // VERIFICATION METROLOGY
        </span>
        <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-on-surface-variant">
          [ TESTING PROTOCOL ]
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-outline divide-y sm:divide-y-0 sm:divide-x divide-outline bg-surface">
        {TESTING_PHASES.map((phase) => (
          <div
            key={phase.phaseNumber}
            className="p-6 md:p-8 flex flex-col justify-between h-full hover:bg-surface-container-low/40 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <span className="font-mono text-2xl font-medium text-on-surface tracking-tight">
                  {phase.phaseNumber}
                </span>
                <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-accent-olive bg-accent-olive/10 px-2 py-0.5">
                  {phase.phaseTag}
                </span>
              </div>
              <h3 className="font-serif text-xl font-normal text-on-surface mb-3">
                {phase.title}
              </h3>
              <p className="font-sans text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                {phase.description}
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-outline font-mono text-[10px] text-on-surface-variant tracking-[0.12em] uppercase">
              {phase.chamberRef}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
