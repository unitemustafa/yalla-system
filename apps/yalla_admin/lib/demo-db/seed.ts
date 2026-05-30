import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { itemRows, type ItemRow } from "@/features/dashboard/data";

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

export type DashboardSeed = {
  items: ItemRow[];
  orders: DashboardOrder[];
};

const legacyStoreFilePath = join(process.cwd(), ".data", "dashboard-store.json");

// TODO: Store demo item prices and order dates as typed numeric/date fields in
// a planned migration. Keep strings now to preserve current dashboard behavior.
const seedOrders: DashboardOrder[] = [
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

function cloneItem(row: ItemRow): ItemRow {
  return { ...row };
}

function cloneOrder(order: DashboardOrder): DashboardOrder {
  return { ...order };
}

export function createSeedStore(): DashboardSeed {
  return {
    items: itemRows.map(cloneItem),
    orders: seedOrders.map(cloneOrder),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isItemRow(value: unknown): value is ItemRow {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value.index) &&
    isString(value.id) &&
    isString(value.image) &&
    isString(value.name) &&
    isString(value.description) &&
    isString(value.category) &&
    isString(value.subcategory) &&
    isString(value.calories) &&
    isString(value.price) &&
    isString(value.featured) &&
    typeof value.active === "boolean"
  );
}

function isDashboardOrder(value: unknown): value is DashboardOrder {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value.index) &&
    isString(value.number) &&
    isString(value.customer) &&
    isString(value.phone) &&
    isString(value.type) &&
    isString(value.status) &&
    typeof value.total === "number" &&
    isString(value.date) &&
    isString(value.time) &&
    isString(value.payment)
  );
}

function isDashboardSeed(value: unknown): value is DashboardSeed {
  if (!isRecord(value)) {
    return false;
  }

  return (
    Array.isArray(value.items) &&
    value.items.every(isItemRow) &&
    Array.isArray(value.orders) &&
    value.orders.every(isDashboardOrder)
  );
}

export function readLegacyStore() {
  try {
    if (!existsSync(legacyStoreFilePath)) {
      return null;
    }

    const store = JSON.parse(readFileSync(legacyStoreFilePath, "utf8")) as unknown;

    if (!isDashboardSeed(store)) {
      return null;
    }

    return {
      items: store.items.map(cloneItem),
      orders: store.orders.map(cloneOrder),
    };
  } catch {
    return null;
  }
}
