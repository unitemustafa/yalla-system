import { createTheme, listThemes } from "@/lib/theme-store";
import { requireDashboardSession, unauthorizedResponse } from "@/lib/api-auth";

export async function GET() {
  const session = await requireDashboardSession();

  if (!session) {
    return unauthorizedResponse();
  }

  return Response.json(await listThemes());
}

export async function POST(request: Request) {
  const session = await requireDashboardSession();

  if (!session) {
    return unauthorizedResponse();
  }

  const body = await request.json().catch(() => ({}));
  const result = await createTheme(body);

  if (!result.theme) {
    return Response.json(
      { errors: result.errors, warnings: result.warnings },
      { status: 400 },
    );
  }

  return Response.json(
    { theme: result.theme, warnings: result.warnings },
    { status: 201 },
  );
}
