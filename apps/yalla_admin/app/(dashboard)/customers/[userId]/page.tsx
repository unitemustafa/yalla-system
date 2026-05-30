import { notFound } from "next/navigation";

import { UserDetailPage } from "@/features/dashboard/pages/user-detail";
import {
  dashboardUsers,
  findDashboardUser,
} from "@/features/dashboard/users/default-dashboard-users";
import { listOrders } from "@/lib/dashboard-store";

export const dynamic = "force-dynamic";

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

export function generateStaticParams() {
  return dashboardUsers.map((user) => ({
    userId: user.id,
  }));
}

export default async function CustomerDetailRoute({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const user = findDashboardUser(userId);

  if (!user) {
    notFound();
  }

  const orders = await listOrders();
  const userPhone = normalizePhone(user.phone);
  const userName = user.name.trim().toLowerCase();
  const userOrders = orders.filter((order) => {
    const orderPhone = normalizePhone(order.phone);

    return (
      (userPhone && orderPhone.endsWith(userPhone.slice(-10))) ||
      order.customer.trim().toLowerCase() === userName
    );
  });

  return <UserDetailPage user={user} orders={userOrders} />;
}
