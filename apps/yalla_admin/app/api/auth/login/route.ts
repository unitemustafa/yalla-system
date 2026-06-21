import { NextResponse } from "next/server";

import {
  authCookieMaxAge,
  authCookieName,
  authCookieSettings,
  backendAccessCookieName,
  backendRefreshCookieName,
  createSessionToken,
  rememberedAuthCookieMaxAge,
} from "@/lib/auth";
import {
  backendAuthUrl,
  extractBackendErrorMessage,
  isAllowedDashboardRole,
  normalizeDashboardUser,
  type BackendLoginResponse,
} from "@/lib/backend-auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const remember = body?.remember === true;

  const backendResponse = await fetch(backendAuthUrl("login"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password, rememberMe: remember }),
    cache: "no-store",
  }).catch(() => null);
  if (!backendResponse) {
    return NextResponse.json(
      { message: "Authentication service is unavailable." },
      { status: 503 },
    );
  }
  const data = (await backendResponse.json().catch(() => null)) as
    | BackendLoginResponse
    | null;
  if (!backendResponse.ok) {
    return NextResponse.json(
      { message: extractBackendErrorMessage(data, "Invalid email or password.") },
      { status: backendResponse.status },
    );
  }
  const user = normalizeDashboardUser(data?.user);
  if (!data?.accessToken || !data.refreshToken || !user) {
    return NextResponse.json(
      { message: "Authentication response is incomplete." },
      { status: 502 },
    );
  }
  if (!isAllowedDashboardRole(user.role)) {
    return NextResponse.json(
      { message: "This account cannot access the dashboard." },
      { status: 403 },
    );
  }

  const sessionMaxAge = remember
    ? rememberedAuthCookieMaxAge
    : authCookieMaxAge;
  const response = NextResponse.json({
    authenticated: true,
    user,
    remembered: remember,
    expiresAt: Date.now() + sessionMaxAge * 1000,
  });
  response.cookies.set(
    authCookieName,
    createSessionToken(user, sessionMaxAge, remember),
    authCookieSettings(remember ? sessionMaxAge : undefined),
  );
  response.cookies.set(
    backendAccessCookieName,
    data.accessToken,
    authCookieSettings(remember ? data.expiresIn || 900 : undefined),
  );
  response.cookies.set(
    backendRefreshCookieName,
    data.refreshToken,
    authCookieSettings(remember ? rememberedAuthCookieMaxAge : undefined),
  );
  return response;
}
