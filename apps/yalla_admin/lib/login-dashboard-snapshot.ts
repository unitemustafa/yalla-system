<<<<<<< HEAD
import { branchOptions, deliveryZones } from "@/features/dashboard/reference-data";
import { prisma } from "@/lib/prisma";
import { listOrders } from "@/lib/dashboard-store";

=======
>>>>>>> 56ecfc2 (link dashboard order, items,auth api with backend)
export type LoginDashboardSnapshot = {
  todayOrders: number;
  activeBranches: number;
  deliveryZones: number;
};

<<<<<<< HEAD
const completedStatuses = new Set(["مكتمل"]);

function getLocalDayRange(referenceDate = new Date()) {
  const start = new Date(referenceDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

function averageDeliveryMinutes() {
  return 18;
}

export async function getLoginDashboardSnapshot(): Promise<LoginDashboardSnapshot> {
  const { start, end } = getLocalDayRange();
  const orders = await listOrders();
  const totalOrders = orders.length;
  const completedOrders = orders.filter((order) =>
    completedStatuses.has(order.status),
  ).length;
  const todayOrders = await prisma.dashboardOrder.count({
    where: {
      createdAt: {
        gte: start,
        lt: end,
      },
    },
  });

  return {
    todayOrders,
    activeBranches: branchOptions.length,
    deliveryZones: deliveryZones.length,
    completedPercent:
      totalOrders === 0 ? 0 : Math.round((completedOrders / totalOrders) * 100),
    averagePreparationMinutes: averageDeliveryMinutes(),
  };
=======
export const loginDashboardSnapshot: LoginDashboardSnapshot = {
  todayOrders: 128,
  activeBranches: 6,
  deliveryZones: 14,
};

export function getLoginDashboardSnapshot() {
  return loginDashboardSnapshot;
>>>>>>> 56ecfc2 (link dashboard order, items,auth api with backend)
}
