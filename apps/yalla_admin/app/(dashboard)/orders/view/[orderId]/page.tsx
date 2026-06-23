import { notFound } from "next/navigation";

import { OrderDetailPage } from "@/features/dashboard/pages/order-detail";
import { dashboardOrders } from "@/features/dashboard/static-data";

export default async function OrderDetailRoute({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = dashboardOrders.find(
    (currentOrder) => currentOrder.number === orderId,
  );

  if (!order) {
    notFound();
  }

  return <OrderDetailPage order={order} />;
}
