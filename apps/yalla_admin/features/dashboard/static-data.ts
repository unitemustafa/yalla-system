import { branchOptions, deliveryZones } from "./reference-data";

export type DashboardOrder = {
  index: string;
  number: string;
  customer: string;
  phone: string;
  type: string;
  status: string;
  total: number;
  date: string;
  time: string;
  payment: string;
};

export const dashboardOrders: DashboardOrder[] = [
  {
    index: "1",
    number: "ORD-20260524-UEETJE",
    customer: "أماني محمود",
    phone: "+201040377043",
    type: "توصيل",
    status: "قيد الانتظار",
    total: 135,
    date: "الأحد، 24 مايو",
    time: "9:03 م",
    payment: "نقدي",
  },
  {
    index: "2",
    number: "ORD-20260524-YY3TSD",
    customer: "أحمد مرسي",
    phone: "+201130309753",
    type: "توصيل",
    status: "قيد الانتظار",
    total: 440,
    date: "الأحد، 24 مايو",
    time: "8:05 م",
    payment: "نقدي",
  },
  {
    index: "3",
    number: "ORD-20260524-GK41OD",
    customer: "يحيى خشبة",
    phone: "+201127466586",
    type: "توصيل",
    status: "مؤكد",
    total: 1445,
    date: "الأحد، 24 مايو",
    time: "6:56 م",
    payment: "نقدي",
  },
  {
    index: "4",
    number: "ORD-20260524-V374YK",
    customer: "محمد سالم",
    phone: "+201152011771",
    type: "توصيل",
    status: "مكتمل",
    total: 414,
    date: "الأحد، 24 مايو",
    time: "4:44 م",
    payment: "نقدي",
  },
  {
    index: "5",
    number: "ORD-20260524-D2W0RJ",
    customer: "mohamed Gamal",
    phone: "+201121675495",
    type: "توصيل",
    status: "مكتمل",
    total: 250,
    date: "الأحد، 24 مايو",
    time: "4:34 م",
    payment: "نقدي",
  },
];

export const loginDashboardSnapshot = {
  todayOrders: dashboardOrders.length,
  activeBranches: branchOptions.length,
  deliveryZones: deliveryZones.length,
  completedPercent: Math.round(
    (dashboardOrders.filter((order) => order.status === "مكتمل").length /
      dashboardOrders.length) *
      100,
  ),
  averagePreparationMinutes: 18,
};

export type LoginDashboardSnapshot = typeof loginDashboardSnapshot;
