import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import type { JournalArticle } from "../types";

interface JournalArticleViewProps {
  article: JournalArticle;
}

export function JournalArticleView({ article }: JournalArticleViewProps) {
  return (
    <article className="w-full bg-surface pb-20">
      {/* Header backlink bar */}
      <div className="border-b border-outline bg-surface">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 font-sans text-xs uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Dispatches</span>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-10 md:pt-16">
        {/* Article Metadata */}
        <div className="flex flex-wrap items-center gap-2 mb-4 font-mono text-xs text-on-surface-variant">
          <span className="text-accent-olive font-semibold">
            {article.dispatchNumber}
          </span>
          <span>{"//"}</span>
          <span>{article.categoryLabel}</span>
          <span>•</span>
          <span>{article.readTime}</span>
          <span>•</span>
          <span>{article.publishDate}</span>
        </div>

        {/* Title */}
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal text-on-surface tracking-tight leading-[1.1] mb-6">
          {article.title}
        </h1>

        {/* Excerpt / Lead */}
        <p className="font-sans text-base sm:text-lg text-on-surface-variant leading-relaxed mb-8 sm:mb-12">
          {article.excerpt}
        </p>

        {/* Author Provenance Bar */}
        <div className="flex items-center justify-between py-4 border-y border-outline mb-10 text-xs font-sans text-on-surface-variant">
          <div>
            <span className="uppercase text-[10px] block text-outline mb-0.5">
              AUTHOR
            </span>
            <span className="font-semibold text-on-surface uppercase">
              {article.author}
              {article.authorRole ? `, ${article.authorRole}` : ""}
            </span>
          </div>
          <div className="text-right">
            <span className="uppercase text-[10px] block text-outline mb-0.5">
              LOCATION
            </span>
            <span className="font-mono text-on-surface">{article.locationTag}</span>
          </div>
        </div>

        {/* Hero Visual Frame */}
        <div className="relative w-full aspect-[16/9] border border-outline overflow-hidden mb-12 bg-surface-container-low">
          <Image
            src={article.image}
            alt={article.altText}
            fill
            priority
            sizes="(max-width: 896px) 100vw, 896px"
            className="object-cover contrast-105"
          />
          {article.specimenRef && (
            <div className="absolute bottom-3 left-3 bg-surface/90 border border-outline px-3 py-1 font-mono text-[10px] text-on-surface uppercase">
              {article.specimenRef}
            </div>
          )}
        </div>

        {/* Essay Content */}
        <div className="prose prose-neutral max-w-none space-y-6 text-on-surface font-sans text-sm sm:text-base leading-relaxed">
          {article.content.map((paragraph, index) => {
            if (index === 0) {
              return (
                <p key={index} className="first-letter:text-5xl first-letter:font-serif first-letter:mr-2 first-letter:float-left first-letter:leading-none first-letter:text-on-surface">
                  {paragraph}
                </p>
              );
            }
            return <p key={index}>{paragraph}</p>;
          })}

          {article.pullQuote && (
            <blockquote className="my-10 p-6 border-l-2 border-accent-olive bg-surface-container-low/60 italic font-serif text-lg sm:text-xl text-on-surface">
              &ldquo;{article.pullQuote}&rdquo;
            </blockquote>
          )}
        </div>

        {/* Article Footer & Navigation */}
        <div className="mt-16 pt-8 border-t border-outline flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/journal"
            className="font-sans text-xs uppercase tracking-wider text-on-surface hover:text-accent-olive font-semibold transition-colors"
          >
            ← View All Dispatches
          </Link>
          <Link
            href="/products"
            className="px-6 py-2.5 bg-primary text-on-primary font-sans text-xs uppercase tracking-wider hover:bg-primary-hover transition-colors"
          >
            Explore Timepieces →
          </Link>
        </div>
      </div>
    </article>
  );
}
