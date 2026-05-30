"use client";

import { useEffect, useState } from "react";

export type DashboardPaletteId =
  | "teal"
  | "emerald"
  | "indigo"
  | "rose"
  | "custom";
export type DashboardFontId = "cairo" | "tajawal" | "system";

type ThemeMode = "light" | "dark";

type CssVariableSet = Record<string, string>;

export type DashboardCustomColors = {
  primary: string;
  surface: string;
  accent: string;
};

export type DashboardCustomization = {
  palette: DashboardPaletteId;
  font: DashboardFontId;
  brandName: string;
  branchName: string;
  logoDataUrl: string;
  customColors: DashboardCustomColors;
};

export const dashboardCustomizationStorageKey = "yalla-dashboard-customization";
export const dashboardCustomizationChangeEvent =
  "yalla-dashboard-customization-change";

export const defaultDashboardCustomization: DashboardCustomization = {
  palette: "teal",
  font: "cairo",
  brandName: "",
  branchName: "",
  logoDataUrl: "",
  customColors: {
    primary: "#155d72",
    surface: "#e7f2f4",
    accent: "#f0b64f",
  },
};

export const dashboardPalettes: Array<{
  id: DashboardPaletteId;
  name: string;
  swatches: string[];
  light: CssVariableSet;
  dark: CssVariableSet;
}> = [
  {
    id: "teal",
    name: "تركواز",
    swatches: ["#155d72", "#e7f2f4", "#f0b64f"],
    light: {
      "--primary": "hsl(195 67% 25%)",
      "--primary-foreground": "hsl(0 0% 98.5%)",
      "--ring": "hsl(195 60% 55%)",
      "--chart-1": "hsl(195 67% 25%)",
      "--chart-2": "hsl(190 53% 39%)",
      "--chart-5": "hsl(38 86% 63%)",
      "--sidebar-foreground": "hsl(195 35% 25%)",
      "--sidebar-primary": "hsl(195 67% 25%)",
      "--sidebar-primary-foreground": "hsl(0 0% 100%)",
      "--sidebar-accent": "hsl(195 40% 94%)",
      "--sidebar-accent-foreground": "hsl(195 67% 22%)",
      "--sidebar-border": "hsl(195 20% 88%)",
      "--sidebar-ring": "hsl(195 60% 55%)",
    },
    dark: {
      "--primary": "hsl(190 75% 42%)",
      "--primary-foreground": "hsl(190 88% 8%)",
      "--ring": "hsl(190 70% 45%)",
      "--chart-1": "hsl(190 75% 48%)",
      "--chart-2": "hsl(155 60% 48%)",
      "--chart-5": "hsl(345 70% 62%)",
      "--sidebar-foreground": "hsl(210 24% 92%)",
      "--sidebar-primary": "hsl(190 75% 42%)",
      "--sidebar-primary-foreground": "hsl(190 88% 8%)",
      "--sidebar-accent": "hsl(195 32% 18%)",
      "--sidebar-accent-foreground": "hsl(190 40% 94%)",
      "--sidebar-border": "hsl(210 16% 22%)",
      "--sidebar-ring": "hsl(190 70% 45%)",
    },
  },
  {
    id: "emerald",
    name: "أخضر",
    swatches: ["#16794f", "#e8f7ef", "#23695c"],
    light: {
      "--primary": "hsl(154 69% 30%)",
      "--primary-foreground": "hsl(0 0% 100%)",
      "--ring": "hsl(154 64% 44%)",
      "--chart-1": "hsl(154 69% 30%)",
      "--chart-2": "hsl(174 45% 34%)",
      "--chart-5": "hsl(42 82% 58%)",
      "--sidebar-foreground": "hsl(160 34% 22%)",
      "--sidebar-primary": "hsl(154 69% 30%)",
      "--sidebar-primary-foreground": "hsl(0 0% 100%)",
      "--sidebar-accent": "hsl(150 42% 93%)",
      "--sidebar-accent-foreground": "hsl(154 72% 22%)",
      "--sidebar-border": "hsl(155 24% 86%)",
      "--sidebar-ring": "hsl(154 64% 44%)",
    },
    dark: {
      "--primary": "hsl(154 64% 45%)",
      "--primary-foreground": "hsl(160 85% 8%)",
      "--ring": "hsl(154 64% 45%)",
      "--chart-1": "hsl(154 64% 45%)",
      "--chart-2": "hsl(190 58% 48%)",
      "--chart-5": "hsl(42 86% 62%)",
      "--sidebar-foreground": "hsl(155 20% 92%)",
      "--sidebar-primary": "hsl(154 64% 45%)",
      "--sidebar-primary-foreground": "hsl(160 85% 8%)",
      "--sidebar-accent": "hsl(158 28% 17%)",
      "--sidebar-accent-foreground": "hsl(150 48% 92%)",
      "--sidebar-border": "hsl(158 18% 24%)",
      "--sidebar-ring": "hsl(154 64% 45%)",
    },
  },
  {
    id: "indigo",
    name: "نيلي",
    swatches: ["#4f46e5", "#eef2ff", "#06b6d4"],
    light: {
      "--primary": "hsl(239 72% 56%)",
      "--primary-foreground": "hsl(0 0% 100%)",
      "--ring": "hsl(239 72% 62%)",
      "--chart-1": "hsl(239 72% 56%)",
      "--chart-2": "hsl(190 84% 42%)",
      "--chart-5": "hsl(24 91% 58%)",
      "--sidebar-foreground": "hsl(235 28% 27%)",
      "--sidebar-primary": "hsl(239 72% 56%)",
      "--sidebar-primary-foreground": "hsl(0 0% 100%)",
      "--sidebar-accent": "hsl(233 75% 95%)",
      "--sidebar-accent-foreground": "hsl(239 65% 34%)",
      "--sidebar-border": "hsl(233 35% 88%)",
      "--sidebar-ring": "hsl(239 72% 62%)",
    },
    dark: {
      "--primary": "hsl(238 82% 70%)",
      "--primary-foreground": "hsl(238 62% 12%)",
      "--ring": "hsl(238 82% 70%)",
      "--chart-1": "hsl(238 82% 70%)",
      "--chart-2": "hsl(190 84% 52%)",
      "--chart-5": "hsl(24 91% 62%)",
      "--sidebar-foreground": "hsl(232 30% 92%)",
      "--sidebar-primary": "hsl(238 82% 70%)",
      "--sidebar-primary-foreground": "hsl(238 62% 12%)",
      "--sidebar-accent": "hsl(238 26% 20%)",
      "--sidebar-accent-foreground": "hsl(233 85% 94%)",
      "--sidebar-border": "hsl(238 16% 27%)",
      "--sidebar-ring": "hsl(238 82% 70%)",
    },
  },
  {
    id: "rose",
    name: "وردي",
    swatches: ["#be185d", "#fff1f2", "#0f766e"],
    light: {
      "--primary": "hsl(334 79% 42%)",
      "--primary-foreground": "hsl(0 0% 100%)",
      "--ring": "hsl(334 79% 52%)",
      "--chart-1": "hsl(334 79% 42%)",
      "--chart-2": "hsl(176 73% 31%)",
      "--chart-5": "hsl(35 92% 58%)",
      "--sidebar-foreground": "hsl(334 28% 27%)",
      "--sidebar-primary": "hsl(334 79% 42%)",
      "--sidebar-primary-foreground": "hsl(0 0% 100%)",
      "--sidebar-accent": "hsl(351 100% 96%)",
      "--sidebar-accent-foreground": "hsl(334 79% 32%)",
      "--sidebar-border": "hsl(345 40% 88%)",
      "--sidebar-ring": "hsl(334 79% 52%)",
    },
    dark: {
      "--primary": "hsl(336 82% 62%)",
      "--primary-foreground": "hsl(336 70% 10%)",
      "--ring": "hsl(336 82% 62%)",
      "--chart-1": "hsl(336 82% 62%)",
      "--chart-2": "hsl(176 66% 46%)",
      "--chart-5": "hsl(35 92% 62%)",
      "--sidebar-foreground": "hsl(336 28% 92%)",
      "--sidebar-primary": "hsl(336 82% 62%)",
      "--sidebar-primary-foreground": "hsl(336 70% 10%)",
      "--sidebar-accent": "hsl(336 25% 19%)",
      "--sidebar-accent-foreground": "hsl(351 100% 95%)",
      "--sidebar-border": "hsl(336 16% 26%)",
      "--sidebar-ring": "hsl(336 82% 62%)",
    },
  },
];

