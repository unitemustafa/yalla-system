import type { DashboardUser } from "@/lib/backend-auth";

<<<<<<< HEAD
import {
  getDashboardAccountEmail,
  isDashboardAccountEmail,
} from "@/lib/account-email";

export const authCookieName = "yalla-session";
export const backendAccessCookieName = "yalla-access-token";
export const backendRefreshCookieName = "yalla-refresh-token";
export const authCookieMaxAge = 60 * 60 * 8;
export const rememberedAuthCookieMaxAge = 60 * 60 * 24 * 30;

const fallbackSessionSecret = "dev-session-secret-change-me";
const fallbackDemoPassword = "01266666610";

const demoAdmin = {
  email: "dashboard@admin.com",
  name: "Mohamed Abdeljalel",
  role: "manager",
};

const mutableAuthState = globalThis as typeof globalThis & {
  __yallaDemoPassword?: string;
};

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  role: string;
  exp: number;
  remembered?: boolean;
};

if (
  process.env.NODE_ENV === "production" &&
  !process.env.SESSION_SECRET?.trim()
) {
  throw new Error(
    "SESSION_SECRET is required in production. Set SESSION_SECRET to a strong random value.",
  );
}

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET?.trim();

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET is required in production. Set SESSION_SECRET to a strong random value.",
    );
  }

  return fallbackSessionSecret;
}

function getDemoPassword() {
  if (mutableAuthState.__yallaDemoPassword) {
    return mutableAuthState.__yallaDemoPassword;
  }

  const password = process.env.DASHBOARD_DEMO_PASSWORD?.trim();

  if (password) {
    return password;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "DASHBOARD_DEMO_PASSWORD is required for demo dashboard login.",
    );
  }

  return fallbackDemoPassword;
}

export function updateDemoPassword(password: string) {
  mutableAuthState.__yallaDemoPassword = password;
}

function encodeJson(value: SessionPayload) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret())
    .update(value)
    .digest("base64url");
}

function signaturesMatch(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export function validateDemoCredentials(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  // Demo-only auth: this dashboard has no real backend user database yet.
  if (
    normalizedEmail !== demoAdmin.email &&
    !isDashboardAccountEmail(normalizedEmail)
  ) {
    return null;
  }

  if (password !== getDemoPassword()) {
    return null;
  }

  return {
    email:
      normalizedEmail === demoAdmin.email
        ? demoAdmin.email
        : getDashboardAccountEmail(),
    name: demoAdmin.name,
    role: demoAdmin.role,
  };
}

export function createSessionToken(user: {
  email: string;
  name: string;
  role: string;
}, maxAge = authCookieMaxAge, remembered = false) {
  const payload = encodeJson({
    sub: user.email,
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + maxAge,
=======
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
>>>>>>> 56ecfc2 (link dashboard order, items,auth api with backend)
    remembered,
    expiresAt: Date.now() + maxAge * 1000,
  });
<<<<<<< HEAD

  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature || !signaturesMatch(signature, sign(payload))) {
    return null;
  }

  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as SessionPayload;

    if (!session.exp || session.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

=======
}

export function readSessionToken(cookie: CookieLike | string | undefined) {
  const value = typeof cookie === "string" ? cookie : cookie?.value;
  if (!value) return null;
  try {
    const session = decodeSession(value);
    if (!session?.user?.email || Date.now() >= session.expiresAt) return null;
>>>>>>> 56ecfc2 (link dashboard order, items,auth api with backend)
    return session;
  } catch {
    return null;
  }
}
