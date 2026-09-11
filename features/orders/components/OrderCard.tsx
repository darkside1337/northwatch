import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatPrice } from "@/config/site";
import { OrderStatusBadge } from "./OrderStatusBadge";
import type { Order } from "../types";

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const items = order.items ?? [];
  const reference = `NW-${order.id.slice(0, 8).toUpperCase()}`;
  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="border border-outline bg-surface-bright p-6 sm:p-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-outline-variant pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-on-surface-variant uppercase tracking-wider">
              {reference}
            </span>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-xs font-mono text-on-surface-variant/80">
            Recorded {formattedDate}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-on-surface-variant block">
            Total Allocated
          </span>
          <span className="font-mono text-base sm:text-lg font-semibold text-on-surface">
            {formatPrice(order.totalCents)}
          </span>
        </div>
      </div>

      {/* Itemized Snapshot Preview */}
      <div className="divide-y divide-outline-variant/60">
        {items.map((item) => (
          <div
            key={item.id}
            className="py-3 flex items-center justify-between gap-4 text-xs"
          >
            <div className="space-y-0.5 min-w-0">
              <p className="font-serif font-medium text-sm text-on-surface truncate">
                {item.title}
              </p>
              <p className="text-[11px] font-mono text-on-surface-variant uppercase tracking-wider">
                {item.variantName} × {item.quantity}
              </p>
            </div>
            <span className="font-mono text-on-surface shrink-0 font-medium">
              {formatPrice(item.unitPriceCents * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* Actions Footer */}
      <div className="pt-2 flex items-center justify-between border-t border-outline-variant/40">
        <span className="text-[11px] font-mono text-on-surface-variant">
          {items.reduce((acc, it) => acc + it.quantity, 0)} {items.reduce((acc, it) => acc + it.quantity, 0) === 1 ? "timepiece" : "timepieces"}
        </span>

        <Link
          href={`/account/orders/${order.id}`}
          className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.12em] text-on-surface hover:text-accent transition-colors group cursor-pointer"
        >
          <span>View Allocation Details</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
