import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";

export const instant = false;

export default async function AccountPage() {

  const sessionData = await requireAuth("/account");
  const user = sessionData.user;

  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3B4436]" />
          <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#595854]">
            AUTHENTICATED // ACTIVE SESSION
          </span>
        </div>
        <h1 className="font-serif text-[32px] font-normal text-[#141413]">
          Collector Registry
        </h1>
        <p className="text-[14px] text-[#595854] mt-1">
          Review your personal provenance records, delivery credentials, and timepiece allocations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="border border-[#DCD8D0] bg-[#FFFFFF] p-6 space-y-4">
          <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#595854]">
            COLLECTOR PROFILE
          </span>
          <div className="space-y-1">
            <p className="text-[15px] font-medium text-[#141413]">{user.name}</p>
            <p className="text-[12px] font-mono text-[#595854]">{user.email}</p>
          </div>
          <div className="pt-4 border-t border-[#E8E5DF] text-[11px] font-mono text-[#595854]">
            REGISTRY ID: <span className="text-[#141413]">{user.id.slice(0, 12)}</span>
          </div>
        </div>

        {/* Security & Access */}
        <div className="border border-[#DCD8D0] bg-[#FFFFFF] p-6 space-y-4">
          <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#595854]">
            SECURITY & ACCESS
          </span>
          <p className="text-[13px] text-[#595854] leading-relaxed">
            Federated identity authentication active. Session expires in 7 days of inactivity.
          </p>
          <div className="pt-4 border-t border-[#E8E5DF] text-[11px] font-mono text-[#3B4436]">
            STATUS: VERIFIED
          </div>
        </div>

        {/* Orders Shortcut */}
        <div className="border border-[#DCD8D0] bg-[#FFFFFF] p-6 space-y-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#595854]">
              TRANSACTIONS
            </span>
            <p className="text-[13px] text-[#595854] mt-2">
              View your historical timepiece acquisitions, order invoices, and active tracking numbers.
            </p>
          </div>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 text-[11px] font-sans font-semibold uppercase tracking-[0.12em] text-[#141413] hover:underline"
          >
            VIEW ORDER ARCHIVE →
          </Link>
        </div>
      </div>
    </div>
  );
}
