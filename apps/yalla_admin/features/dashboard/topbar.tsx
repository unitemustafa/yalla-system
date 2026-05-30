"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, ChevronLeft, PanelRight } from "lucide-react";

import type { BreadcrumbItem } from "./types";
import { useDashboardI18n } from "./i18n";
import { Button } from "./primitives";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export function Topbar({
  breadcrumbs,
  collapsed,
  onOpenMobile,
  onToggleCollapsed,
}: {
  breadcrumbs: BreadcrumbItem[];
  collapsed: boolean;
  onOpenMobile: () => void;
  onToggleCollapsed: () => void;
}) {
  const { t } = useDashboardI18n();
  const lastScrollYRef = useRef(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    function handleScroll() {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollYRef.current;

      setHidden(scrollingDown && currentScrollY > 96);
      lastScrollYRef.current = currentScrollY;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur transition-transform duration-300 ease-out supports-[backdrop-filter]:bg-card/85",
        hidden && "-translate-y-full",
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="-mr-1 size-7 lg:hidden"
          onClick={onOpenMobile}
          aria-label={t("common.toggleSidebar")}
        >
          <PanelRight className="size-4" />
          <span className="sr-only">{t("common.toggleSidebar")}</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="-mr-1 hidden size-7 lg:inline-flex"
          onClick={onToggleCollapsed}
          aria-expanded={!collapsed}
          aria-label={t("common.toggleSidebar")}
        >
          <PanelRight className="size-4" />
          <span className="sr-only">{t("common.toggleSidebar")}</span>
        </Button>
        <div className="h-4 w-px bg-border" />
        <nav aria-label={t("common.breadcrumb")} className="-mr-2 min-w-0">
          <ol className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
            {breadcrumbs.map((item, index) => (
              <li
                key={`${item.label}-${index}`}
                className="flex min-w-0 items-center gap-2"
              >
                {index > 0 ? <ChevronLeft className="size-3.5 shrink-0" /> : null}
                {item.href ? (
                  <Link href={item.href} className="truncate hover:text-foreground">
                    {item.label}
                  </Link>
                ) : (
                  <span className="truncate text-foreground">{item.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle />
        <Link
          href="/notifications"
          aria-label={t("profile.notifications")}
          title={t("profile.notifications")}
          className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Bell className="size-4" />
        </Link>
      </div>
    </header>
  );
}
