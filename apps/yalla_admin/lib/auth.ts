import { createHmac, timingSafeEqual } from "node:crypto";

export const authCookieName = "yalla-session";
export const backendAccessCookieName = "yalla-access-token";
export const backendRefreshCookieName = "yalla-refresh-token";
export const authCookieMaxAge = 60 * 60 * 8;
export const rememberedAuthCookieMaxAge = 60 * 60 * 24 * 30;

const fallbackSessionSecret = "dev-session-secret-change-me";

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  role: string;
  exp: number;
  remembered?: boolean;
};

if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET?.trim()) {
  throw new Error("SESSION_SECRET is required in production.");
}

function getSessionSecret() {
  return process.env.SESSION_SECRET?.trim() || fallbackSessionSecret;
}

function encodeJson(value: SessionPayload) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function signaturesMatch(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer);
}

export function createSessionToken(
  user: { id?: string; email: string; name: string; role: string },
  maxAge = authCookieMaxAge,
  remembered = false,
) {
  const payload = encodeJson({
    sub: user.id || user.email,
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + maxAge,
    remembered,
  });
  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token: string | undefined) {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !signaturesMatch(signature, sign(payload))) {
    return null;
  }
  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as SessionPayload;
    return session.exp >= Math.floor(Date.now() / 1000) ? session : null;
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
