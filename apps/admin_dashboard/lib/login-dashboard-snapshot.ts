import { branchOptions, deliveryZones } from "@/features/dashboard/reference-data";
import { prisma } from "@/lib/prisma";
import { listOrders } from "@/lib/dashboard-store";

export type LoginDashboardSnapshot = {
  todayOrders: number;
  activeBranches: number;
  deliveryZones: number;
  completedPercent: number;
  averagePreparationMinutes: number;
};

const completedStatuses = new Set(["مكتمل"]);

function getLocalDayRange(referenceDate = new Date()) {
  const start = new Date(referenceDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

function extractMinutes(value: string) {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function averageDeliveryMinutes() {
  const zoneCount: number = deliveryZones.length;

  if (zoneCount === 0) {
    return 0;
  }

  const totalMinutes = deliveryZones.reduce(
    (sum, zone) => sum + extractMinutes(zone[5]),
    0,
  );

  return Math.round(totalMinutes / zoneCount);
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
}
