import * as React from "react";

interface ArchivePaginationProps {
  currentCount: number;
  totalCount: number;
}

export function ArchivePagination({
  currentCount,
  totalCount,
}: ArchivePaginationProps) {
  return (
    <section className="w-full bg-surface pb-16 pt-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="border border-outline p-4 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container-lowest">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-on-surface font-semibold">
              PAGE 01 / 01
            </span>
            <span className="text-outline">|</span>
            <span className="font-mono text-xs text-on-surface-variant">
              SHOWING {currentCount} OF {totalCount} SPECIMENS
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled
              className="px-4 py-1.5 border border-outline text-outline font-sans text-xs uppercase cursor-not-allowed bg-surface-container"
            >
              Previous
            </button>
            <button
              type="button"
              className="px-4 py-1.5 border border-primary bg-primary text-on-primary font-sans text-xs uppercase font-medium"
            >
              1
            </button>
            <button
              type="button"
              disabled
              className="px-4 py-1.5 border border-outline text-outline font-sans text-xs uppercase cursor-not-allowed bg-surface-container"
            >
              Next
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-on-surface-variant font-mono text-[11px]">
            <span>END OF SERIES ARCHIVE</span>
            <span className="w-1.5 h-1.5 rounded-full bg-accent-olive inline-block" />
          </div>
        </div>
      </div>
    </section>
  );
}
