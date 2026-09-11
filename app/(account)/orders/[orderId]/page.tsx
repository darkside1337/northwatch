import { redirect } from "next/navigation";

interface LegacyOrderDetailRedirectProps {
  params: Promise<{ orderId: string }>;
}

export default async function LegacyOrderDetailRedirect({ params }: LegacyOrderDetailRedirectProps) {
  const { orderId } = await params;
  redirect(`/account/orders/${orderId}`);
}
