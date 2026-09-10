"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import { user, session } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { eq } from "drizzle-orm";
import { sanitizeRedirectPath } from "./schemas";
import { env } from "@/config/env";

/**
 * Revokes active session and removes session cookies.
 */
export async function signOutAction() {
  const reqHeaders = await headers();
  try {
    await auth.api.signOut({
      headers: reqHeaders,
    });
  } catch {
    // If auth API signOut fails, manually remove the cookie as a fallback
    const cookieStore = await cookies();
    cookieStore.delete("better-auth.session_token");
    cookieStore.delete("__Secure-better-auth.session_token");
  }

  redirect("/login");
}

/**
 * Development-only quick sign in as a test collector.
 * Bypasses third-party OAuth popups for local testing & automation.
 */
export async function devSignInAction(redirectTo?: string) {
  if (env.NODE_ENV === "production") {
    throw new Error("Dev sign-in is disabled in production.");
  }

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

  // Create session
  const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await db.insert(session).values({
    id: "session_dev_" + crypto.randomUUID().slice(0, 8),
    userId: existingUser.id,
    token,
    expiresAt,
  });

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set("better-auth.session_token", token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
  });

  const destination = sanitizeRedirectPath(redirectTo, "/account");
  redirect(destination);
}
