import {
  deleteOrder,
  updateOrder,
} from "@/lib/dashboard-store";
import { requireDashboardSession, unauthorizedResponse } from "@/lib/api-auth";

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/dashboard/orders/[orderNumber]">,
) {
  const session = await requireDashboardSession();

  if (!session) {
    return unauthorizedResponse();
  }

  const { orderNumber } = await ctx.params;
  const body = await request.json().catch(() => ({}));
  const total = Number(body.total);
  const order = await updateOrder(orderNumber, {
    customer: typeof body.customer === "string" ? body.customer : undefined,
    phone: typeof body.phone === "string" ? body.phone : undefined,
    type: typeof body.type === "string" ? body.type : undefined,
    status: typeof body.status === "string" ? body.status : undefined,
    total: Number.isFinite(total) ? total : undefined,
    date: typeof body.date === "string" ? body.date : undefined,
    time: typeof body.time === "string" ? body.time : undefined,
    payment: typeof body.payment === "string" ? body.payment : undefined,
  });

  if (!order) {
    return Response.json({ message: "Order not found" }, { status: 404 });
  }

  return Response.json({ order });
}

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/dashboard/orders/[orderNumber]">,
) {
  const session = await requireDashboardSession();

  if (!session) {
    return unauthorizedResponse();
  }

  const { orderNumber } = await ctx.params;
  const formData = await request.formData();
  const customer = formData.get("customer");
  const phone = formData.get("phone");
  const type = formData.get("type");
  const status = formData.get("status");
  const total = Number(formData.get("total"));
  const date = formData.get("date");
  const time = formData.get("time");
  const payment = formData.get("payment");
  const order = await updateOrder(orderNumber, {
    customer: typeof customer === "string" ? customer : undefined,
    phone: typeof phone === "string" ? phone : undefined,
    type: typeof type === "string" ? type : undefined,
    status: typeof status === "string" ? status : undefined,
    total: Number.isFinite(total) ? total : undefined,
    date: typeof date === "string" ? date : undefined,
    time: typeof time === "string" ? time : undefined,
    payment: typeof payment === "string" ? payment : undefined,
  });

  if (!order) {
    return Response.json({ message: "Order not found" }, { status: 404 });
  }

  return Response.redirect(
    new URL(`/orders/view/${encodeURIComponent(order.number)}`, request.url),
    303,
  );
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/dashboard/orders/[orderNumber]">,
) {
  const session = await requireDashboardSession();

  if (!session) {
    return unauthorizedResponse();
  }

  const { orderNumber } = await ctx.params;
  const deleted = await deleteOrder(orderNumber);

  if (!deleted) {
    return Response.json({ message: "Order not found" }, { status: 404 });
  }

  return Response.json({ ok: true });
}
