import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { getOrderById, OrderDetailView } from "@/features/orders";

export const instant = false;

interface OrderDetailPageProps {
  params: Promise<{ orderId: string }>;
}

export async function generateMetadata({ params }: OrderDetailPageProps) {
  const { orderId } = await params;
  return {
    title: `Order Record NW-${orderId.slice(0, 8).toUpperCase()} — Northwatch`,
    description: "Itemized horological acquisition receipt and transit details.",
  };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderId } = await params;
  const sessionData = await requireAuth(`/account/orders/${orderId}`);

  // Fetch scoped order — returns null if order does not belong to sessionData.user.id (IDOR defense)
  const order = await getOrderById(orderId, sessionData.user.id);

  if (!order) {
    notFound();
  }

  return <OrderDetailView order={order} />;
}
