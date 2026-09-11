"use client";

import * as React from "react";
import { X, SlidersHorizontal, Check } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "cn";
import {
  MOVEMENT_OPTIONS,
  STRAP_OPTIONS,
  DIAMETER_OPTIONS,
  SORT_OPTIONS,
} from "../constants";

interface CatalogFilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeCount: number;
  currentMovement: string;
  currentStrap: string;
  currentDiameter: string;
  currentSort: string;
  totalCount?: number;
  onUpdateFilter: (key: string, value: string) => void;
  onClearAll: () => void;
}

export function CatalogFilterDrawer({
  open,
  onOpenChange,
  activeCount,
  currentMovement,
  currentStrap,
  currentDiameter,
  currentSort,
  totalCount,
  onUpdateFilter,
  onClearAll,
}: CatalogFilterDrawerProps) {
  return (
    <div className="flex md:hidden items-center justify-between gap-3">
      <Sheet open={open} onOpenChange={onOpenChange}>
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
                        onClick={() => onUpdateFilter("movement", opt.value)}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 text-xs font-sans transition-colors border text-left",
                          isSelected
                            ? "bg-surface-container border-on-surface text-on-surface font-medium"
                            : "bg-surface border-outline text-on-surface-variant hover:text-on-surface hover:border-outline-variant"
                        )}
                      >
                        <span>{opt.label}</span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-accent" />
                        )}
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
                        onClick={() => onUpdateFilter("strap", opt.value)}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 text-xs font-sans transition-colors border text-left",
                          isSelected
                            ? "bg-surface-container border-on-surface text-on-surface font-medium"
                            : "bg-surface border-outline text-on-surface-variant hover:text-on-surface hover:border-outline-variant"
                        )}
                      >
                        <span>{opt.label}</span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-accent" />
                        )}
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
                        onClick={() => onUpdateFilter("diameter", opt.value)}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 text-xs font-mono transition-colors border text-left",
                          isSelected
                            ? "bg-surface-container border-on-surface text-on-surface font-medium"
                            : "bg-surface border-outline text-on-surface-variant hover:text-on-surface hover:border-outline-variant"
                        )}
                      >
                        <span>{opt.label}</span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-accent" />
                        )}
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
                        onClick={() => onUpdateFilter("sort", opt.value)}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 text-xs font-sans transition-colors border text-left",
                          isSelected
                            ? "bg-surface-container border-on-surface text-on-surface font-medium"
                            : "bg-surface border-outline text-on-surface-variant hover:text-on-surface hover:border-outline-variant"
                        )}
                      >
                        <span>{opt.label}</span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-accent" />
                        )}
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
                onClick={onClearAll}
                className="flex-1"
              >
                Reset
              </Button>
            )}
            <Button
              variant="default"
              size="default"
              onClick={() => onOpenChange(false)}
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
  );
}
