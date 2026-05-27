"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  Eye,
  EyeOff,
  Filter,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import { Button, Card } from "../primitives";
import {
  staffBranchOptions,
  staffRoleFilterOptions,
  staffRoleOptions,
  staffShiftFilterOptions,
  staffShiftOptions,
  type StaffFilters,
  type StaffFormValues,
  type StaffMember,
} from "./data";
import {
  formatArabicDate,
  formatShiftType,
  roleLabelInArabic,
  statusLabelInArabic,
} from "./utils";
import { cn } from "@/lib/utils";

function NativeSelect({
  value,
  onChange,
  options,
  className,
  ariaLabel,
}: {
  value: string;
  onChange?: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  className?: string;
  ariaLabel: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        className={cn(
          "h-9 w-full appearance-none rounded-md border border-border bg-input px-3 pe-9 text-sm text-foreground shadow-sm outline-none transition focus:border-primary/40 focus:ring-1 focus:ring-primary/20",
          !value && "text-muted-foreground",
        )}
      >
        {options.map((option) => (
          <option key={option.value || option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

export function StaffPageHeader() {
  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
      <div>
        <h1 className="text-[2rem] font-semibold leading-none tracking-normal text-foreground">
          Staff
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Manage all users in the system
        </p>
      </div>
      <Link
        href="/users/create"
        className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
      >
        <Plus className="size-4" />
        Create Staff
      </Link>
    </div>
  );
}

export function StaffFiltersBar({
  draft,
  applyDisabled,
  clearDisabled,
  onChange,
  onApply,
  onClear,
}: {
  draft: StaffFilters;
  applyDisabled: boolean;
  clearDisabled: boolean;
  onChange: (next: StaffFilters) => void;
  onApply: () => void;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_160px_184px_auto] lg:items-end">
        <div className="space-y-2">
          <div className="text-sm font-medium">Search</div>
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={draft.search}
              onChange={(event) => onChange({ ...draft, search: event.target.value })}
              placeholder="Search for a user..."
              className="h-9 w-full rounded-md border border-border bg-input pe-3 ps-9 text-sm shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium">Role</div>
          <NativeSelect
            ariaLabel="Role filter"
            value={draft.role}
            onChange={(role) => onChange({ ...draft, role })}
            options={staffRoleFilterOptions}
          />
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium">Shift Type</div>
          <NativeSelect
            ariaLabel="Shift type filter"
            value={draft.shiftType}
            onChange={(shiftType) => onChange({ ...draft, shiftType })}
            options={staffShiftFilterOptions}
          />
        </div>
        <div className="flex gap-2 lg:pb-0.5">
          <Button
            type="button"
            variant="outline"
            className="h-9 w-12 px-0"
            onClick={onClear}
            disabled={clearDisabled}
            aria-label="Clear filters"
          >
            <X className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-9 px-4 text-sm"
            onClick={onApply}
            disabled={applyDisabled}
          >
            Apply Filters
            <Filter className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function StaffActionsMenu({
  open,
  onToggle,
  editHref,
  viewHref,
}: {
  open: boolean;
  onToggle: () => void;
  editHref: string;
  viewHref: string;
}) {
  return (
    <div
      className="relative flex justify-end"
      data-staff-menu
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
        className="inline-flex h-9 min-w-14 items-center justify-center rounded-md border border-border bg-background px-4 text-base font-semibold text-foreground shadow-sm hover:bg-muted/40"
      >
        ...
      </button>
      {open ? (
        <div className="absolute right-0 top-11 z-20 min-w-[180px] rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg">
          <div className="px-3 py-2 text-sm font-semibold">User Data</div>
          <div className="border-t" />
          <Link
            href={editHref}
            className="flex h-10 items-center justify-between rounded-md px-3 text-sm hover:bg-muted/50"
          >
            <span>Edit</span>
            <Pencil className="size-3.5" />
          </Link>
          <div className="border-t" />
          <Link
            href={viewHref}
            className="flex h-10 items-center justify-between rounded-md px-3 text-sm hover:bg-muted/50"
          >
            <span>عرض</span>
            <UserRound className="size-3.5" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export function StaffTableCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="mt-6">{children}</div>;
}

export function StaffTable({
  members,
  openMenuId,
  onToggleMenu,
  onRowClick,
}: {
  members: StaffMember[];
  openMenuId: string | null;
  onToggleMenu: (id: string) => void;
  onRowClick: (id: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-border bg-card">
      <table className="w-full table-auto text-sm">
        <thead>
          <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
            {[
              "#",
              "",
              "Name",
              "Username",
              "Age",
              "Address",
              "Phone Number",
              "Number of Tables",
              "Shift",
              "Role",
              "Actions",
            ].map((label, index) => (
              <th
                key={`${label}-${index}`}
                className={cn(
                  "h-10 px-3 text-left font-medium",
                  index === 0 && "w-14",
                  index === 1 && "w-10",
                  index === 2 && "w-[136px]",
                  index === 10 && "w-[88px]",
                )}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {members.map((member, index) => (
            <tr
              key={member.id}
              onClick={() => onRowClick(member.id)}
              className="cursor-pointer border-b border-border bg-card hover:bg-muted/35"
            >
              <td className="px-3 py-3 align-middle">{index + 1}</td>
              <td className="px-3 py-3 align-middle">
                <span className="block h-8 w-8 rounded-full bg-transparent" />
              </td>
              <td className="px-3 py-3 align-middle font-medium">
                <span className="block max-w-[120px] break-words">{member.name}</span>
              </td>
              <td className="px-3 py-3 align-middle">{member.username}</td>
              <td className="px-3 py-3 align-middle">{member.age ? member.age : ""}</td>
              <td className="px-3 py-3 align-middle">{member.address ?? ""}</td>
              <td className="px-3 py-3 align-middle">{member.phone}</td>
              <td className="px-3 py-3 align-middle">{member.tablesCount}</td>
              <td className="px-3 py-3 align-middle">{formatShiftType(member.shiftType)}</td>
              <td className="px-3 py-3 align-middle">{member.role}</td>
              <td className="px-3 py-3 align-middle">
                <StaffActionsMenu
                  open={openMenuId === member.id}
                  onToggle={() => onToggleMenu(member.id)}
                  editHref={`/users/edit/${member.id}?returnTo=%2Fusers%3F`}
                  viewHref={`/users/${member.id}`}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StaffEmptyState() {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <UserRound className="size-8 text-muted-foreground" />
      <div className="space-y-1">
        <p className="text-base font-semibold">No staff found</p>
        <p className="text-sm text-muted-foreground">
          Adjust the filters or create a new staff member.
        </p>
      </div>
      <Link
        href="/users/create"
        className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
      >
        <Plus className="size-4" />
        Create Staff
      </Link>
    </div>
  );
}

export function StaffLoadingState() {
  return (
    <div className="space-y-4 p-5">
      <div className="h-9 w-full animate-pulse rounded-md bg-muted/50" />
      <div className="h-[260px] animate-pulse rounded-lg border bg-muted/20" />
    </div>
  );
}

export function StaffErrorState({
  onReset,
}: {
  onReset: () => void;
}) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <div className="space-y-1">
        <p className="text-base font-semibold">Unable to load staff</p>
        <p className="text-sm text-muted-foreground">
          The local data store could not be read. Reset the page data to continue.
        </p>
      </div>
      <Button type="button" onClick={onReset}>
        Reset Data
      </Button>
    </div>
  );
}

export function StaffPagination({
  count,
}: {
  count: number;
}) {
  return (
    <div className="mt-4 flex flex-col justify-between gap-3 px-0 py-0 text-xs text-muted-foreground md:flex-row md:items-center">
      <div className="flex flex-wrap items-center gap-3">
        <span>{`Showing ${count > 0 ? "1" : "0"}–${count} Of ${count} Results`}</span>
        <div className="flex items-center gap-2">
          <span>Items per page:</span>
          <NativeSelect
            ariaLabel="Items per page"
            value="50"
            options={[{ label: "50", value: "50" }]}
            className="w-[86px]"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled
          className="inline-flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground opacity-50"
          aria-label="Previous page"
        >
          <ArrowLeft className="size-4 rotate-180" />
        </button>
        <span>{`${count > 0 ? "1" : "0"} / 1`}</span>
        <button
          type="button"
          disabled
          className="inline-flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground opacity-50"
          aria-label="Next page"
        >
          <ArrowLeft className="size-4" />
        </button>
      </div>
    </div>
  );
}

export function StaffActionBar({
  primaryLabel,
  primaryAction,
  backHref,
}: {
  primaryLabel: string;
  primaryAction: () => void;
  backHref: string;
}) {
  return (
    <Card className="flex min-h-[58px] items-center justify-between border-border bg-card px-4 py-3">
      <button
        type="button"
        onClick={primaryAction}
        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
      >
        {primaryLabel}
      </button>
      <Link
        href={backHref}
        className="inline-flex size-10 items-center justify-center rounded-xl border border-border bg-background text-foreground hover:bg-muted/40"
        aria-label="Go back"
      >
        <ArrowLeft className="size-4" />
      </Link>
    </Card>
  );
}

export function StaffFormLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_166px]">
      {children}
    </div>
  );
}

export function StaffPanel({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={cn("overflow-hidden border-border bg-card", className)}>
      <div className="border-b border-border px-4 py-3 text-[15px] font-semibold">
        {title}
      </div>
      <div className="p-4">{children}</div>
    </Card>
  );
}

export function StaffInputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  showPasswordToggle = false,
  passwordVisible = false,
  onTogglePassword,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: "text" | "email" | "tel" | "number" | "password";
  showPasswordToggle?: boolean;
  passwordVisible?: boolean;
  onTogglePassword?: () => void;
}) {
  const resolvedType =
    type === "password" && passwordVisible ? "text" : type === "number" ? "text" : type;

  return (
    <label className="flex flex-col gap-2 text-sm font-medium">
      <span>{label}</span>
      <div className="relative">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          inputMode={type === "number" ? "numeric" : undefined}
          type={resolvedType}
          className={cn(
            "h-9 w-full rounded-md border border-border bg-input px-3 text-sm shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/40 focus:ring-1 focus:ring-primary/20",
            showPasswordToggle && "pr-9",
          )}
        />
        {showPasswordToggle ? (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-label={passwordVisible ? "Hide password" : "Show password"}
          >
            {passwordVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        ) : null}
      </div>
    </label>
  );
}

export function StaffFormFields({
  mode,
  values,
  onChange,
}: {
  mode: "create" | "edit";
  values: StaffFormValues;
  onChange: (field: keyof StaffFormValues, value: string) => void;
}) {
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <>
      <div className="space-y-4">
        <StaffPanel title="Basic Information">
          <div className="grid gap-4 md:grid-cols-2">
            <StaffInputField
              label="Name"
              value={values.name}
              onChange={(value) => onChange("name", value)}
              placeholder="e.g., Ahmed Mohamed"
            />
            <StaffInputField
              label="Username"
              value={values.username}
              onChange={(value) => onChange("username", value)}
              placeholder="e.g., ahmed123"
            />
            <StaffInputField
              label="Email"
              type="email"
              value={values.email}
              onChange={(value) => onChange("email", value)}
              placeholder="e.g., ahmed@example.com"
            />
            <StaffInputField
              label="Phone Number"
              type="tel"
              value={values.phone}
              onChange={(value) => onChange("phone", value)}
              placeholder="e.g., 01012345678"
            />
            <div className="md:col-span-1">
              <StaffInputField
                label="Password"
                type="password"
                value={values.password}
                onChange={(value) => onChange("password", value)}
                placeholder="Add your password"
                showPasswordToggle
                passwordVisible={passwordVisible}
                onTogglePassword={() => setPasswordVisible((current) => !current)}
              />
            </div>
          </div>
        </StaffPanel>

        <StaffPanel title="Additional Details">
          <div className="grid gap-4 md:grid-cols-2">
            <StaffInputField
              label="Age"
              type="number"
              value={values.age}
              onChange={(value) => onChange("age", value)}
              placeholder="18"
            />
            <StaffInputField
              label="Address"
              value={values.address}
              onChange={(value) => onChange("address", value)}
              placeholder="Enter your personal address"
            />
          </div>
        </StaffPanel>
      </div>

      <StaffPanel title="Role & Shift" className="h-fit">
        <div className="space-y-4">
          <label className="flex flex-col gap-2 text-sm font-medium">
            <span>Role</span>
            <NativeSelect
              ariaLabel="Role"
              value={values.role}
              onChange={(value) => onChange("role", value)}
              options={staffRoleOptions}
            />
          </label>
          {mode === "create" ? (
            <label className="flex flex-col gap-2 text-sm font-medium">
              <span>Branch</span>
              <NativeSelect
                ariaLabel="Branch"
                value={values.branch}
                onChange={(value) => onChange("branch", value)}
                options={staffBranchOptions}
              />
            </label>
          ) : null}
          <label className="flex flex-col gap-2 text-sm font-medium">
            <span>Shift Type</span>
            <NativeSelect
              ariaLabel="Shift Type"
              value={values.shiftType}
              onChange={(value) => onChange("shiftType", value)}
              options={staffShiftOptions}
            />
          </label>
        </div>
      </StaffPanel>
    </>
  );
}

export function StaffDetailHeader({
  editHref,
  onDelete,
}: {
  editHref: string;
  onDelete: () => void;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-start">
      <div className="order-2 flex flex-wrap gap-2 xl:order-1">
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-destructive px-4 text-sm font-medium text-white shadow-sm hover:bg-destructive/90"
        >
          حذف
          <Trash2 className="size-4" />
        </button>
        <Link
          href={editHref}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
        >
          تعديل
          <Pencil className="size-4" />
        </Link>
        <Link
          href="/users"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground hover:bg-muted/40"
        >
          رجوع
          <ArrowLeft className="size-4" />
        </Link>
      </div>
      <div className="order-1 text-right xl:order-2" dir="rtl">
        <div className="inline-flex items-start gap-3">
          <div>
            <h1 className="text-[3rem] font-semibold leading-[0.95] tracking-normal">
              تفاصيل
              <br />
              المستخدم
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              عرض وإدارة معلومات المستخدم
            </p>
          </div>
          <UserRound className="mt-1 size-6 text-foreground" />
        </div>
      </div>
    </div>
  );
}

function DetailValueBadge({
  value,
  tone = "primary",
}: {
  value: string;
  tone?: "primary" | "neutral";
}) {
  return (
    <span
      className={cn(
        "inline-flex min-w-[52px] items-center justify-center rounded-md px-2 py-1 text-xs font-semibold",
        tone === "primary"
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-foreground",
      )}
    >
      {value}
    </span>
  );
}

export function StaffDetailCards({
  member,
}: {
  member: StaffMember;
}) {
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <StaffPanel title="الادوار والصلاحيات" className="min-h-[320px]">
        <div className="space-y-8 text-center" dir="rtl">
          <div>
            <div className="text-sm text-muted-foreground">دور المستخدم والصلاحيات الممنوحة</div>
          </div>
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">الدور</div>
              <DetailValueBadge value={roleLabelInArabic(member.role)} />
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">الصلاحيات</div>
              <DetailValueBadge value={member.permissions[0] ?? "read"} tone="neutral" />
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">الحالة</div>
              <DetailValueBadge value={statusLabelInArabic(member.status)} />
            </div>
          </div>
        </div>
      </StaffPanel>

      <StaffPanel title="المعلومات الشخصية" className="min-h-[320px]">
        <div className="space-y-5 text-right" dir="rtl">
          <div className="text-sm text-muted-foreground">البيانات الأساسية للمستخدم</div>
          <div className="space-y-5 text-[15px]">
            <div>
              <div className="text-sm text-muted-foreground">الاسم</div>
              <div className="mt-1 text-[1.05rem] font-semibold">{member.name}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">اسم المستخدم</div>
              <div className="mt-1 text-[1.05rem] font-semibold">{member.username}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">البريد الإلكتروني</div>
              <div className="mt-1 text-[1.05rem] font-semibold break-all">{member.email}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">رقم الهاتف</div>
              <div className="mt-1 text-[1.05rem] font-semibold">{member.phone.replace("+", "")}+</div>
            </div>
          </div>
        </div>
      </StaffPanel>

      <StaffPanel title="التخصص والحالة" className="min-h-[260px] lg:col-start-2">
        <div className="space-y-5 text-right" dir="rtl">
          <div className="text-sm text-muted-foreground">الفرع والقسم والجداول المخصصة</div>
          <div className="space-y-5 text-[15px]">
            <div>
              <div className="text-sm text-muted-foreground">تم الإنشاء بواسطة</div>
              <div className="mt-1 text-[1.05rem] font-semibold break-all">{member.createdBy}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">تاريخ الإنشاء</div>
              <div className="mt-1 text-[1.05rem] font-semibold">{formatArabicDate(member.createdAt)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">آخر تحديث</div>
              <div className="mt-1 text-[1.05rem] font-semibold">{formatArabicDate(member.updatedAt)}</div>
            </div>
          </div>
        </div>
      </StaffPanel>
    </div>
  );
}
