import {
  deleteItem,
  updateItem,
} from "@/lib/dashboard-store";
import { requireDashboardSession, unauthorizedResponse } from "@/lib/api-auth";

export async function PATCH(request: Request, ctx: RouteContext<"/api/dashboard/items/[itemId]">) {
  const session = await requireDashboardSession();

  if (!session) {
    return unauthorizedResponse();
  }

  const { itemId } = await ctx.params;
  const body = await request.json().catch(() => ({}));
  const item = await updateItem(itemId, {
    active: typeof body.active === "boolean" ? body.active : undefined,
  });

  if (!item) {
    return Response.json({ message: "Item not found" }, { status: 404 });
  }

  return Response.json({ item });
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/dashboard/items/[itemId]">) {
  const session = await requireDashboardSession();

  if (!session) {
    return unauthorizedResponse();
  }

  const { itemId } = await ctx.params;
  const deleted = await deleteItem(itemId);

  if (!deleted) {
    return Response.json({ message: "Item not found" }, { status: 404 });
  }

  return Response.json({ ok: true });
}
