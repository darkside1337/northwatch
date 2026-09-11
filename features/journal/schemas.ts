import { z } from "zod";

export const journalFilterSchema = z.object({
  category: z
    .enum(["all", "metallurgy", "atelier", "philosophy", "field"])
    .catch("all"),
});

export const newsletterSubscriptionSchema = z.object({
  email: z.string().email("Please provide a valid email address."),
});

export type JournalFilterInput = z.input<typeof journalFilterSchema>;
export type JournalFilterOutput = z.infer<typeof journalFilterSchema>;
export type NewsletterSubscriptionInput = z.infer<
  typeof newsletterSubscriptionSchema
>;