export const dashboardFonts: Array<{
  id: DashboardFontId;
  name: string;
  cssValue: string;
}> = [
  {
    id: "cairo",
    name: "Cairo",
    cssValue: "var(--font-cairo), Cairo, Tajawal, sans-serif",
  },
  {
    id: "tajawal",
    name: "Tajawal",
    cssValue: "Tajawal, var(--font-cairo), Cairo, sans-serif",
  },
  {
    id: "system",
    name: "System",
    cssValue:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
];

function isDashboardPaletteId(value: unknown): value is DashboardPaletteId {
  return value === "custom" || dashboardPalettes.some((palette) => palette.id === value);
}

function isDashboardFontId(value: unknown): value is DashboardFontId {
  return dashboardFonts.some((font) => font.id === value);
}

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value.trim());
}

export function normalizeDashboardCustomColors(
  colors: unknown,
): DashboardCustomColors {
  const parsed =
    colors && typeof colors === "object"
      ? (colors as Partial<DashboardCustomColors>)
      : {};

  return {
    primary: isHexColor(parsed.primary)
      ? parsed.primary
      : defaultDashboardCustomization.customColors.primary,
    surface: isHexColor(parsed.surface)
      ? parsed.surface
      : defaultDashboardCustomization.customColors.surface,
    accent: isHexColor(parsed.accent)
      ? parsed.accent
      : defaultDashboardCustomization.customColors.accent,
  };
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function hexToHsl(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: Math.round(lightness * 100) };
  }

  const delta = max - min;
  const saturation =
    lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  let hue = 0;

  if (max === red) {
    hue = (green - blue) / delta + (green < blue ? 6 : 0);
  } else if (max === green) {
    hue = (blue - red) / delta + 2;
  } else {
    hue = (red - green) / delta + 4;
  }

  return {
    h: Math.round(hue * 60),
    s: Math.round(saturation * 100),
    l: Math.round(lightness * 100),
  };
}

