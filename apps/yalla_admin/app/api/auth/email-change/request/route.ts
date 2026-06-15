import { requireDashboardSession, unauthorizedResponse } from "@/lib/api-auth";
import { createEmailChangeCode } from "@/lib/email-change";

export async function POST(request: Request) {
  const session = await requireDashboardSession();

  if (!session) {
    return unauthorizedResponse();
  }

  const body = await request.json().catch(() => null);
  const newEmail = typeof body?.newEmail === "string" ? body.newEmail.trim() : "";

  if (!newEmail) {
    return Response.json({ message: "New email is required." }, { status: 400 });
  }

  const changeRequest = createEmailChangeCode(newEmail);

  if (!changeRequest) {
    return Response.json(
      { message: "Enter a different email address." },
      { status: 400 },
    );
  }

  return Response.json({
    expiresAt: changeRequest.expiresAt,
    newEmail: changeRequest.newEmail,
    oldEmail: changeRequest.oldEmail,
    devCode: process.env.NODE_ENV === "production" ? undefined : changeRequest.code,
    message: "Email change verification code has been prepared.",
  });
}
