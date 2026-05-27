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
  const order = await updateOrder(orderNumber, {
    status: typeof body.status === "string" ? body.status : undefined,
  });

  if (!order) {
    return Response.json({ message: "Order not found" }, { status: 404 });
  }

  return Response.json({ order });
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
