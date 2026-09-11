import Link from "next/link";
import Image from "next/image";

export function BrandStatementSection() {
  return (
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
  );
}
