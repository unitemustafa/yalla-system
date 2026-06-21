"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { DashboardUser } from "@/lib/backend-auth";

type AuthUserContextValue = {
  user: DashboardUser | null;
  loading: boolean;
  setUser: (user: DashboardUser) => void;
  refresh: () => Promise<DashboardUser | null>;
};

const AuthUserContext = createContext<AuthUserContextValue | null>(null);

export function AuthUserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/auth/session", { cache: "no-store" });
    const data = await response.json().catch(() => null);
    const nextUser = response.ok ? (data?.user as DashboardUser | undefined) : null;
    setUser(nextUser ?? null);
    setLoading(false);
    if (!response.ok && typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return nextUser ?? null;
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session", { cache: "no-store" })
      .then(async (response) => ({
        response,
        data: await response.json().catch(() => null),
      }))
      .then(({ response, data }) => {
        if (!active) return;
        setUser(response.ok ? (data?.user as DashboardUser) : null);
        setLoading(false);
        if (!response.ok) window.location.href = "/login";
      });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({ user, loading, setUser, refresh }),
    [user, loading, refresh],
  );

  return (
    <AuthUserContext.Provider value={value}>
      {children}
    </AuthUserContext.Provider>
  );
}

export function useAuthUser() {
  const value = useContext(AuthUserContext);
  if (!value) throw new Error("useAuthUser must be used inside AuthUserProvider");
  return value;
}
