import * as React from "react";
import type { ArchiveFilterState, ArchiveSpecimen } from "../types";
import { ArchiveHeader } from "./ArchiveHeader";
import { ArchiveFilterBar } from "./ArchiveFilterBar";
import { ArchiveGrid } from "./ArchiveGrid";
import { ArchiveTechBanner } from "./ArchiveTechBanner";
import { ArchivePagination } from "./ArchivePagination";

interface ArchiveViewProps {
  specimens: ArchiveSpecimen[];
  filters: ArchiveFilterState;
}

export function ArchiveView({ specimens, filters }: ArchiveViewProps) {
  return (
    <div className="flex flex-col w-full">
      <ArchiveHeader specimenCount={specimens.length} />
      <ArchiveFilterBar filters={filters} />
      <ArchiveGrid specimens={specimens} />
      <ArchiveTechBanner />
      <ArchivePagination currentCount={specimens.length} totalCount={12} />
    </div>
  );
}
