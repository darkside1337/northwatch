import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/config/site";
import type { ArchiveSpecimen } from "../types";

interface ArchiveSpecimenCardProps {
  specimen: ArchiveSpecimen;
}

export function ArchiveSpecimenCard({ specimen }: ArchiveSpecimenCardProps) {
  const targetHref = specimen.productSlug
    ? `/products/${specimen.productSlug}`
    : "/products";

  return (
    <article className="bg-surface group flex flex-col justify-between transition-colors hover:bg-surface-container-low">
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-xs text-on-surface-variant uppercase tracking-wider">
            {specimen.refCode}
          </span>
          <span className="font-sans text-[11px] text-on-surface-variant uppercase tracking-wider">
            {specimen.indexNumber}
          </span>
        </div>

        <div className="w-full aspect-square bg-surface-container-lowest border border-outline overflow-hidden mb-4 relative flex items-center justify-center">
          <div className="relative w-full h-full p-4 sm:p-6">
            <Image
              src={specimen.image}
              alt={specimen.altText}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              className="object-contain p-2 group-hover:scale-[1.03] transition-transform duration-500 ease-out"
            />
          </div>
          <div className="absolute top-2 left-2 bg-surface border border-outline px-1.5 py-0.5 font-mono text-[10px] text-on-surface uppercase">
            {specimen.diameter.toUpperCase()}
          </div>
        </div>

        <h2 className="font-serif text-xl sm:text-2xl text-on-surface font-normal mb-1 leading-snug">
          {specimen.title}
        </h2>
        <p className="font-sans text-xs sm:text-sm text-on-surface-variant mb-4">
          {specimen.specsSummary}
        </p>
      </div>

      <div className="px-4 sm:px-6 pb-6 pt-3 border-t border-outline flex flex-col gap-3 bg-surface/50">
        <div className="flex items-center justify-between">
          <span className="font-mono text-base sm:text-lg text-on-surface font-semibold">
            {formatPrice(specimen.priceCents)}
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 ${
                specimen.isLimitedRun ? "bg-on-surface" : "bg-accent-olive"
              } inline-block`}
            />
            <span
              className={`font-sans text-[11px] uppercase tracking-widest ${
                specimen.isLimitedRun
                  ? "text-on-surface"
                  : "text-accent-olive font-semibold"
              }`}
            >
              {specimen.isLimitedRun ? "Limited Run" : "In Stock"}
            </span>
          </div>
        </div>

        <Link
          href={targetHref}
          className="w-full py-2 bg-transparent hover:bg-primary border border-outline hover:border-primary text-on-surface hover:text-on-primary font-sans text-xs uppercase tracking-wider text-center transition-colors flex items-center justify-center gap-1.5 rounded-none"
        >
          <span>View Specification</span>
          <span className="text-xs">→</span>
        </Link>
      </div>
    </article>
  );
}
