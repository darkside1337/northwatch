import * as React from "react";
import Image from "next/image";
import { METALLURGY_SPECS } from "../data";

export function MaterialManifestGrid() {
  return (
    <section className="mb-20 md:mb-28">
      {/* Section Divider Eyebrow */}
      <div className="flex items-center justify-between pb-4 mb-8 md:mb-10 border-b border-outline">
        <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-on-surface-variant">
          SECTION 01 // MATERIAL RESTRAINT
        </span>
        <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-on-surface-variant">
          [ METALLURGICAL MANIFEST ]
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 border border-outline divide-y md:divide-y-0 md:divide-x divide-outline bg-surface">
        {METALLURGY_SPECS.map((spec) => (
          <div key={spec.id} className="flex flex-col h-full bg-surface">
            <div className="aspect-square w-full border-b border-outline bg-surface-container-low overflow-hidden relative">
              <Image
                src={spec.image}
                alt={spec.altText}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover contrast-[1.02]"
              />
              <span className="absolute top-3 left-3 bg-surface border border-outline px-2 py-1 font-mono text-[10px] tracking-[0.14em] uppercase text-on-surface">
                {spec.badge}
              </span>
            </div>

            <div className="p-6 md:p-8 flex flex-col justify-between flex-1">
              <div>
                <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-on-surface-variant mb-2">
                  {spec.category}
                </div>
                <h2 className="font-serif text-2xl font-normal text-on-surface mb-3">
                  {spec.title}
                </h2>
                <p className="font-sans text-xs sm:text-sm leading-relaxed text-on-surface-variant mb-6">
                  {spec.description}
                </p>
              </div>

              <div className="pt-4 border-t border-outline space-y-2 font-mono text-[11px] text-on-surface-variant">
                {spec.metrics.map((metric) => (
                  <div key={metric.label} className="flex justify-between">
                    <span>{metric.label}</span>
                    <span className="text-on-surface font-medium">
                      {metric.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
