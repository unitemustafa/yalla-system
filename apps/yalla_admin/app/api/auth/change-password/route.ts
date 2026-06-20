import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { requireDashboardSession, unauthorizedResponse } from "@/lib/api-auth";
import {
  authCookieName,
  backendAccessCookieName,
  backendRefreshCookieName,
  validateDemoCredentials,
  updateDemoPassword,
} from "@/lib/auth";
import {
  backendAuthUrl,
  dashboardAuthMode,
  extractBackendErrorMessage,
} from "@/lib/backend-auth";

const passwordCookieNames = [
  authCookieName,
  backendAccessCookieName,
  backendRefreshCookieName,
];

export async function POST(request: Request) {
  const session = await requireDashboardSession();

  if (!session) {
    return unauthorizedResponse();
  }

  const body = await request.json().catch(() => null);
  const currentPassword =
    typeof body?.currentPassword === "string" ? body.currentPassword : "";
  const newPassword =
    typeof body?.newPassword === "string" ? body.newPassword : "";
  const passwordConfirm =
    typeof body?.passwordConfirm === "string" ? body.passwordConfirm : "";

  if (!currentPassword || !newPassword || !passwordConfirm) {
    return NextResponse.json(
      { message: "Current password, new password, and confirmation are required." },
      { status: 400 },
    );
  }

  if (newPassword !== passwordConfirm) {
    return NextResponse.json(
      { message: "Passwords do not match." },
      { status: 400 },
    );
  }

  if (dashboardAuthMode() === "demo") {
    if (!validateDemoCredentials(session.email, currentPassword)) {
      return NextResponse.json(
        { message: "Current password is incorrect." },
        { status: 400 },
      );
    }

    updateDemoPassword(newPassword);
    return clearAuthCookies(
      NextResponse.json({ ok: true, message: "Password changed successfully." }),
    );
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(backendAccessCookieName)?.value;

  if (!accessToken) {
    return unauthorizedResponse();
  }

  const backendResponse = await fetch(backendAuthUrl("change-password"), {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      currentPassword,
      newPassword,
      passwordConfirm,
    }),
    cache: "no-store",
  }).catch(() => null);

  if (!backendResponse) {
    return NextResponse.json(
      { message: "Authentication service is unavailable." },
      { status: 503 },
    );
  }

  const data = await backendResponse.json().catch(() => null);

  if (!backendResponse.ok) {
    return NextResponse.json(
      {
        message: extractBackendErrorMessage(
          data,
          "Could not change password.",
        ),
      },
      { status: backendResponse.status },
    );
  }

  return clearAuthCookies(
    NextResponse.json({ ok: true, message: "Password changed successfully." }),
  );
}

function clearAuthCookies(response: NextResponse) {
  for (const cookieName of passwordCookieNames) {
    response.cookies.set({
      name: cookieName,
      value: "",
      httpOnly: true,
      maxAge: 0,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
}
