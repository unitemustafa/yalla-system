"use client";

import { clearClientAuth } from "@/lib/client-api";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronsUpDown,
  Languages,
  LogOut,
  Monitor,
  Moon,
  Palette,
  Settings,
  Sun,
  User,
} from "lucide-react";

import { logoSrc, navGroups } from "./data";
import { DashboardImage } from "./dashboard-image";
import { useDashboardCustomization } from "./customization";
import { useSidebarGroups } from "./hooks";
import { useDashboardI18n } from "./i18n";
import { currentUser } from "./profile-data";
import { branchOptions } from "./reference-data";
import type { PageKey } from "./types";
import { cn } from "@/lib/utils";

type ThemeChoice = "light" | "dark" | "system";
type FloatingNavState = {
  label: string;
  top: number;
};

const themeStorageKey = "yalla-theme";
const themeChangeEvent = "yalla-theme-change";

function itemActive(itemPage: PageKey | undefined, activePage: PageKey) {
  return itemPage === activePage;
}

function applyTheme(theme: ThemeChoice) {
  const root = document.documentElement;
  const resolvedTheme =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;

  root.classList.remove("light", "dark");
  root.classList.add(resolvedTheme);
  root.style.colorScheme = resolvedTheme;

  localStorage.setItem(themeStorageKey, theme);

  window.dispatchEvent(new Event(themeChangeEvent));
}

const appearanceOptions = [
  { value: "system", labelKey: "appearance.system", icon: Monitor },
  { value: "dark", labelKey: "appearance.dark", icon: Moon },
  { value: "light", labelKey: "appearance.light", icon: Sun },
] as const;

const languageOptions = [
  { value: "ar", labelKey: "language.ar" },
  { value: "en", labelKey: "language.en" },
] as const;

