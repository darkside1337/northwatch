"use client";

import { ChevronDown } from "lucide-react";
import {
  MOVEMENT_OPTIONS,
  STRAP_OPTIONS,
  DIAMETER_OPTIONS,
  SORT_OPTIONS,
} from "../constants";

interface CatalogDesktopFilterBarProps {
  currentMovement: string;
  currentStrap: string;
  currentDiameter: string;
  currentSort: string;
  totalCount?: number;
  onUpdateFilter: (key: string, value: string) => void;
}

interface FilterDropdownConfig {
  key: string;
  value: string;
  ariaLabel: string;
  options: readonly { label: string; value: string }[];
}

export function CatalogDesktopFilterBar({
  currentMovement,
  currentStrap,
  currentDiameter,
  currentSort,
  totalCount,
  onUpdateFilter,
}: CatalogDesktopFilterBarProps) {
  const dropdowns: FilterDropdownConfig[] = [
    {
      key: "movement",
      value: currentMovement,
      ariaLabel: "Filter by movement",
      options: MOVEMENT_OPTIONS,
    },
    {
      key: "strap",
      value: currentStrap,
      ariaLabel: "Filter by strap material",
      options: STRAP_OPTIONS,
    },
    {
      key: "diameter",
      value: currentDiameter,
      ariaLabel: "Filter by case diameter",
      options: DIAMETER_OPTIONS,
    },
    {
      key: "sort",
      value: currentSort,
      ariaLabel: "Sort products",
      options: SORT_OPTIONS,
    },
  ];

  return (
    <div className="hidden md:flex items-center gap-3">
      {dropdowns.map((dropdown) => (
        <div key={dropdown.key} className="relative">
          <select
            value={dropdown.value}
            onChange={(e) => onUpdateFilter(dropdown.key, e.target.value)}
            className="appearance-none bg-surface border border-outline px-3 py-2 pr-8 font-mono text-xs uppercase tracking-wider text-on-surface hover:border-on-surface focus:outline-none focus:border-on-surface cursor-pointer rounded-none"
            aria-label={dropdown.ariaLabel}
          >
            {dropdown.options.map((opt) => (
              <option key={opt.label} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      ))}

      {/* Desktop Count Readout */}
      {totalCount !== undefined && (
        <span className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant pl-2 shrink-0">
          [{totalCount} {totalCount === 1 ? "Piece" : "Pieces"}]
        </span>
      )}
    </div>
  );
}
