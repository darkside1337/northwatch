import { NextResponse } from "next/server";

/**
 * Next.js 16 Proxy
 * Replaces legacy middleware.ts convention.
 *
 * Edge Presence Check (Phase 4):
 * Will perform a lightweight session cookie presence check for protected routes.
 * Authoritative cryptographic session verification remains in Server Actions and layouts.
 */
export function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/checkout/:path*"],
};
