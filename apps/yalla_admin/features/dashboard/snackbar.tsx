"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

import { cn } from "@/lib/utils";

type SnackbarTone = "success" | "danger" | "info";

type Snackbar = {
  id: number;
  message: string;
  tone: SnackbarTone;
};

type SnackbarInput = {
  message: string;
  tone?: SnackbarTone;
};

type SnackbarContextValue = {
  showSnackbar: (snackbar: SnackbarInput) => void;
};

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [snackbars, setSnackbars] = useState<Snackbar[]>([]);

  const removeSnackbar = useCallback((id: number) => {
    setSnackbars((currentSnackbars) =>
      currentSnackbars.filter((snackbar) => snackbar.id !== id),
    );
  }, []);

  const showSnackbar = useCallback(({ message, tone = "success" }: SnackbarInput) => {
    const id = Date.now() + Math.random();

    setSnackbars((currentSnackbars) => [
      ...currentSnackbars.slice(-2),
      { id, message, tone },
    ]);
  }, []);

  const value = useMemo(() => ({ showSnackbar }), [showSnackbar]);

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-4 left-4 z-[80] flex w-[calc(100%-2rem)] max-w-[380px] flex-col gap-2 sm:w-[380px]"
      >
        {snackbars.map((snackbar) => (
          <SnackbarItem
            key={snackbar.id}
            snackbar={snackbar}
            onClose={() => removeSnackbar(snackbar.id)}
          />
        ))}
      </div>
    </SnackbarContext.Provider>
  );
}

function SnackbarItem({
  snackbar,
  onClose,
}: {
  snackbar: Snackbar;
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 3600);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  const Icon =
    snackbar.tone === "danger"
      ? AlertTriangle
      : snackbar.tone === "info"
        ? Info
        : CheckCircle2;

  return (
    <div
      role={snackbar.tone === "danger" ? "alert" : "status"}
      className={cn(
        "flex min-h-12 items-start gap-3 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur",
        snackbar.tone === "success" &&
          "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-500/15 dark:text-emerald-100",
        snackbar.tone === "danger" &&
          "border-red-300 bg-red-50 text-red-900 dark:border-red-400/30 dark:bg-red-500/15 dark:text-red-100",
        snackbar.tone === "info" &&
          "border-primary/30 bg-primary/10 text-primary",
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 flex-1 leading-5">{snackbar.message}</div>
      <button
        aria-label="إغلاق التنبيه"
        className="rounded-md p-0.5 opacity-70 transition-opacity hover:opacity-100"
        onClick={onClose}
        type="button"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

export function useSnackbar() {
  const context = useContext(SnackbarContext);

  if (!context) {
    throw new Error("useSnackbar must be used inside SnackbarProvider");
  }

  return context;
}
