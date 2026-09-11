import * as React from "react";
import type { JournalArticle } from "../types";
import { JournalArticleCard } from "./JournalArticleCard";

interface JournalArticleGridProps {
  articles: JournalArticle[];
}

export function JournalArticleGrid({ articles }: JournalArticleGridProps) {
  if (articles.length === 0) {
    return (
      <section className="w-full bg-surface border-b border-outline py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <div className="border border-outline bg-surface-container-low p-8 max-w-md mx-auto">
            <span className="font-mono text-xs text-on-surface-variant block uppercase mb-2">
              DISPATCH ARCHIVE
            </span>
            <p className="font-sans text-sm text-on-surface-variant">
              No field dispatches found under this category.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-surface border-b border-outline">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 sm:py-16">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-8 pb-3 border-b border-outline">
          <div>
            <span className="font-mono text-xs text-accent-olive uppercase tracking-widest block mb-1">
              SECTION 02 / ARTICLES
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-on-surface font-normal">
              Curated Technical Essays
            </h2>
          </div>
          <span className="font-mono text-xs text-on-surface-variant mt-2 sm:mt-0">
            SHOWING {articles.length.toString().padStart(2, "0")} DISPATCHES IN
            ROTATION
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-outline">
          {articles.map((article) => (
            <JournalArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}
