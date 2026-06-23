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
  email: string;
  phone: string;
  role: string;
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
  } catch {
    return null;
  }
}

export function isAccessTokenUsable(
  token: string | null | undefined,
  bufferMs = 0,
) {
  const expiresAt = jwtExpiresAt(token);
  return Boolean(expiresAt && expiresAt > Date.now() + bufferMs);
}

