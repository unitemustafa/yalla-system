import { NextResponse } from "next/server";

import {
  authCookieName,
  authCookieSettings,
  createSessionToken,
  rememberedAuthCookieMaxAge,
  validateDemoCredentials,
} from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const remember = body?.remember === true;
  const user = validateDemoCredentials(email, password);

  if (!user) {
    return NextResponse.json(
      { message: "Invalid email or password." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });
  const maxAge = remember ? rememberedAuthCookieMaxAge : undefined;
  response.cookies.set({
    name: authCookieName,
    value: createSessionToken(user, maxAge),
    ...authCookieSettings(maxAge),
  });

  return response;
}
