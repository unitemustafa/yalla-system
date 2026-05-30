import { NextResponse } from "next/server";

import { requireDashboardSession, unauthorizedResponse } from "@/lib/api-auth";
import { updateDemoPassword } from "@/lib/auth";
import { consumePasswordResetToken } from "@/lib/password-reset";

export async function POST(request: Request) {
  const session = await requireDashboardSession();
  if (!session) {
    return unauthorizedResponse();
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const resetToken =
    typeof body?.resetToken === "string" ? body.resetToken.trim() : "";

  if (!email || !password || !resetToken) {
    return NextResponse.json(
      { message: "Email, reset token, and password are required." },
      { status: 400 },
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { message: "Password must be at least 6 characters." },
      { status: 400 },
    );
  }

  if (!consumePasswordResetToken(email, resetToken)) {
    return NextResponse.json(
      { message: "Invalid or expired reset token." },
      { status: 400 },
    );
  }

  updateDemoPassword(password);

  return NextResponse.json({
    ok: true,
    message: "Password has been updated.",
  });
}
