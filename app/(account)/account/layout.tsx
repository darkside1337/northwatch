import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";
import { signOutAction } from "@/features/auth/actions";

export const instant = false;

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const sessionData = await requireAuth("/account");

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col font-sans">
      {/* Account Navigation Header */}
      <header className="w-full border-b border-[#DCD8D0] bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="font-serif text-[18px] font-medium tracking-[0.2em] text-[#141413] uppercase"
            >
              NORTHWATCH<span className="text-[#3B4436] font-bold ml-0.5">.</span>
            </Link>
            <span className="text-[#DCD8D0]">/</span>
            <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#595854]">
              COLLECTOR PORTAL
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-[12px] font-semibold text-[#141413]">
                {sessionData.user.name}
              </span>
              <span className="text-[10px] font-mono text-[#595854]">
                {sessionData.user.email}
              </span>
            </div>

            <form action={signOutAction}>
              <button
                type="submit"
                className="px-3 py-1.5 border border-[#DCD8D0] hover:border-[#141413] text-[10px] font-sans font-semibold uppercase tracking-[0.12em] text-[#141413] transition-colors cursor-pointer"
              >
                SIGN OUT
              </button>
            </form>
          </div>
        </div>

        {/* Secondary Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-8 text-[11px] font-sans uppercase tracking-[0.14em]">
          <Link
            href="/account"
            className="py-3 border-b-2 border-transparent hover:border-[#141413] text-[#595854] hover:text-[#141413] transition-colors"
          >
            OVERVIEW
          </Link>
          <Link
            href="/account/orders"
            className="py-3 border-b-2 border-transparent hover:border-[#141413] text-[#595854] hover:text-[#141413] transition-colors"
          >
            ORDER ARCHIVE
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
        {children}
      </main>
    </div>
  );
}
