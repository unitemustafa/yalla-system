import { createItem, listItems } from "@/lib/dashboard-store";
import { requireDashboardSession, unauthorizedResponse } from "@/lib/api-auth";

export async function GET() {
  const session = await requireDashboardSession();

  if (!session) {
    return unauthorizedResponse();
  }

  return Response.json({ items: await listItems() });
}

export async function POST(request: Request) {
  const session = await requireDashboardSession();

  if (!session) {
    return unauthorizedResponse();
  }

  const body = await request.json().catch(() => ({}));
  const item = await createItem({
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
    return Response.json({ message: "Product name is required" }, { status: 400 });
  }

  return Response.json({ item }, { status: 201 });
}
