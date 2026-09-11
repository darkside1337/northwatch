import { requireAuth } from "@/lib/auth/session";
import { getOrdersForUser, OrderArchiveList } from "@/features/orders";

export const instant = false;

export default async function AccountOrdersPage() {
  const sessionData = await requireAuth("/account/orders");
  const userOrders = await getOrdersForUser(sessionData.user.id);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-on-surface-variant">
            ARCHIVE // PROVENANCE & ALLOCATIONS
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-on-surface">
          Order Archive
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Historical timepiece acquisitions associated with {sessionData.user.email}.
        </p>
      </div>

      <OrderArchiveList orders={userOrders} />
    </div>
  );
}
