import * as React from "react";
import type { ArchiveSpecimen } from "../types";
import { ArchiveSpecimenCard } from "./ArchiveSpecimenCard";

interface ArchiveGridProps {
  specimens: ArchiveSpecimen[];
}

export function ArchiveGrid({ specimens }: ArchiveGridProps) {
  if (specimens.length === 0) {
    return (
      <section className="w-full bg-surface py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <div className="border border-outline bg-surface-container-low p-12 max-w-lg mx-auto">
            <span className="font-mono text-xs text-on-surface-variant block uppercase mb-2">
              ARCHIVE SEARCH // ZERO MATCHES
            </span>
            <h2 className="font-serif text-2xl text-on-surface font-normal mb-3">
              No matching archival specimens
            </h2>
            <p className="font-sans text-sm text-on-surface-variant mb-6 leading-relaxed">
              No timepieces in our permanent collection match the selected
              filter criteria. Reset your query to view active references.
            </p>
            <a
              href="/archive"
              className="inline-block px-6 py-2.5 bg-primary text-on-primary font-sans text-xs uppercase tracking-wider hover:bg-primary-hover transition-colors"
            >
              Reset Archive Query
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-surface">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 border-t border-l border-outline bg-outline gap-[1px]">
          {specimens.map((specimen) => (
            <ArchiveSpecimenCard key={specimen.id} specimen={specimen} />
          ))}
        </div>
      </div>
    </section>
  );
}
