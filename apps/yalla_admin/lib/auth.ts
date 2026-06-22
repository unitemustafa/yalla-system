import type { DashboardUser } from "@/lib/backend-auth";

export const authCookieName = "yalla_dashboard_session";
export const backendAccessCookieName = "yalla_backend_access";
export const backendRefreshCookieName = "yalla_backend_refresh";
export const authCookieMaxAge = 8 * 60 * 60;
export const rememberedAuthCookieMaxAge = 30 * 24 * 60 * 60;

export type DashboardSession = {
  user: DashboardUser;
  sub: string;
  email: string;
  name: string;
  role: string;
  exp: number;
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
  const expiresAt = Date.now() + maxAge * 1000;

  return encodeSession({
    user,
    sub: user.email,
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Math.floor(expiresAt / 1000),
    remembered,
    expiresAt,
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

export function authCookieSettings(maxAge?: number) {
  return {
    httpOnly: true,
    ...(maxAge === undefined ? {} : { maxAge }),
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

const fallbackDemoPassword = "01266666610";
const demoAdmin = {
  email: "dashboard@admin.com",
  name: "Mohamed Abdeljalel",
  role: "manager",
};
const mutableAuthState = globalThis as typeof globalThis & {
  __yallaDemoPassword?: string;
};

function getDemoPassword() {
  if (mutableAuthState.__yallaDemoPassword) {
    return mutableAuthState.__yallaDemoPassword;
  }

  return process.env.DASHBOARD_DEMO_PASSWORD?.trim() || fallbackDemoPassword;
}

export function updateDemoPassword(password: string) {
  mutableAuthState.__yallaDemoPassword = password;
}

export function validateDemoCredentials(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail !== demoAdmin.email || password !== getDemoPassword()) {
    return null;
  }

  return demoAdmin;
}
