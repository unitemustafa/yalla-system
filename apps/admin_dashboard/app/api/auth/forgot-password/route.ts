import { NextResponse } from "next/server";

import { isDemoAdminEmail } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";

  if (!email) {
    return NextResponse.json(
      { message: "Email is required." },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    knownAccount: isDemoAdminEmail(email),
    message:
      "If this email exists, password reset instructions have been prepared.",
  });
}
