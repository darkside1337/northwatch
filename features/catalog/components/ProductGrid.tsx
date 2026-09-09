import { ProductCard, LOCAL_WATCH_IMAGES } from "./ProductCard";
import type { ProductWithVariants } from "../schemas";
import { cn } from "cn";

interface ProductGridProps {
  products: ProductWithVariants[];
  className?: string;
}

export function ProductGrid({ products, className }: ProductGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6",
        className
      )}
    >
      {products.map((product, index) => {
        // Assign a distinct local studio image from public/images
        const localImage = LOCAL_WATCH_IMAGES[index % LOCAL_WATCH_IMAGES.length];

        return (
          <ProductCard
            key={product.id}
            product={product}
            imageSrc={localImage}
          />
        );
      })}
    </div>
  );
}
