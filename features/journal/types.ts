export type JournalCategory =
  | "all"
  | "metallurgy"
  | "atelier"
  | "philosophy"
  | "field";

export interface JournalArticle {
  id: string;
  slug: string;
  dispatchNumber: string;
  locationTag: string;
  isLeadMonograph?: boolean;
  specimenRef?: string;
  category: JournalCategory;
  categoryLabel: string;
  readTime: string;
  publishDate: string;
  title: string;
  excerpt: string;
  author: string;
  authorRole?: string;
  image: string;
  altText: string;
  content: string[];
  pullQuote?: string;
}

export interface FieldNote {
  id: string;
  noteCode: string;
  dateCode: string;
  title: string;
  description: string;
  actionLabel: string;
  actionType: "download" | "view";
  specFile?: string;
}

export interface JournalCategoryTab {
  category: JournalCategory;
  label: string;
  count: number;
}
