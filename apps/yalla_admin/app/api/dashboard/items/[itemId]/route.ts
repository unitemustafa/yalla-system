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
    image: typeof body.image === "string" ? body.image : undefined,
    name: typeof body.name === "string" ? body.name : undefined,
    description:
      typeof body.description === "string" ? body.description : undefined,
    category: typeof body.category === "string" ? body.category : undefined,
    subcategory:
      typeof body.subcategory === "string" ? body.subcategory : undefined,
    calories: typeof body.calories === "string" ? body.calories : undefined,
    price: typeof body.price === "string" ? body.price : undefined,
    variantDetails:
      typeof body.variantDetails === "string" ? body.variantDetails : undefined,
    visibilityMode:
      typeof body.visibilityMode === "string" ? body.visibilityMode : undefined,
    regionSlugs: Array.isArray(body.regionSlugs)
      ? body.regionSlugs.filter((item: unknown) => typeof item === "string")
      : undefined,
    regionNames: Array.isArray(body.regionNames)
      ? body.regionNames.filter((item: unknown) => typeof item === "string")
      : undefined,
    featured:
      typeof body.featured === "boolean" || typeof body.featured === "string"
        ? body.featured
        : undefined,
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
