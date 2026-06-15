import { requireDashboardSession, unauthorizedResponse } from "@/lib/api-auth";
import { getDashboardAccountEmail } from "@/lib/account-email";

export async function GET() {
  const session = await requireDashboardSession();

  if (!session) {
    return unauthorizedResponse();
  }

  return Response.json({
    email: getDashboardAccountEmail(),
  });
}
