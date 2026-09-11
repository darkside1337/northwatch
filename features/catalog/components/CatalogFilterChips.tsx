"use client";

import { X } from "lucide-react";

interface FilterChipItem {
  key: string;
  label: string;
  value: string;
}

interface CatalogFilterChipsProps {
  activeFilters: FilterChipItem[];
  onRemoveFilter: (key: string) => void;
  onClearAll: () => void;
  isPending: boolean;
}

export function CatalogFilterChips({
  activeFilters,
  onRemoveFilter,
  onClearAll,
  isPending,
}: CatalogFilterChipsProps) {
  if (activeFilters.length === 0) {
    return null;
  }

  return (
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
            onClick={() => onRemoveFilter(filter.key)}
            className="text-on-surface-variant hover:text-on-surface transition-colors ml-0.5 p-0.5"
            aria-label={`Remove filter for ${filter.label}`}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={onClearAll}
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
  );
}
