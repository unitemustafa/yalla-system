import "server-only";

import { extractBackendErrorMessage } from "@/lib/backend-auth";
import { djangoFetch } from "@/lib/django-bff";

export async function dashboardBff(
  path: string,
  init: RequestInit = {},
) {
  const response = await djangoFetch(`dashboard/${path.replace(/^\/+/, "")}`, init);
  if (!response) {
    return Response.json({ message: "Dashboard service is unavailable." }, { status: 503 });
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    return Response.json(
      { message: extractBackendErrorMessage(data, "Dashboard request failed.") },
      { status: response.status },
    );
  }
  return Response.json(data, { status: response.status });
}
