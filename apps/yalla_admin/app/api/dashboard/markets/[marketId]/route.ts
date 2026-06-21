import { dashboardBff } from "@/lib/dashboard-bff";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ marketId: string }> },
) {
  const { marketId } = await context.params;
  return dashboardBff(`markets/${encodeURIComponent(marketId)}`, {
    method: "PATCH",
    body: JSON.stringify(await request.json().catch(() => ({}))),
  });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ marketId: string }> },
) {
  const { marketId } = await context.params;
  return dashboardBff(`markets/${encodeURIComponent(marketId)}`, {
    method: "DELETE",
  });
}
