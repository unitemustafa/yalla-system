"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Cookies } from "react-cookie";

import {
  AUTH_COOKIE_NAMES,
  type AuthSession,
  type AuthTokens,
  type AuthUser,
  isAccessTokenUsable,
  jwtExpiresAt,
} from "@/lib/auth";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");
const REFRESH_BUFFER_MS = 60_000;
const REMEMBER_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const cookies = new Cookies();

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  login: (input: {
    email: string;
    password: string;
    remember: boolean;
  }) => Promise<void>;
  logout: () => Promise<void>;
  apiFetch: (path: string, init?: RequestInit) => Promise<Response>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
let refreshPromise: Promise<AuthTokens> | null = null;

function cookieOptions(remember: boolean) {
  return {
    path: "/",
    sameSite: "lax" as const,
    secure: typeof window !== "undefined" && window.location.protocol === "https:",
    ...(remember ? { maxAge: REMEMBER_MAX_AGE_SECONDS } : {}),
  };
}

function removeOptions() {
  return {
    path: "/",
    sameSite: "lax" as const,
    secure: typeof window !== "undefined" && window.location.protocol === "https:",
  };
}

function readRemember() {
  return cookies.get(AUTH_COOKIE_NAMES.remember, { doNotParse: true }) === "true";
}

function readUser(): AuthUser | null {
  const value = cookies.get(AUTH_COOKIE_NAMES.user);
  return value && typeof value === "object" ? (value as AuthUser) : null;
}

function persistTokens(tokens: AuthTokens, remember = readRemember()) {
  const options = cookieOptions(remember);
  cookies.set(AUTH_COOKIE_NAMES.accessToken, tokens.accessToken, options);
  cookies.set(AUTH_COOKIE_NAMES.refreshToken, tokens.refreshToken, options);
}

function persistSession(session: AuthSession, remember: boolean) {
  const options = cookieOptions(remember);
  persistTokens(session, remember);
  cookies.set(AUTH_COOKIE_NAMES.user, session.user, options);
  cookies.set(AUTH_COOKIE_NAMES.remember, String(remember), options);
}

function clearSessionCookies() {
  const options = removeOptions();
  Object.values(AUTH_COOKIE_NAMES).forEach((name) => {
    cookies.remove(name, options);
  });
}

async function responseData(response: Response) {
  return (await response.json().catch(() => null)) as unknown;
}

function firstApiError(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const message = firstApiError(item);
      if (message) return message;
    }
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) {
      const message = firstApiError(item);
      if (message) return message;
    }
  }
  return null;
}

function localizedAuthError(value: unknown, fallback: string) {
  const message = firstApiError(value);
  if (!message) return fallback;

  const normalized = message.toLowerCase();
  if (normalized.includes("invalid email or password")) {
    return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
  }
  if (normalized.includes("not been verified")) {
    return "الحساب غير مفعّل. أكّد البريد الإلكتروني أولًا.";
  }
  if (normalized.includes("required")) {
    return "أكمل البريد الإلكتروني وكلمة المرور.";
  }
  return message;
}

