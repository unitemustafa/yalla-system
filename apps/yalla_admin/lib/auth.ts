<<<<<<< HEAD
export const AUTH_COOKIE_NAMES = {
  accessToken: "yalla_access_token",
  refreshToken: "yalla_refresh_token",
  user: "yalla_auth_user",
  remember: "yalla_remember",
} as const;

export type AuthUser = {
  id: string;
  first_name: string;
  last_name: string;
=======
﻿import type { DashboardUser } from "@/lib/backend-auth";

export const authCookieName = "yalla_dashboard_session";
export const backendAccessCookieName = "yalla_backend_access";
export const backendRefreshCookieName = "yalla_backend_refresh";
export const authCookieMaxAge = 8 * 60 * 60;
export const rememberedAuthCookieMaxAge = 30 * 24 * 60 * 60;

export type DashboardSession = {
  user: DashboardUser;
  sub: string;
>>>>>>> ddcd1d89cdee7f9089a4a648a3aec410ab2923a8
  email: string;
  phone: string;
  role: string;
<<<<<<< HEAD
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthSession = AuthTokens & {
  user: AuthUser;
};

export function isSafeNextPath(value: string | null | undefined) {
  return Boolean(
    value &&
      value.startsWith("/") &&
      !value.startsWith("//") &&
      !value.includes("\\"),
  );
}

export function jwtExpiresAt(token: string | null | undefined) {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );
    const decoded = JSON.parse(atob(padded)) as { exp?: unknown };

    return typeof decoded.exp === "number" ? decoded.exp * 1000 : null;
=======
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
>>>>>>> ddcd1d89cdee7f9089a4a648a3aec410ab2923a8
  } catch {
    return null;
  }
}

<<<<<<< HEAD
export function isAccessTokenUsable(
  token: string | null | undefined,
  bufferMs = 0,
) {
  const expiresAt = jwtExpiresAt(token);
  return Boolean(expiresAt && expiresAt > Date.now() + bufferMs);
}

=======
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
>>>>>>> ddcd1d89cdee7f9089a4a648a3aec410ab2923a8
