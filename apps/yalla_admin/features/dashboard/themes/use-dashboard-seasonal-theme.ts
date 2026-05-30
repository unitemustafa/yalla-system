"use client";

import { useEffect } from "react";

type ThemeColors = {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  button: string;
  headerNavigation: string;
};

type ActiveThemeResponse = {
  theme?: {
    colors: ThemeColors;
    darkColors?: Partial<Record<keyof ThemeColors, string | null>>;
  };
};

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function readableForeground(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 150 ? "hsl(0 0% 9%)" : "hsl(0 0% 100%)";
}

function withAlpha(hex: string, alpha: string) {
  return `color-mix(in srgb, ${hex} ${alpha}, transparent)`;
}

function colorMode() {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function elevatedSurface(hex: string) {
  return colorMode() === "dark"
    ? `color-mix(in srgb, ${hex} 92%, white 8%)`
    : hex;
}

function resolvedColors(theme: NonNullable<ActiveThemeResponse["theme"]>) {
  if (colorMode() === "light") {
    return theme.colors;
  }

  return {
    primary: theme.darkColors?.primary ?? theme.colors.primary,
    secondary: theme.darkColors?.secondary ?? theme.colors.secondary,
    background: theme.darkColors?.background ?? theme.colors.background,
    text: theme.darkColors?.text ?? theme.colors.text,
    button: theme.darkColors?.button ?? theme.colors.button,
    headerNavigation:
      theme.darkColors?.headerNavigation ?? theme.colors.headerNavigation,
  };
}

function applyTheme(theme: NonNullable<ActiveThemeResponse["theme"]>) {
  const root = document.documentElement;
  const colors = resolvedColors(theme);
  const cardSurface = elevatedSurface(colors.background);
  const primaryForeground = readableForeground(colors.primary);
  const buttonForeground = readableForeground(colors.button);

  const variables: Record<string, string> = {
    "--background": colors.background,
    "--foreground": colors.text,
    "--card": cardSurface,
    "--card-foreground": colors.text,
    "--popover": cardSurface,
    "--popover-foreground": colors.text,
    "--primary": colors.primary,
    "--primary-foreground": primaryForeground,
    "--ring": colors.primary,
    "--chart-1": colors.primary,
    "--chart-2": colors.secondary,
    "--chart-5": colors.button,
    "--sidebar": colors.headerNavigation,
    "--sidebar-foreground": colors.text,
    "--sidebar-primary": colors.button,
    "--sidebar-primary-foreground": buttonForeground,
    "--sidebar-accent": withAlpha(colors.primary, "14%"),
    "--sidebar-accent-foreground": colors.text,
    "--sidebar-border": withAlpha(colors.text, "16%"),
    "--sidebar-ring": colors.primary,
  };

  Object.entries(variables).forEach(([name, value]) => {
    root.style.setProperty(name, value);
  });
}

export function useDashboardSeasonalTheme() {
  useEffect(() => {
    let cancelled = false;
    let activeTheme: ActiveThemeResponse["theme"] | null = null;

    async function loadTheme() {
      try {
        const response = await fetch("/api/themes/active?target=dashboard", {
          cache: "no-store",
        });
        const data = (await response.json()) as ActiveThemeResponse;

        if (!cancelled && response.ok && data.theme) {
          activeTheme = data.theme;
          applyTheme(data.theme);
        }
      } catch {
        // Keep the current dashboard palette if the theme endpoint is unavailable.
      }
    }

    function reapplyTheme() {
      const theme = activeTheme;

      if (theme) {
        requestAnimationFrame(() => applyTheme(theme));
      }
    }

    loadTheme();
    window.addEventListener("yalla-theme-change", reapplyTheme);

    return () => {
      cancelled = true;
      window.removeEventListener("yalla-theme-change", reapplyTheme);
    };
  }, []);
}
