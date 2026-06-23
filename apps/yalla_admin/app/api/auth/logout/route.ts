import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  authCookieName,
  backendAccessCookieName,
  backendRefreshCookieName,
} from "@/lib/auth";
import { backendAuthUrl, dashboardAuthMode } from "@/lib/backend-auth";

export async function POST() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(backendAccessCookieName)?.value;
  const refreshToken = cookieStore.get(backendRefreshCookieName)?.value;

  if (dashboardAuthMode() === "backend" && refreshToken) {
    await fetch(backendAuthUrl("logout"), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    }).catch(() => null);
  }

  const response = NextResponse.json({ ok: true });

  for (const cookieName of [
    authCookieName,
    backendAccessCookieName,
    backendRefreshCookieName,
  ]) {
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
