"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

const storageKey = "yalla-theme";
const themeChangeEvent = "yalla-theme-change";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.style.colorScheme = theme;
  window.dispatchEvent(new Event(themeChangeEvent));
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    function syncTheme() {
      setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    }

    syncTheme();
    window.addEventListener("storage", syncTheme);
    window.addEventListener(themeChangeEvent, syncTheme);

    return () => {
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener(themeChangeEvent, syncTheme);
    };
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem(storageKey, nextTheme);
    applyTheme(nextTheme);
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      aria-pressed={isDark}
      aria-label="Toggle theme"
      title="Toggle theme"
      onClick={toggleTheme}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        className,
      )}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
