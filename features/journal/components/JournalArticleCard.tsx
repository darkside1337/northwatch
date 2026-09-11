import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { JournalArticle } from "../types";

interface JournalArticleCardProps {
  article: JournalArticle;
}

export function JournalArticleCard({ article }: JournalArticleCardProps) {
  return (
    <article className="border-r border-b border-outline bg-surface flex flex-col justify-between group hover:bg-surface-container-low transition-colors duration-300">
      <div>
        <div className="w-full aspect-[4/3] bg-surface-container overflow-hidden border-b border-outline relative">
          <Image
            src={article.image}
            alt={article.altText}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          <div className="absolute top-3 left-3 bg-surface/90 px-2 py-1 border border-outline">
            <span className="font-mono text-[11px] text-on-surface uppercase tracking-wider font-semibold">
              {article.dispatchNumber}
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-sans text-xs uppercase text-accent-olive font-semibold tracking-wider">
              {article.categoryLabel}
            </span>
            <span className="text-outline text-xs">•</span>
            <span className="font-mono text-xs text-on-surface-variant">
              {article.readTime}
            </span>
          </div>

          <h3 className="font-serif text-xl sm:text-2xl text-on-surface mb-2.5 group-hover:text-accent-olive transition-colors leading-snug">
            {article.title}
          </h3>

          <p className="font-sans text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-4">
            {article.excerpt}
          </p>
        </div>
      </div>

      <div className="px-6 pb-6 pt-3 flex items-center justify-between border-t border-outline/60">
        <span className="font-mono text-[11px] text-on-surface-variant uppercase">
          BY {article.author}
        </span>
        <Link
          href={`/journal/${article.slug}`}
          className="inline-flex items-center gap-1.5 font-sans text-xs uppercase text-on-surface group-hover:text-accent-olive font-semibold transition-colors"
        >
          <span>Read Dispatch</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </article>
  );
}
