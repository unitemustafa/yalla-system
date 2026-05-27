import type { StaffRole, StaffStatus } from "./data";

export function formatShiftType(shiftType: string) {
  return shiftType || "Not specified";
}

export function formatArabicDate(date: string) {
  return new Intl.DateTimeFormat("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function roleLabelInArabic(role: StaffRole) {
  if (role === "Admin") {
    return "مسؤول";
  }

  return "نادل";
}

export function statusLabelInArabic(status: StaffStatus) {
  if (status === "active") {
    return "نشط";
  }
  if (status === "pending") {
    return "قيد المراجعة";
  }

  return "غير نشط";
}

export function filtersChanged(
  current: { search: string; role: string; shiftType: string },
  next: { search: string; role: string; shiftType: string },
) {
  return (
    current.search !== next.search ||
    current.role !== next.role ||
    current.shiftType !== next.shiftType
  );
}

export function buildReturnToUsersHref() {
  return "/users?returnTo=%2Fusers%3F";
}
