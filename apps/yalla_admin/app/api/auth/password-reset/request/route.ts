import { NextResponse } from "next/server";

import { requireDashboardSession, unauthorizedResponse } from "@/lib/api-auth";
import { createPasswordResetCode } from "@/lib/password-reset";

export async function POST(request: Request) {
  const session = await requireDashboardSession();
  if (!session) {
    return unauthorizedResponse();
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";

  if (!email) {
    return NextResponse.json(
      { message: "Email is required." },
      { status: 400 },
    );
  }

  const reset = createPasswordResetCode(email);

  return NextResponse.json({
    ok: true,
    email: reset.email,
    expiresAt: reset.expiresAt,
    devCode: process.env.NODE_ENV === "production" ? undefined : reset.code,
    message: "Password reset code has been prepared.",
  });
}
