import { createHmac, timingSafeEqual } from "node:crypto";

export const authCookieName = "yalla-session";
export const authCookieMaxAge = 60 * 60 * 8;
export const rememberedAuthCookieMaxAge = 60 * 60 * 24 * 30;

const demoAdmin = {
  email: "dashboard@admin.com",
  name: "Mohamed Abdeljalel",
  role: "manager",
};

const mutableAuthState = globalThis as typeof globalThis & {
  __yallaDemoPassword?: string;
};

type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  role: string;
  exp: number;
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

  throw new Error(
    "SESSION_SECRET is required for dashboard auth. Set SESSION_SECRET in your environment.",
  );
}

function getDemoPassword() {
  if (mutableAuthState.__yallaDemoPassword) {
    return mutableAuthState.__yallaDemoPassword;
  }

  const password = process.env.DASHBOARD_DEMO_PASSWORD;

  if (password) {
    return password;
  }

  throw new Error(
    "DASHBOARD_DEMO_PASSWORD is required for demo dashboard login.",
  );
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
  if (normalizedEmail !== demoAdmin.email || password !== getDemoPassword()) {
    return null;
  }

  return {
    email: demoAdmin.email,
    name: demoAdmin.name,
    role: demoAdmin.role,
  };
}

export function isDemoAdminEmail(email: string) {
  return email.trim().toLowerCase() === demoAdmin.email;
}

export function createSessionToken(user: {
  email: string;
  name: string;
  role: string;
}, maxAge = authCookieMaxAge) {
  const payload = encodeJson({
    sub: user.email,
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + maxAge,
  });

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

    return session;
  } catch {
    return null;
  }
}

export function authCookieSettings(maxAge = authCookieMaxAge) {
  return {
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}
