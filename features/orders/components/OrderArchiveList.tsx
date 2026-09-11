import Link from "next/link";
import { OrderCard } from "./OrderCard";
import type { Order } from "../types";

interface OrderArchiveListProps {
  orders: Order[];
}

export function OrderArchiveList({ orders }: OrderArchiveListProps) {
  if (orders.length === 0) {
    return (
      <div className="border border-outline bg-surface-bright p-12 sm:p-16 text-center space-y-6">
        <div className="w-10 h-10 mx-auto border border-outline flex items-center justify-center font-mono text-xs text-on-surface-variant">
          00
        </div>
        <div className="space-y-1.5 max-w-md mx-auto">
          <h2 className="font-serif text-2xl font-normal text-on-surface">
            No Orders on Record
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            You currently have no verified transactions recorded in the Northwatch registry.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/products"
            className="inline-block px-8 py-3.5 bg-primary text-on-primary text-xs font-mono uppercase tracking-[0.14em] hover:bg-primary-hover transition-colors cursor-pointer"
          >
            Explore Timepieces →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
