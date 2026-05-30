import type { LucideIcon } from "lucide-react";

export type PageKey =
  | "overview"
  | "items"
  | "create-item"
  | "categories"
  | "addons"
  | "orders"
  | "create-order"
  | "order-detail"
  | "offers"
  | "create-offer"
  | "delivery-zone"
  | "couriers"
  | "customers"
  | "account"
  | "settings"
  | "notifications";

export type NavChild = {
  label: string;
  href: string;
  page: PageKey;
  soon?: boolean;
};

export type NavItem = {
  label: string;
  href?: string;
  page?: PageKey;
  icon: LucideIcon;
  soon?: boolean;
  children?: NavChild[];
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export type BreadcrumbItem = {
  label: string;
  href?: string;
};
