import { NextResponse } from "next/server";

import { requireDashboardSession } from "@/lib/api-auth";
import { authCookieName } from "@/lib/auth";

export async function POST() {
  const session = await requireDashboardSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, deleted: true });

  response.cookies.set({
    name: authCookieName,
    value: "",
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
