import {
  deleteOrDisableTheme,
  getTheme,
  updateTheme,
} from "@/lib/theme-store";
import { requireDashboardSession, unauthorizedResponse } from "@/lib/api-auth";

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ themeId: string }> },
) {
  const session = await requireDashboardSession();

  if (!session) {
    return unauthorizedResponse();
  }

  const { themeId } = await ctx.params;
  const theme = await getTheme(themeId);

  if (!theme) {
    return Response.json({ message: "Theme not found" }, { status: 404 });
  }

  return Response.json({ theme });
}

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ themeId: string }> },
) {
  const session = await requireDashboardSession();

  if (!session) {
    return unauthorizedResponse();
  }

  const { themeId } = await ctx.params;
  const body = await request.json().catch(() => ({}));
  const result = await updateTheme(themeId, body);

  if ("message" in result) {
    return Response.json({ message: result.message }, { status: result.status });
  }

  if ("errors" in result) {
    return Response.json(
      { errors: result.errors, warnings: result.warnings },
      { status: result.status },
    );
  }

  return Response.json({ theme: result.theme, warnings: result.warnings });
}

export async function DELETE(
  request: Request,
  ctx: { params: Promise<{ themeId: string }> },
) {
  const session = await requireDashboardSession();

  if (!session) {
    return unauthorizedResponse();
  }

  const { themeId } = await ctx.params;
  const hardDelete = new URL(request.url).searchParams.get("hard") === "true";
  const result = await deleteOrDisableTheme(themeId, hardDelete);

  if ("message" in result) {
    return Response.json({ message: result.message }, { status: result.status });
  }

  return Response.json({ ok: result.ok, deleted: result.deleted });
}
