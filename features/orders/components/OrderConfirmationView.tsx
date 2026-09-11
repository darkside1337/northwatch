import Link from "next/link";
import { CheckCircle2, Clock, ArrowRight, ShieldCheck } from "lucide-react";
import { formatPrice, siteConfig } from "@/config/site";
import { OrderSettlementPoller } from "./OrderSettlementPoller";
import type { Order } from "../types";

interface OrderConfirmationViewProps {
  order: Order;
}

export function OrderConfirmationView({ order }: OrderConfirmationViewProps) {
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
  };
  const recipientName =
    shippingAddr.name ||
    (shippingAddr.firstName && shippingAddr.lastName
      ? `${shippingAddr.firstName} ${shippingAddr.lastName}`
      : shippingAddr.firstName || "Recipient");
  const streetAddress = shippingAddr.street || shippingAddr.line1;
  const secondaryAddress = shippingAddr.apartment || shippingAddr.line2;

  const isPaid =
    order.status === "paid" ||
    order.status === "shipped" ||
    order.status === "delivered";
  const tier =
    order.shippingTierId in siteConfig.shipping.tiers
      ? siteConfig.shipping.tiers[
          order.shippingTierId as keyof typeof siteConfig.shipping.tiers
        ]
      : siteConfig.shipping.tiers.standard;

  return (
    <div className="max-w-3xl mx-auto space-y-10 py-6 sm:py-12">
      <OrderSettlementPoller isPaid={isPaid} />
      {/* Header Banner */}
      <div className="border border-outline/60 bg-surface-bright p-8 sm:p-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-outline-variant/60 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isPaid ? "bg-accent" : "bg-amber-600"
                }`}
              />
              <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-on-surface-variant">
                {isPaid
                  ? "VAULT ALLOCATION CONFIRMED"
                  : "AWAITING SETTLEMENT CONFIRMATION"}
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-foreground">
              {isPaid ? "Acquisition Confirmed" : "Order Processing"}
            </h1>
          </div>
          <div className="sm:text-right font-mono">
            <p className="text-[11px] uppercase tracking-wider text-on-surface-variant">
              Order Reference
            </p>
            <p className="text-base font-semibold text-foreground tracking-tight">
              NW-{order.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>

        {/* Status Callout */}
        <div
          className={`p-4 border text-sm flex items-start gap-3.5 ${
            isPaid
              ? "bg-accent/5 border-accent/20 text-on-surface"
              : "bg-amber-500/5 border-amber-500/20 text-on-surface"
          }`}
        >
          {isPaid ? (
            <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          ) : (
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1 text-[13px] leading-relaxed">
            <p className="font-semibold">
              {isPaid
                ? "Payment authorized and verified. Your serial allocation has been locked."
                : "Your payment instruction has been initiated and is awaiting banking settlement."}
            </p>
            <p className="text-on-surface-variant text-[12px]">
              An encrypted receipt and transit manifest will be transmitted to{" "}
              <strong className="text-foreground font-medium">
                {order.email}
              </strong>
              .
            </p>
          </div>
        </div>

        {/* Dispatch & Delivery Manifest */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2">
            <h3 className="text-[11px] font-mono uppercase tracking-[0.14em] text-on-surface-variant">
              Delivery Destination
            </h3>
            <div className="text-[13px] text-foreground leading-relaxed">
              <p className="font-medium">{recipientName}</p>
              {streetAddress && <p>{streetAddress}</p>}
              {secondaryAddress && <p>{secondaryAddress}</p>}
              <p>
                {shippingAddr.city}, {shippingAddr.state}{" "}
                {shippingAddr.postalCode}
              </p>
              <p>{shippingAddr.country}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-[11px] font-mono uppercase tracking-[0.14em] text-on-surface-variant">
              Transit Specification
            </h3>
            <div className="text-[13px] text-foreground leading-relaxed">
              <p className="font-medium">
                {tier?.name || "Standard Vault Courier"}
              </p>
              <p className="text-on-surface-variant text-[12px]">
                {tier?.estimatedDays || "3-5 business days"} tracked delivery
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-on-surface-variant font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                <span>TAMPER-EVIDENT HOROLOGICAL VAULT SEAL</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Line Items & Financial Summary */}
      <div className="border border-outline/60 bg-surface-bright p-8 sm:p-10 space-y-8">
        <div>
          <h2 className="text-[11px] font-mono uppercase tracking-[0.16em] text-on-surface-variant mb-4">
            Allocation Manifest ({order.items.length}{" "}
            {order.items.length === 1 ? "Item" : "Items"})
          </h2>
          <div className="divide-y divide-outline-variant/50">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="py-4 flex items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <h4 className="font-serif text-lg font-normal text-foreground truncate">
                    {item.title}
                  </h4>
                  <p className="text-[12px] font-mono uppercase tracking-wider text-on-surface-variant">
                    {item.variantName} × {item.quantity}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono text-sm font-medium text-foreground">
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
        <div className="border-t border-outline-variant/60 pt-6 space-y-3">
          <div className="flex justify-between text-[13px] text-on-surface-variant">
            <span>Subtotal</span>
            <span className="font-mono text-foreground">
              {formatPrice(order.subtotalCents)}
            </span>
          </div>

          {order.discountCents > 0 && (
            <div className="flex justify-between text-[13px] text-accent">
              <span>Promotion ({order.promoCode || "Privilege Access"})</span>
              <span className="font-mono">
                -{formatPrice(order.discountCents)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-[13px] text-on-surface-variant">
            <span>Secure Transit ({tier?.name || "Standard"})</span>
            <span className="font-mono text-foreground">
              {order.shippingCents === 0
                ? "Complimentary"
                : formatPrice(order.shippingCents)}
            </span>
          </div>

          <div className="flex justify-between text-[13px] text-on-surface-variant">
            <span>Estimated Regional Tax</span>
            <span className="font-mono text-foreground">
              {formatPrice(order.taxCents)}
            </span>
          </div>

          <div className="border-t border-outline/60 pt-4 flex justify-between items-baseline">
            <div className="space-y-0.5">
              <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-foreground font-semibold">
                Total Allocated
              </span>
              <p className="text-[11px] text-on-surface-variant">
                USD including duties & insured transit
              </p>
            </div>
            <span className="font-mono text-2xl font-normal text-foreground">
              {formatPrice(order.totalCents)}
            </span>
          </div>
        </div>
      </div>

      {/* Post-Purchase Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <Link
          href="/products"
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 border border-outline text-foreground text-[11px] font-mono uppercase tracking-[0.14em] hover:bg-surface-container transition-colors"
        >
          Return to Storefront
        </Link>
        <Link
          href="/account/orders"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-on-primary text-[11px] font-mono uppercase tracking-[0.14em] hover:bg-primary-hover transition-colors"
        >
          <span>View in Order Archive</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
