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

const codeAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const defaultItemImage =
  "https://bucket.ammenu.com/twins-cafe/tenantsthumbnails/1775081472381-tz4tlty8cn.webp";
const featuredYes = "\u0646\u0639\u0645";
const featuredNo = "\u0644\u0627";
const waitingStatus = "\u0642\u064a\u062f \u0627\u0644\u0627\u0646\u062a\u0638\u0627\u0631";
const confirmedStatus = "\u0645\u0624\u0643\u062f";
const completedStatus = "\u0645\u0643\u062a\u0645\u0644";
const cancelledStatus = "\u0645\u0644\u063a\u064a";
const pickupType = "\u0627\u0633\u062a\u0644\u0627\u0645 \u0645\u0646 \u0627\u0644\u0641\u0631\u0639";
const deliveryType = "\u062a\u0648\u0635\u064a\u0644";
const cashPayment = "\u0646\u0642\u062f\u064a";
const cardPayment = "\u0628\u0637\u0627\u0642\u0629 \u0628\u0646\u0643\u064a\u0629";
const walletPayment = "\u0645\u062d\u0641\u0638\u0629 \u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a\u0629";

export type CreateItemInput = {
  image?: string;
  name?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  calories?: string;
  price?: string;
  variantDetails?: string;
  visibilityMode?: string;
  regionSlugs?: string[];
  regionNames?: string[];
  featured?: boolean | string;
  active?: boolean;
};

export type CreateOrderInput = Partial<
  Pick<
    DashboardOrder,
    "customer" | "phone" | "type" | "status" | "total" | "date" | "time" | "payment"
  >
>;

function toPosition(index: string, fallback: number) {
  const position = Number(index);
  return Number.isFinite(position) ? position : fallback;
}

function randomSegment(length = 6) {
  return Array.from({ length }, () =>
    codeAlphabet[Math.floor(Math.random() * codeAlphabet.length)],
  ).join("");
}

function dateStamp(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function trimText(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizePrice(value: unknown) {
  const text = trimText(value, "0");
  return /\bEGP\b/i.test(text) ? text : `${text} EGP`;
}

function normalizeFeatured(value: CreateItemInput["featured"]) {
  if (typeof value === "boolean") {
    return value ? featuredYes : featuredNo;
  }

  return trimText(value, featuredNo);
}

function normalizeVisibilityMode(value: unknown) {
  return trimText(value).toLowerCase() === "regions" ? "regions" : "general";
}

function normalizeStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function stringifyList(value: unknown) {
  return JSON.stringify(normalizeStringArray(value));
}

function parseStoredList(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    return normalizeStringArray(parsed);
  } catch {
    return normalizeStringArray(value);
  }
}

function normalizeOrderType(value: unknown) {
  const text = trimText(value);
  if (text === "delivery") return deliveryType;
  if (text === "pickup") return pickupType;
  return text || deliveryType;
}

function normalizeOrderStatus(value: unknown) {
  const text = trimText(value);
  const lowered = text.toLowerCase();

  if (!text || /^\?+$/.test(text)) return waitingStatus;
  if (lowered === "pending" || lowered === "waiting") return waitingStatus;
  if (lowered === "confirmed") return confirmedStatus;
  if (lowered === "completed" || lowered === "complete") return completedStatus;
  if (lowered === "cancelled" || lowered === "canceled") return cancelledStatus;

  return text;
}

function normalizePayment(value: unknown) {
  const text = trimText(value);
  if (text === "cash") return cashPayment;
  if (text === "card") return cardPayment;
  if (text === "wallet") return walletPayment;
  return text || cashPayment;
}

function formatOrderDate(date = new Date()) {
  return new Intl.DateTimeFormat("ar-EG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Africa/Cairo",
  }).format(date);
}

function formatOrderTime(date = new Date()) {
  return new Intl.DateTimeFormat("ar-EG", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Africa/Cairo",
  }).format(date);
}

async function uniqueProductCode() {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = `PRD-${randomSegment()}`;
    const existing = await prisma.dashboardItem.findUnique({ where: { code } });

    if (!existing) {
      return code;
    }
  }

  return `PRD-${Date.now().toString(36).toUpperCase()}`;
}

async function uniqueOrderNumber(now = new Date()) {
  const prefix = `ORD-${dateStamp(now)}`;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const number = `${prefix}-${randomSegment()}`;
    const existing = await prisma.dashboardOrder.findUnique({ where: { number } });

    if (!existing) {
      return number;
    }
  }

  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

