"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import type { DashboardUser } from "@/lib/backend-auth";
import { clearClientAuth, getClientSession } from "@/lib/client-api";

type AuthUserContextValue = {
  user: DashboardUser | null;
  loading: boolean;
  setUser: (user: DashboardUser) => void;
  refresh: () => Promise<DashboardUser | null>;
};

const AuthUserContext = createContext<AuthUserContextValue | null>(null);

export function AuthUserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DashboardUser | null>(
    () => getClientSession()?.user ?? null,
  );
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const session = getClientSession();
    const nextUser = session?.user ?? null;
    setUser(nextUser ?? null);
    setLoading(false);
    if (!nextUser && typeof window !== "undefined") {
      clearClientAuth();
      window.location.href = "/login";
    }
    return nextUser ?? null;
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
