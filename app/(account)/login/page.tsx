import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { OAuthSignInCard } from "@/features/auth/components/OAuthSignInCard";
import { DevSignInButton } from "@/features/auth/components/DevSignInButton";
import { sanitizeRedirectPath } from "@/features/auth/schemas";

export const instant = false;

interface LoginPageProps {
  searchParams: Promise<{ redirectTo?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirectTo } = await searchParams;
  const safeRedirect = sanitizeRedirectPath(redirectTo, "/account");

  // If already authenticated, redirect immediately
  const sessionData = await getSession();
  if (sessionData?.session) {
    redirect(safeRedirect);
  }

  const isNonProduction = process.env.NODE_ENV !== "production";

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#141413] flex flex-col justify-between font-sans selection:bg-[#3B4436] selection:text-white">
      {/* Top Utility Header / Navigation Anchor */}
      <header className="w-full px-6 py-5 flex items-center justify-between border-b border-[#DCD8D0] bg-[#FAF9F6]/90">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-[10px] font-medium font-sans uppercase tracking-[0.14em] text-[#595854] hover:text-[#141413] transition-colors"
        >
          <span className="transition-transform group-hover:-translate-x-0.5">←</span>
          <span>STOREFRONT</span>
        </Link>

        <div className="hidden sm:flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3B4436] animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#595854]">
            SYS.LOC // 59.3293° N · CH-1204
          </span>
        </div>

        <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#595854]">
          PORTAL REF. <span className="text-[#141413] font-medium">NW-AUTH-01</span>
        </div>
      </header>

      {/* Central Viewport Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <OAuthSignInCard redirectTo={safeRedirect} />
        {isNonProduction && <DevSignInButton redirectTo={safeRedirect} />}
      </main>

      {/* Bottom Global Footnote Bar */}
      <footer className="w-full px-6 py-4 border-t border-[#DCD8D0] bg-[#FAF9F6] flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-[#595854] gap-2">
        <div>
          <span>NORTHWATCH MANUFACTURE</span> · <span>SKEPPSBRON 14, STOCKHOLM</span> ·{" "}
          <span>RUE DU RHÔNE 42, GENÈVE</span>
        </div>
        <div className="flex items-center gap-4">
          <span>REGULATED TO 5 POSITIONS</span>
          <span>·</span>
          <span>© 2026 NORTHWATCH INSTRUMENTS SA / AB</span>
        </div>
      </footer>
    </div>
  );
}
