"use client";

import { useState } from "react";
import { ProductWithVariants, ProductVariant } from "../schemas";
import { ProductGallery } from "./ProductGallery";
import { VariantPicker } from "./VariantPicker";
import { SpecMatrix } from "./SpecMatrix";
import { EditorialQuote } from "./EditorialQuote";

interface ProductDetailViewProps {
  product: ProductWithVariants;
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  // Default to first variant (sorted by lowest price from query)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0] || {
      id: "fallback",
      productId: product.id,
      sku: product.referenceCode,
      name: "Standard Reference",
      dialColor: null,
      strapMaterial: null,
      caseFinish: null,
      priceCents: 38000,
      stock: 10,
      images: [],
    }
  );

  return (
    <div className="w-full space-y-16">
      {/* 55% Gallery / 45% Action Split Grid (Desktop: 7 cols / 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Left Column: 55% Sticky Gallery */}
        <div className="lg:col-span-7 lg:sticky lg:top-24">
          <ProductGallery product={product} selectedVariant={selectedVariant} />
        </div>

        {/* Right Column: 45% Specifications & Acquisition Controls */}
        <div className="lg:col-span-5">
          <VariantPicker
            product={product}
            selectedVariant={selectedVariant}
            onVariantChange={setSelectedVariant}
          />
        </div>
      </div>

      {/* Editorial Pull Quote */}
      <EditorialQuote
        quote={product.editorialQuote}
        author={product.quoteAuthor}
      />

      {/* 6-Block Horological Spec Matrix */}
      <SpecMatrix
        product={product}
        selectedVariant={selectedVariant}
      />
    </div>
  );
}
