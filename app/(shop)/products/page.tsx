import { Suspense } from "react";
import type { Metadata } from "next";
import { getProducts } from "@/features/catalog/queries";
import { ProductSortOption } from "@/features/catalog/schemas";
import { ProductGrid } from "@/features/catalog/components/ProductGrid";
import { ProductGridSkeleton } from "@/features/catalog/components/ProductGridSkeleton";
import { CatalogControls } from "@/features/catalog/components/CatalogControls";
import { CatalogEmptyState } from "@/features/catalog/components/CatalogEmptyState";
import { SectionHeader } from "@/components/section-header";

export const metadata: Metadata = {
  title: "Catalog // Series 01 Timepieces — Northwatch",
  description:
    "Explore the complete Northwatch manifest. Boutique mechanical watches engineered under Scandinavian reduction and chronometer-grade tolerances.",
};

interface ProductsPageProps {
  searchParams: Promise<{
    q?: string;
    movement?: string;
    strap?: string;
    diameter?: string;
    sort?: string;
  }>;
}

async function ProductGridContainer({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    movement?: string;
    strap?: string;
    diameter?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;
  const parsedSort = ProductSortOption.safeParse(params.sort);
  const sort = parsedSort.success ? parsedSort.data : "featured";

  const products = await getProducts({
    query: params.q,
    movement: params.movement,
    strapMaterial: params.strap,
    caseDiameter: params.diameter,
    sort,
  });

  if (products.length === 0) {
    return <CatalogEmptyState query={params.q} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-xs font-mono text-on-surface-variant pb-2 border-b border-outline-variant">
        <span className="uppercase tracking-wider">
          Registry // Series 01
        </span>
        <span className="uppercase tracking-widest text-[11px]">
          [{products.length} {products.length === 1 ? "Specimen" : "Specimens"}]
        </span>
      </div>

      <ProductGrid products={products} />
    </div>
  );
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <div className="w-full bg-surface text-on-surface py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Architectural Section Header */}
        <SectionHeader
          eyebrow="Series 01 Manifest"
          title="Active Collection"
          description="Boutique mechanical chronometers designed under Scandinavian architectural reduction. Each specimen hand-regulated in Geneva."
          badge="Swiss Calibre"
        />

        {/* Client Filter Controls wrapped in Suspense for useSearchParams */}
        <Suspense fallback={<div className="h-10 mb-8 border border-outline bg-surface animate-pulse" />}>
          <CatalogControls />
        </Suspense>

        {/* Suspense Streaming Grid: searchParams awaited inside container */}
        <Suspense fallback={<ProductGridSkeleton count={4} />}>
          <ProductGridContainer searchParams={searchParams} />
        </Suspense>

        {/* Atelier Technical Footnote */}
        <div className="mt-16 pt-8 border-t border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[11px] font-mono text-on-surface-variant uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-accent rounded-none inline-block" />
            <span>Stockholm Studio Design · Geneva Assembly</span>
          </div>
          <span>Chronometer Pacing Standard: 120 Hours</span>
        </div>
      </div>
    </div>
  );
}
