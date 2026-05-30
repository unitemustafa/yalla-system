import { NextResponse } from "next/server";

import { requireDashboardSession, unauthorizedResponse } from "@/lib/api-auth";
import { verifyPasswordResetCode } from "@/lib/password-reset";

export async function POST(request: Request) {
  const session = await requireDashboardSession();
  if (!session) {
    return unauthorizedResponse();
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const code = typeof body?.code === "string" ? body.code.trim() : "";

  if (!email || !code) {
    return NextResponse.json(
      { message: "Email and code are required." },
      { status: 400 },
    );
  }

  const verification = verifyPasswordResetCode(email, code);
  if (!verification) {
    return NextResponse.json(
      { message: "Invalid or expired verification code." },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    resetToken: verification.resetToken,
    expiresAt: verification.expiresAt,
  });
}
