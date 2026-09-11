"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "cn";
import {
  MOVEMENT_OPTIONS,
  STRAP_OPTIONS,
  DIAMETER_OPTIONS,
  SORT_OPTIONS,
} from "../constants";
import { CatalogFilterDrawer } from "./CatalogFilterDrawer";
import { CatalogFilterChips } from "./CatalogFilterChips";
import { CatalogDesktopFilterBar } from "./CatalogDesktopFilterBar";

export {
  MOVEMENT_OPTIONS,
  STRAP_OPTIONS,
  DIAMETER_OPTIONS,
  SORT_OPTIONS,
};

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

  // Sync search input if URL changes externally without cascading effect
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

        {/* Mobile Filter & Sort Drawer (< 768px) */}
        <CatalogFilterDrawer
          open={mobileDrawerOpen}
          onOpenChange={setMobileDrawerOpen}
          activeCount={activeCount}
          currentMovement={currentMovement}
          currentStrap={currentStrap}
          currentDiameter={currentDiameter}
          currentSort={currentSort}
          totalCount={totalCount}
          onUpdateFilter={updateFilter}
          onClearAll={clearAllFilters}
        />

        {/* Desktop Filter Bar Selects (>= 768px) */}
        <CatalogDesktopFilterBar
          currentMovement={currentMovement}
          currentStrap={currentStrap}
          currentDiameter={currentDiameter}
          currentSort={currentSort}
          totalCount={totalCount}
          onUpdateFilter={updateFilter}
        />
      </div>

      {/* Active Filter Chips Row */}
      <CatalogFilterChips
        activeFilters={activeFilters}
        onRemoveFilter={removeFilter}
        onClearAll={clearAllFilters}
        isPending={isPending}
      />
    </div>
  );
}
