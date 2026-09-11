"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, X, ChevronsUpDown } from "lucide-react";
import type { ArchiveFilterState } from "../types";

interface ArchiveFilterBarProps {
  filters: ArchiveFilterState;
}

export function ArchiveFilterBar({ filters }: ArchiveFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === "featured" || !value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    // Always reset page to 1 when changing filters
    params.delete("page");
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`);
  };

  const handleReset = () => {
    router.push(pathname);
  };

  const hasActiveFilters =
    filters.dial !== "all" ||
    filters.caseSize !== "all" ||
    filters.movement !== "all" ||
    filters.material !== "all";

  return (
    <section className="w-full bg-surface sticky top-16 z-30 border-b border-outline">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Facets */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Dial */}
            <div className="relative inline-block text-left">
              <select
                aria-label="Filter by dial color"
                value={filters.dial}
                onChange={(e) => updateParam("dial", e.target.value)}
                className="appearance-none bg-surface border border-outline px-3 py-1.5 font-sans text-xs uppercase text-on-surface hover:border-primary focus:outline-none cursor-pointer pr-8 rounded-none transition-colors"
              >
                <option value="all">Dial: All</option>
                <option value="slate">Basalt Slate</option>
                <option value="arctic">Arctic White</option>
                <option value="forest">Forest Green</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface pointer-events-none" />
            </div>

            {/* Case */}
            <div className="relative inline-block text-left">
              <select
                aria-label="Filter by case size"
                value={filters.caseSize}
                onChange={(e) => updateParam("caseSize", e.target.value)}
                className="appearance-none bg-surface border border-outline px-3 py-1.5 font-sans text-xs uppercase text-on-surface hover:border-primary focus:outline-none cursor-pointer pr-8 rounded-none transition-colors"
              >
                <option value="all">Case: All</option>
                <option value="38mm">38mm</option>
                <option value="39mm">39mm</option>
                <option value="40mm">40mm</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface pointer-events-none" />
            </div>

            {/* Movement */}
            <div className="relative inline-block text-left">
              <select
                aria-label="Filter by movement type"
                value={filters.movement}
                onChange={(e) => updateParam("movement", e.target.value)}
                className="appearance-none bg-surface border border-outline px-3 py-1.5 font-sans text-xs uppercase text-on-surface hover:border-primary focus:outline-none cursor-pointer pr-8 rounded-none transition-colors"
              >
                <option value="all">Movement: All</option>
                <option value="automatic">Swiss Automatic</option>
                <option value="hand-wound">Hand-Wound</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface pointer-events-none" />
            </div>

            {/* Material */}
            <div className="relative inline-block text-left">
              <select
                aria-label="Filter by material"
                value={filters.material}
                onChange={(e) => updateParam("material", e.target.value)}
                className="appearance-none bg-surface border border-outline px-3 py-1.5 font-sans text-xs uppercase text-on-surface hover:border-primary focus:outline-none cursor-pointer pr-8 rounded-none transition-colors"
              >
                <option value="all">Material: All</option>
                <option value="steel">316L Austenitic Steel</option>
                <option value="dlc">DLC Matte Basalt</option>
                <option value="monolithic">Gunmetal 316L</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface pointer-events-none" />
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 font-sans text-xs uppercase text-on-surface-variant hover:text-on-surface transition-colors px-2 py-1.5"
              >
                <X className="w-3.5 h-3.5" />
                Clear All
              </button>
            )}
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2 ml-auto">
            <label
              htmlFor="sort-specimens"
              className="font-sans text-xs uppercase text-on-surface-variant hidden lg:inline-block"
            >
              Order:
            </label>
            <div className="relative inline-block text-left">
              <select
                id="sort-specimens"
                aria-label="Order specimens"
                value={filters.sort}
                onChange={(e) => updateParam("sort", e.target.value)}
                className="appearance-none bg-surface border border-outline px-3 py-1.5 font-sans text-xs uppercase text-on-surface hover:border-primary focus:outline-none cursor-pointer pr-8 rounded-none transition-colors"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="dia-asc">Diameter: 38mm to 40mm</option>
                <option value="cal">Calibre Architecture</option>
              </select>
              <ChevronsUpDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Active Query Strip */}
        <div className="py-2 border-t border-outline flex items-center justify-between text-on-surface-variant">
          <div className="flex items-center gap-3 overflow-x-auto py-0.5 no-scrollbar">
            <span className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
              Active Query:
            </span>
            <span className="font-mono text-[11px] uppercase bg-surface-container px-2 py-0.5 border border-outline text-on-surface whitespace-nowrap">
              CALIBRE: {filters.movement.toUpperCase()}
            </span>
            <span className="font-mono text-[11px] uppercase bg-surface-container px-2 py-0.5 border border-outline text-on-surface whitespace-nowrap">
              CASE: {filters.caseSize.toUpperCase()}
            </span>
            <span className="font-mono text-[11px] uppercase bg-surface-container px-2 py-0.5 border border-outline text-on-surface whitespace-nowrap">
              DIAL: {filters.dial.toUpperCase()}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2 font-mono text-[11px] text-on-surface-variant whitespace-nowrap">
            <span className="w-1.5 h-1.5 bg-outline inline-block" />
            <span>CHOPIN SWISS REGULATION ±4 SEC/DAY</span>
          </div>
        </div>
      </div>
    </section>
  );
}