function hslValue(hex: string, lightness?: number) {
  const hsl = hexToHsl(hex);
  return `hsl(${hsl.h} ${hsl.s}% ${lightness ?? hsl.l}%)`;
}

function readableForeground(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 150 ? "hsl(0 0% 9%)" : "hsl(0 0% 100%)";
}

export function dashboardCustomPaletteVariables(
  colors: DashboardCustomColors,
): { light: CssVariableSet; dark: CssVariableSet; swatches: string[] } {
  const normalized = normalizeDashboardCustomColors(colors);
  const primaryForeground = readableForeground(normalized.primary);
  const accentForeground = readableForeground(normalized.accent);

  return {
    swatches: [normalized.primary, normalized.surface, normalized.accent],
    light: {
      "--primary": normalized.primary,
      "--primary-foreground": primaryForeground,
      "--ring": normalized.primary,
      "--chart-1": normalized.primary,
      "--chart-2": normalized.accent,
      "--chart-5": normalized.surface,
      "--sidebar-foreground": hslValue(normalized.primary, 22),
      "--sidebar-primary": normalized.primary,
      "--sidebar-primary-foreground": primaryForeground,
      "--sidebar-accent": normalized.surface,
      "--sidebar-accent-foreground": hslValue(normalized.primary, 24),
      "--sidebar-border": hslValue(normalized.surface, 86),
      "--sidebar-ring": normalized.primary,
    },
    dark: {
      "--primary": normalized.primary,
      "--primary-foreground": primaryForeground,
      "--ring": normalized.primary,
      "--chart-1": normalized.primary,
      "--chart-2": normalized.accent,
      "--chart-5": normalized.surface,
      "--sidebar-foreground": "hsl(210 24% 92%)",
      "--sidebar-primary": normalized.primary,
      "--sidebar-primary-foreground": primaryForeground,
      "--sidebar-accent": hslValue(normalized.primary, 18),
      "--sidebar-accent-foreground": accentForeground,
      "--sidebar-border": hslValue(normalized.primary, 24),
      "--sidebar-ring": normalized.primary,
    },
  };
}

