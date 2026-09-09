import Link from "next/link";
import Image from "next/image";
import { getProducts } from "@/features/catalog/queries";
import { ProductGrid } from "@/features/catalog/components/ProductGrid";
import { SectionHeader } from "@/components/section-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

const HERO_CALIBRATION_METRICS = [
  { label: "Tolerance", value: "±0.015mm" },
  { label: "Alloy", value: "316L Steel" },
  { label: "Power Reserve", value: "41 Hours" },
  { label: "Balance", value: "28,800 VPH" },
] as const;

const ATELIER_STANDARDS = [
  { step: "01", label: "Swiss Mechanical" },
  { step: "02", label: "316L Billet Steel" },
  { step: "03", label: "Mohs 9 Sapphire" },
  { step: "04", label: "10 ATM Tested" },
] as const;

export default async function ShopHomePage() {
  // Fetch featured watches for homepage composition
  const featuredProducts = await getProducts({ limit: 4, sort: "featured" });

  return (
    <div className="flex flex-col w-full bg-surface text-on-surface">
      {/* ===================================================================
          1. CHIAROSCURO MACRO HERO SECTION
          =================================================================== */}
      <section className="w-full bg-surface border-b border-outline">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 md:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column: Horological Narrative & Calibration Matrix */}
            <div className="lg:col-span-6 flex flex-col items-start justify-center pr-0 lg:pr-6">
              {/* Micro-eyebrow */}
              <div className="inline-flex items-center gap-2 mb-4">
                <span
                  className="w-2 h-2 bg-accent rounded-none shrink-0"
                  aria-hidden="true"
                />
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent font-medium">
                  Calibre Specification // Obsidian Study
                </span>
              </div>

              {/* Display Headline */}
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-on-surface uppercase tracking-tight leading-[1.05] mb-6 font-normal">
                Refined by restraint.
              </h1>

              {/* Narrative Editorial Copy */}
              <p className="font-sans text-base sm:text-lg text-on-surface-variant max-w-xl leading-relaxed mb-8">
                Machined from single-billet surgical steel and finished with
                hand-chamfered bevels. Every Northwatch piece undergoes 120 hours
                of chronometric pacing in Geneva before allocation.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-10">
                <Link
                  href="/products"
                  className={buttonVariants({ variant: "default", size: "default" })}
                >
                  Acquire Series 01
                </Link>
                <Link
                  href="/manufacture"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "default" }),
                    "group inline-flex items-center gap-2"
                  )}
                >
                  <span>Examine Specifications</span>
                  <span className="inline-block transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)_and_(pointer:fine)]:group-hover:translate-x-1 motion-reduce:transform-none">
                    →
                  </span>
                </Link>
              </div>

              {/* Horology Technical Data Matrix (4 Columns) */}
              <div className="w-full pt-6 border-t border-outline-variant grid grid-cols-2 sm:grid-cols-4 gap-4">
                {HERO_CALIBRATION_METRICS.map((metric, idx) => (
                  <div
                    key={metric.label}
                    className={cn(
                      "flex flex-col space-y-1",
                      idx > 0 && "sm:border-l sm:border-outline-variant sm:pl-4"
                    )}
                  >
                    <span className="font-mono text-[10px] uppercase text-accent tracking-widest font-medium">
                      {metric.label}
                    </span>
                    <span className="font-mono text-xs text-on-surface font-semibold tabular-nums">
                      {metric.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Hairline Framed Macro Photography Visual */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <div className="relative w-full aspect-[4/3] lg:aspect-[16/11] bg-surface-container-low overflow-hidden border border-outline flex flex-col justify-between p-4 sm:p-6 group">
                <Image
                  src="/images/hero-chiaroscuro.jpg"
                  alt="Extreme macro study of Northwatch dial and knurled crown in surgical steel and obsidian slate."
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />

                {/* Technical Caption Overlay Top */}
                <div className="relative z-10 flex justify-between items-start">
                  <div className="bg-surface border border-outline px-3 py-1">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface">
                      Studio Specimen No. NW-01B // Macro Flank &amp; Crown
                    </span>
                  </div>
                </div>

                {/* Technical Horology Spec Bar Bottom */}
                <div className="relative z-10 flex flex-col sm:flex-row justify-between sm:items-end gap-2 bg-surface p-3 sm:p-4 border border-outline">
                  <div className="flex flex-col">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-accent font-medium">
                      Horology Architecture Spec
                    </span>
                    <span className="font-mono text-xs text-on-surface font-semibold">
                      Surgical 316L Bezel · Sapphire Crystal · 10 ATM
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-on-surface-variant tracking-wider uppercase">
                    Geneva Regulated
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          2. FEATURED COLLECTION SECTION (Mobile-First 2-col / Desktop 4-col)
          =================================================================== */}
      <section className="w-full bg-surface py-16 md:py-24 border-b border-outline">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {/* Section Header Component */}
          <SectionHeader
            eyebrow="Series 01 Catalogue"
            title="The Northwatch Collection"
            description="Designed around restraint. Built for everyday wear with surgical-grade austenitic alloys and high-beat movements."
          />

          {/* Architectural Product Grid Component */}
          <ProductGrid products={featuredProducts} />

          {/* Bottom Manifest Action */}
          <div className="mt-12 text-center">
            <Link
              href="/products"
              className={cn(
                buttonVariants({ variant: "outline", size: "default" }),
                "group inline-flex items-center gap-2"
              )}
            >
              <span>Explore Full Manifest [08 Pieces]</span>
              <span className="inline-block transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)_and_(pointer:fine)]:group-hover:translate-x-1 motion-reduce:transform-none">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ===================================================================
          3. BRAND STATEMENT SECTION (Disciplined Horology)
          =================================================================== */}
      <section className="w-full bg-surface-container-low py-16 md:py-24 border-b border-outline">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column Narrative */}
            <div className="lg:col-span-7 flex flex-col items-start pr-0 lg:pr-8">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent font-medium mb-3">
                Disciplined Horology
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-on-surface mb-6 leading-tight uppercase font-normal">
                Built to outlast trends.
              </h2>
              <div className="w-12 h-px bg-accent mb-6" aria-hidden="true" />
              <p className="font-sans text-base sm:text-lg text-on-surface-variant leading-relaxed mb-8 max-w-xl">
                Northwatch creates watches with disciplined proportions,
                dependable automatic movements, and materials chosen to age
                gracefully. We reject superficial ornament in pursuit of
                balance, legibility, and architectural longevity.
              </p>
              <Link
                href="/manufacture"
                className="group inline-flex items-center gap-2 font-sans text-xs uppercase tracking-[0.14em] font-semibold text-on-surface pb-1 border-b border-on-surface hover:text-accent hover:border-accent transition-colors"
              >
                <span>Discover our manufacture philosophy</span>
                <span className="inline-block transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)_and_(pointer:fine)]:group-hover:translate-x-1 motion-reduce:transform-none">
                  →
                </span>
              </Link>
            </div>

            {/* Right Column Macro Visual */}
            <div className="lg:col-span-5">
              <div className="relative w-full aspect-square bg-surface border border-outline p-4 flex flex-col justify-between">
                <div className="relative w-full h-full">
                  <Image
                    src="/images/hero-granite.jpg"
                    alt="Northwatch timepiece resting on Swedish honed light granite."
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                </div>
                <div className="absolute bottom-6 left-6 right-6 bg-surface border border-outline p-3 flex justify-between items-center text-xs font-mono">
                  <span className="text-accent uppercase tracking-wider">
                    Tolerance ±0.015mm
                  </span>
                  <span className="text-on-surface">316L Austenitic Steel</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          4. ATELIER STANDARDS RAIL
          =================================================================== */}
      <section className="w-full bg-surface py-10 border-b border-outline">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 font-mono text-xs uppercase tracking-widest text-on-surface-variant">
            {ATELIER_STANDARDS.map((standard) => (
              <div key={standard.step} className="flex items-center gap-3">
                <span className="text-accent font-bold">{standard.step}</span>
                <span>{standard.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
