import { ProductCard } from "./ProductCard";
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
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
