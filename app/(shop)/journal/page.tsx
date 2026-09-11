import { Suspense } from "react";
import type { Metadata } from "next";
import {
  journalFilterSchema,
  getLeadArticle,
  getCuratedArticles,
  JournalView,
} from "@/features/journal";

export const metadata: Metadata = {
  title: "The Journal — Field Dispatches & Essays — Northwatch",
  description:
    "Critical writings on chronometric discipline, Scandinavian architectural reduction, uncompromised metallurgy, and the silent philosophy of mechanical time.",
};

interface JournalPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function JournalSkeleton() {
  return (
    <div className="w-full bg-surface min-h-[600px] animate-pulse">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="h-6 w-32 bg-surface-container mb-4" />
        <div className="h-12 w-80 bg-surface-container mb-6" />
        <div className="h-4 w-96 bg-surface-container mb-12" />
        <div className="h-64 w-full bg-surface-container mb-12" />
      </div>
    </div>
  );
}

async function JournalContent({ searchParams }: JournalPageProps) {
  const resolvedSearchParams = await searchParams;

  const parsed = journalFilterSchema.parse({
    category: resolvedSearchParams.category,
  });

  const leadArticle = getLeadArticle();
  const curatedArticles = getCuratedArticles(parsed.category);

  return (
    <JournalView
      leadArticle={leadArticle}
      curatedArticles={curatedArticles}
      activeCategory={parsed.category}
    />
  );
}

export default function JournalPage({ searchParams }: JournalPageProps) {
  return (
    <Suspense fallback={<JournalSkeleton />}>
      <JournalContent searchParams={searchParams} />
    </Suspense>
  );
}
