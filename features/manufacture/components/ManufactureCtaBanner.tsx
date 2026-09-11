import * as React from "react";
import Link from "next/link";

export function ManufactureCtaBanner() {
  return (
    <section className="mb-16">
      <div className="border border-outline bg-surface p-6 sm:p-10 md:p-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="max-w-xl">
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-on-surface-variant mb-3 flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-olive" />
            <span>HOROLOGICAL PRODUCTION · RESTRAINED EDITIONS</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal text-on-surface mb-3">
            Experience the results of our manufacture.
          </h2>
          <p className="font-sans text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            All active Northwatch references are manufactured in limited seasonal
            batches, individually tested, and accompanied by their certified
            chronometric ledger.
          </p>
        </div>

        <div className="flex-shrink-0 w-full sm:w-auto">
          <Link
            href="/products"
            className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-primary text-on-primary font-sans text-xs tracking-[0.14em] uppercase font-medium hover:bg-primary-hover transition-colors rounded-none text-center"
          >
            <span>Explore Active Collection</span>
            <span className="ml-2">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
