import "server-only";

import { cookies } from "next/headers";

import {
  authCookieMaxAge,
  authCookieName,
  authCookieSettings,
  backendAccessCookieName,
  backendRefreshCookieName,
  createSessionToken,
  readSessionToken,
  rememberedAuthCookieMaxAge,
} from "@/lib/auth";
import {
  backendApiBaseUrl,
  backendAuthUrl,
  type DashboardUser,
} from "@/lib/backend-auth";

type RefreshPayload = {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
};

export async function djangoFetch(path: string, init: RequestInit = {}) {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get(backendAccessCookieName)?.value;
  const refreshToken = cookieStore.get(backendRefreshCookieName)?.value;
  const session = readSessionToken(cookieStore.get(authCookieName)?.value);

  const send = (token: string | undefined) => {
    const headers = new Headers(init.headers);
    if (token) headers.set("authorization", `Bearer ${token}`);
    if (
      init.body &&
      !(init.body instanceof FormData) &&
      !headers.has("content-type")
    ) {
      headers.set("content-type", "application/json");
    }
    return fetch(`${backendApiBaseUrl()}/${path.replace(/^\/+/, "")}`, {
      ...init,
      headers,
      cache: "no-store",
    }).catch(() => null);
  };

  const response = await send(accessToken);
  if (response?.status !== 401 || !refreshToken) return response;

  const refreshResponse = await fetch(backendAuthUrl("refresh"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  }).catch(() => null);
  const refreshed = (await refreshResponse?.json().catch(() => null)) as
    | RefreshPayload
    | null;

  if (!refreshResponse?.ok || !refreshed?.accessToken) return response;

  accessToken = refreshed.accessToken;
  cookieStore.set(
    backendAccessCookieName,
    accessToken,
    authCookieSettings(session?.remembered ? refreshed.expiresIn || 900 : undefined),
  );
  if (refreshed.refreshToken) {
    cookieStore.set(
      backendRefreshCookieName,
      refreshed.refreshToken,
      authCookieSettings(
        session?.remembered ? rememberedAuthCookieMaxAge : undefined,
      ),
    );
  }
  return send(accessToken);
}

export async function renewDashboardSession(user: DashboardUser) {
  const cookieStore = await cookies();
  const existing = readSessionToken(cookieStore.get(authCookieName)?.value);
  const maxAge = existing?.remembered
    ? rememberedAuthCookieMaxAge
    : authCookieMaxAge;
  cookieStore.set(
    authCookieName,
    createSessionToken(user, maxAge, Boolean(existing?.remembered)),
    authCookieSettings(existing?.remembered ? maxAge : undefined),
  );
}

export async function clearDashboardCookies() {
  const cookieStore = await cookies();
  for (const name of [
    authCookieName,
    backendAccessCookieName,
    backendRefreshCookieName,
  ]) {
    cookieStore.set(name, "", authCookieSettings(0));
  }
}
