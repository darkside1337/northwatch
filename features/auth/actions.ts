"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";

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

