export type DashboardOrder = Record<string, unknown> & {
  id?: string | number;
  number?: string;
  orderNumber?: string;
  customer?: unknown;
  status?: string;
};

export function listOrders(): DashboardOrder[] {
  return [];
}
