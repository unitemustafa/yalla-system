"use client";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { DashboardAutoTranslate } from "./auto-translate";
import { useDashboardFrame } from "./hooks";
import {
  DashboardI18nProvider,
  useDashboardI18n,
} from "./i18n";
import { useDashboardCustomization } from "./customization";
import { DashboardOfflineBanner } from "./offline-banner";
import { SessionExpiryGuard } from "./session-expiry-guard";
import { SnackbarProvider } from "./snackbar";
import { cn } from "@/lib/utils";
import { AuthUserProvider } from "@/features/auth/auth-user-provider";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthUserProvider>
      <DashboardI18nProvider>
        <SnackbarProvider>
          <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </SnackbarProvider>
      </DashboardI18nProvider>
    </AuthUserProvider>
  );
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const {
    activePage,
    collapsed,
    mobileNavOpen,
    closeMobileNav,
    openMobileNav,
    toggleCollapsed,
  } = useDashboardFrame();
  const { breadcrumbsForPage, direction, t } = useDashboardI18n();
  useDashboardCustomization();
  const breadcrumbs = breadcrumbsForPage(activePage);

  return (
    <DashboardAutoTranslate>
      <div className="min-h-screen w-full bg-background text-foreground">
        <SessionExpiryGuard />
        <DashboardOfflineBanner />
        {mobileNavOpen ? (
          <button
            className="fixed inset-0 z-20 bg-foreground/30 backdrop-blur-[1px] lg:hidden"
            aria-label={t("common.closeSidebar")}
            onClick={closeMobileNav}
          />
        ) : null}
        <Sidebar
          activePage={activePage}
          collapsed={collapsed}
          mobileOpen={mobileNavOpen}
          onCloseMobile={closeMobileNav}
          onToggleCollapsed={toggleCollapsed}
        />
        <div
          className={cn(
            "min-h-screen transition-[padding] duration-300 ease-in-out",
            direction === "rtl"
              ? collapsed
                ? "lg:pr-16"
                : "lg:pr-[256px]"
              : collapsed
                ? "lg:pl-16"
                : "lg:pl-[256px]",
          )}
        >
          <Topbar
            breadcrumbs={breadcrumbs}
            collapsed={collapsed}
            onOpenMobile={openMobileNav}
            onToggleCollapsed={toggleCollapsed}
          />
          <main className="min-h-[calc(100vh-64px)] bg-background">
            {children}
          </main>
        </div>
      </div>
    </DashboardAutoTranslate>
  );
}
