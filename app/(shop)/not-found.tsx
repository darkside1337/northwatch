import Link from "next/link";

export default function ShopNotFound() {
  return (
    <div className="flex-1 min-h-[75vh] flex items-center justify-center px-4 py-16 md:py-24">
      {/* Central Error Container (Architectural Calibration Reticle - Stitch 9023a4fd90824b71b42e3b505634c7d2) */}
      <div className="relative w-full max-w-2xl bg-surface-container-lowest border border-outline p-8 sm:p-14 md:p-16 mx-auto">
        {/* Architectural Corner Crosshairs */}
        <div
          aria-hidden="true"
          className="absolute -top-2.5 -left-2.5 font-mono text-[10px] text-on-surface-variant bg-surface px-1 tracking-widest select-none"
        >
          +
        </div>
        <div
          aria-hidden="true"
          className="absolute -top-2.5 -right-2.5 font-mono text-[10px] text-on-surface-variant bg-surface px-1 tracking-widest select-none"
        >
          +
        </div>
        <div
          aria-hidden="true"
          className="absolute -bottom-2.5 -left-2.5 font-mono text-[10px] text-on-surface-variant bg-surface px-1 tracking-widest select-none"
        >
          +
        </div>
        <div
          aria-hidden="true"
          className="absolute -bottom-2.5 -right-2.5 font-mono text-[10px] text-on-surface-variant bg-surface px-1 tracking-widest select-none"
        >
          +
        </div>

        {/* Reticle Hairline Target Lines */}
        <div aria-hidden="true" className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[1px] bg-accent-olive" />
        <div aria-hidden="true" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[1px] bg-accent-olive" />
        <div aria-hidden="true" className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[1px] bg-accent-olive" />
        <div aria-hidden="true" className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-[1px] bg-accent-olive" />

        <div className="text-center flex flex-col items-center">
          {/* Eyebrow / Monospace Calibration Metadata */}
          <div className="inline-flex items-center space-x-2.5 border border-outline bg-surface-container-low px-3.5 py-1 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-olive" />
            <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-on-surface font-medium">
              ERR // CALIBRATION_DISCREPANCY // 404
            </span>
          </div>

          {/* Calibration Reticle Graphic */}
          <div
            aria-hidden="true"
            className="w-20 h-20 mb-8 relative flex items-center justify-center select-none"
          >
            {/* Circular Dial Reticle */}
            <div className="absolute inset-0 rounded-full border border-outline" />
            <div className="absolute inset-2 rounded-full border border-outline-variant border-dashed" />
            {/* Precision Crosshairs */}
            <div className="absolute w-full h-[1px] bg-outline" />
            <div className="absolute h-full w-[1px] bg-outline" />
            {/* Central Pivot Pip */}
            <div className="w-2 h-2 rounded-full bg-on-surface z-10" />
            {/* Calibre Deviation Indicators */}
            <span className="absolute -top-3 font-mono text-[9px] tracking-widest text-on-surface-variant">
              00.00°
            </span>
            <span className="absolute -bottom-3 font-mono text-[9px] tracking-widest text-on-surface-variant">
              ±0.00s
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="font-serif text-4xl sm:text-5xl md:text-[52px] font-normal tracking-[-0.01em] text-on-surface leading-[1.08] mb-4">
            Reference Not Located
          </h1>

          {/* Editorial Sub-headline / Telemetry Note */}
          <p className="font-mono text-[11px] tracking-[0.12em] text-accent-olive uppercase mb-6">
            INDEX RECALIBRATION REQUIRED · OSCILLATION NULL
          </p>

          {/* Editorial Body Copy */}
          <p className="font-sans text-[15px] leading-[1.65] text-on-surface-variant max-w-[440px] text-center mb-10 font-normal">
            The timepiece reference or journal archive you requested cannot be located in the current
            manifest. It may have been retired to the vault or re-indexed.
          </p>

          {/* Architectural Telemetry Bar */}
          <div className="w-full max-w-md border-y border-outline-variant py-2.5 mb-10 grid grid-cols-3 text-center text-[10px] font-mono tracking-wider text-on-surface-variant">
            <div>
              CODE: <span className="text-on-surface font-medium">NULL_PTR</span>
            </div>
            <div className="border-x border-outline-variant">
              STATUS: <span className="text-on-surface font-medium">UNSYNCHRONIZED</span>
            </div>
            <div>
              CADENCE: <span className="text-on-surface font-medium">0 VPH</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
            <Link
              href="/products"
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center bg-on-surface text-white text-[12px] font-semibold tracking-[0.14em] uppercase py-3.5 px-6 rounded-none hover:bg-[#2A2A28] transition-colors"
            >
              RETURN TO CATALOG &nbsp;→
            </Link>
            <Link
              href="/products"
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center bg-transparent border border-outline text-on-surface text-[12px] font-semibold tracking-[0.14em] uppercase py-3.5 px-6 rounded-none hover:bg-surface-container-low transition-colors"
            >
              EXPLORE ARCHIVE
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
