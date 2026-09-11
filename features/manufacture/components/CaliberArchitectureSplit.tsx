import * as React from "react";
import { CALIBER_PARAMETERS } from "../data";

export function CaliberArchitectureSplit() {
  return (
    <section className="mb-20 md:mb-28">
      {/* Section Divider Eyebrow */}
      <div className="flex items-center justify-between pb-4 mb-8 md:mb-10 border-b border-outline">
        <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-on-surface-variant">
          SECTION 02 // CHRONOMETRIC CADENCE
        </span>
        <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-on-surface-variant">
          [ CALIBER SPECIFICATION ]
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 border border-outline bg-surface">
        {/* Left Column: Editorial Horology Essay */}
        <div className="lg:col-span-6 p-6 sm:p-8 md:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-outline">
          <div>
            <div className="flex items-center space-x-2 font-mono text-[11px] tracking-[0.16em] uppercase text-on-surface-variant mb-6">
              <span className="w-1.5 h-1.5 bg-accent-olive inline-block" />
              <span>MECHANICAL REGULATION ENGINE</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal leading-tight text-on-surface mb-6">
              The Architecture of Caliber NW-CAL.01
            </h2>

            <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-on-surface-variant font-normal">
              <p>
                At the heart of every Northwatch timepiece beats the NW-CAL.01
                mechanical architecture. Regulated across five dynamic physical
                orientations over 360 continuous hours in our Geneva atelier,
                each movement achieves chronometric equilibrium before release.
              </p>
              <p>
                Its self-winding bidirectional rotor is tungsten-weighted and
                skeletonized to maximize kinetic winding efficiency while keeping
                case thickness below 10.4mm. Under high-contrast inspection
                loupes, the mainplates reveal perlage circular graining, thermal
                blued screws, and polished Geneva stripes.
              </p>
              <p>
                Operating at 28,800 vibrations per hour (4Hz), the balance
                spring delivers eight authoritative beats per second, translating
                the passage of time into an unbroken, fluid sweep across our
                matte basalt dials.
              </p>
            </div>
          </div>

          {/* Chronometric Assurance Stamp */}
          <div className="mt-8 pt-6 border-t border-outline flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 border border-outline flex items-center justify-center font-serif text-xs italic text-on-surface font-semibold">
                N
              </div>
              <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-on-surface">
                ATELIER REGULATED · 5 POSITIONS
              </span>
            </div>
            <span className="font-mono text-[11px] tracking-[0.14em] text-on-surface-variant">
              GENÈVE OBS. CAL.
            </span>
          </div>
        </div>

        {/* Right Column: Technical Specification Table */}
        <div className="lg:col-span-6 flex flex-col justify-between bg-surface-container-low/50">
          <div className="p-6 sm:p-8 md:p-12 pb-6">
            <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-on-surface-variant mb-2">
              ENGINEERING BLUEPRINT DATA
            </div>
            <div className="font-serif text-2xl font-normal text-on-surface mb-6">
              Technical Parameters
            </div>

            <div className="divide-y divide-outline border-t border-b border-outline">
              {CALIBER_PARAMETERS.map((param) => (
                <div
                  key={param.label}
                  className="py-3.5 flex items-center justify-between gap-4"
                >
                  <span className="font-mono text-[11px] uppercase text-on-surface-variant tracking-[0.08em]">
                    {param.label}
                  </span>
                  {param.isHighlighted ? (
                    <div className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-olive" />
                      <span className="font-mono text-[11px] sm:text-xs font-semibold text-on-surface tracking-[0.05em]">
                        {param.value}
                      </span>
                    </div>
                  ) : (
                    <span className="font-mono text-[11px] sm:text-xs font-semibold text-on-surface tracking-[0.05em] text-right">
                      {param.value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-8 md:p-12 pt-0">
            <div className="p-4 bg-surface border border-outline flex items-start space-x-3">
              <span className="font-mono text-xs text-accent-olive font-bold">
                #
              </span>
              <p className="font-sans text-xs text-on-surface-variant leading-normal">
                Every assembled movement is assigned an engraved individual
                serial cataloged inside our Stockholm Archive ledger for permanent
                servicing traceability.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
