import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { getOrderById } from "@/features/orders/queries";
import { OrderConfirmationView } from "@/features/orders";

export const instant = false;

interface ConfirmationPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderConfirmationPage({ params }: ConfirmationPageProps) {
  const { orderId } = await params;
  const sessionData = await requireAuth(`/confirmation/${orderId}`);

  const order = await getOrderById(orderId, sessionData.user.id);
  if (!order) {
    notFound();
  }

  return <OrderConfirmationView order={order} />;
}
