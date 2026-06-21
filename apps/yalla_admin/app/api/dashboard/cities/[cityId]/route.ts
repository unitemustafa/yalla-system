import { dashboardBff } from "@/lib/dashboard-bff";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ cityId: string }> },
) {
  const { cityId } = await context.params;
  return dashboardBff(`cities/${encodeURIComponent(cityId)}`, {
    method: "PATCH",
    body: JSON.stringify(await request.json().catch(() => ({}))),
  });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ cityId: string }> },
) {
  const { cityId } = await context.params;
  return dashboardBff(`cities/${encodeURIComponent(cityId)}`, {
    method: "DELETE",
  });
}
