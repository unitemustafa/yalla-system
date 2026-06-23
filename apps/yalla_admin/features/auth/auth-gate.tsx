"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "./auth-provider";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      const next = `${window.location.pathname}${window.location.search}`;
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [router, status]);

  if (status !== "authenticated") {
    return (
      <main className="grid min-h-dvh place-items-center bg-background text-foreground">
        <p className="text-sm text-muted-foreground">
          {status === "loading" ? "جارٍ التحقق من الجلسة..." : "جارٍ تحويلك لتسجيل الدخول..."}
        </p>
      </main>
    );
  }

  return children;
}

