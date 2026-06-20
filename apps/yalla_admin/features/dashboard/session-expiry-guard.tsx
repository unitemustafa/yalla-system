"use client";

import { useEffect, useRef, useState } from "react";

const tabSessionStorageKey = "yalla-dashboard-tab-session";

type SessionResponse = {
  authenticated?: boolean;
  remembered?: boolean;
  expiresAt?: number;
};

export function SessionExpiryGuard() {
  const [expired, setExpired] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const didClearServerSession = useRef(false);

  useEffect(() => {
    let alive = true;

    async function clearServerSession() {
      if (didClearServerSession.current) {
        return;
      }

      didClearServerSession.current = true;
      sessionStorage.removeItem(tabSessionStorageKey);
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    }

    async function expireSession() {
      if (!alive) {
        return;
      }

      setExpired(true);
      await clearServerSession();
    }

    async function checkSession() {
      const response = await fetch("/api/auth/session", {
        cache: "no-store",
      }).catch(() => null);

      if (!alive) {
        return;
      }

      if (!response?.ok) {
        await expireSession();
        return;
      }

      const data = (await response.json().catch(() => null)) as
        | SessionResponse
        | null;

      if (!data?.authenticated) {
        await expireSession();
        return;
      }

      if (data.remembered) {
        sessionStorage.removeItem(tabSessionStorageKey);
        return;
      }

      const tabSession = sessionStorage.getItem(tabSessionStorageKey);

      if (!tabSession) {
        await expireSession();
        return;
      }

      const expiresAt =
        typeof data.expiresAt === "number" ? data.expiresAt : Date.now();
      const millisecondsUntilExpiry = expiresAt - Date.now();

      if (millisecondsUntilExpiry <= 0) {
        await expireSession();
        return;
      }

      timeoutRef.current = window.setTimeout(() => {
        void expireSession();
      }, millisecondsUntilExpiry);
    }

    void checkSession();

    return () => {
      alive = false;

      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!expired) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/35 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-expired-title"
    >
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 text-center shadow-2xl">
        <h2 id="session-expired-title" className="text-xl font-extrabold">
          انتهت الجلسة
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          انتهت الجلسة، برجاء إعادة تسجيل الدخول. للحفاظ على الجلسة لمدة أطول،
          فعّل خيار تذكرني عند تسجيل الدخول.
        </p>
        <button
          className="mt-6 inline-flex h-11 min-w-40 items-center justify-center rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
          onClick={() => window.location.assign("/login")}
          type="button"
        >
          تسجيل الدخول
        </button>
      </div>
    </div>
  );
}
