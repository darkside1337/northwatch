import { JOURNAL_ARTICLES, FIELD_NOTES } from "./data";
import type { JournalArticle, JournalCategory, FieldNote } from "./types";

export function getLeadArticle(): JournalArticle {
  const lead = JOURNAL_ARTICLES.find((a) => a.isLeadMonograph);
  return lead || JOURNAL_ARTICLES[0];
}

export function getCuratedArticles(
  category: JournalCategory = "all"
): JournalArticle[] {
  // Articles excluding the lead monograph, filtered by category
  const nonLead = JOURNAL_ARTICLES.filter((a) => !a.isLeadMonograph);

  if (category === "all") {
    return nonLead;
  }

  return nonLead.filter((a) => a.category === category);
}

export function getArticleBySlug(slug: string): JournalArticle | undefined {
  return JOURNAL_ARTICLES.find((a) => a.slug === slug);
}

export function getFieldNotes(): FieldNote[] {
  return FIELD_NOTES;
}
