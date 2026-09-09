"use client";

import { useState } from "react";
import Image from "next/image";
import { ProductWithVariants, ProductVariant } from "../schemas";

interface GalleryPlate {
  id: string;
  label: string;
  sublabel: string;
  src: string;
  alt: string;
}

interface ProductGalleryProps {
  product: ProductWithVariants;
  selectedVariant?: ProductVariant;
}

export function ProductGallery({ product, selectedVariant }: ProductGalleryProps) {
  // Resolve primary image from variant if available, otherwise local studio asset
  const primaryImage =
    selectedVariant?.images?.[0] ||
    product.variants[0]?.images?.[0] ||
    "/images/watch-field-38.jpg";

  // Multi-angle horological studio gallery plates aligned with Stitch PDP
  const plates: GalleryPlate[] = [
    {
      id: "front",
      label: "PLATE 01 // FRONT ELEVATION",
      sublabel: "Dial Face & Bezel Geometry",
      src: primaryImage,
      alt: `${product.title} front dial elevation in 316L stainless steel`,
    },
    {
      id: "caseback",
      label: "PLATE 02 // EXHIBITION CASEBACK",
      sublabel: "Geneva Stripes & Rotor Mechanism",
      src: "/images/watch-movement.jpg",
      alt: `${product.title} exhibition sapphire crystal display back showing calibrated movement`,
    },
    {
      id: "strap",
      label: "PLATE 03 // HORWEEN LEATHER & HARDWARE",
      sublabel: "Chicago Chromexcel & 316L Buckle",
      src: "/images/watch-strap.jpg",
      alt: `${product.title} leather strap and engraved stainless steel buckle`,
    },
    {
      id: "profile",
      label: "PLATE 04 // FLANK ARCHITECTURE",
      sublabel: "10.4mm Profile & Knurled Crown",
      src: "/images/watch-profile.jpg",
      alt: `${product.title} side flank profile showing brushed bevels and knurled crown`,
    },
    {
      id: "macro",
      label: "PLATE 05 // HOROLOGY MACRO LOUPE",
      sublabel: "Brushed Texture & Diamond-Cut Indices",
      src: "/images/hero-chiaroscuro.jpg",
      alt: `${product.title} macro dial detail with chiaroscuro atelier lighting`,
    },
  ];

  const [activePlateIndex, setActivePlateIndex] = useState(0);
  const activePlate = plates[activePlateIndex] ?? plates[0];

  return (
    <div className="w-full">
      {/* 1. Primary Hero Canvas (4:5 Ratio Studio Plate) */}
      <div className="relative aspect-[4/5] w-full bg-[#FFFFFF] border border-outline p-6 sm:p-10 flex items-center justify-center overflow-hidden">
        {/* Architectural Reticle Corner Crosshairs */}
        <span
          aria-hidden="true"
          className="absolute top-2 left-2.5 font-mono text-[11px] text-on-surface-variant/50 select-none pointer-events-none"
        >
          +
        </span>
        <span
          aria-hidden="true"
          className="absolute top-2 right-2.5 font-mono text-[11px] text-on-surface-variant/50 select-none pointer-events-none"
        >
          +
        </span>
        <span
          aria-hidden="true"
          className="absolute bottom-2 left-2.5 font-mono text-[11px] text-on-surface-variant/50 select-none pointer-events-none"
        >
          +
        </span>
        <span
          aria-hidden="true"
          className="absolute bottom-2 right-2.5 font-mono text-[11px] text-on-surface-variant/50 select-none pointer-events-none"
        >
          +
        </span>

        {/* Technical Plate Locator Microtag */}
        <div className="absolute top-4 left-4 z-10 inline-flex items-center space-x-2 border border-outline bg-surface/90 px-2.5 py-1 backdrop-blur-none">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-olive" />
          <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-on-surface font-medium">
            {activePlate.label}
          </span>
        </div>

        {/* Scale Calibration Stamp */}
        <div className="absolute bottom-4 right-4 z-10 border border-outline bg-surface/90 px-2 py-0.5 font-mono text-[10px] tracking-widest text-on-surface-variant uppercase">
          SCALE 1:1
        </div>

        {/* Main Product Specimen Image */}
        <div className="relative w-full h-full flex items-center justify-center transition-opacity duration-300">
          <Image
            src={activePlate.src}
            alt={activePlate.alt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 55vw, 680px"
            priority={activePlateIndex === 0}
            className="object-contain p-2 select-none"
          />
        </div>
      </div>

      {/* 2. 2x2 Architectural Detail Gallery (Stitch PDP Reference) */}
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {plates.slice(1).map((plate, index) => {
          const plateNumber = index + 1; // offset by 1 because front is plate 0
          const isSelected = activePlateIndex === plateNumber;

          return (
            <button
              key={plate.id}
              type="button"
              onClick={() => setActivePlateIndex(plateNumber)}
              aria-label={`Switch to ${plate.label}`}
              aria-pressed={isSelected}
              className={`group relative aspect-[4/3] w-full border text-left bg-[#FFFFFF] transition-colors focus:outline-none focus:ring-1 focus:ring-on-surface ${
                isSelected
                  ? "border-on-surface ring-1 ring-on-surface"
                  : "border-outline hover:border-on-surface-variant"
              }`}
            >
              {/* Thumbnail Image */}
              <div className="relative w-full h-full overflow-hidden p-2">
                <Image
                  src={plate.src}
                  alt={plate.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 160px"
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
              </div>

              {/* Sub-label Bar */}
              <div className="absolute bottom-0 inset-x-0 bg-surface/95 border-t border-outline px-2 py-1">
                <p className="font-mono text-[9px] uppercase tracking-wider text-on-surface font-medium truncate">
                  {plate.sublabel}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
