import { cookies } from "next/headers";

import { requireDashboardSession, unauthorizedResponse } from "@/lib/api-auth";
import {
  authCookieSettings,
  backendAccessCookieName,
  backendRefreshCookieName,
  rememberedAuthCookieMaxAge,
} from "@/lib/auth";
import {
  backendApiBaseUrl,
  dashboardAuthMode,
  extractBackendErrorMessage,
} from "@/lib/backend-auth";

async function proxyCouriers(method: "GET" | "POST", request?: Request) {
  const session = await requireDashboardSession();

  if (!session) {
    return unauthorizedResponse();
  }

  if (dashboardAuthMode() !== "backend") {
    return Response.json(
      { message: "Courier accounts require backend authentication mode." },
      { status: 503 },
    );
  }

  const cookieStore = await cookies();
  let accessToken = cookieStore.get(backendAccessCookieName)?.value;

  if (!accessToken) {
    return unauthorizedResponse();
  }

  const body = method === "POST" ? await request?.text() : undefined;
  const sendRequest = () =>
    fetch(`${backendApiBaseUrl()}/auth/couriers`, {
      method,
      headers: {
        authorization: `Bearer ${accessToken}`,
        ...(method === "POST" ? { "content-type": "application/json" } : {}),
      },
      body,
      cache: "no-store",
    }).catch(() => null);

  let backendResponse = await sendRequest();

  if (backendResponse?.status === 401) {
    const refreshToken = cookieStore.get(backendRefreshCookieName)?.value;
    const refreshResponse = refreshToken
      ? await fetch(`${backendApiBaseUrl()}/auth/refresh`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ refreshToken }),
          cache: "no-store",
        }).catch(() => null)
      : null;
    const refreshData = (await refreshResponse?.json().catch(() => null)) as
      | { accessToken?: string; refreshToken?: string }
      | null;

    if (refreshResponse?.ok && refreshData?.accessToken) {
      accessToken = refreshData.accessToken;
      cookieStore.set({
        name: backendAccessCookieName,
        value: accessToken,
        ...authCookieSettings(session.remembered ? 15 * 60 : undefined),
      });
      if (refreshData.refreshToken) {
        cookieStore.set({
          name: backendRefreshCookieName,
          value: refreshData.refreshToken,
          ...authCookieSettings(
            session.remembered ? rememberedAuthCookieMaxAge : undefined,
          ),
        });
      }
      backendResponse = await sendRequest();
    }
  }

  if (!backendResponse) {
    return Response.json(
      { message: "Courier account service is unavailable." },
      { status: 503 },
    );
  }

  const data = await backendResponse.json().catch(() => null);

  if (!backendResponse.ok) {
    return Response.json(
      {
        ...(data && typeof data === "object" ? data : {}),
        message: extractBackendErrorMessage(
          data,
          "Could not save the courier account.",
        ),
      },
      { status: backendResponse.status },
    );
  }

  return Response.json(data, { status: backendResponse.status });
}

export async function GET() {
  return proxyCouriers("GET");
}

export async function POST(request: Request) {
  return proxyCouriers("POST", request);
}
