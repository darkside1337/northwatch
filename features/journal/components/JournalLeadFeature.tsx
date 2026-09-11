import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { JournalArticle } from "../types";

interface JournalLeadFeatureProps {
  article: JournalArticle;
}

export function JournalLeadFeature({ article }: JournalLeadFeatureProps) {
  return (
    <section className="w-full bg-surface border-b border-outline">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-outline bg-surface-container-low">
          {/* Left Feature Image (60% / 7 cols) */}
          <div className="lg:col-span-7 relative group overflow-hidden border-b lg:border-b-0 lg:border-r border-outline flex flex-col justify-between bg-surface-container-high min-h-[380px] sm:min-h-[480px] lg:min-h-[540px]">
            <Image
              src={article.image}
              alt={article.altText}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover object-center grayscale contrast-125 transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-primary/20 pointer-events-none" />

            {/* Top Metadata Stamp */}
            <div className="relative z-10 p-4 sm:p-6 flex justify-between items-start">
              <div className="bg-surface/90 backdrop-blur-none px-3 py-1 border border-outline">
                <span className="font-mono text-xs text-on-surface uppercase tracking-wider font-semibold">
                  {article.dispatchNumber} {"//"} {article.locationTag}
                </span>
              </div>
              <span className="font-mono text-[11px] bg-primary text-on-primary px-2.5 py-1 uppercase tracking-widest font-medium">
                LEAD MONOGRAPH
              </span>
            </div>

            {/* Bottom Visual Annotation */}
            <div className="relative z-10 p-4 sm:p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-12">
              <p className="font-mono text-xs text-white/90 tracking-wider">
                {article.specimenRef}
              </p>
            </div>
          </div>

          {/* Right Feature Narrative (40% / 5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-between bg-surface">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="font-sans text-xs uppercase text-accent-olive font-semibold tracking-widest">
                  {article.categoryLabel}
                </span>
                <span className="text-outline text-xs">/</span>
                <span className="font-mono text-xs text-on-surface-variant">
                  {article.readTime}
                </span>
                <span className="text-outline text-xs">/</span>
                <span className="font-mono text-xs text-on-surface-variant">
                  {article.publishDate}
                </span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-on-surface tracking-tight mb-4 leading-tight">
                {article.title}
              </h2>

              <p className="font-sans text-sm text-on-surface-variant mb-4 leading-relaxed">
                {article.excerpt}
              </p>

              {article.pullQuote && (
                <p className="font-serif italic text-xs sm:text-sm text-on-surface mb-6 pl-3 border-l-2 border-accent-olive">
                  &ldquo;{article.pullQuote}&rdquo;
                </p>
              )}
            </div>

            <div className="pt-6 border-t border-outline flex items-center justify-between">
              <div>
                <span className="font-sans text-[10px] uppercase text-on-surface-variant block tracking-wider">
                  AUTHOR
                </span>
                <span className="font-sans text-xs uppercase text-on-surface font-semibold tracking-wide">
                  {article.author}
                  {article.authorRole ? `, ${article.authorRole}` : ""}
                </span>
              </div>

              <Link
                href={`/journal/${article.slug}`}
                className="group inline-flex items-center gap-2 font-sans text-xs uppercase text-on-surface hover:text-accent-olive tracking-widest font-semibold transition-colors"
              >
                <span>Read Essay</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
