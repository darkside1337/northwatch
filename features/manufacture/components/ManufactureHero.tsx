import * as React from "react";
import Image from "next/image";

export function ManufactureHero() {
  return (
    <section className="mb-16 md:mb-24">
      {/* Eyebrow & Manifest Tag */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-outline gap-3">
        <div className="flex items-center space-x-3">
          <span className="w-2 h-2 rounded-full bg-accent-olive" />
          <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-on-surface-variant">
            03 // MANUFACTURE &amp; PROVENANCE
          </span>
        </div>
        <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-on-surface-variant">
          STOCKHOLM ATELIER · GENÈVE CALIBRATION LABORATORY
        </div>
      </div>

      {/* Headline & Subtitle */}
      <div className="pt-8 md:pt-10 pb-10 md:pb-12 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-end">
        <div className="lg:col-span-8">
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-normal leading-[1.08] tracking-[-0.01em] text-on-surface">
            Engineered in Stockholm.
            <br className="hidden sm:inline" />
            {" "}Assembled in Geneva.
          </h1>
        </div>
        <div className="lg:col-span-4">
          <p className="font-sans text-sm md:text-[15px] leading-relaxed text-on-surface-variant font-normal max-w-md">
            A dialogue between Scandinavian architectural reduction and
            centuries of Swiss mechanical watchmaking discipline. Calibrated for
            arctic resilience and lifelong chronometric precision.
          </p>
        </div>
      </div>

      {/* Hero Visual Frame (16:9 Studio / Atelier Provenance) */}
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] border border-outline overflow-hidden bg-surface-container-low">
        <Image
          src="/images/hero-granite.jpg"
          alt="Northwatch horological atelier workbench with drafting calipers, precision loupe, and mechanical instrument"
          fill
          priority
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="object-cover grayscale contrast-[1.05]"
        />
        {/* Architectural Overlay Badges */}
        <div className="absolute bottom-3 left-3 md:bottom-6 md:left-6 bg-surface/90 border border-outline px-3 md:px-4 py-1.5 md:py-2 flex items-center space-x-2 md:space-x-3">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-olive" />
          <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-on-surface">
            BENCH REF. ATELIER-SW-04 // 46°12&apos;00&quot;N 06°09&apos;00&quot;E
          </span>
        </div>
        <div className="hidden sm:flex absolute top-3 right-3 md:top-6 md:right-6 bg-surface/90 border border-outline px-3 py-1.5 font-mono text-[10px] tracking-[0.16em] uppercase text-on-surface-variant">
          OBSERVATION STANDARD · ISO 3159
        </div>
      </div>
    </section>
  );
}
