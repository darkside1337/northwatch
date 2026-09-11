import { Suspense } from "react";
import type { Metadata } from "next";
import {
  archiveFilterSchema,
  getArchiveSpecimens,
  ArchiveView,
} from "@/features/archive";

export const metadata: Metadata = {
  title: "The Archive — Northwatch",
  description:
    "Series Archive and permanent specimen collection of precision Northwatch timepieces. Cold-rolled 316L austenitic steel and Swiss automatic calibers.",
};

interface ArchivePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function ArchiveSkeleton() {
  return (
    <div className="w-full bg-surface min-h-[600px] animate-pulse">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="h-8 w-48 bg-surface-container mb-4" />
        <div className="h-12 w-96 bg-surface-container mb-8" />
        <div className="h-10 w-full bg-surface-container mb-12" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square bg-surface-container" />
          ))}
        </div>
      </div>
    </div>
  );
}

async function ArchiveContent({ searchParams }: ArchivePageProps) {
  const resolvedSearchParams = await searchParams;

  const parsedFilters = archiveFilterSchema.parse({
    dial: resolvedSearchParams.dial,
    caseSize: resolvedSearchParams.caseSize,
    movement: resolvedSearchParams.movement,
    material: resolvedSearchParams.material,
    sort: resolvedSearchParams.sort,
    page: resolvedSearchParams.page,
  });

  const specimens = getArchiveSpecimens(parsedFilters);

  return <ArchiveView specimens={specimens} filters={parsedFilters} />;
}

export default function ArchivePage({ searchParams }: ArchivePageProps) {
  return (
    <Suspense fallback={<ArchiveSkeleton />}>
      <ArchiveContent searchParams={searchParams} />
    </Suspense>
  );
}
