import { activateTheme } from "@/lib/theme-store";
import { requireDashboardSession, unauthorizedResponse } from "@/lib/api-auth";

export async function POST(
  request: Request,
  ctx: { params: Promise<{ themeId: string }> },
) {
  const session = await requireDashboardSession();

  if (!session) {
    return unauthorizedResponse();
  }

  const { themeId } = await ctx.params;
  const body = await request.json().catch(() => ({}));
  const result = await activateTheme(themeId, body);

  if ("message" in result) {
    return Response.json({ message: result.message }, { status: result.status });
  }

  return Response.json({
    theme: result.theme,
    activeByTarget: result.activeByTarget,
  });
}
