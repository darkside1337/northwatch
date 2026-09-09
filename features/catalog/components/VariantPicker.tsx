"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ProductWithVariants, ProductVariant, formatPriceCents } from "../schemas";
import { useCart } from "@/features/cart";

interface VariantPickerProps {
  product: ProductWithVariants;
  selectedVariant: ProductVariant;
  onVariantChange: (variant: ProductVariant) => void;
}

export function VariantPicker({
  product,
  selectedVariant,
  onVariantChange,
}: VariantPickerProps) {
  const { addItem, openCart, isPending: isCartPending } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isArchived, setIsArchived] = useState(false);

  // Extract available unique strap options
  const strapOptions = Array.from(
    new Set(product.variants.map((v) => v.strapMaterial).filter(Boolean) as string[])
  );

  // Extract available unique dial colors
  const dialOptions = Array.from(
    new Set(product.variants.map((v) => v.dialColor).filter(Boolean) as string[])
  );

  const isOutOfStock = selectedVariant.stock === 0;

  const handleStrapSelect = (strap: string) => {
    // Find variant matching current dial + new strap, or first variant with new strap
    const match =
      product.variants.find(
        (v) => v.strapMaterial === strap && v.dialColor === selectedVariant.dialColor
      ) || product.variants.find((v) => v.strapMaterial === strap);

    if (match) {
      onVariantChange(match);
    }
  };

  const handleDialSelect = (dial: string) => {
    const match =
      product.variants.find(
        (v) => v.dialColor === dial && v.strapMaterial === selectedVariant.strapMaterial
      ) || product.variants.find((v) => v.dialColor === dial);

    if (match) {
      onVariantChange(match);
    }
  };

  const handleAddToBag = async () => {
    if (isOutOfStock || isCartPending) return;

    try {
      await addItem(selectedVariant.id, quantity);
      setIsAdded(true);
      openCart();
      setTimeout(() => {
        setIsAdded(false);
      }, 2000);
    } catch (err) {
      toast.error("Unable to add to bag", {
        description:
          err instanceof Error ? err.message : "Inventory allocation failed.",
      });
    }
  };

  const handleSaveToArchive = () => {
    setIsArchived((prev) => !prev);
    if (!isArchived) {
      toast.success("Saved to Archive", {
        description: `Specimen ${product.referenceCode} bookmarked in session archive.`,
      });
    } else {
      toast.info("Removed from Archive", {
        description: `Specimen ${product.referenceCode} removed from session archive.`,
      });
    }
  };

  const handleBookViewing = () => {
    toast.info("Private Viewing", {
      description: `Viewing request initiated for ${product.title} (${product.referenceCode}) at Stockholm Atelier.`,
    });
  };

  const totalPrice = formatPriceCents(selectedVariant.priceCents * quantity);

  return (
    <div className="flex flex-col space-y-8">
      {/* 1. Series Header & Title */}
      <div className="border-b border-outline pb-6">
        <div className="flex items-center space-x-2 font-mono text-[10px] tracking-[0.2em] uppercase text-accent-olive font-medium mb-3">
          <span>SERIES 01 // ARCHITECTURAL FIELD</span>
          <span>·</span>
          <span>REF. {product.referenceCode}</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-normal tracking-[-0.01em] text-on-surface leading-[1.08] mb-4">
          {product.title}
        </h1>

        <div className="flex items-baseline justify-between pt-2">
          <div className="font-mono text-2xl sm:text-3xl text-on-surface font-medium">
            {formatPriceCents(selectedVariant.priceCents)}
            <span className="text-[12px] text-on-surface-variant font-normal ml-2">USD</span>
          </div>

          {/* Live Inventory Pip */}
          <div className="inline-flex items-center space-x-2 border border-outline bg-surface-container-low px-3 py-1">
            <span
              className={`w-2 h-2 rounded-full ${
                isOutOfStock ? "bg-[#8C887B]" : "bg-accent-olive animate-pulse"
              }`}
            />
            <span className="font-mono text-[11px] tracking-wider uppercase text-on-surface font-medium">
              {isOutOfStock
                ? "Archive Depleted"
                : selectedVariant.stock <= 3
                ? `Low Stock: ${selectedVariant.stock} Left`
                : "In Stock — Dispatches in 24h"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Editorial Lead Description */}
      {product.description && (
        <p className="font-sans text-[15px] leading-[1.65] text-on-surface-variant font-normal">
          {product.description}
        </p>
      )}

      {/* 3. Variant Controls */}
      <div className="space-y-6 pt-2">
        {/* Case Diameter Selector */}
        {product.caseDiameter && (
          <div>
            <div className="flex justify-between items-center text-[11px] font-mono tracking-wider uppercase mb-2.5">
              <span className="text-on-surface-variant">Case Diameter</span>
              <span className="text-on-surface font-medium">{product.caseDiameter}</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="border border-on-surface bg-surface-container-low px-4 py-2 font-mono text-[12px] font-medium text-on-surface"
              >
                {product.caseDiameter.toUpperCase()}
              </button>
            </div>
          </div>
        )}

        {/* Dial Color / Texture Selector */}
        {dialOptions.length > 1 && (
          <div>
            <div className="flex justify-between items-center text-[11px] font-mono tracking-wider uppercase mb-2.5">
              <span className="text-on-surface-variant">Dial Texture</span>
              <span className="text-on-surface font-medium">
                {selectedVariant.dialColor || "Standard"}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {dialOptions.map((dial) => {
                const isSelected = selectedVariant.dialColor === dial;
                return (
                  <button
                    key={dial}
                    type="button"
                    onClick={() => handleDialSelect(dial)}
                    aria-pressed={isSelected}
                    className={`border px-3.5 py-2 font-mono text-[11px] tracking-wider uppercase transition-colors ${
                      isSelected
                        ? "border-on-surface bg-surface-container-low text-on-surface font-medium"
                        : "border-outline hover:border-on-surface-variant text-on-surface-variant bg-surface"
                    }`}
                  >
                    {dial}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Strap Material Selector */}
        {strapOptions.length > 0 && (
          <div>
            <div className="flex justify-between items-center text-[11px] font-mono tracking-wider uppercase mb-2.5">
              <span className="text-on-surface-variant">Strap & Hardware</span>
              <span className="text-on-surface font-medium">
                {selectedVariant.strapMaterial || "Standard"}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {strapOptions.map((strap) => {
                const isSelected = selectedVariant.strapMaterial === strap;
                const matchingVar = product.variants.find((v) => v.strapMaterial === strap);
                const strapOutOfStock = matchingVar?.stock === 0;

                return (
                  <button
                    key={strap}
                    type="button"
                    onClick={() => handleStrapSelect(strap)}
                    aria-pressed={isSelected}
                    className={`flex items-center justify-between p-3 border text-left transition-colors ${
                      isSelected
                        ? "border-on-surface bg-surface-container-low"
                        : "border-outline hover:border-on-surface-variant bg-surface"
                    }`}
                  >
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-wider text-on-surface font-medium">
                        {strap}
                      </p>
                      {strapOutOfStock ? (
                        <p className="font-mono text-[9px] uppercase tracking-wider text-[#8C887B]">
                          Depleted
                        </p>
                      ) : (
                        matchingVar && (
                          <p className="font-mono text-[10px] text-on-surface-variant">
                            {formatPriceCents(matchingVar.priceCents)}
                          </p>
                        )
                      )}
                    </div>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-olive ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quantity Selector */}
        {!isOutOfStock && (
          <div className="flex items-center space-x-4 pt-2">
            <span className="font-mono text-[11px] tracking-wider uppercase text-on-surface-variant">
              Quantity
            </span>
            <div className="inline-flex border border-outline bg-surface">
              <button
                type="button"
                disabled={quantity <= 1}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-1 font-mono text-[13px] hover:bg-surface-container-low disabled:opacity-30 disabled:hover:bg-transparent"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="px-4 py-1 font-mono text-[13px] border-x border-outline flex items-center">
                {quantity}
              </span>
              <button
                type="button"
                disabled={quantity >= Math.min(5, selectedVariant.stock)}
                onClick={() =>
                  setQuantity((q) => Math.min(Math.min(5, selectedVariant.stock), q + 1))
                }
                className="px-3 py-1 font-mono text-[13px] hover:bg-surface-container-low disabled:opacity-30 disabled:hover:bg-transparent"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Primary CTA & Secondary Action Buttons */}
      <div className="space-y-3 pt-2">
        {/* Primary Acquisition CTA */}
        <button
          type="button"
          disabled={isOutOfStock || isCartPending}
          onClick={handleAddToBag}
          className={`w-full py-4 px-6 text-[13px] font-semibold tracking-[0.16em] uppercase rounded-none transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-on-surface select-none ${
            isOutOfStock
              ? "bg-outline text-on-surface-variant/60 cursor-not-allowed border border-outline"
              : isCartPending
              ? "bg-[#2A2A28] text-white opacity-80 cursor-wait"
              : isAdded
              ? "bg-accent-olive text-white active:scale-[0.98]"
              : "bg-on-surface text-white hover:bg-[#2A2A28] active:scale-[0.98]"
          }`}
        >
          {isOutOfStock
            ? "OUT OF STOCK"
            : isCartPending
            ? "RESERVING REFERENCE..."
            : isAdded
            ? "ADDED TO BAG ✓"
            : `ADD TO BAG — ${totalPrice}`}
        </button>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleBookViewing}
            className="py-3 px-4 border border-outline text-[11px] font-semibold tracking-[0.14em] uppercase text-on-surface hover:bg-surface-container-low transition-colors rounded-none text-center"
          >
            BOOK VIEWING
          </button>
          <button
            type="button"
            onClick={handleSaveToArchive}
            className={`py-3 px-4 border border-outline text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors rounded-none text-center ${
              isArchived
                ? "bg-surface-container-low text-accent-olive font-bold border-accent-olive"
                : "text-on-surface hover:bg-surface-container-low"
            }`}
          >
            {isArchived ? "SAVED TO ARCHIVE ✓" : "SAVE TO ARCHIVE"}
          </button>
        </div>
      </div>

      {/* 5. Three Horological Value Pillars (Stitch Reference) */}
      <div className="border-t border-outline pt-6 space-y-3">
        <div className="flex items-start space-x-3 text-[12px]">
          <span className="font-mono text-accent-olive text-[11px] mt-0.5">01</span>
          <div>
            <p className="font-sans font-medium text-on-surface">Swiss Calibre Elaboré Grade</p>
            <p className="font-sans text-on-surface-variant text-[11px]">
              Regulated in 5 positions at the Stockholm Atelier for chronometer-grade cadence.
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-3 text-[12px] border-t border-outline-variant/60 pt-3">
          <span className="font-mono text-accent-olive text-[11px] mt-0.5">02</span>
          <div>
            <p className="font-sans font-medium text-on-surface">10-Year Mechanical Warranty</p>
            <p className="font-sans text-on-surface-variant text-[11px]">
              Comprehensive atelier guarantee covering gear trains, balance assemblies, and escapements.
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-3 text-[12px] border-t border-outline-variant/60 pt-3">
          <span className="font-mono text-accent-olive text-[11px] mt-0.5">03</span>
          <div>
            <p className="font-sans font-medium text-on-surface">Complimentary FedEx Express</p>
            <p className="font-sans text-on-surface-variant text-[11px]">
              Carbon-neutral, fully insured delivery in a bespoke solid ash wood presentation case.
            </p>
          </div>
        </div>
      </div>

      {/* 6. Atelier Verification Card */}
      <div className="relative border border-outline bg-surface-container-low/40 p-4 sm:p-5">
        <span
          aria-hidden="true"
          className="absolute top-1.5 left-2 font-mono text-[10px] text-on-surface-variant/40"
        >
          +
        </span>
        <span
          aria-hidden="true"
          className="absolute top-1.5 right-2 font-mono text-[10px] text-on-surface-variant/40"
        >
          +
        </span>
        <span
          aria-hidden="true"
          className="absolute bottom-1.5 left-2 font-mono text-[10px] text-on-surface-variant/40"
        >
          +
        </span>
        <span
          aria-hidden="true"
          className="absolute bottom-1.5 right-2 font-mono text-[10px] text-on-surface-variant/40"
        >
          +
        </span>

        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent-olive font-medium mb-1">
          ATELIER VERIFICATION // CHRONOMETER SEAL
        </p>
        <p className="font-sans text-[12px] leading-relaxed text-on-surface-variant">
          Each timepiece is individually numbered, mechanically timed over 240 hours, and delivered
          with a hand-signed Chronometer Certificate.
        </p>
      </div>

      {/* 7. Mobile Sticky Dock (Flush Viewport Bottom Bar) */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 border-t border-outline p-4 flex items-center justify-between gap-4 backdrop-blur-none">
        <div>
          <div className="font-mono text-[15px] font-semibold text-on-surface">
            {formatPriceCents(selectedVariant.priceCents)}
          </div>
          <div className="flex items-center space-x-1.5 font-mono text-[9px] text-on-surface-variant uppercase">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isOutOfStock ? "bg-[#8C887B]" : "bg-accent-olive"
              }`}
            />
            <span>{isOutOfStock ? "Depleted" : "In Stock"}</span>
          </div>
        </div>

        <button
          type="button"
          disabled={isOutOfStock}
          onClick={handleAddToBag}
          className={`flex-1 py-3 px-4 text-[12px] font-semibold tracking-[0.14em] uppercase rounded-none transition-colors ${
            isOutOfStock
              ? "bg-outline text-on-surface-variant/60 cursor-not-allowed"
              : isAdded
              ? "bg-accent-olive text-white"
              : "bg-on-surface text-white hover:bg-[#2A2A28]"
          }`}
        >
          {isOutOfStock ? "OUT OF STOCK" : isAdded ? "ADDED ✓" : "ADD TO BAG"}
        </button>
      </div>
    </div>
  );
}
