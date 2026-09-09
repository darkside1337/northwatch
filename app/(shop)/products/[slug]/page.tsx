import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getProductBySlug, getRelatedProducts } from "@/features/catalog/queries";
import { ProductDetailView } from "@/features/catalog/components/ProductDetailView";
import { ProductGrid } from "@/features/catalog/components/ProductGrid";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Timepiece Not Located — Northwatch",
      description: "The requested horological specimen is not registered in the atelier manifest.",
    };
  }

  const defaultPrice = product.variants[0]?.priceCents
    ? `$${(product.variants[0].priceCents / 100).toFixed(2)} USD`
    : "";

  return {
    title: `${product.title} (${product.referenceCode}) — Northwatch`,
    description:
      product.description ||
      `Minimalist Scandinavian mechanical timepiece. ${product.referenceCode}, ${defaultPrice}.`,
    openGraph: {
      title: `${product.title} — Northwatch Atelier`,
      description: product.description || undefined,
      images: product.variants[0]?.images?.[0]
        ? [{ url: product.variants[0].images[0] }]
        : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.id, 4);

  return (
    <div className="w-full pb-24 md:pb-32">
      {/* 1. Breadcrumbs & Horological Serial Locator Bar (Stitch Reference) */}
      <div className="border-b border-outline bg-surface px-6 md:px-12 py-3 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono tracking-[0.14em] uppercase text-on-surface-variant">
        <nav aria-label="Breadcrumb" className="flex items-center space-x-2">
          <Link href="/products" className="hover:text-on-surface transition-colors">
            COLLECTION
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-on-surface transition-colors">
            FIELD
          </Link>
          <span>/</span>
          <span className="text-on-surface font-medium">REF. {product.referenceCode}</span>
        </nav>

        <div className="flex flex-wrap items-center gap-x-3 text-[10px] text-on-surface-variant/80">
          <span>TOLERANCE: {product.specs?.tolerance || "-4/+6 SEC/DAY"}</span>
          <span>·</span>
          <span>{product.specs?.edition || "ATELIER EDITION: 500 PIECES"}</span>
        </div>
      </div>

      {/* 2. Main Product Content (55/45 Split + Quote + 6-Block Spec Matrix) */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-8 sm:pt-12">
        <ProductDetailView product={product} />

        {/* 3. Related Calibers Rail */}
        {relatedProducts.length > 0 && (
          <section
            aria-label="Related Timepieces"
            className="mt-20 sm:mt-28 pt-12 border-t border-outline"
          >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-outline gap-2">
              <div>
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-accent-olive font-medium block mb-1">
                  ATELIER MANIFEST // COMPLEMENTARY
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-on-surface font-normal">
                  Related Calibers
                </h2>
              </div>
              <Link
                href="/products"
                className="font-mono text-[11px] tracking-widest text-on-surface-variant hover:text-on-surface transition-colors uppercase"
              >
                VIEW FULL MANIFEST →
              </Link>
            </div>

            <ProductGrid products={relatedProducts} />
          </section>
        )}
      </main>
    </div>
  );
}
