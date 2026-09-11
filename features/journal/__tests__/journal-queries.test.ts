import { describe, it, expect } from "vitest";
import {
  getLeadArticle,
  getCuratedArticles,
  getArticleBySlug,
  getFieldNotes,
} from "../queries";
import {
  journalFilterSchema,
  newsletterSubscriptionSchema,
} from "../schemas";

describe("Journal Queries and Schemas", () => {
  it("returns the designated lead monograph", () => {
    const lead = getLeadArticle();
    expect(lead).toBeDefined();
    expect(lead.isLeadMonograph).toBe(true);
    expect(lead.slug).toBe("the-aesthetics-of-restraint");
  });

  it("filters curated articles by category", () => {
    const all = getCuratedArticles("all");
    expect(all.length).toBeGreaterThan(0);

    const metallurgy = getCuratedArticles("metallurgy");
    expect(metallurgy.length).toBeGreaterThan(0);
    metallurgy.forEach((art) => {
      expect(art.category).toBe("metallurgy");
    });

    const atelier = getCuratedArticles("atelier");
    expect(atelier.length).toBeGreaterThan(0);
    atelier.forEach((art) => {
      expect(art.category).toBe("atelier");
    });
  });

  it("retrieves individual articles by slug", () => {
    const article = getArticleBySlug("study-in-basalt");
    expect(article).toBeDefined();
    expect(article?.dispatchNumber).toBe("DISPATCH 013");
    expect(article?.author).toContain("Thornström");

    const nonExistent = getArticleBySlug("missing-article");
    expect(nonExistent).toBeUndefined();
  });

  it("retrieves field notes with valid reference codes", () => {
    const notes = getFieldNotes();
    expect(notes.length).toBeGreaterThanOrEqual(4);
    notes.forEach((note) => {
      expect(note.noteCode).toMatch(/^NOTE \d{2}$/);
      expect(note.dateCode).toBeTruthy();
    });
  });

  it("validates journal category filter inputs safely", () => {
    const valid = journalFilterSchema.parse({ category: "metallurgy" });
    expect(valid.category).toBe("metallurgy");

    const invalid = journalFilterSchema.parse({ category: "invalid-category" });
    expect(invalid.category).toBe("all");
  });

  it("validates newsletter email input", () => {
    const valid = newsletterSubscriptionSchema.safeParse({
      email: "collector@northwatch.se",
    });
    expect(valid.success).toBe(true);

    const invalid = newsletterSubscriptionSchema.safeParse({
      email: "not-an-email",
    });
    expect(invalid.success).toBe(false);
  });
});
