"use client";

import { useEffect, useRef, useState } from "react";

import { clearClientAuth, getClientSession } from "@/lib/client-api";

const tabSessionStorageKey = "yalla-dashboard-tab-session";

export function SessionExpiryGuard() {
  const [expired, setExpired] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const didClearSession = useRef(false);

  useEffect(() => {
    let alive = true;

    function clearSession() {
      if (didClearSession.current) return;
      didClearSession.current = true;
      sessionStorage.removeItem(tabSessionStorageKey);
      clearClientAuth();
    }

    function expireSession() {
      if (!alive) return;
      setExpired(true);
      clearSession();
    }

    function checkSession() {
      const session = getClientSession();

      if (!alive) return;
      if (!session) {
        expireSession();
        return;
      }

      if (session.remembered) {
        sessionStorage.removeItem(tabSessionStorageKey);
        return;
      }

      const tabSession = sessionStorage.getItem(tabSessionStorageKey);
      if (!tabSession) {
        expireSession();
        return;
      }

      const millisecondsUntilExpiry = session.expiresAt - Date.now();
      if (millisecondsUntilExpiry <= 0) {
        expireSession();
        return;
      }

      timeoutRef.current = window.setTimeout(() => {
        expireSession();
      }, millisecondsUntilExpiry);
    }

    checkSession();

    return () => {
      alive = false;
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!expired) return null;

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
