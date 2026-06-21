import {
  extractBackendErrorMessage,
  isAllowedDashboardRole,
  normalizeDashboardUser,
  type BackendUser,
} from "@/lib/backend-auth";
import { djangoFetch, renewDashboardSession } from "@/lib/django-bff";

async function accountResponse(response: Response | null) {
  if (!response) {
    return Response.json({ message: "Account service is unavailable." }, { status: 503 });
  }
  const data = (await response.json().catch(() => null)) as
    | { user?: BackendUser }
    | null;
  if (!response.ok) {
    return Response.json(
      { message: extractBackendErrorMessage(data, "Account request failed.") },
      { status: response.status },
    );
  }
  const user = normalizeDashboardUser(data?.user);
  if (!user || !isAllowedDashboardRole(user.role)) {
    return Response.json({ message: "Admin role is required." }, { status: 403 });
  }
  await renewDashboardSession(user);
  return Response.json({ user });
}

export async function GET() {
  return accountResponse(await djangoFetch("auth/me"));
}

export async function PATCH(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  const body = contentType.includes("multipart/form-data")
    ? await request.formData()
    : JSON.stringify(await request.json().catch(() => ({})));
  return accountResponse(
    await djangoFetch("auth/me", {
      method: "PATCH",
      body,
    }),
  );
}
