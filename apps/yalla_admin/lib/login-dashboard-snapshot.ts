export type LoginDashboardSnapshot = {
  todayOrders: number;
  activeBranches: number;
  deliveryZones: number;
};

export const loginDashboardSnapshot: LoginDashboardSnapshot = {
  todayOrders: 128,
  activeBranches: 6,
  deliveryZones: 14,
};

export function getLoginDashboardSnapshot() {
  return loginDashboardSnapshot;
}
