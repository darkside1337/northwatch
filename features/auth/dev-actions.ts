"use server";

import { cookies } from "next/headers";
import { db } from "@/lib/db/client";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirectQuerySchema } from "./schemas";
import { testAuth } from "@/lib/auth/test-auth";

/**
 * Development-only quick sign in as a test collector.
 * Bypasses third-party OAuth popups for local manual testing.
 *
 * HARDENING INVARIANT:
 * This action is guarded by an explicit runtime check inside the function body.
 * Calling this action in production immediately throws an unhandled fatal error.
 */
export async function devSignInAction(rawRedirectTo?: string) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("FATAL: Dev sign-in is disabled in production.");
  }

  const { redirectTo } = redirectQuerySchema.parse({ redirectTo: rawRedirectTo });

  const email = "collector@northwatch.ch";
  const name = "Marcus Vance (Test Collector)";

  // Find or create test user
  let existingUser = await db.query.user.findFirst({
    where: eq(user.email, email),
  });

  if (!existingUser) {
    const [createdUser] = await db
      .insert(user)
      .values({
        id: "collector_dev_" + crypto.randomUUID().slice(0, 8),
        name,
        email,
        emailVerified: true,
        image: null,
      })
      .returning();
    existingUser = createdUser;
  }

  // Generate authoritative signed HMAC session cookie via Better Auth testUtils
  const ctx = await testAuth.$context;
  const { cookies: authCookies } = await ctx.test.login({
    userId: existingUser.id,
  });

  const cookieStore = await cookies();
  for (const c of authCookies) {
    cookieStore.set(c.name, c.value, {
      path: c.path || "/",
      httpOnly: c.httpOnly ?? true,
      secure: false,
      sameSite: (c.sameSite?.toLowerCase() === "strict"
        ? "strict"
        : c.sameSite?.toLowerCase() === "none"
        ? "none"
        : "lax") as "lax" | "strict" | "none",
      expires: c.expires ? new Date(c.expires * 1000) : undefined,
    });
  }

  return { success: true, destination: redirectTo };
}
