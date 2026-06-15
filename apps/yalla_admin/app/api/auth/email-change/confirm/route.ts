import { requireDashboardSession, unauthorizedResponse } from "@/lib/api-auth";
import { confirmEmailChange } from "@/lib/email-change";

export async function POST(request: Request) {
  const session = await requireDashboardSession();

  if (!session) {
    return unauthorizedResponse();
  }

  const body = await request.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim() : "";

  if (!code) {
    return Response.json({ message: "Verification code is required." }, { status: 400 });
  }

  const result = confirmEmailChange(code);

  if (!result) {
    return Response.json(
      { message: "Invalid or expired verification code." },
      { status: 400 },
    );
  }

  return Response.json({
    email: result.email,
    oldEmail: result.oldEmail,
    ok: true,
  });
}
