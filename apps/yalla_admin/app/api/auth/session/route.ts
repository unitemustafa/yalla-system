import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  isAllowedDashboardRole,
  normalizeDashboardUser,
  type BackendUser,
} from "@/lib/backend-auth";
import {
  clearDashboardCookies,
  djangoFetch,
  renewDashboardSession,
} from "@/lib/django-bff";
import {
  authCookieMaxAge,
  authCookieName,
  readSessionToken,
  rememberedAuthCookieMaxAge,
} from "@/lib/auth";

export async function GET() {
  const session = readSessionToken(
    (await cookies()).get(authCookieName)?.value,
  );
  const backendResponse = await djangoFetch("auth/me");
  if (!backendResponse?.ok) {
    await clearDashboardCookies();
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  const data = (await backendResponse.json().catch(() => null)) as
    | { user?: BackendUser }
    | null;
  const user = normalizeDashboardUser(data?.user);
  if (!user || !isAllowedDashboardRole(user.role)) {
    await clearDashboardCookies();
    return NextResponse.json(
      { authenticated: false, message: "Admin role is required." },
      { status: 403 },
    );
  }
  await renewDashboardSession(user);
  const remembered = Boolean(session?.remembered);
  const sessionMaxAge = remembered
    ? rememberedAuthCookieMaxAge
    : authCookieMaxAge;
  return NextResponse.json({
    authenticated: true,
    user,
    remembered,
    expiresAt: Date.now() + sessionMaxAge * 1000,
  });
}
