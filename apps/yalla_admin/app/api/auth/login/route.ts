import { NextResponse } from "next/server";

import {
  authCookieName,
  authCookieSettings,
  backendAccessCookieName,
  backendRefreshCookieName,
  authCookieMaxAge,
  createSessionToken,
  rememberedAuthCookieMaxAge,
  validateDemoCredentials,
} from "@/lib/auth";
import {
  backendAuthUrl,
  dashboardAuthMode,
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

  if (dashboardAuthMode() === "demo") {
    return loginWithDemoCredentials(email, password, remember);
  }

  const backendResponse = await fetch(backendAuthUrl("login"), {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
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
      {
        message: extractBackendErrorMessage(
          data,
          "Invalid email or password.",
        ),
      },
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

  const sessionTokenMaxAge = remember
    ? rememberedAuthCookieMaxAge
    : authCookieMaxAge;
  const persistentCookieMaxAge = remember
    ? rememberedAuthCookieMaxAge
    : undefined;
  const expiresAt = Date.now() + sessionTokenMaxAge * 1000;
  const response = NextResponse.json({
    ok: true,
    user,
    remembered: remember,
    expiresAt,
  });

  response.cookies.set({
    name: authCookieName,
    value: createSessionToken(user, sessionTokenMaxAge, remember),
    ...authCookieSettings(persistentCookieMaxAge),
  });
  response.cookies.set({
    name: backendAccessCookieName,
    value: data.accessToken,
    ...authCookieSettings(remember ? data.expiresIn || 15 * 60 : undefined),
  });
  response.cookies.set({
    name: backendRefreshCookieName,
    value: data.refreshToken,
    ...authCookieSettings(persistentCookieMaxAge),
  });

  return response;
}

function loginWithDemoCredentials(
  email: string,
  password: string,
  remember: boolean,
) {
  const user = validateDemoCredentials(email, password);

  if (!user) {
    return NextResponse.json(
      { message: "Invalid email or password." },
      { status: 401 },
    );
  }

  const sessionTokenMaxAge = remember
    ? rememberedAuthCookieMaxAge
    : authCookieMaxAge;
  const persistentCookieMaxAge = remember
    ? rememberedAuthCookieMaxAge
    : undefined;
  const expiresAt = Date.now() + sessionTokenMaxAge * 1000;
  const response = NextResponse.json({
    ok: true,
    remembered: remember,
    expiresAt,
  });
  response.cookies.set({
    name: authCookieName,
    value: createSessionToken(user, sessionTokenMaxAge, remember),
    ...authCookieSettings(persistentCookieMaxAge),
  });

  return response;
}