function toItemRow(item: DashboardItem): ItemRow {
  return {
    index: String(item.position),
    id: item.id,
    code: item.code,
    image: item.image,
    name: item.name,
    description: item.description,
    category: item.category,
    subcategory: item.subcategory,
    calories: item.calories,
    price: item.price,
    variantDetails: item.variantDetails ?? "{}",
    visibilityMode: normalizeVisibilityMode(item.visibilityMode),
    regionSlugs: parseStoredList(item.regionSlugs),
    regionNames: parseStoredList(item.regionNames),
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
    status: normalizeOrderStatus(order.status),
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
            code: item.code ?? `PRD-SEED-${String(index + 1).padStart(3, "0")}`,
            position: toPosition(item.index, index + 1),
            image: item.image,
            name: item.name,
            description: item.description,
            category: item.category,
            subcategory: item.subcategory,
            calories: item.calories,
            price: item.price,
            variantDetails: "{}",
            visibilityMode: item.visibilityMode ?? "general",
            regionSlugs: JSON.stringify(item.regionSlugs ?? []),
            regionNames: JSON.stringify(item.regionNames ?? []),
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
            status: normalizeOrderStatus(order.status),
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

export async function createItem(input: CreateItemInput) {
  await ensureSeeded();

  const name = trimText(input.name);

  if (!name) {
    return null;
  }

  const maxPosition = await prisma.dashboardItem.aggregate({
    _max: { position: true },
  });
  const code = await uniqueProductCode();
  const item = await prisma.dashboardItem.create({
    data: {
      id: code.toLowerCase(),
      code,
      position: (maxPosition._max.position ?? 0) + 1,
      image: trimText(input.image, defaultItemImage),
      name,
      description: trimText(input.description),
      category: trimText(input.category, "\u063a\u064a\u0631 \u0645\u0635\u0646\u0641"),
      subcategory: trimText(input.subcategory, "\u0639\u0627\u0645"),
      calories: trimText(input.calories),
      price: normalizePrice(input.price),
      variantDetails: trimText(input.variantDetails, "{}"),
      visibilityMode: normalizeVisibilityMode(input.visibilityMode),
      regionSlugs: stringifyList(input.regionSlugs),
      regionNames: stringifyList(input.regionNames),
      featured: normalizeFeatured(input.featured),
      active: input.active ?? true,
    },
  });

  return toItemRow(item);
}

export async function updateItem(
  itemId: string,
  patch: Partial<CreateItemInput>,
) {
  await ensureSeeded();

  const item = await prisma.dashboardItem.findUnique({ where: { id: itemId } });

  if (!item) {
    return null;
  }

  const updatedItem = await prisma.dashboardItem.update({
    where: { id: itemId },
    data: {
      image:
        typeof patch.image === "string" && patch.image.trim()
          ? trimText(patch.image, item.image)
          : item.image,
      name:
        typeof patch.name === "string" && patch.name.trim()
          ? trimText(patch.name, item.name)
          : item.name,
      description:
        typeof patch.description === "string"
          ? trimText(patch.description)
          : item.description,
      category:
        typeof patch.category === "string" && patch.category.trim()
          ? trimText(patch.category, item.category)
          : item.category,
      subcategory:
        typeof patch.subcategory === "string" && patch.subcategory.trim()
          ? trimText(patch.subcategory, item.subcategory)
          : item.subcategory,
      calories:
        typeof patch.calories === "string"
          ? trimText(patch.calories)
          : item.calories,
      price:
        typeof patch.price === "string" && patch.price.trim()
          ? normalizePrice(patch.price)
          : item.price,
      variantDetails:
        typeof patch.variantDetails === "string"
          ? trimText(patch.variantDetails, "{}")
          : item.variantDetails,
      visibilityMode:
        typeof patch.visibilityMode === "string"
          ? normalizeVisibilityMode(patch.visibilityMode)
          : item.visibilityMode,
      regionSlugs: Array.isArray(patch.regionSlugs)
        ? stringifyList(patch.regionSlugs)
        : item.regionSlugs,
      regionNames: Array.isArray(patch.regionNames)
        ? stringifyList(patch.regionNames)
        : item.regionNames,
      featured:
        typeof patch.featured === "boolean" ||
        typeof patch.featured === "string"
          ? normalizeFeatured(patch.featured)
          : item.featured,
      active:
        typeof patch.active === "boolean" ? patch.active : item.active,
    },
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
      code: await uniqueProductCode(),
      position,
      image: item.image,
      name: `${item.name} نسخة`,
      description: item.description,
      category: item.category,
      subcategory: item.subcategory,
      calories: item.calories,
      price: item.price,
      variantDetails: item.variantDetails ?? "{}",
      visibilityMode: item.visibilityMode,
      regionSlugs: item.regionSlugs,
      regionNames: item.regionNames,
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

export async function createOrder(input: CreateOrderInput) {
  await ensureSeeded();

  const now = new Date();
  const maxPosition = await prisma.dashboardOrder.aggregate({
    _max: { position: true },
  });
  const total = Number(input.total);
  const order = await prisma.dashboardOrder.create({
    data: {
      number: await uniqueOrderNumber(now),
      position: (maxPosition._max.position ?? 0) + 1,
      customer: trimText(input.customer, "\u0639\u0645\u064a\u0644 \u062c\u062f\u064a\u062f"),
      phone: trimText(input.phone, "\u063a\u064a\u0631 \u0645\u062a\u0627\u062d"),
      type: normalizeOrderType(input.type),
      status: normalizeOrderStatus(input.status),
      total: Number.isFinite(total) && total >= 0 ? total : 0,
      date: trimText(input.date, formatOrderDate(now)),
      time: trimText(input.time, formatOrderTime(now)),
      payment: normalizePayment(input.payment),
    },
  });

  return toOrderRow(order);
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
    data.status = normalizeOrderStatus(patch.status);
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
