import {
  branchOptions,
  deliveryZones,
} from "@/features/dashboard/reference-data";
import { getDashboardStats } from "@/lib/dashboard-store";

export type LoginDashboardSnapshot = {
  todayOrders: number;
  activeBranches: number;
  deliveryZones: number;
  completedPercent: number;
  averagePreparationMinutes: number;
};

export async function getLoginDashboardSnapshot(): Promise<LoginDashboardSnapshot> {
  const stats = await getDashboardStats().catch(() => ({
    todayOrders: 0,
    completedPercent: 0,
  }));

  return {
    todayOrders: stats.todayOrders,
    activeBranches: branchOptions.length,
    deliveryZones: deliveryZones.length,
    completedPercent: stats.completedPercent,
    averagePreparationMinutes: 18,
  };
}
