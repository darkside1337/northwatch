"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, SlidersHorizontal, ChevronDown, Check } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

export const MOVEMENT_OPTIONS = [
  { label: "All Movements", value: "" },
  { label: "Automatic", value: "Automatic" },
  { label: "Manual Wind", value: "Manual" },
] as const;

export const STRAP_OPTIONS = [
  { label: "All Straps", value: "" },
  { label: "Olive Canvas", value: "Olive Canvas" },
  { label: "Horween Calfskin", value: "Horween Calfskin" },
  { label: "Milanese Mesh", value: "Milanese Mesh" },
  { label: "Bridle Leather", value: "Bridle Leather" },
  { label: "Shell Cordovan", value: "Shell Cordovan" },
  { label: "FKM Rubber", value: "FKM Rubber" },
  { label: "Titanium Bracelet", value: "Titanium Bracelet" },
] as const;

export const DIAMETER_OPTIONS = [
  { label: "All Diameters", value: "" },
  { label: "37mm", value: "37mm" },
  { label: "38mm", value: "38mm" },
  { label: "39mm", value: "39mm" },
  { label: "40mm", value: "40mm" },
  { label: "41mm", value: "41mm" },
] as const;

export const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Newest Arrivals", value: "newest" },
] as const;

interface CatalogControlsProps {
  totalCount?: number;
  className?: string;
}

