import { Check, Clock, AlertCircle } from "lucide-react";
import type { OrderStatus } from "../types";

interface OrderTimelineProps {
  status: OrderStatus;
}

interface TimelineStep {
  id: string;
  label: string;
  description: string;
}

const STEPS: TimelineStep[] = [
  {
    id: "placed",
    label: "Order Placed",
    description: "Transaction initialized",
  },
  {
    id: "allocated",
    label: "Vault Allocated",
    description: "Serial numbers assigned",
  },
  {
    id: "dispatched",
    label: "Insured Transit",
    description: "Armored courier custody",
  },
  {
    id: "delivered",
    label: "Delivered",
    description: "Recipient signature verified",
  },
];

export function OrderTimeline({ status }: OrderTimelineProps) {
  if (status === "refunded") {
    return (
      <div className="border border-outline bg-surface-container-low p-6 flex items-start gap-4">
        <AlertCircle className="w-5 h-5 text-on-surface-variant shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-serif text-lg font-medium text-on-surface">Order Refunded</p>
          <p className="text-xs text-on-surface-variant font-mono">
            Settlement has been fully reversed to your original payment method. Inventory allocations have been returned to the vault.
          </p>
        </div>
      </div>
    );
  }

  if (status === "canceled") {
    return (
      <div className="border border-error/30 bg-surface p-6 flex items-start gap-4">
        <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-serif text-lg font-medium text-error">Order Canceled</p>
          <p className="text-xs text-on-surface-variant font-mono">
            This acquisition was canceled before vault dispatch. No settlement was processed.
          </p>
        </div>
      </div>
    );
  }

  // Determine active step index:
  // 0: pending_payment
  // 1: paid
  // 2: shipped
  // 3: delivered
  const activeStepIndex =
    status === "delivered"
      ? 3
      : status === "shipped"
        ? 2
        : status === "paid"
          ? 1
          : 0;

  return (
    <div className="border border-outline bg-surface-bright p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-outline-variant pb-3">
        <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-on-surface-variant">
          Fulfillment Lifecycle
        </span>
        <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-accent">
          {status === "delivered"
            ? "Completed"
            : status === "shipped"
              ? "In Transit"
              : status === "paid"
                ? "Vault Processing"
                : "Awaiting Settlement"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative">
        {STEPS.map((step, index) => {
          const isCompleted = index <= activeStepIndex && status !== "pending_payment";
          const isCurrent = index === activeStepIndex;

          return (
            <div key={step.id} className="flex sm:flex-col items-start gap-3.5 sm:gap-3">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border transition-colors ${
                  isCompleted
                    ? "bg-primary border-primary text-on-primary"
                    : isCurrent
                      ? "border-accent text-accent bg-surface"
                      : "border-outline text-on-surface-variant/40 bg-surface"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5" />
                ) : isCurrent ? (
                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                ) : (
                  <span className="text-[10px] font-mono">{index + 1}</span>
                )}
              </div>

              <div className="space-y-0.5">
                <p
                  className={`text-xs font-mono uppercase tracking-wider ${
                    isCompleted || isCurrent
                      ? "text-on-surface font-medium"
                      : "text-on-surface-variant/60"
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-[11px] text-on-surface-variant">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
