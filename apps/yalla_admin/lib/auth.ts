import type { DashboardUser } from "@/lib/backend-auth";

export const authCookieName = "yalla_dashboard_session";
export const backendAccessCookieName = "yalla_backend_access";
export const backendRefreshCookieName = "yalla_backend_refresh";
export const authCookieMaxAge = 8 * 60 * 60;
export const rememberedAuthCookieMaxAge = 30 * 24 * 60 * 60;

export type DashboardSession = {
  user: DashboardUser;
  expiresAt: number;
  remembered: boolean;
};

type CookieLike = { value?: string };

function encodeSession(session: DashboardSession) {
  return encodeURIComponent(JSON.stringify(session));
}

function decodeSession(value: string) {
  return JSON.parse(decodeURIComponent(value)) as
    | DashboardSession
    | undefined;
}

export function createSessionToken(
  user: DashboardUser,
  maxAge: number,
  remembered: boolean,
) {
  return encodeSession({
    user,
    remembered,
    expiresAt: Date.now() + maxAge * 1000,
  });
}

export function readSessionToken(cookie: CookieLike | string | undefined) {
  const value = typeof cookie === "string" ? cookie : cookie?.value;
  if (!value) return null;
  try {
    const session = decodeSession(value);
    if (!session?.user?.email || Date.now() >= session.expiresAt) return null;
    return session;
  } catch {
    return null;
  }
}