export function Sidebar({
  activePage,
  collapsed,
  mobileOpen,
  onCloseMobile,
  onToggleCollapsed,
}: {
  activePage: PageKey;
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onToggleCollapsed: () => void;
}) {
  const { isGroupOpen, toggleGroup } = useSidebarGroups();
  const { direction, language, pageTitle, t } = useDashboardI18n();
  const { customization } = useDashboardCustomization();
  const iconOnly = collapsed && !mobileOpen;
  const branchMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const collapsedNavMenuRef = useRef<HTMLDivElement>(null);
  const [branchMenuOpen, setBranchMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [collapsedGroupOpen, setCollapsedGroupOpen] =
    useState<FloatingNavState | null>(null);
  const [iconTooltip, setIconTooltip] = useState<FloatingNavState | null>(null);
  const brandName = customization.brandName || t("brand.name");
  const branchName = customization.branchName || t("branch.default");
  const brandLogo = customization.logoDataUrl || logoSrc;
  const [theme, setTheme] = useState<ThemeChoice>(() => {
    if (typeof window === "undefined") {
      return "dark";
    }

    const storedTheme = localStorage.getItem(themeStorageKey);
    return storedTheme === "light" ||
      storedTheme === "dark" ||
      storedTheme === "system"
      ? storedTheme
      : "dark";
  });

  useEffect(() => {
    if (!branchMenuOpen && !profileMenuOpen && !collapsedGroupOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (branchMenuRef.current && !branchMenuRef.current.contains(target)) {
        setBranchMenuOpen(false);
      }

      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setProfileMenuOpen(false);
      }

      if (
        collapsedNavMenuRef.current &&
        !collapsedNavMenuRef.current.contains(target)
      ) {
        setCollapsedGroupOpen(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setBranchMenuOpen(false);
        setProfileMenuOpen(false);
        setCollapsedGroupOpen(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [branchMenuOpen, collapsedGroupOpen, profileMenuOpen]);

  function selectTheme(nextTheme: ThemeChoice) {
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }

  async function logout() {
    setProfileMenuOpen(false);
    onCloseMobile();

    clearClientAuth();
    window.location.href = "/login";
  }

  function groupLabel(index: number) {
    return index === 0 ? t("sidebar.group.menu") : t("sidebar.group.management");
  }

  function navItemLabel(item: (typeof navGroups)[number]["items"][number]) {
    if (item.page) {
      return pageTitle(item.page);
    }

    const firstChildPage = item.children?.[0]?.page;

    if (firstChildPage === "items") return t("nav.products");
    if (firstChildPage === "orders") return t("nav.orders");
    if (firstChildPage === "offers") return t("nav.offers");
    if (firstChildPage === "delivery-zone") return t("nav.delivery");

    if (item.label === "العضويات") return t("nav.memberships");
    if (item.label === "الشات") return t("nav.chat");

    return item.label;
  }

  function navChildLabel(page: PageKey) {
    if (page === "items") return t("nav.allProducts");
    if (page === "orders") return t("nav.allOrders");
    if (page === "offers") return t("nav.allOffers");

    return pageTitle(page);
  }

  function floatingTop(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    return rect.top + rect.height / 2;
  }

  function showIconTooltip(
    event: React.MouseEvent<HTMLElement> | React.FocusEvent<HTMLElement>,
    label: string,
  ) {
    if (!iconOnly || collapsedGroupOpen?.label === label) {
      return;
    }

    setIconTooltip({ label, top: floatingTop(event.currentTarget) });
  }

  function hideIconTooltip(label?: string) {
    setIconTooltip((current) =>
      !label || current?.label === label ? null : current,
    );
  }

  function toggleCollapsedGroup(
    event: React.MouseEvent<HTMLElement>,
    label: string,
  ) {
    const top = floatingTop(event.currentTarget);

    setIconTooltip(null);
    setBranchMenuOpen(false);
    setProfileMenuOpen(false);
    setCollapsedGroupOpen((current) =>
      current?.label === label ? null : { label, top },
    );
  }

  return (
    <aside
      className={cn(
        "fixed inset-y-0 z-30 overflow-hidden border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-300 ease-in-out lg:z-20 lg:block",
        direction === "rtl" ? "right-0 border-l" : "left-0 border-r",
        mobileOpen ? "block w-[256px]" : "hidden",
        !mobileOpen && (collapsed ? "lg:w-16" : "lg:w-[256px]"),
      )}
    >
      <div
        ref={branchMenuRef}
        className={cn(
          "relative flex h-16 items-center px-2",
          iconOnly && "justify-center",
        )}
      >
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={branchMenuOpen}
          onClick={() => {
            setBranchMenuOpen((open) => !open);
            setProfileMenuOpen(false);
            setCollapsedGroupOpen(null);
            setIconTooltip(null);
          }}
          onFocus={(event) => showIconTooltip(event, brandName)}
          onMouseEnter={(event) => showIconTooltip(event, brandName)}
          onBlur={() => hideIconTooltip(brandName)}
          onMouseLeave={() => hideIconTooltip(brandName)}
          title={iconOnly ? brandName : undefined}
          className={cn(
            "flex h-12 items-center gap-2 overflow-hidden rounded-md p-1.5 text-sm font-medium transition-colors hover:bg-sidebar-accent",
            branchMenuOpen && "bg-sidebar-accent text-sidebar-accent-foreground",
            iconOnly ? "w-12 justify-center" : "w-full",
          )}
        >
          <DashboardImage
            alt={brandName}
            src={brandLogo}
            width={32}
            height={32}
            priority
            unoptimized={brandLogo.startsWith("data:")}
            className="size-7 rounded-lg"
          />
          {!iconOnly ? (
            <>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5 leading-tight">
                <span className="block truncate text-start text-[11px] font-semibold">
                  {brandName}
                </span>
                <span className="line-clamp-2 block text-start text-[10px] leading-[12px] text-sidebar-foreground/80">
                  {branchName}
                </span>
              </span>
              <ChevronsUpDown className="size-3.5 shrink-0" />
            </>
          ) : null}
        </button>

        {branchMenuOpen ? (
          <div
            role="menu"
            className={cn(
              "z-50 rounded-lg border border-sidebar-border bg-sidebar p-1 text-sidebar-foreground shadow-2xl",
              iconOnly
                ? cn(
                    "fixed top-[68px] w-64",
                    direction === "rtl" ? "right-2" : "left-2",
                  )
                : "absolute left-2 right-2 top-16",
            )}
          >
            {branchOptions.map((branch) => (
              <button
                key={branch.id}
                type="button"
                role="menuitemradio"
                aria-checked
                onClick={() => setBranchMenuOpen(false)}
                className="flex min-h-9 w-full items-center gap-2 rounded-md bg-sidebar-accent px-2 py-2 text-sm font-medium text-sidebar-accent-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <span className="min-w-0 flex-1 truncate text-start">
                  {t(branch.labelKey)}
                </span>
                <Check className="size-4 shrink-0" />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <nav
        className={cn(
          "no-scrollbar flex h-[calc(100vh-128px)] flex-col justify-between overflow-y-auto overflow-x-hidden pb-4",
          iconOnly ? "px-0" : "px-2",
        )}
      >
        <div>
          {navGroups.map((group, groupIndex) => (
            <div
              key={group.label}
              className={cn("pt-2", groupIndex > 0 && "mt-3")}
            >
              {!iconOnly ? (
                <div className="flex h-8 items-center px-2 text-xs text-muted-foreground">
                  {groupLabel(groupIndex)}
                </div>
              ) : null}
              <div className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const hasChildren = Boolean(item.children?.length);
                  const canExpandInline = hasChildren && !iconOnly;
                  const itemLabel = navItemLabel(item);
                  const active =
                    itemActive(item.page, activePage) ||
                    Boolean(
                      item.children?.some((child) => child.page === activePage),
                    );
                  const open = isGroupOpen(item.label) || active;
                  const disabled = item.soon && !hasChildren;
                  const soonClass =
                    "rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-200";
                  const itemBody = (
                    <>
                      <Icon className="size-4 shrink-0" />
                      {!iconOnly ? (
                        <span className="min-w-0 flex-1 truncate text-start">
                          {itemLabel}
                        </span>
                      ) : null}
                      {canExpandInline ? (
                        open ? (
                          <ChevronDown className="size-4 shrink-0" />
                        ) : (
                          <ChevronLeft className="size-4 shrink-0" />
                        )
                      ) : null}
                      {!iconOnly && item.soon ? (
                        <span className={soonClass}>{t("common.soon")}</span>
                      ) : null}
                    </>
                  );

                  return (
                    <div key={item.label}>
                      {item.href ? (
                        <Link
                          href={item.href}
                          onClick={() => {
                            setCollapsedGroupOpen(null);
                            onCloseMobile();
                          }}
                          onFocus={(event) => showIconTooltip(event, itemLabel)}
                          onMouseEnter={(event) =>
                            showIconTooltip(event, itemLabel)
                          }
                          onBlur={() => hideIconTooltip(itemLabel)}
                          onMouseLeave={() => hideIconTooltip(itemLabel)}
                          title={iconOnly ? itemLabel : undefined}
                          className={cn(
                            "flex h-8 items-center rounded-md text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            iconOnly
                              ? "mx-auto w-8 justify-center p-0"
                              : "w-full gap-2 p-2",
                            active &&
                              "bg-sidebar-accent text-sidebar-accent-foreground",
                          )}
                        >
                          {itemBody}
                        </Link>
                      ) : (
                        <button
                          onClick={(event) => {
                            if (disabled) {
                              return;
                            }
                            if (iconOnly && hasChildren) {
                              toggleCollapsedGroup(event, item.label);
                              return;
                            }
                            if (canExpandInline) {
                              toggleGroup(item.label);
                            }
                          }}
                          onFocus={(event) => showIconTooltip(event, itemLabel)}
                          onMouseEnter={(event) =>
                            showIconTooltip(event, itemLabel)
                          }
                          onBlur={() => hideIconTooltip(itemLabel)}
                          onMouseLeave={() => hideIconTooltip(itemLabel)}
                          title={iconOnly ? itemLabel : undefined}
                          aria-expanded={
                            canExpandInline
                              ? open
                              : iconOnly && hasChildren
                                ? collapsedGroupOpen?.label === item.label
                                : undefined
                          }
                          aria-haspopup={iconOnly && hasChildren ? "menu" : undefined}
                          disabled={disabled}
                          className={cn(
                            "flex h-8 items-center rounded-md text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            iconOnly
                              ? "mx-auto w-8 justify-center p-0"
                              : "w-full gap-2 p-2",
                            active &&
                              "bg-sidebar-accent text-sidebar-accent-foreground",
                            disabled &&
                              "cursor-not-allowed text-sidebar-foreground/35 opacity-60 hover:bg-transparent hover:text-sidebar-foreground/35",
                          )}
                        >
                          {itemBody}
                        </button>
                      )}
                      {!iconOnly && item.children && open ? (
                        <div
                          className={cn(
                            "flex min-w-0 flex-col gap-1 border-sidebar-accent-foreground/30 py-0.5",
                            direction === "rtl"
                              ? "mr-3.5 border-r pr-4"
                              : "ml-3.5 border-l pl-4",
                          )}
                        >
                          {item.children.map((child) =>
                            child.href === "#" ? (
                              <button
                                key={child.label}
                                className="flex h-8 items-center justify-between gap-2 rounded-md px-2 text-start text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                              >
                                <span className="truncate">
                                  {navChildLabel(child.page)}
                                </span>
                                {child.soon ? (
                                  <span className={soonClass}>
                                    {t("common.soon")}
                                  </span>
                                ) : null}
                              </button>
                            ) : (
                              <Link
                                key={child.label}
                                href={child.href}
                                onClick={onCloseMobile}
                                className={cn(
                                  "flex h-8 items-center justify-between gap-2 rounded-md px-2 text-start text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                  child.page === activePage &&
                                    "bg-sidebar-accent text-sidebar-accent-foreground",
                                )}
                              >
                                <span className="truncate">
                                  {navChildLabel(child.page)}
                                </span>
                                {child.soon ? (
                                  <span className={soonClass}>
                                    {t("common.soon")}
                                  </span>
                                ) : null}
                              </Link>
                            ),
                          )}
                        </div>
                      ) : null}
                      {iconOnly &&
                      item.children &&
                      collapsedGroupOpen?.label === item.label ? (
                        <div
                          ref={collapsedNavMenuRef}
                          role="menu"
                          className={cn(
                            "fixed z-50 w-60 -translate-y-1/2 rounded-lg border border-sidebar-border bg-sidebar p-1 text-sidebar-foreground shadow-2xl",
                            direction === "rtl" ? "right-[72px]" : "left-[72px]",
                          )}
                          style={{ top: collapsedGroupOpen.top }}
                        >
                          <div className="mb-1 rounded-md bg-sidebar-accent/60 px-3 py-2 text-sm font-semibold text-sidebar-accent-foreground">
                            {itemLabel}
                          </div>
                          {item.children.map((child) =>
                            child.href === "#" ? (
                              <button
                                key={child.label}
                                className="flex min-h-9 w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-start text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                role="menuitem"
                                type="button"
                              >
                                <span className="truncate">
                                  {navChildLabel(child.page)}
                                </span>
                                {child.soon ? (
                                  <span className={soonClass}>
                                    {t("common.soon")}
                                  </span>
                                ) : null}
                              </button>
                            ) : (
                              <Link
                                key={child.label}
                                href={child.href}
                                onClick={() => {
                                  setCollapsedGroupOpen(null);
                                  onCloseMobile();
                                }}
                                role="menuitem"
                                className={cn(
                                  "flex min-h-9 items-center justify-between gap-2 rounded-md px-2 py-2 text-start text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                  child.page === activePage &&
                                    "bg-sidebar-accent text-sidebar-accent-foreground",
                                )}
                              >
                                <span className="truncate">
                                  {navChildLabel(child.page)}
                                </span>
                                {child.soon ? (
                                  <span className={soonClass}>
                                    {t("common.soon")}
                                  </span>
                                ) : null}
                              </Link>
                            ),
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="pt-4" />
      </nav>

      {iconOnly && iconTooltip ? (
        <div
          role="tooltip"
          className={cn(
            "pointer-events-none fixed z-50 -translate-y-1/2 rounded-md border border-sidebar-border bg-sidebar px-3 py-2 text-xs font-semibold text-sidebar-foreground shadow-xl",
            direction === "rtl" ? "right-[72px]" : "left-[72px]",
          )}
          style={{ top: iconTooltip.top }}
        >
          {iconTooltip.label}
        </div>
      ) : null}

      <div
        ref={profileMenuRef}
        className="absolute bottom-0 left-0 right-0 flex h-16 items-center justify-center bg-sidebar px-2"
      >
        {profileMenuOpen ? (
          <div
            className={cn(
              "z-50 rounded-lg border border-sidebar-border bg-sidebar p-1 text-sidebar-foreground shadow-2xl",
              iconOnly
                ? cn(
                    "fixed bottom-[68px] w-64",
                    direction === "rtl" ? "right-2" : "left-2",
                  )
                : "absolute bottom-16 left-2 right-2",
            )}
          >
            <div className="mb-1 flex items-center gap-3 rounded-md bg-sidebar-accent/60 px-3 py-2">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold">
                {currentUser.initials}
              </span>
              <span className="min-w-0 flex-1 text-start">
                <span className="block truncate text-sm font-semibold">
                  {currentUser.fullName}
                </span>
              </span>
            </div>

            <Link
              href="/account"
              onClick={() => {
                setProfileMenuOpen(false);
                onCloseMobile();
              }}
              className="flex h-9 w-full items-center gap-2 rounded-md px-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <User className="size-4 shrink-0" />
              <span className="min-w-0 flex-1 truncate text-start">
                {t("profile.account")}
              </span>
            </Link>
            <Link
              href="/settings"
              onClick={() => {
                setProfileMenuOpen(false);
                onCloseMobile();
              }}
              className="flex h-9 w-full items-center gap-2 rounded-md px-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <Settings className="size-4 shrink-0" />
              <span className="min-w-0 flex-1 truncate text-start">
                {t("profile.settings")}
              </span>
            </Link>
            <Link
              href="/notifications"
              onClick={() => {
                setProfileMenuOpen(false);
                onCloseMobile();
              }}
              className="flex h-9 w-full items-center gap-2 rounded-md px-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <Bell className="size-4 shrink-0" />
              <span className="min-w-0 flex-1 truncate text-start">
                {t("profile.notifications")}
              </span>
              <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                2
              </span>
            </Link>

            <div className="my-1 h-px bg-sidebar-border" />

            <div className="rounded-md px-2 py-2">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-sidebar-foreground/70">
                <Palette className="size-3.5" />
                <span>{t("profile.appearance")}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {appearanceOptions.map((option) => {
                  const Icon = option.icon;
                  const selected = theme === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => selectTheme(option.value)}
                      className={cn(
                        "flex h-8 items-center justify-center gap-1.5 rounded-md border text-xs transition-colors",
                        selected
                          ? "border-sidebar-ring bg-sidebar-accent text-sidebar-accent-foreground"
                          : "border-sidebar-border text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <Icon className="size-3.5" />
                      <span className="truncate">{t(option.labelKey)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-md px-2 py-2">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-sidebar-foreground/70">
                <Languages className="size-3.5" />
                <span>{t("profile.language")}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                {languageOptions.map((option) => {
                  const selected = language === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={selected}
                      disabled
                      className={cn(
                        "flex h-8 cursor-not-allowed items-center justify-center gap-1.5 rounded-md border px-2 text-xs opacity-60 transition-colors",
                        selected
                          ? "border-sidebar-ring bg-sidebar-accent text-sidebar-accent-foreground"
                          : "border-sidebar-border text-sidebar-foreground/75",
                      )}
                    >
                      <span className="truncate">{t(option.labelKey)}</span>
                      {selected ? <Check className="size-3.5" /> : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="my-1 h-px bg-sidebar-border" />

            <button
              type="button"
              onClick={logout}
              className="flex h-9 w-full items-center gap-2 rounded-md px-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-300"
            >
              <LogOut className="size-4 shrink-0" />
              <span className="min-w-0 flex-1 truncate text-start">
                {t("profile.logout")}
              </span>
            </button>
          </div>
        ) : null}
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={profileMenuOpen}
          onClick={() => {
            setProfileMenuOpen((open) => !open);
            setBranchMenuOpen(false);
            setCollapsedGroupOpen(null);
            setIconTooltip(null);
          }}
          onFocus={(event) => showIconTooltip(event, currentUser.fullName)}
          onMouseEnter={(event) => showIconTooltip(event, currentUser.fullName)}
          onBlur={() => hideIconTooltip(currentUser.fullName)}
          onMouseLeave={() => hideIconTooltip(currentUser.fullName)}
          title={iconOnly ? currentUser.fullName : undefined}
          className={cn(
            "flex h-12 items-center gap-2 rounded-md p-2 text-start transition-colors hover:bg-sidebar-accent",
            profileMenuOpen && "bg-sidebar-accent text-sidebar-accent-foreground",
            iconOnly ? "w-12 justify-center" : "w-full",
          )}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold">
            {currentUser.initials}
          </span>
          {!iconOnly ? (
            <>
              <span className="flex min-w-0 flex-1 flex-col items-start justify-start text-sm leading-tight">
                <span className="block truncate font-medium">
                  {currentUser.fullName}
                </span>
                <span className="block truncate text-xs">
                  {t("role.manager")}
                </span>
              </span>
              <ChevronsUpDown className="size-4" />
            </>
          ) : null}
        </button>
      </div>

      <button
        onClick={onToggleCollapsed}
        className={cn(
          "absolute top-0 hidden h-full w-0.5 cursor-ew-resize border-x bg-transparent lg:block",
          direction === "rtl" ? "left-[-8px]" : "right-[-8px]",
        )}
        aria-label={t("common.toggleSidebar")}
      />
    </aside>
  );
}
