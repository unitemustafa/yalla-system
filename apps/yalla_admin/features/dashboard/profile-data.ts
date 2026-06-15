import {
  Bell,
  CircleAlert,
  Clock,
  PackageCheck,
  ShieldCheck,
  ShoppingCart,
  Store,
} from "lucide-react";

import { defaultDashboardAccountEmail } from "@/lib/account-email";

export const currentUser = {
  initials: "MA",
  fullName: "Mohamed Abdeljalel",
  role: "Manager",
  email: defaultDashboardAccountEmail,
  phone: "+20 112 240 1581",
  username: "m.abdeljalel",
  location: "Cairo, Egypt",
  branch: "اول اونلاين ماركت في التل الكبير",
  joinedAt: "May 2026",
  lastLogin: "Today, 4:12 PM",
};

export const accountInfo = [
  { label: "Username", value: currentUser.username },
  { label: "Email", value: currentUser.email },
  { label: "Phone", value: currentUser.phone },
  { label: "Default branch", value: currentUser.branch },
];

export const profileDetails = [
  { label: "Role", value: currentUser.role },
  { label: "Location", value: currentUser.location },
  { label: "Joined", value: currentUser.joinedAt },
  { label: "Last login", value: currentUser.lastLogin },
];

export const notifications = [
  {
    id: "notif-order-1721",
    icon: ShoppingCart,
    title: "New order received",
    message: "Order ORD-20260522-YCFJWF is waiting for confirmation.",
    time: "5 minutes ago",
    read: false,
    category: "Orders",
  },
  {
    id: "notif-stock-509",
    icon: CircleAlert,
    title: "Low stock alert",
    message: "Fresh chicken stock is below the configured threshold.",
    time: "24 minutes ago",
    read: false,
    category: "Inventory",
  },
  {
    id: "notif-courier-88",
    icon: PackageCheck,
    title: "Courier completed delivery",
    message: "Courier Ahmed marked delivery ORD-20260518-QYT6Y0 as complete.",
    time: "1 hour ago",
    read: true,
    category: "Delivery",
  },
  {
    id: "notif-branch-12",
    icon: Store,
    title: "Branch settings synced",
    message: "All branch catalog updates were synced successfully.",
    time: "Yesterday, 9:45 PM",
    read: true,
    category: "System",
  },
  {
    id: "notif-security-2fa",
    icon: ShieldCheck,
    title: "Security review scheduled",
    message: "Two-factor authentication review is scheduled for this week.",
    time: "Yesterday, 3:10 PM",
    read: true,
    category: "Security",
  },
  {
    id: "notif-summary-17",
    icon: Bell,
    title: "Daily sales summary ready",
    message: "The latest branch performance snapshot is available.",
    time: "Monday, 6:00 PM",
    read: true,
    category: "Reports",
  },
  {
    id: "notif-shift-22",
    icon: Clock,
    title: "Shift handoff reminder",
    message: "Evening shift handoff notes are pending review.",
    time: "Monday, 4:30 PM",
    read: true,
    category: "Team",
  },
];