async function refreshTokens() {
  if (refreshPromise) return refreshPromise;

  const refreshToken = cookies.get(AUTH_COOKIE_NAMES.refreshToken, {
    doNotParse: true,
  }) as string | undefined;
  if (!refreshToken) throw new Error("لا توجد جلسة قابلة للتجديد.");

  refreshPromise = (async () => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const data = (await responseData(response)) as Partial<AuthTokens> | null;

    if (
      !response.ok ||
      typeof data?.accessToken !== "string" ||
      typeof data.refreshToken !== "string"
    ) {
      throw new Error("انتهت الجلسة. سجّل الدخول من جديد.");
    }

    const nextTokens = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
    persistTokens(nextTokens);
    return nextTokens;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSession = useCallback(() => {
    clearSessionCookies();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const scheduleRefresh = useCallback(
    function schedule(accessToken: string) {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      const expiresAt = jwtExpiresAt(accessToken);
      if (!expiresAt) {
        clearSession();
        return;
      }

      const delay = Math.max(0, expiresAt - Date.now() - REFRESH_BUFFER_MS);
      refreshTimer.current = setTimeout(() => {
        void refreshTokens()
          .then((tokens) => schedule(tokens.accessToken))
          .catch(clearSession);
      }, delay);
    },
    [clearSession],
  );

  useEffect(() => {
    let active = true;

    void Promise.resolve().then(async () => {
      const savedUser = readUser();
      const accessToken = cookies.get(AUTH_COOKIE_NAMES.accessToken, {
        doNotParse: true,
      }) as string | undefined;
      const refreshToken = cookies.get(AUTH_COOKIE_NAMES.refreshToken, {
        doNotParse: true,
      }) as string | undefined;

      if (!active) return;
      if (!savedUser || savedUser.role !== "admin" || !refreshToken) {
        clearSession();
        return;
      }

      setUser(savedUser);
      if (isAccessTokenUsable(accessToken)) {
        setStatus("authenticated");
        scheduleRefresh(accessToken!);
        return;
      }

      try {
        const tokens = await refreshTokens();
        if (!active) return;
        setStatus("authenticated");
        scheduleRefresh(tokens.accessToken);
      } catch {
        if (active) clearSession();
      }
    });

    return () => {
      active = false;
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
  }, [clearSession, scheduleRefresh]);

  const login = useCallback(
    async (input: { email: string; password: string; remember: boolean }) => {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: input.email,
          password: input.password,
        }),
      });
      const data = (await responseData(response)) as Partial<AuthSession> | null;

      if (!response.ok) {
        throw new Error(
          localizedAuthError(data, "تعذر تسجيل الدخول. حاول مرة أخرى."),
        );
      }
      if (
        typeof data?.accessToken !== "string" ||
        typeof data.refreshToken !== "string" ||
        !data.user
      ) {
        throw new Error("استجابة تسجيل الدخول غير مكتملة.");
      }
      if (data.user.role !== "admin") {
        clearSessionCookies();
        throw new Error("هذا الحساب لا يملك صلاحية دخول لوحة الإدارة.");
      }

      const session = data as AuthSession;
      persistSession(session, input.remember);
      setUser(session.user);
      setStatus("authenticated");
      scheduleRefresh(session.accessToken);
    },
    [scheduleRefresh],
  );

  const logout = useCallback(async () => {
    const accessToken = cookies.get(AUTH_COOKIE_NAMES.accessToken, {
      doNotParse: true,
    }) as string | undefined;
    const refreshToken = cookies.get(AUTH_COOKIE_NAMES.refreshToken, {
      doNotParse: true,
    }) as string | undefined;

    try {
      if (accessToken && refreshToken) {
        await fetch(`${API_BASE_URL}/auth/logout/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch {
      // Local logout must succeed even when Django is unavailable.
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const apiFetch = useCallback(
    async (path: string, init: RequestInit = {}) => {
      async function request(accessToken: string) {
        const headers = new Headers(init.headers);
        headers.set("Authorization", `Bearer ${accessToken}`);
        return fetch(
          path.startsWith("http") ? path : `${API_BASE_URL}/${path.replace(/^\/+/, "")}`,
          { ...init, headers },
        );
      }

      let accessToken = cookies.get(AUTH_COOKIE_NAMES.accessToken, {
        doNotParse: true,
      }) as string | undefined;

      if (!isAccessTokenUsable(accessToken)) {
        try {
          accessToken = (await refreshTokens()).accessToken;
          scheduleRefresh(accessToken);
        } catch (error) {
          clearSession();
          throw error;
        }
      }

      let response = await request(accessToken!);
      if (response.status !== 401) return response;

      try {
        accessToken = (await refreshTokens()).accessToken;
        scheduleRefresh(accessToken);
        response = await request(accessToken);
        return response;
      } catch (error) {
        clearSession();
        throw error;
      }
    },
    [clearSession, scheduleRefresh],
  );

  const value = useMemo(
    () => ({ status, user, login, logout, apiFetch }),
    [apiFetch, login, logout, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider.");
  return value;
}
