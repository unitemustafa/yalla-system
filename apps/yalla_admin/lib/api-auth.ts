import { cookies } from "next/headers";

import { authCookieName, readSessionToken } from "@/lib/auth";

export async function requireDashboardSession() {
  const cookieStore = await cookies();
  const session = readSessionToken(cookieStore.get(authCookieName)?.value);

  return session;
}

export function unauthorizedResponse() {
  return Response.json({ message: "Unauthorized" }, { status: 401 });
}
