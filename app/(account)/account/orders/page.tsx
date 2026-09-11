import Link from "next/link";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { orders } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/session";
import { formatPrice } from "@/config/site";

export const instant = false;

export default async function AccountOrdersPage() {
  const sessionData = await requireAuth("/account/orders");

  // Fetch verified completed / processed orders.
  // Explicitly omit pending_payment attempts so abandoned checkout carts never appear in order history.
  const userOrders = await db.query.orders.findMany({
    where: and(
      eq(orders.userId, sessionData.user.id),
      inArray(orders.status, ["paid", "shipped", "delivered", "canceled", "refunded"])
    ),
    with: {
      items: true,
    },
    orderBy: [desc(orders.createdAt)],
  });

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

      {userOrders.length === 0 ? (
        <div className="border border-[#DCD8D0] bg-[#FFFFFF] p-12 text-center space-y-4">
          <div className="w-8 h-8 mx-auto border border-[#DCD8D0] flex items-center justify-center font-mono text-[11px] text-[#595854]">
            00
          </div>
          <div className="space-y-1">
            <h2 className="font-serif text-[20px] font-normal text-[#141413]">
              No Orders on Record
            </h2>
            <p className="text-[13px] text-[#595854] max-w-sm mx-auto">
              You currently have no verified transactions recorded in the Northwatch registry.
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
      ) : (
        <div className="space-y-4">
          {userOrders.map((order) => (
            <div
              key={order.id}
              className="border border-[#DCD8D0] bg-[#FFFFFF] p-6 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DCD8D0]/60 pb-3">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-mono text-[#595854] uppercase tracking-wider">
                    Order Ref: {order.id.slice(0, 8).toUpperCase()}
                  </span>
                  <p className="text-xs font-mono text-[#8A8780]">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 border border-[#DCD8D0] text-[10px] font-mono uppercase tracking-wider text-[#3B4436] bg-[#FAF9F6]">
                    {order.status}
                  </span>
                  <span className="font-mono text-sm font-semibold text-[#141413]">
                    {formatPrice(order.totalCents)}
                  </span>
                </div>
              </div>

              <div className="divide-y divide-[#DCD8D0]/40">
                {order.items.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-serif font-medium text-[#141413]">{item.title}</span>
                      <span className="text-[#595854] ml-2">({item.variantName}) × {item.quantity}</span>
                    </div>
                    <span className="font-mono text-[#141413]">
                      {formatPrice(item.unitPriceCents * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
