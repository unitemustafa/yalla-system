<<<<<<< HEAD
export * from "@/lib/demo-db/dashboard-store";
=======
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
>>>>>>> 56ecfc2 (link dashboard order, items,auth api with backend)
