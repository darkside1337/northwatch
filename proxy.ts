import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js 16 Proxy
 * Replaces legacy middleware.ts convention.
 *
 * Edge Presence Check (Defense in Depth - Routing Gate):
 * Performs a lightweight session cookie presence check for protected routes.
 * No database or cryptographic verification is performed at the edge.
 * Authoritative session verification remains in Server Actions and Layouts.
 */
export function proxy(request: NextRequest) {
  const hasSessionCookie =
    request.cookies.has("better-auth.session_token") ||
    request.cookies.has("__Secure-better-auth.session_token");

  if (!hasSessionCookie) {
    const { pathname, search } = request.nextUrl;
    const redirectTo = encodeURIComponent(pathname + search);
    return NextResponse.redirect(
      new URL(`/login?redirectTo=${redirectTo}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/checkout/:path*"],
};

