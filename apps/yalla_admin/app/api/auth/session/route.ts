import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { authCookieName, readSessionToken } from "@/lib/auth";

export async function GET() {
  const cookieStore = await cookies();
  const session = readSessionToken(cookieStore.get(authCookieName)?.value);

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    remembered: Boolean(session.remembered),
    expiresAt: session.exp * 1000,
  });
}
