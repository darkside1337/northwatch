import { describe, it, expect } from "vitest";
import {
  oauthProviderSchema,
  sanitizeRedirectPath,
  redirectQuerySchema,
} from "../schemas";

describe("features/auth/schemas", () => {
  describe("oauthProviderSchema", () => {
    it("accepts valid supported providers", () => {
      expect(oauthProviderSchema.parse("google")).toBe("google");
      expect(oauthProviderSchema.parse("github")).toBe("github");
    });

    it("rejects unsupported providers", () => {
      expect(() => oauthProviderSchema.parse("facebook")).toThrow();
      expect(() => oauthProviderSchema.parse("twitter")).toThrow();
      expect(() => oauthProviderSchema.parse("")).toThrow();
    });
  });

  describe("sanitizeRedirectPath", () => {
    it("allows valid internal relative paths", () => {
      expect(sanitizeRedirectPath("/account")).toBe("/account");
      expect(sanitizeRedirectPath("/account/orders")).toBe("/account/orders");
      expect(sanitizeRedirectPath("/checkout/shipping?tier=express")).toBe(
        "/checkout/shipping?tier=express"
      );
    });

    it("rejects external open redirects and falls back to default", () => {
      expect(sanitizeRedirectPath("https://evil.com")).toBe("/account");
      expect(sanitizeRedirectPath("http://malicious.org/phish")).toBe("/account");
      expect(sanitizeRedirectPath("//evil.com")).toBe("/account");
      expect(sanitizeRedirectPath("/\\evil.com")).toBe("/account");
      expect(sanitizeRedirectPath("javascript:alert(1)")).toBe("/account");
    });

    it("handles empty or null inputs gracefully with fallback", () => {
      expect(sanitizeRedirectPath(null)).toBe("/account");
      expect(sanitizeRedirectPath(undefined)).toBe("/account");
      expect(sanitizeRedirectPath("", "/custom-fallback")).toBe("/custom-fallback");
    });
  });

  describe("redirectQuerySchema", () => {
    it("transforms incoming query into safe sanitized path", () => {
      const parsed = redirectQuerySchema.parse({ redirectTo: "https://evil.com" });
      expect(parsed.redirectTo).toBe("/account");

      const validParsed = redirectQuerySchema.parse({
        redirectTo: "/checkout/payment",
      });
      expect(validParsed.redirectTo).toBe("/checkout/payment");
    });
  });
});
