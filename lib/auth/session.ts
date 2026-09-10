import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";

/**
 * Authoritative cryptographic session verification (Defense in Depth).
 * Queries Better Auth directly with request headers to resolve the DB-backed session.
 */
export async function getSession() {
  const reqHeaders = await headers();
  return await auth.api.getSession({
    headers: reqHeaders,
  });
}

/**
 * Enforces session requirement in Server Components, Layouts, and Server Actions.
 * Redirects to /login if unauthenticated.
 */
export async function requireAuth(redirectTo?: string) {
  const sessionData = await getSession();

  if (!sessionData || !sessionData.session) {
    const target = redirectTo
      ? `/login?redirectTo=${encodeURIComponent(redirectTo)}`
      : "/login";
    redirect(target);
  }

  return sessionData;
}
