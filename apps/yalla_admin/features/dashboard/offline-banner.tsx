"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

import { useDashboardI18n } from "./i18n";

export function DashboardOfflineBanner() {
  const { t } = useDashboardI18n();
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const updateStatus = () => setIsOffline(!window.navigator.onLine);

    updateStatus();
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <div
      role="alert"
      className="pointer-events-none fixed inset-x-3 top-3 z-[90] mx-auto flex max-w-2xl items-center gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-bold text-red-900 shadow-lg dark:border-red-400/30 dark:bg-red-500/15 dark:text-red-100"
    >
      <WifiOff className="size-5 shrink-0" />
      <span className="min-w-0 leading-5">{t("offline.banner")}</span>
    </div>
  );
}
