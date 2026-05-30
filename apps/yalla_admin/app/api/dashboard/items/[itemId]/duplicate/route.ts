import { duplicateItem } from "@/lib/dashboard-store";
import { requireDashboardSession, unauthorizedResponse } from "@/lib/api-auth";

export async function POST(_request: Request, ctx: RouteContext<"/api/dashboard/items/[itemId]/duplicate">) {
  const session = await requireDashboardSession();

  if (!session) {
    return unauthorizedResponse();
  }

  const { itemId } = await ctx.params;
  const item = await duplicateItem(itemId);

  if (!item) {
    return Response.json({ message: "Item not found" }, { status: 404 });
  }

  return Response.json({ item }, { status: 201 });
}
