import * as React from "react";
import type { JournalArticle, JournalCategory } from "../types";
import { JournalMasthead } from "./JournalMasthead";
import { JournalLeadFeature } from "./JournalLeadFeature";
import { JournalArticleGrid } from "./JournalArticleGrid";
import { JournalMonographLibrary } from "./JournalMonographLibrary";
import { JournalDispatchSubscribe } from "./JournalDispatchSubscribe";
import { JournalTelemetryBar } from "./JournalTelemetryBar";

interface JournalViewProps {
  leadArticle: JournalArticle;
  curatedArticles: JournalArticle[];
  activeCategory: JournalCategory;
}

export function JournalView({
  leadArticle,
  curatedArticles,
  activeCategory,
}: JournalViewProps) {
  return (
    <div className="flex flex-col w-full">
      <JournalMasthead activeCategory={activeCategory} />
      <JournalLeadFeature article={leadArticle} />
      <JournalArticleGrid articles={curatedArticles} />
      <JournalMonographLibrary />
      <JournalDispatchSubscribe />
      <JournalTelemetryBar />
    </div>
  );
}
