"use client";

import {
  authCookieMaxAge,
  authCookieName,
  backendAccessCookieName,
  backendRefreshCookieName,
  createSessionToken,
  readSessionToken,
  rememberedAuthCookieMaxAge,
} from "@/lib/auth";
import {
  backendApiBaseUrl,
  backendAuthUrl,
  backendUrl,
  extractBackendTokens,
  extractBackendUser,
  isAllowedDashboardRole,
  normalizeDashboardUser,
  type BackendLoginResponse,
  type DashboardUser,
} from "@/lib/backend-auth";

type CookieOptions = {
  maxAge?: number;
};

function cookieAttributes(options: CookieOptions = {}) {
  const maxAge = options.maxAge === undefined ? "" : `; max-age=${options.maxAge}`;
  const secure = window.location.protocol === "https:" ? "; secure" : "";

  return `${maxAge}; path=/; samesite=lax${secure}`;
}

export function setClientCookie(
  name: string,
  value: string,
  options?: CookieOptions,
) {
  document.cookie = `${name}=${value}${cookieAttributes(options)}`;
}

export function getClientCookie(name: string) {
  const prefix = `${name}=`;
  return (
    document.cookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(prefix))
      ?.slice(prefix.length) ?? null
  );
}

export function removeClientCookie(name: string) {
  document.cookie = `${name}=; max-age=0; path=/; samesite=lax`;
}

export function clearClientAuth() {
  removeClientCookie(authCookieName);
  removeClientCookie(backendAccessCookieName);
  removeClientCookie(backendRefreshCookieName);
}

export function getClientSession() {
  return readSessionToken(getClientCookie(authCookieName) ?? undefined);
}

export function getClientAccessToken() {
  return getClientCookie(backendAccessCookieName);
}

export function saveClientAuth(
  user: DashboardUser,
  accessToken: string,
  refreshToken: string,
  remember: boolean,
  accessMaxAge?: number,
) {
  const sessionMaxAge = remember
    ? rememberedAuthCookieMaxAge
    : authCookieMaxAge;
  const maxAgeOption = remember ? { maxAge: sessionMaxAge } : undefined;

  setClientCookie(
    authCookieName,
    createSessionToken(user, sessionMaxAge, remember),
    maxAgeOption,
  );
  setClientCookie(
    backendAccessCookieName,
    encodeURIComponent(accessToken),
    remember ? { maxAge: accessMaxAge ?? 900 } : undefined,
  );
  setClientCookie(
    backendRefreshCookieName,
    encodeURIComponent(refreshToken),
    remember ? { maxAge: rememberedAuthCookieMaxAge } : undefined,
  );
}

export async function loginToBackend({
  email,
  password,
  remember,
}: {
  email: string;
  password: string;
  remember: boolean;
}) {
  const response = await fetch(backendAuthUrl("login"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password, rememberMe: remember }),
  });
  const data = (await response.json().catch(() => null)) as
    | BackendLoginResponse
    | null;

  if (!response.ok) {
    return { ok: false as const, response, data };
  }

  const { accessToken, refreshToken } = extractBackendTokens(data);
  const user = normalizeDashboardUser(extractBackendUser(data));
  if (!accessToken || !refreshToken || !user) {
    return { ok: false as const, response, data, incomplete: true };
  }
  if (!isAllowedDashboardRole(user.role)) {
    return { ok: false as const, response, data, forbidden: true };
  }

  saveClientAuth(user, accessToken, refreshToken, remember, data?.expiresIn);
  return { ok: true as const, user, remembered: remember };
}

export async function dashboardFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const token = getClientAccessToken();

  if (token) headers.set("authorization", `Bearer ${decodeURIComponent(token)}`);
  if (
    init.body &&
    !(init.body instanceof FormData) &&
    !headers.has("content-type")
  ) {
    headers.set("content-type", "application/json");
  }

  const backendPath =
    path === "couriers" || path.startsWith("couriers/")
      ? `auth/${path}`
      : `dashboard/${path}`;

  return fetch(backendUrl(backendPath), {
    ...init,
    headers,
    cache: "no-store",
  });
}

export async function authFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const token = getClientAccessToken();

  if (token) headers.set("authorization", `Bearer ${decodeURIComponent(token)}`);
  if (
    init.body &&
    !(init.body instanceof FormData) &&
    !headers.has("content-type")
  ) {
    headers.set("content-type", "application/json");
  }

  return fetch(backendAuthUrl(path), {
    ...init,
    headers,
    cache: "no-store",
  });
}

export function backendAssetUrl(path: string | null | undefined) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const apiBase = backendApiBaseUrl();
  const origin = apiBase.replace(/\/api\/v\d+\/?$/i, "");

  return `${origin}/${path.replace(/^\/+/, "")}`;
}
