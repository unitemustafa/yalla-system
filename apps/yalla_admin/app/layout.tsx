import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const cairo = localFont({
  src: [
    {
      path: "../public/fonts/tajawal/Tajawal-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/tajawal/Tajawal-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/tajawal/Tajawal-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/tajawal/Tajawal-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Yalla Admin",
  description: "Yalla Admin dashboard",
};

const themeScript = `
(function () {
  try {
    var themeKey = "yalla-theme";
    var customizationKey = "yalla-dashboard-customization";
    var stored = localStorage.getItem(themeKey);
    var systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var theme = stored === "light" ? "light" : stored === "system" ? (systemDark ? "dark" : "light") : "dark";
    var root = document.documentElement;
    var fonts = {
      cairo: "var(--font-cairo), Cairo, Tajawal, sans-serif",
      tajawal: "Tajawal, var(--font-cairo), Cairo, sans-serif",
      system: "system-ui, -apple-system, BlinkMacSystemFont, \\"Segoe UI\\", sans-serif"
    };
    var palettes = {
      teal: {
        light: {
          "--primary": "hsl(195 67% 25%)",
          "--primary-foreground": "hsl(0 0% 98.5%)",
          "--ring": "hsl(195 60% 55%)",
          "--sidebar-foreground": "hsl(195 35% 25%)",
          "--sidebar-primary": "hsl(195 67% 25%)",
          "--sidebar-primary-foreground": "hsl(0 0% 100%)",
          "--sidebar-accent": "hsl(195 40% 94%)",
          "--sidebar-accent-foreground": "hsl(195 67% 22%)",
          "--sidebar-border": "hsl(195 20% 88%)",
          "--sidebar-ring": "hsl(195 60% 55%)"
        },
        dark: {
          "--primary": "hsl(190 75% 42%)",
          "--primary-foreground": "hsl(190 88% 8%)",
          "--ring": "hsl(190 70% 45%)",
          "--sidebar-foreground": "hsl(210 24% 92%)",
          "--sidebar-primary": "hsl(190 75% 42%)",
          "--sidebar-primary-foreground": "hsl(190 88% 8%)",
          "--sidebar-accent": "hsl(195 32% 18%)",
          "--sidebar-accent-foreground": "hsl(190 40% 94%)",
          "--sidebar-border": "hsl(210 16% 22%)",
          "--sidebar-ring": "hsl(190 70% 45%)"
        }
      },
      emerald: {
        light: {
          "--primary": "hsl(154 69% 30%)",
          "--primary-foreground": "hsl(0 0% 100%)",
          "--ring": "hsl(154 64% 44%)",
          "--sidebar-foreground": "hsl(160 34% 22%)",
          "--sidebar-primary": "hsl(154 69% 30%)",
          "--sidebar-primary-foreground": "hsl(0 0% 100%)",
          "--sidebar-accent": "hsl(150 42% 93%)",
          "--sidebar-accent-foreground": "hsl(154 72% 22%)",
          "--sidebar-border": "hsl(155 24% 86%)",
          "--sidebar-ring": "hsl(154 64% 44%)"
        },
        dark: {
          "--primary": "hsl(154 64% 45%)",
          "--primary-foreground": "hsl(160 85% 8%)",
          "--ring": "hsl(154 64% 45%)",
          "--sidebar-foreground": "hsl(155 20% 92%)",
          "--sidebar-primary": "hsl(154 64% 45%)",
          "--sidebar-primary-foreground": "hsl(160 85% 8%)",
          "--sidebar-accent": "hsl(158 28% 17%)",
          "--sidebar-accent-foreground": "hsl(150 48% 92%)",
          "--sidebar-border": "hsl(158 18% 24%)",
          "--sidebar-ring": "hsl(154 64% 45%)"
        }
      },
      indigo: {
        light: {
          "--primary": "hsl(239 72% 56%)",
          "--primary-foreground": "hsl(0 0% 100%)",
          "--ring": "hsl(239 72% 62%)",
          "--sidebar-foreground": "hsl(235 28% 27%)",
          "--sidebar-primary": "hsl(239 72% 56%)",
          "--sidebar-primary-foreground": "hsl(0 0% 100%)",
          "--sidebar-accent": "hsl(233 75% 95%)",
          "--sidebar-accent-foreground": "hsl(239 65% 34%)",
          "--sidebar-border": "hsl(233 35% 88%)",
          "--sidebar-ring": "hsl(239 72% 62%)"
        },
        dark: {
          "--primary": "hsl(238 82% 70%)",
          "--primary-foreground": "hsl(238 62% 12%)",
          "--ring": "hsl(238 82% 70%)",
          "--sidebar-foreground": "hsl(232 30% 92%)",
          "--sidebar-primary": "hsl(238 82% 70%)",
          "--sidebar-primary-foreground": "hsl(238 62% 12%)",
          "--sidebar-accent": "hsl(238 26% 20%)",
          "--sidebar-accent-foreground": "hsl(233 85% 94%)",
          "--sidebar-border": "hsl(238 16% 27%)",
          "--sidebar-ring": "hsl(238 82% 70%)"
        }
      },
      rose: {
        light: {
          "--primary": "hsl(334 79% 42%)",
          "--primary-foreground": "hsl(0 0% 100%)",
          "--ring": "hsl(334 79% 52%)",
          "--sidebar-foreground": "hsl(334 28% 27%)",
          "--sidebar-primary": "hsl(334 79% 42%)",
          "--sidebar-primary-foreground": "hsl(0 0% 100%)",
          "--sidebar-accent": "hsl(351 100% 96%)",
          "--sidebar-accent-foreground": "hsl(334 79% 32%)",
          "--sidebar-border": "hsl(345 40% 88%)",
          "--sidebar-ring": "hsl(334 79% 52%)"
        },
        dark: {
          "--primary": "hsl(336 82% 62%)",
          "--primary-foreground": "hsl(336 70% 10%)",
          "--ring": "hsl(336 82% 62%)",
          "--sidebar-foreground": "hsl(336 28% 92%)",
          "--sidebar-primary": "hsl(336 82% 62%)",
          "--sidebar-primary-foreground": "hsl(336 70% 10%)",
          "--sidebar-accent": "hsl(336 25% 19%)",
          "--sidebar-accent-foreground": "hsl(351 100% 95%)",
          "--sidebar-border": "hsl(336 16% 26%)",
          "--sidebar-ring": "hsl(336 82% 62%)"
        }
      }
    };
    function validHex(value, fallback) {
      return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
    }
    function hexToRgb(hex) {
      var normalized = hex.replace("#", "");
      return {
        r: parseInt(normalized.slice(0, 2), 16),
        g: parseInt(normalized.slice(2, 4), 16),
        b: parseInt(normalized.slice(4, 6), 16)
      };
    }
    function hexToHsl(hex) {
      var rgb = hexToRgb(hex);
      var red = rgb.r / 255;
      var green = rgb.g / 255;
      var blue = rgb.b / 255;
      var max = Math.max(red, green, blue);
      var min = Math.min(red, green, blue);
      var lightness = (max + min) / 2;
      if (max === min) {
        return { h: 0, s: 0, l: Math.round(lightness * 100) };
      }
      var delta = max - min;
      var saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
      var hue = 0;
      if (max === red) {
        hue = (green - blue) / delta + (green < blue ? 6 : 0);
      } else if (max === green) {
        hue = (blue - red) / delta + 2;
      } else {
        hue = (red - green) / delta + 4;
      }
      return { h: Math.round(hue * 60), s: Math.round(saturation * 100), l: Math.round(lightness * 100) };
    }
    function hslValue(hex, lightness) {
      var hsl = hexToHsl(hex);
      return "hsl(" + hsl.h + " " + hsl.s + "% " + (lightness || hsl.l) + "%)";
    }
    function readableForeground(hex) {
      var rgb = hexToRgb(hex);
      var brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
      return brightness > 150 ? "hsl(0 0% 9%)" : "hsl(0 0% 100%)";
    }
    function customPalette(colors) {
      var primary = validHex(colors && colors.primary, "#155d72");
      var surface = validHex(colors && colors.surface, "#e7f2f4");
      var accent = validHex(colors && colors.accent, "#f0b64f");
      var primaryForeground = readableForeground(primary);
      var accentForeground = readableForeground(accent);
      return {
        light: {
          "--primary": primary,
          "--primary-foreground": primaryForeground,
          "--ring": primary,
          "--chart-1": primary,
          "--chart-2": accent,
          "--chart-5": surface,
          "--sidebar-foreground": hslValue(primary, 22),
          "--sidebar-primary": primary,
          "--sidebar-primary-foreground": primaryForeground,
          "--sidebar-accent": surface,
          "--sidebar-accent-foreground": hslValue(primary, 24),
          "--sidebar-border": hslValue(surface, 86),
          "--sidebar-ring": primary
        },
        dark: {
          "--primary": primary,
          "--primary-foreground": primaryForeground,
          "--ring": primary,
          "--chart-1": primary,
          "--chart-2": accent,
          "--chart-5": surface,
          "--sidebar-foreground": "hsl(210 24% 92%)",
          "--sidebar-primary": primary,
          "--sidebar-primary-foreground": primaryForeground,
          "--sidebar-accent": hslValue(primary, 18),
          "--sidebar-accent-foreground": accentForeground,
          "--sidebar-border": hslValue(primary, 24),
          "--sidebar-ring": primary
        }
      };
    }
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    root.style.colorScheme = theme;
    var customization = JSON.parse(localStorage.getItem(customizationKey) || "{}");
    var palette = customization.palette === "custom" ? customPalette(customization.customColors) : (palettes[customization.palette] || palettes.teal);
    var variables = palette[theme] || palette.light;
    Object.keys(variables).forEach(function (key) {
      root.style.setProperty(key, variables[key]);
    });
    root.style.setProperty("--dashboard-font-family", fonts[customization.font] || fonts.cairo);
    root.lang = "ar-EG-u-nu-latn";
    root.dir = "rtl";
    localStorage.removeItem("yalla-language");
  } catch (_) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar-EG-u-nu-latn"
      dir="rtl"
      suppressHydrationWarning
      className={`${cairo.variable} antialiased font-sans`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
