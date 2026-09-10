import { z } from "zod";

export const oauthProviderSchema = z.enum(["google", "github"]);
export type OAuthProvider = z.infer<typeof oauthProviderSchema>;

/**
 * Validates redirect paths to prevent Open Redirect attacks.
 * Only relative application paths starting with a single '/' are permitted.
 */
export function sanitizeRedirectPath(path?: string | null, fallback = "/account"): string {
  if (!path || typeof path !== "string") {
    return fallback;
  }

  const trimmed = path.trim();
  // Reject external protocols, scheme-relative URLs (//evil.com), and backslashes
  if (
    trimmed.startsWith("/") &&
    !trimmed.startsWith("//") &&
    !trimmed.startsWith("/\\") &&
    !trimmed.includes("://")
  ) {
    return trimmed;
  }

  return fallback;
}

export const redirectQuerySchema = z.object({
  redirectTo: z
    .string()
    .optional()
    .transform((val) => sanitizeRedirectPath(val)),
});
