import Link from "next/link";
import { ArrowLeft, ShieldCheck, Mail } from "lucide-react";
import { formatPrice, siteConfig } from "@/config/site";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderTimeline } from "./OrderTimeline";
import { PrintReceiptButton } from "./PrintReceiptButton";
import type { Order } from "../types";

interface OrderDetailViewProps {
  order: Order;
}

export function OrderDetailView({ order }: OrderDetailViewProps) {
  const items = order.items ?? [];
  const reference = `NW-${order.id.slice(0, 8).toUpperCase()}`;
  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const shippingAddr = (order.shippingAddress ?? {}) as {
    firstName?: string;
    lastName?: string;
    street?: string;
    apartment?: string;
    name?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
  };

  const recipientName =
    shippingAddr.name ||
    (shippingAddr.firstName && shippingAddr.lastName
      ? `${shippingAddr.firstName} ${shippingAddr.lastName}`
      : shippingAddr.firstName || "Collector");
  const streetAddress = shippingAddr.street || shippingAddr.line1;
  const secondaryAddress = shippingAddr.apartment || shippingAddr.line2;

  const tier =
    order.shippingTierId in siteConfig.shipping.tiers
      ? siteConfig.shipping.tiers[order.shippingTierId as keyof typeof siteConfig.shipping.tiers]
      : siteConfig.shipping.tiers.standard;

  return (
    <div className="space-y-10 max-w-4xl">
      {/* Navigation Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-outline-variant pb-6">
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Order Archive</span>
        </Link>

        <div className="flex items-center gap-3">
          <PrintReceiptButton />
          <a
            href="mailto:concierge@northwatch.ch"
            className="inline-flex items-center gap-2 px-4 py-2 border border-outline hover:border-on-surface bg-surface-bright text-on-surface text-[11px] font-mono uppercase tracking-[0.14em] transition-colors cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Concierge Inquiry</span>
          </a>
        </div>
      </div>

      {/* Editorial Order Header */}
      <div className="border border-outline bg-surface-bright p-6 sm:p-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 border-b border-outline-variant pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-on-surface-variant">
                VAULT RECORD
              </span>
              <OrderStatusBadge status={order.status} />
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-on-surface">
              {reference}
            </h1>
            <p className="text-xs font-mono text-on-surface-variant">
              Allocated {formattedDate} {"//"} Account ID: {order.userId?.slice(0, 12) ?? "GUEST"}
            </p>
          </div>

          <div className="sm:text-right space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-on-surface-variant block">
              Total Settled
            </span>
            <span className="font-mono text-2xl sm:text-3xl font-normal text-on-surface">
              {formatPrice(order.totalCents)}
            </span>
          </div>
        </div>

        {/* Timeline Progression */}
        <OrderTimeline status={order.status} />

        {/* Destination and Transit Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4 border-t border-outline-variant">
          <div className="space-y-2">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.16em] text-on-surface-variant">
              Delivery Destination
            </h3>
            <div className="text-xs text-on-surface leading-relaxed font-sans">
              <p className="font-medium text-sm">{recipientName}</p>
              {streetAddress && <p>{streetAddress}</p>}
              {secondaryAddress && <p>{secondaryAddress}</p>}
              <p>
                {shippingAddr.city}, {shippingAddr.state} {shippingAddr.postalCode}
              </p>
              <p>{shippingAddr.country}</p>
              {shippingAddr.phone && (
                <p className="text-on-surface-variant font-mono mt-1 text-[11px]">
                  {shippingAddr.phone}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.16em] text-on-surface-variant">
              Transit Specification
            </h3>
            <div className="text-xs text-on-surface leading-relaxed font-sans">
              <p className="font-medium text-sm">{tier?.name || "Insured Ground Courier"}</p>
              <p className="text-on-surface-variant text-[11px]">
                {tier?.estimatedDays || "3-5 business days"} transit duration
              </p>
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-outline-variant/60 text-[10px] font-mono text-accent">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>TAMPER-EVIDENT HOROLOGICAL VAULT SEAL</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Line Item Manifest & Financial Ledger */}
      <div className="border border-outline bg-surface-bright p-6 sm:p-10 space-y-8">
        <div>
          <h2 className="text-[10px] font-mono uppercase tracking-[0.16em] text-on-surface-variant mb-4">
            Allocation Manifest ({items.length} {items.length === 1 ? "Timepiece" : "Timepieces"})
          </h2>
          <div className="divide-y divide-outline-variant">
            {items.map((item) => (
              <div
                key={item.id}
                className="py-5 flex items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <h4 className="font-serif text-lg sm:text-xl font-normal text-on-surface truncate">
                    {item.title}
                  </h4>
                  <p className="text-xs font-mono uppercase tracking-wider text-on-surface-variant">
                    {item.variantName} × {item.quantity}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-mono text-sm sm:text-base font-medium text-on-surface">
                    {formatPrice(item.unitPriceCents * item.quantity)}
                  </p>
                  {item.quantity > 1 && (
                    <p className="text-[11px] font-mono text-on-surface-variant">
                      {formatPrice(item.unitPriceCents)} each
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ledger Breakdown */}
        <div className="border-t border-outline-variant pt-6 space-y-3">
          <div className="flex justify-between text-xs text-on-surface-variant">
            <span>Subtotal</span>
            <span className="font-mono text-on-surface">{formatPrice(order.subtotalCents)}</span>
          </div>

          {order.discountCents > 0 && (
            <div className="flex justify-between text-xs text-accent">
              <span>Promotion ({order.promoCode || "Privilege Access"})</span>
              <span className="font-mono">-{formatPrice(order.discountCents)}</span>
            </div>
          )}

          <div className="flex justify-between text-xs text-on-surface-variant">
            <span>Secure Transit ({tier?.name || "Standard"})</span>
            <span className="font-mono text-on-surface">
              {order.shippingCents === 0 ? "Complimentary" : formatPrice(order.shippingCents)}
            </span>
          </div>

          <div className="flex justify-between text-xs text-on-surface-variant">
            <span>Estimated Regional Tax</span>
            <span className="font-mono text-on-surface">{formatPrice(order.taxCents)}</span>
          </div>

          <div className="border-t border-outline pt-4 flex justify-between items-baseline">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-on-surface font-semibold">
                Total Allocated
              </span>
              <p className="text-[11px] text-on-surface-variant">USD including duties & insured transport</p>
            </div>
            <span className="font-mono text-2xl font-normal text-on-surface">
              {formatPrice(order.totalCents)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
