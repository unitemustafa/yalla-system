import { cookies } from "next/headers";

import type { ItemRow } from "@/features/dashboard/data";
import { backendAccessCookieName } from "@/lib/auth";
import { backendApiBaseUrl } from "@/lib/backend-auth";

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

export type CreateItemInput = {
  image?: string;
  name?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  shopName?: string;
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
    | "customer"
    | "phone"
    | "type"
    | "status"
    | "total"
    | "date"
    | "time"
    | "payment"
  >
>;

type DashboardStats = {
  todayOrders: number;
  completedPercent: number;
};

class DashboardApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function dashboardRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(backendAccessCookieName)?.value;

  if (!accessToken) {
    throw new DashboardApiError("Backend access token is missing.", 401);
  }

  const response = await fetch(
    `${backendApiBaseUrl()}/dashboard/${path.replace(/^\/+/, "")}`,
    {
      ...init,
      headers: {
        authorization: `Bearer ${accessToken}`,
        ...(init.body ? { "content-type": "application/json" } : {}),
        ...init.headers,
      },
      cache: "no-store",
    },
  ).catch(() => null);

  if (!response) {
    throw new DashboardApiError("Dashboard API is unavailable.", 503);
  }

  const data = (await response.json().catch(() => null)) as T | null;

  if (!response.ok) {
    const record =
      data && typeof data === "object" ? (data as Record<string, unknown>) : null;
    const message =
      (typeof record?.message === "string" && record.message) ||
      (typeof record?.detail === "string" && record.detail) ||
      "Dashboard API request failed.";
    throw new DashboardApiError(message, response.status);
  }

  return data as T;
}

export async function listItems() {
  const data = await dashboardRequest<{ items: ItemRow[] }>("items");
  return data.items;
}

export async function createItem(input: CreateItemInput) {
  if (!input.name?.trim()) {
    return null;
  }

  const data = await dashboardRequest<{ item: ItemRow }>("items", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.item;
}

export async function updateItem(
  itemId: string,
  patch: Partial<CreateItemInput>,
) {
  try {
    const data = await dashboardRequest<{ item: ItemRow }>(
      `items/${encodeURIComponent(itemId)}`,
      {
        method: "PATCH",
        body: JSON.stringify(patch),
      },
    );
    return data.item;
  } catch (error) {
    if (error instanceof DashboardApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function duplicateItem(itemId: string) {
  try {
    const data = await dashboardRequest<{ item: ItemRow }>(
      `items/${encodeURIComponent(itemId)}/duplicate`,
      { method: "POST" },
    );
    return data.item;
  } catch (error) {
    if (error instanceof DashboardApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function deleteItem(itemId: string) {
  try {
    await dashboardRequest<{ ok: boolean }>(
      `items/${encodeURIComponent(itemId)}`,
      { method: "DELETE" },
    );
    return true;
  } catch (error) {
    if (error instanceof DashboardApiError && error.status === 404) {
      return false;
    }
    throw error;
  }
}

export async function listOrders() {
  const data = await dashboardRequest<{ orders: DashboardOrder[] }>("orders");
  return data.orders;
}

export async function createOrder(input: CreateOrderInput) {
  const data = await dashboardRequest<{ order: DashboardOrder }>("orders", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.order;
}

export async function updateOrder(
  orderNumber: string,
  patch: CreateOrderInput,
) {
  try {
    const data = await dashboardRequest<{ order: DashboardOrder }>(
      `orders/${encodeURIComponent(orderNumber)}`,
      {
        method: "PATCH",
        body: JSON.stringify(patch),
      },
    );
    return data.order;
  } catch (error) {
    if (error instanceof DashboardApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function deleteOrder(orderNumber: string) {
  try {
    await dashboardRequest<{ ok: boolean }>(
      `orders/${encodeURIComponent(orderNumber)}`,
      { method: "DELETE" },
    );
    return true;
  } catch (error) {
    if (error instanceof DashboardApiError && error.status === 404) {
      return false;
    }
    throw error;
  }
}

export async function getDashboardStats() {
  return dashboardRequest<DashboardStats>("stats");
}
