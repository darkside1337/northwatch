import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/config/site";
import type { ProductWithVariants } from "../schemas";
import { cn } from "cn";

export const LOCAL_WATCH_IMAGES = [
  "/images/watch-field-38.jpg",
  "/images/watch-profile.jpg",
  "/images/watch-movement.jpg",
  "/images/watch-strap.jpg",
  "/images/hero-basalt.jpg",
  "/images/hero-granite.jpg",
] as const;

interface ProductCardProps {
  product: ProductWithVariants;
  imageSrc?: string;
  className?: string;
}

export function ProductCard({
  product,
  imageSrc,
  className,
}: ProductCardProps) {
  // Determine primary display variant and pricing
  const defaultVariant = product.variants[0];
  const minPriceCents = product.variants.reduce(
    (min, v) => (v.priceCents < min ? v.priceCents : min),
    defaultVariant ? defaultVariant.priceCents : 0
  );

  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const isInStock = totalStock > 0;

  // Prioritize imageSrc prop, then database-backed variant images, then local studio fallback
  const primaryImage =
    imageSrc ||
    defaultVariant?.images?.[0] ||
    LOCAL_WATCH_IMAGES[0];

  // Build concise spec summary: e.g. "38mm · Automatic 4Hz · 10 ATM"
  const specParts = [
    product.caseDiameter,
    product.movement?.split("(")[0]?.trim(),
    defaultVariant?.strapMaterial,
  ].filter(Boolean);
  const specLine = specParts.join(" · ");

  return (
    <article
      className={cn(
        "group flex flex-col bg-surface-container-lowest border border-outline hover:border-on-surface transition-colors duration-300",
        className
      )}
    >
      <Link
        href={`/products/${product.slug}`}
        className="flex flex-col flex-1"
        aria-label={`View ${product.title}`}
      >
        {/* Visual Stage (4:5 Aspect Ratio) */}
        <div className="relative aspect-[4/5] w-full bg-surface-container-low overflow-hidden border-b border-outline-variant flex items-center justify-center p-6">
          {/* Reference Microtag Pill */}
          <div className="absolute top-3 left-3 z-10 bg-surface/90 border border-outline px-2 py-0.5 select-none">
            <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface">
              {product.referenceCode}
            </span>
          </div>

          {/* Watch Image with subtle hover zoom */}
          <div className="relative w-full h-full">
            <Image
              src={primaryImage}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-[1.02] motion-reduce:transform-none"
            />
          </div>
        </div>

        {/* Card Metadata & Actions */}
        <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-serif text-lg sm:text-xl font-normal tracking-tight text-on-surface group-hover:text-accent transition-colors truncate">
                {product.title}
              </h3>
              <span className="font-sans text-sm sm:text-base font-semibold text-on-surface tabular-nums shrink-0">
                {formatPrice(minPriceCents)}
              </span>
            </div>

            {specLine && (
              <p className="font-sans text-xs text-on-surface-variant truncate">
                {specLine}
              </p>
            )}
          </div>

          {/* Card Footer: Stock Status & Text Action Link */}
          <div className="pt-3 border-t border-outline-variant flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  isInStock ? "bg-accent" : "bg-on-surface-variant"
                )}
                aria-hidden="true"
              />
              <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant">
                {isInStock ? "In Stock" : "Retired"}
              </span>
            </div>

            <span className="font-sans text-xs uppercase tracking-[0.1em] text-on-surface inline-flex items-center gap-1">
              Inspect{" "}
              <span className="inline-block transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)_and_(pointer:fine)]:group-hover:translate-x-1 motion-reduce:transform-none">
                →
              </span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
