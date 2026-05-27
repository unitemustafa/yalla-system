import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "يلا ماركت",
  description: "واجهة إدارة يلا ماركت",
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
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    root.style.colorScheme = theme;
    var customization = JSON.parse(localStorage.getItem(customizationKey) || "{}");
    var palette = palettes[customization.palette] || palettes.teal;
    var variables = palette[theme] || palette.light;
    Object.keys(variables).forEach(function (key) {
      root.style.setProperty(key, variables[key]);
    });
    root.style.setProperty("--dashboard-font-family", fonts[customization.font] || fonts.cairo);
    root.lang = "ar-EG";
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
      lang="ar-EG"
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