function currentThemeMode(): ThemeMode {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function readDashboardCustomization(): DashboardCustomization {
  if (typeof window === "undefined") {
    return defaultDashboardCustomization;
  }

  try {
    const parsed = JSON.parse(
      localStorage.getItem(dashboardCustomizationStorageKey) ?? "{}",
    ) as Partial<DashboardCustomization>;

    return {
      palette: isDashboardPaletteId(parsed.palette)
        ? parsed.palette
        : defaultDashboardCustomization.palette,
      font: isDashboardFontId(parsed.font)
        ? parsed.font
        : defaultDashboardCustomization.font,
      brandName:
        typeof parsed.brandName === "string" ? parsed.brandName.trim() : "",
      branchName:
        typeof parsed.branchName === "string" ? parsed.branchName.trim() : "",
      logoDataUrl:
        typeof parsed.logoDataUrl === "string" ? parsed.logoDataUrl : "",
      customColors: normalizeDashboardCustomColors(parsed.customColors),
    };
  } catch {
    return defaultDashboardCustomization;
  }
}

export function applyDashboardCustomization(
  customization: DashboardCustomization,
) {
  if (typeof window === "undefined") {
    return;
  }

  const root = document.documentElement;
  const palette =
    customization.palette === "custom"
      ? dashboardCustomPaletteVariables(customization.customColors)
      : (dashboardPalettes.find((item) => item.id === customization.palette) ??
        dashboardPalettes[0]);
  const font =
    dashboardFonts.find((item) => item.id === customization.font) ??
    dashboardFonts[0];
  const variables = palette[currentThemeMode()];

  Object.entries(variables).forEach(([name, value]) => {
    root.style.setProperty(name, value);
  });
  root.style.setProperty("--dashboard-font-family", font.cssValue);
}

export function saveDashboardCustomization(
  customization: DashboardCustomization,
) {
  localStorage.setItem(
    dashboardCustomizationStorageKey,
    JSON.stringify(customization),
  );
  applyDashboardCustomization(customization);
  window.dispatchEvent(
    new CustomEvent(dashboardCustomizationChangeEvent, {
      detail: customization,
    }),
  );
}

export function resetDashboardCustomization() {
  localStorage.removeItem(dashboardCustomizationStorageKey);
  applyDashboardCustomization(defaultDashboardCustomization);
  window.dispatchEvent(
    new CustomEvent(dashboardCustomizationChangeEvent, {
      detail: defaultDashboardCustomization,
    }),
  );
}

export function useDashboardCustomization() {
  const [customization, setCustomization] = useState<DashboardCustomization>(
    defaultDashboardCustomization,
  );

  useEffect(() => {
    function syncCustomization() {
      const nextCustomization = readDashboardCustomization();
      setCustomization(nextCustomization);
      applyDashboardCustomization(nextCustomization);
    }

    syncCustomization();
    window.addEventListener("storage", syncCustomization);
    window.addEventListener(
      dashboardCustomizationChangeEvent,
      syncCustomization,
    );
    window.addEventListener("yalla-theme-change", syncCustomization);

    return () => {
      window.removeEventListener("storage", syncCustomization);
      window.removeEventListener(
        dashboardCustomizationChangeEvent,
        syncCustomization,
      );
      window.removeEventListener("yalla-theme-change", syncCustomization);
    };
  }, []);

  return {
    customization,
    setCustomization: saveDashboardCustomization,
    resetCustomization: resetDashboardCustomization,
  };
}
