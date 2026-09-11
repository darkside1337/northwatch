import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getArticleBySlug,
  JournalArticleView,
  JOURNAL_ARTICLES,
} from "@/features/journal";

interface JournalDetailPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return JOURNAL_ARTICLES.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: JournalDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Dispatch Not Located — Northwatch",
    };
  }

  return {
    title: `${article.title} — Northwatch Journal`,
    description: article.excerpt,
  };
}

export default async function JournalDetailPage({
  params,
}: JournalDetailPageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return <JournalArticleView article={article} />;
}
