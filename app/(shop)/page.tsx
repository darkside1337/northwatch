import Link from "next/link";
import { getProducts } from "@/features/catalog/queries";
import { ProductGrid } from "@/features/catalog/components/ProductGrid";
import { HeroSection } from "@/features/catalog/components/HeroSection";
import { BrandStatementSection } from "@/features/catalog/components/BrandStatementSection";
import { AtelierStandardsRail } from "@/features/catalog/components/AtelierStandardsRail";
import { SectionHeader } from "@/components/section-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

export default async function ShopHomePage() {
  // Fetch featured watches for homepage composition
  const featuredProducts = await getProducts({ limit: 4, sort: "featured" });

  return (
    <div className="flex flex-col w-full bg-surface text-on-surface">
      {/* 1. Macro Visual Study & Calibration Hero */}
      <HeroSection />

      {/* 2. Featured Collection Grid */}
      <section className="w-full bg-surface py-16 md:py-24 border-b border-outline">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <SectionHeader
            eyebrow="Series 01 Catalogue"
            title="The Northwatch Collection"
            description="Designed around restraint. Built for everyday wear with surgical-grade austenitic alloys and high-beat movements."
          />

          <ProductGrid products={featuredProducts} />

          <div className="mt-12 text-center">
            <Link
              href="/products"
              className={cn(
                buttonVariants({ variant: "outline", size: "default" }),
                "group inline-flex items-center gap-2"
              )}
            >
              <span>Explore Full Manifest [08 Pieces]</span>
              <span className="inline-block transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)_and_(pointer:fine)]:group-hover:translate-x-1 motion-reduce:transform-none">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Disciplined Horology Brand Narrative */}
      <BrandStatementSection />

      {/* 4. Atelier Mechanical Standards Rail */}
      <AtelierStandardsRail />
    </div>
  );
}
