import type { OrderStatus } from "../types";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

interface StatusConfig {
  label: string;
  pipClass: string;
  containerClass: string;
}

const STATUS_CONFIGS: Record<OrderStatus, StatusConfig> = {
  paid: {
    label: "ALLOCATED // PAID",
    pipClass: "bg-accent",
    containerClass: "border-outline bg-surface text-accent",
  },
  shipped: {
    label: "IN TRANSIT",
    pipClass: "bg-[#71766F]",
    containerClass: "border-outline bg-surface text-on-surface",
  },
  delivered: {
    label: "DELIVERED",
    pipClass: "bg-accent",
    containerClass: "border-outline bg-surface text-on-surface",
  },
  refunded: {
    label: "REFUNDED",
    pipClass: "bg-[#8A8780]",
    containerClass: "border-outline bg-surface text-on-surface-variant",
  },
  canceled: {
    label: "CANCELED",
    pipClass: "bg-error",
    containerClass: "border-error/30 bg-surface text-error",
  },
  pending_payment: {
    label: "SETTLEMENT PENDING",
    pipClass: "bg-amber-600",
    containerClass: "border-amber-600/30 bg-surface text-amber-700",
  },
};

export function OrderStatusBadge({ status, className = "" }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIGS[status] ?? {
    label: status.toUpperCase(),
    pipClass: "bg-[#8A8780]",
    containerClass: "border-outline bg-surface text-on-surface-variant",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 border text-[10px] font-mono uppercase tracking-[0.14em] ${config.containerClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.pipClass}`} />
      <span>{config.label}</span>
    </span>
  );
}
