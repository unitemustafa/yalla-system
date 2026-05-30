"use client";

import Image from "next/image";
import { useEffect } from "react";

import { logoSrc } from "@/features/dashboard/data";

const splashStorageKey = "yalla-login-splash-seen";

export function getInitialLoginSplashVisibility() {
  if (typeof window === "undefined") {
    return true;
  }

  try {
    return sessionStorage.getItem(splashStorageKey) !== "true";
  } catch {
    return true;
  }
}

export function markLoginSplashSeen() {
  try {
    sessionStorage.setItem(splashStorageKey, "true");
  } catch {
    // Ignore storage failures so the login screen never gets blocked.
  }
}

export function LoginSplash({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const timer = window.setTimeout(onDone, reducedMotion ? 450 : 1450);

    return () => window.clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="absolute inset-0 bg-primary" />
      <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(to_left,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:54px_54px]" />
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center px-8 text-center text-primary-foreground">
        <Image
          alt="Yalla Market"
          src={logoSrc}
          width={92}
          height={92}
          priority
          className="size-[92px] rounded-2xl border border-white/25 object-cover shadow-2xl"
        />
        <h1 className="mt-5 text-3xl font-extrabold leading-tight">
          يلا ماركت
        </h1>
        <p className="mt-2 text-sm font-medium text-white/75">لوحة التحكم</p>
        <div
          className="mt-8 h-1.5 w-full overflow-hidden rounded-full bg-white/20"
          aria-hidden="true"
        >
          <div className="h-full w-1/2 animate-[splash-progress_1.25s_ease-in-out_infinite] rounded-full bg-amber-300" />
        </div>
      </div>
    </div>
  );
}
