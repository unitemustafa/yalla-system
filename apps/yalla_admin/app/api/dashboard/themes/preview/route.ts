import { previewTheme } from "@/lib/theme-store";
import { requireDashboardSession, unauthorizedResponse } from "@/lib/api-auth";

export async function POST(request: Request) {
  const session = await requireDashboardSession();

  if (!session) {
    return unauthorizedResponse();
  }

  const body = await request.json().catch(() => ({}));
  const result = await previewTheme(body);

  if (result.status !== 200) {
    return Response.json({ errors: result.errors }, { status: result.status });
  }

  return Response.json({
    preview: result.preview,
    warnings: result.warnings,
  });
}
