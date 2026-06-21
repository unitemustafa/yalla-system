import { cookies } from "next/headers";

import { backendRefreshCookieName } from "@/lib/auth";
import { clearDashboardCookies, djangoFetch } from "@/lib/django-bff";

export async function POST() {
  const refreshToken = (await cookies()).get(backendRefreshCookieName)?.value;
  if (refreshToken) {
    await djangoFetch("auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  }
  await clearDashboardCookies();
  return Response.json({ ok: true });
}
