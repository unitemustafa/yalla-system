import { notFound } from "next/navigation";

import { OrderDetailPage } from "@/features/dashboard/pages/order-detail";
import { listOrders } from "@/lib/dashboard-store";

export const dynamic = "force-dynamic";

export default async function OrderDetailRoute({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const orders = await listOrders();
  const order = orders.find((currentOrder) => currentOrder.number === orderId);

  if (!order) {
    notFound();
  }

  return <OrderDetailPage order={order} />;
}