export function CatalogControls({
  totalCount,
  className,
}: CatalogControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();

  // URL state
  const currentQuery = searchParams.get("q") ?? "";
  const currentMovement = searchParams.get("movement") ?? "";
  const currentStrap = searchParams.get("strap") ?? "";
  const currentDiameter = searchParams.get("diameter") ?? "";
  const currentSort = searchParams.get("sort") ?? "featured";

  // Local state for debounced search
  const [searchTerm, setSearchTerm] = React.useState(currentQuery);
  const [prevQuery, setPrevQuery] = React.useState(currentQuery);
  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);

  // Sync search input if URL changes externally (e.g. back button or clear) without cascading effect
  if (currentQuery !== prevQuery) {
    setPrevQuery(currentQuery);
    setSearchTerm(currentQuery);
  }

  // Push new query params smoothly using React 19 transition
  const updateFilter = React.useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "featured") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset to page 1 implicitly if offset is added in the future
      params.delete("offset");

      startTransition(() => {
        const queryStr = params.toString();
        router.push(queryStr ? `/products?${queryStr}` : "/products", {
          scroll: false,
        });
      });
    },
    [router, searchParams]
  );

  // Debounced search trigger (300ms)
  React.useEffect(() => {
    if (searchTerm === currentQuery) return;

    const timer = setTimeout(() => {
      updateFilter("q", searchTerm.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, currentQuery, updateFilter]);

  // Clear single filter
  const removeFilter = (key: string) => {
    if (key === "q") {
      setSearchTerm("");
    }
    updateFilter(key, "");
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    startTransition(() => {
      router.push("/products", { scroll: false });
    });
    setMobileDrawerOpen(false);
  };

  // Active filters calculation
  const activeFilters = React.useMemo(() => {
    const list: { key: string; label: string; value: string }[] = [];
    if (currentQuery) list.push({ key: "q", label: "Search", value: `"${currentQuery}"` });
    if (currentMovement) list.push({ key: "movement", label: "Movement", value: currentMovement });
    if (currentStrap) list.push({ key: "strap", label: "Strap", value: currentStrap });
    if (currentDiameter) list.push({ key: "diameter", label: "Size", value: currentDiameter });
    if (currentSort && currentSort !== "featured") {
      const sortLabel = SORT_OPTIONS.find((s) => s.value === currentSort)?.label || currentSort;
      list.push({ key: "sort", label: "Sort", value: sortLabel });
    }
    return list;
  }, [currentQuery, currentMovement, currentStrap, currentDiameter, currentSort]);

  const activeCount = activeFilters.length;

  return (
    <div className={cn("flex flex-col gap-4 mb-8", className)}>
      {/* Top Controls Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Field */}
        <div className="relative flex-1 max-w-md">
          <div className="relative flex items-center border border-outline bg-surface px-3 py-2 focus-within:border-on-surface transition-colors">
            <Search className="w-4 h-4 text-on-surface-variant mr-2.5 shrink-0" strokeWidth={1.5} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reference, calibre, dial..."
              className="w-full bg-transparent font-sans text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none"
              aria-label="Search catalog"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => removeFilter("q")}
                className="p-0.5 text-on-surface-variant hover:text-on-surface transition-colors"
                aria-label="Clear search query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Filter & Sort Drawer Trigger (< 768px) */}
        <div className="flex md:hidden items-center justify-between gap-3">
          <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
            <SheetTrigger
              className={cn(
                "flex-1 inline-flex items-center justify-center gap-2 h-10 px-4 border border-outline bg-surface font-mono text-[11px] uppercase tracking-wider text-on-surface hover:border-on-surface transition-colors"
              )}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Filters &amp; Sort</span>
              {activeCount > 0 && (
                <span className="w-4 h-4 bg-accent text-white flex items-center justify-center text-[9px] font-bold">
                  {activeCount}
                </span>
              )}
            </SheetTrigger>

            <SheetContent
              side="right"
              showCloseButton={false}
              className="w-full max-w-[360px] p-0 flex flex-col justify-between bg-surface border-l border-outline"
            >
              {/* Drawer Header */}
              <div>
                <div className="h-16 px-6 flex items-center justify-between border-b border-outline">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs uppercase tracking-widest text-on-surface font-semibold">
                      Filter Collection
                    </span>
                    {activeCount > 0 && (
                      <span className="bg-surface-container px-2 py-0.5 font-mono text-[10px] text-accent">
                        [{activeCount}]
                      </span>
                    )}
                  </div>
                  <SheetClose className="w-8 h-8 flex items-center justify-center text-on-surface hover:text-accent border border-transparent hover:border-outline transition-colors">
                    <X className="w-4 h-4" />
                    <span className="sr-only">Close Filters</span>
                  </SheetClose>
                </div>

                {/* Drawer Filter Groups */}
                <div className="p-6 space-y-6 max-h-[calc(100vh-140px)] overflow-y-auto">
                  {/* Movement Group */}
                  <div className="space-y-2.5">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-on-surface-variant font-medium">
                      Calibre Movement
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {MOVEMENT_OPTIONS.map((opt) => {
                        const isSelected = currentMovement === opt.value;
                        return (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() => updateFilter("movement", opt.value)}
                            className={cn(
                              "flex items-center justify-between px-3 py-2 text-xs font-sans transition-colors border text-left",
                              isSelected
                                ? "bg-surface-container border-on-surface text-on-surface font-medium"
                                : "bg-surface border-outline text-on-surface-variant hover:text-on-surface hover:border-outline-variant"
                            )}
                          >
                            <span>{opt.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-accent" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Strap Group */}
                  <div className="space-y-2.5">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-on-surface-variant font-medium">
                      Strap Material
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {STRAP_OPTIONS.map((opt) => {
                        const isSelected = currentStrap === opt.value;
                        return (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() => updateFilter("strap", opt.value)}
                            className={cn(
                              "flex items-center justify-between px-3 py-2 text-xs font-sans transition-colors border text-left",
                              isSelected
                                ? "bg-surface-container border-on-surface text-on-surface font-medium"
                                : "bg-surface border-outline text-on-surface-variant hover:text-on-surface hover:border-outline-variant"
                            )}
                          >
                            <span>{opt.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-accent" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Diameter Group */}
                  <div className="space-y-2.5">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-on-surface-variant font-medium">
                      Case Diameter
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {DIAMETER_OPTIONS.map((opt) => {
                        const isSelected = currentDiameter === opt.value;
                        return (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() => updateFilter("diameter", opt.value)}
                            className={cn(
                              "flex items-center justify-between px-3 py-2 text-xs font-mono transition-colors border text-left",
                              isSelected
                                ? "bg-surface-container border-on-surface text-on-surface font-medium"
                                : "bg-surface border-outline text-on-surface-variant hover:text-on-surface hover:border-outline-variant"
                            )}
                          >
                            <span>{opt.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-accent" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sort Group */}
                  <div className="space-y-2.5">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-on-surface-variant font-medium">
                      Sort Sequence
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {SORT_OPTIONS.map((opt) => {
                        const isSelected = currentSort === opt.value;
                        return (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() => updateFilter("sort", opt.value)}
                            className={cn(
                              "flex items-center justify-between px-3 py-2 text-xs font-sans transition-colors border text-left",
                              isSelected
                                ? "bg-surface-container border-on-surface text-on-surface font-medium"
                                : "bg-surface border-outline text-on-surface-variant hover:text-on-surface hover:border-outline-variant"
                            )}
                          >
                            <span>{opt.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-accent" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Bottom Actions */}
              <div className="p-6 border-t border-outline flex gap-3 bg-surface">
                {activeCount > 0 && (
                  <Button
                    variant="outline"
                    size="default"
                    onClick={clearAllFilters}
                    className="flex-1"
                  >
                    Reset
                  </Button>
                )}
                <Button
                  variant="default"
                  size="default"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex-1"
                >
                  Apply
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          {/* Mobile Specimen Counter */}
          {totalCount !== undefined && (
            <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant">
              [{totalCount} {totalCount === 1 ? "Piece" : "Pieces"}]
            </span>
          )}
        </div>

        {/* Desktop Filter Bar Selects (>= 768px) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Movement Select */}
          <div className="relative">
            <select
              value={currentMovement}
              onChange={(e) => updateFilter("movement", e.target.value)}
              className="appearance-none bg-surface border border-outline px-3 py-2 pr-8 font-mono text-xs uppercase tracking-wider text-on-surface hover:border-on-surface focus:outline-none focus:border-on-surface cursor-pointer rounded-none"
              aria-label="Filter by movement"
            >
              {MOVEMENT_OPTIONS.map((opt) => (
                <option key={opt.label} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Strap Select */}
          <div className="relative">
            <select
              value={currentStrap}
              onChange={(e) => updateFilter("strap", e.target.value)}
              className="appearance-none bg-surface border border-outline px-3 py-2 pr-8 font-mono text-xs uppercase tracking-wider text-on-surface hover:border-on-surface focus:outline-none focus:border-on-surface cursor-pointer rounded-none"
              aria-label="Filter by strap material"
            >
              {STRAP_OPTIONS.map((opt) => (
                <option key={opt.label} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Diameter Select */}
          <div className="relative">
            <select
              value={currentDiameter}
              onChange={(e) => updateFilter("diameter", e.target.value)}
              className="appearance-none bg-surface border border-outline px-3 py-2 pr-8 font-mono text-xs uppercase tracking-wider text-on-surface hover:border-on-surface focus:outline-none focus:border-on-surface cursor-pointer rounded-none"
              aria-label="Filter by case diameter"
            >
              {DIAMETER_OPTIONS.map((opt) => (
                <option key={opt.label} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort Select */}
          <div className="relative">
            <select
              value={currentSort}
              onChange={(e) => updateFilter("sort", e.target.value)}
              className="appearance-none bg-surface border border-outline px-3 py-2 pr-8 font-mono text-xs uppercase tracking-wider text-on-surface hover:border-on-surface focus:outline-none focus:border-on-surface cursor-pointer rounded-none"
              aria-label="Sort products"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.label} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Desktop Count Readout */}
          {totalCount !== undefined && (
            <span className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant pl-2 shrink-0">
              [{totalCount} {totalCount === 1 ? "Piece" : "Pieces"}]
            </span>
          )}
        </div>
      </div>

      {/* Active Filter Chips Row */}
      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-outline-variant">
          <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant mr-1">
            Active Filters:
          </span>

          {activeFilters.map((filter) => (
            <div
              key={filter.key}
              className="inline-flex items-center gap-1.5 bg-surface border border-outline px-2.5 py-1 text-xs"
            >
              <span className="font-mono text-[10px] uppercase text-on-surface-variant">
                {filter.label}:
              </span>
              <span className="font-mono text-[11px] text-on-surface font-medium">
                {filter.value}
              </span>
              <button
                type="button"
                onClick={() => removeFilter(filter.key)}
                className="text-on-surface-variant hover:text-on-surface transition-colors ml-0.5 p-0.5"
                aria-label={`Remove filter for ${filter.label}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={clearAllFilters}
            className="font-mono text-[10px] uppercase tracking-wider text-accent hover:underline ml-2"
          >
            Clear All
          </button>

          {/* Pending spinner micro-indicator */}
          {isPending && (
            <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant animate-pulse ml-auto">
              Updating...
            </span>
          )}
        </div>
      )}
    </div>
  );
}
