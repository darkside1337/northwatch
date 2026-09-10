import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";

export const instant = false;

export default async function AccountOrdersPage() {

  const sessionData = await requireAuth("/account/orders");

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3B4436]" />
          <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#595854]">
            ARCHIVE // PROVENANCE & ALLOCATIONS
          </span>
        </div>
        <h1 className="font-serif text-[32px] font-normal text-[#141413]">
          Order Archive
        </h1>
        <p className="text-[14px] text-[#595854] mt-1">
          Historical timepiece acquisitions associated with {sessionData.user.email}.
        </p>
      </div>

      {/* Empty State / Initial Orders View (Full Phase 7 will fetch live orders) */}
      <div className="border border-[#DCD8D0] bg-[#FFFFFF] p-12 text-center space-y-4">
        <div className="w-8 h-8 mx-auto border border-[#DCD8D0] flex items-center justify-center font-mono text-[11px] text-[#595854]">
          00
        </div>
        <div className="space-y-1">
          <h2 className="font-serif text-[20px] font-normal text-[#141413]">
            No Orders on Record
          </h2>
          <p className="text-[13px] text-[#595854] max-w-sm mx-auto">
            You currently have no historical transactions recorded in the Northwatch registry.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/products"
            className="inline-block px-6 py-3 bg-[#141413] text-[#FFFFFF] text-[11px] font-sans font-semibold uppercase tracking-[0.12em] hover:bg-[#2A2A28] transition-colors"
          >
            EXPLORE TIMEPIECES →
          </Link>
        </div>
      </div>
    </div>
  );
}
