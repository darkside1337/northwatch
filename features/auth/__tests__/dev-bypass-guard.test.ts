import { describe, it, expect, vi, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { devSignInAction } from "../dev-actions";
import * as authActions from "../actions";

describe("Dev Authentication Bypass Hardening Guard", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("guarantees OAuthSignInCard contains zero references or imports of devSignInAction or dev-actions", () => {
    const cardPath = path.resolve(
      process.cwd(),
      "features/auth/components/OAuthSignInCard.tsx"
    );
    const cardSource = fs.readFileSync(cardPath, "utf-8");

    expect(cardSource).not.toContain("devSignInAction");
    expect(cardSource).not.toContain("dev-actions");
    expect(cardSource).not.toContain("QUICK DEV SIGN-IN");
  });

  it("guarantees production auth actions module does not export devSignInAction", () => {
    expect((authActions as Record<string, unknown>).devSignInAction).toBeUndefined();
  });

  it("throws a fatal error immediately when devSignInAction is called in production mode", async () => {
    vi.stubEnv("NODE_ENV", "production");

    await expect(devSignInAction("/account")).rejects.toThrow(
      "FATAL: Dev sign-in is disabled in production."
    );
  });
});
