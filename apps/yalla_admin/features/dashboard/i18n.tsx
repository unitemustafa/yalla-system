"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
} from "react";

import { ar } from "./locales/ar";
import type { BreadcrumbItem, PageKey } from "./types";

export type DashboardLanguage = "ar";
export type DashboardDirection = "rtl";
export type TranslationKey = keyof typeof ar;

const languageStorageKey = "yalla-language";
const arabicLatinNumberLocale = "ar-EG-u-nu-latn";

const pageKeys: Record<PageKey, TranslationKey> = {
  overview: "page.overview",
  items: "page.items",
  "create-item": "page.createItem",
  shops: "page.shops",
  categories: "page.categories",
  addons: "page.addons",
  orders: "page.orders",
  "create-order": "page.createOrder",
  "order-detail": "page.orderDetail",
  offers: "page.offers",
  "create-offer": "page.createOffer",
  "delivery-zone": "page.deliveryZone",
  couriers: "page.couriers",
  customers: "page.customers",
  account: "page.account",
  settings: "page.settings",
  notifications: "page.notifications",
};

type DashboardI18nValue = {
  language: DashboardLanguage;
  direction: DashboardDirection;
  numberLocale: string;
  t: (key: string) => string;
  pageTitle: (page: PageKey) => string;
  breadcrumbsForPage: (page: PageKey) => BreadcrumbItem[];
};

const DashboardI18nContext = createContext<DashboardI18nValue | null>(null);

function applyArabicLanguage() {
  const root = document.documentElement;
  root.lang = arabicLatinNumberLocale;
  root.dir = "rtl";
  localStorage.removeItem(languageStorageKey);
}

export function DashboardI18nProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const language: DashboardLanguage = "ar";
  const direction: DashboardDirection = "rtl";
  const numberLocale = arabicLatinNumberLocale;

  useEffect(() => {
    applyArabicLanguage();
  }, []);

  const value = useMemo<DashboardI18nValue>(() => {
    const dictionary = ar as Record<string, string>;
    const translate = (key: string) => dictionary[key] ?? key;
    const pageTitle = (page: PageKey) => translate(pageKeys[page]);
    const dashboardCrumb: BreadcrumbItem = {
      label: translate("page.overview"),
      href: "/dashboard",
    };
    const breadcrumbsForPage = (page: PageKey): BreadcrumbItem[] => {
      if (page === "overview") {
        return [{ label: translate("page.overview") }];
      }

      return [dashboardCrumb, { label: pageTitle(page) }];
    };

    return {
      language,
      direction,
      numberLocale,
      t: translate,
      pageTitle,
      breadcrumbsForPage,
    };
  }, [direction, language, numberLocale]);

  return (
    <DashboardI18nContext.Provider value={value}>
      {children}
    </DashboardI18nContext.Provider>
  );
}

export function useDashboardI18n() {
  const context = useContext(DashboardI18nContext);

  if (!context) {
    throw new Error("useDashboardI18n must be used inside DashboardI18nProvider");
  }

  return context;
}
