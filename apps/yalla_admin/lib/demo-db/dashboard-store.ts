import type { DashboardItem, DashboardOrder as PrismaDashboardOrder } from "@prisma/client";

import type { ItemRow } from "@/features/dashboard/data";
import { prisma } from "@/lib/prisma";

import { ensureDashboardSchema } from "./schema";
import {
  createSeedStore,
  readLegacyStore,
  type DashboardOrder,
} from "./seed";

export type { DashboardOrder } from "./seed";

let seedPromise: Promise<void> | null = null;

function toPosition(index: string, fallback: number) {
  const position = Number(index);
  return Number.isFinite(position) ? position : fallback;
}

function toItemRow(item: DashboardItem): ItemRow {
  return {
    index: String(item.position),
    id: item.id,
    image: item.image,
    name: item.name,
    description: item.description,
    category: item.category,
    subcategory: item.subcategory,
    calories: item.calories,
    price: item.price,
    featured: item.featured,
    active: item.active,
  };
}

function toOrderRow(order: PrismaDashboardOrder): DashboardOrder {
  return {
    index: String(order.position),
    number: order.number,
    customer: order.customer,
    phone: order.phone,
    type: order.type,
    status: order.status,
    total: order.total,
    date: order.date,
    time: order.time,
    payment: order.payment,
  };
}

async function ensureSeeded() {
  if (!seedPromise) {
    seedPromise = (async () => {
      await ensureDashboardSchema();

      const [itemCount, orderCount] = await Promise.all([
        prisma.dashboardItem.count(),
        prisma.dashboardOrder.count(),
      ]);

      if (itemCount > 0 || orderCount > 0) {
        return;
      }

      const seed = readLegacyStore() ?? createSeedStore();

      await prisma.$transaction([
        prisma.dashboardItem.createMany({
          data: seed.items.map((item, index) => ({
            id: item.id,
            position: toPosition(item.index, index + 1),
            image: item.image,
            name: item.name,
            description: item.description,
            category: item.category,
            subcategory: item.subcategory,
            calories: item.calories,
            price: item.price,
            featured: item.featured,
            active: item.active,
          })),
        }),
        prisma.dashboardOrder.createMany({
          data: seed.orders.map((order, index) => ({
            number: order.number,
            position: toPosition(order.index, index + 1),
            customer: order.customer,
            phone: order.phone,
            type: order.type,
            status: order.status,
            total: order.total,
            date: order.date,
            time: order.time,
            payment: order.payment,
          })),
        }),
      ]);
    })();
  }

  await seedPromise;
}

export async function listItems() {
  await ensureSeeded();

  const items = await prisma.dashboardItem.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });

  return items.map(toItemRow);
}

export async function updateItem(
  itemId: string,
  patch: Partial<Pick<ItemRow, "active">>,
) {
  await ensureSeeded();

  const item = await prisma.dashboardItem.findUnique({ where: { id: itemId } });

  if (!item) {
    return null;
  }

  if (typeof patch.active !== "boolean") {
    return toItemRow(item);
  }

  const updatedItem = await prisma.dashboardItem.update({
    where: { id: itemId },
    data: { active: patch.active },
  });

  return toItemRow(updatedItem);
}

export async function duplicateItem(itemId: string) {
  await ensureSeeded();

  const item = await prisma.dashboardItem.findUnique({ where: { id: itemId } });

  if (!item) {
    return null;
  }

  const maxPosition = await prisma.dashboardItem.aggregate({
    _max: { position: true },
  });
  const position = (maxPosition._max.position ?? 0) + 1;
  const copy = await prisma.dashboardItem.create({
    data: {
      id: `${item.id}-copy-${Date.now()}`,
      position,
      image: item.image,
      name: `${item.name} نسخة`,
      description: item.description,
      category: item.category,
      subcategory: item.subcategory,
      calories: item.calories,
      price: item.price,
      featured: item.featured,
      active: item.active,
    },
  });

  return toItemRow(copy);
}

export async function deleteItem(itemId: string) {
  await ensureSeeded();

  const item = await prisma.dashboardItem.findUnique({ where: { id: itemId } });

  if (!item) {
    return false;
  }

  await prisma.dashboardItem.delete({ where: { id: itemId } });

  return true;
}

export async function listOrders() {
  await ensureSeeded();

  const orders = await prisma.dashboardOrder.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });

  return orders.map(toOrderRow);
}

export async function updateOrder(
  orderNumber: string,
  patch: Partial<
    Pick<
      DashboardOrder,
      "customer" | "phone" | "type" | "status" | "total" | "date" | "time" | "payment"
    >
  >,
) {
  await ensureSeeded();

  const order = await prisma.dashboardOrder.findUnique({
    where: { number: orderNumber },
  });

  if (!order) {
    return null;
  }

  const data: Partial<
    Pick<
      PrismaDashboardOrder,
      "customer" | "phone" | "type" | "status" | "total" | "date" | "time" | "payment"
    >
  > = {};

  if (typeof patch.customer === "string" && patch.customer.trim()) {
    data.customer = patch.customer.trim();
  }
  if (typeof patch.phone === "string" && patch.phone.trim()) {
    data.phone = patch.phone.trim();
  }
  if (typeof patch.type === "string" && patch.type.trim()) {
    data.type = patch.type.trim();
  }
  if (typeof patch.status === "string" && patch.status.trim()) {
    data.status = patch.status.trim();
  }
  if (typeof patch.total === "number" && Number.isFinite(patch.total)) {
    data.total = patch.total;
  }
  if (typeof patch.date === "string" && patch.date.trim()) {
    data.date = patch.date.trim();
  }
  if (typeof patch.time === "string" && patch.time.trim()) {
    data.time = patch.time.trim();
  }
  if (typeof patch.payment === "string" && patch.payment.trim()) {
    data.payment = patch.payment.trim();
  }

  if (!Object.keys(data).length) {
    return toOrderRow(order);
  }

  const updatedOrder = await prisma.dashboardOrder.update({
    where: { number: orderNumber },
    data,
  });

  return toOrderRow(updatedOrder);
}

export async function deleteOrder(orderNumber: string) {
  await ensureSeeded();

  const order = await prisma.dashboardOrder.findUnique({
    where: { number: orderNumber },
  });

  if (!order) {
    return false;
  }

  await prisma.dashboardOrder.delete({ where: { number: orderNumber } });

  return true;
}
