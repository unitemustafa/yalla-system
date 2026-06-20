import { requireDashboardSession, unauthorizedResponse } from "@/lib/api-auth";

export async function GET() {
  const session = await requireDashboardSession();

  if (!session) {
    return unauthorizedResponse();
  }

  return Response.json({
    email: session.email,
    name: session.name,
    role: session.role,
  });
}
