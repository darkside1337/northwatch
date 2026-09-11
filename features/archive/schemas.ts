import { z } from "zod";

export const archiveFilterSchema = z.object({
  dial: z.enum(["all", "slate", "arctic", "forest"]).catch("all"),
  caseSize: z.enum(["all", "38mm", "39mm", "40mm"]).catch("all"),
  movement: z.enum(["all", "automatic", "hand-wound"]).catch("all"),
  material: z.enum(["all", "steel", "dlc", "monolithic"]).catch("all"),
  sort: z
    .enum(["featured", "price-asc", "price-desc", "dia-asc", "cal"])
    .catch("featured"),
  page: z.coerce.number().int().min(1).catch(1),
});

export type ArchiveFilterInput = z.input<typeof archiveFilterSchema>;
export type ArchiveFilterOutput = z.infer<typeof archiveFilterSchema>;
