import { extractBackendErrorMessage } from "@/lib/backend-auth";
import { clearDashboardCookies, djangoFetch } from "@/lib/django-bff";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const response = await djangoFetch("auth/change-password", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!response) {
    return Response.json({ message: "Authentication service is unavailable." }, { status: 503 });
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    return Response.json(
      { message: extractBackendErrorMessage(data, "Could not change password.") },
      { status: response.status },
    );
  }
  await clearDashboardCookies();
  return Response.json({ ok: true, message: "Password changed successfully." });
}
