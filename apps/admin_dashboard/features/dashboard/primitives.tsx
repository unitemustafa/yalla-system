"use client";

import type { ComponentPropsWithoutRef, MouseEvent } from "react";
import { useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

export function Button({
  children,
  variant = "default",
  size = "default",
  className,
  ...props
}: ComponentPropsWithoutRef<"button"> & {
  variant?: "default" | "outline" | "ghost" | "secondary" | "danger";
  size?: "default" | "sm" | "icon";
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        variant === "default" &&
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        variant === "outline" &&
          "border border-border bg-background text-muted-foreground shadow-sm hover:bg-accent hover:text-accent-foreground",
        variant === "ghost" && "hover:bg-accent hover:text-accent-foreground",
        variant === "secondary" &&
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        variant === "danger" &&
          "bg-destructive text-white shadow-sm hover:bg-destructive/90",
        size === "default" && "h-9 px-4 py-2",
        size === "sm" && "h-8 px-3 text-xs",
        size === "icon" && "size-9",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[12px] border bg-card text-card-foreground shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  icon,
  className,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-16 items-center justify-center rounded-t-lg px-6 py-4 text-center",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-0.5">
        <div className="flex items-center gap-2 text-sm font-semibold leading-none tracking-normal">
          {icon}
          {title}
        </div>
        {description ? (
          <div className="text-xs leading-4 text-muted-foreground">
            {description}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "blue" | "green" | "red" | "secondary";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold",
        tone === "default" && "border-border text-foreground",
        tone === "blue" &&
          "border-blue-300 bg-blue-100 text-blue-800 dark:border-blue-400/30 dark:bg-blue-500/15 dark:text-blue-200",
        tone === "green" &&
          "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/15 dark:text-emerald-200",
        tone === "red" &&
          "border-red-300 bg-red-100 text-red-800 dark:border-red-400/30 dark:bg-red-500/15 dark:text-red-200",
        tone === "secondary" &&
          "border-transparent bg-secondary text-secondary-foreground",
      )}
    >
      {children}
    </span>
  );
}

export function Input({
  className,
  ...props
}: ComponentPropsWithoutRef<"input">) {
  return (
    <input
      className={cn(
        "flex h-9 w-full rounded-md border border-border bg-input px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export function SelectBox({
  children,
  className,
  disabled,
}: {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      className={cn(
        "flex h-9 w-full items-center justify-between gap-4 rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground shadow-sm disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      <span className="truncate">{children}</span>
      <ChevronDown className="size-4 opacity-50" />
    </button>
  );
}

export function Switch({
  checked = true,
  disabled,
  onCheckedChange,
  className,
  ...props
}: Omit<ComponentPropsWithoutRef<"button">, "onChange"> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}) {
  const controlled = onCheckedChange !== undefined;
  const [uncontrolledChecked, setUncontrolledChecked] = useState(checked);
  const isChecked = controlled ? checked : uncontrolledChecked;

  function toggleSwitch(event: MouseEvent<HTMLButtonElement>) {
    props.onClick?.(event);

    if (event.defaultPrevented || disabled) {
      return;
    }

    event.stopPropagation();

    const nextChecked = !isChecked;
    if (!controlled) {
      setUncontrolledChecked(nextChecked);
    }
    onCheckedChange?.(nextChecked);
  }

  return (
    <button
      type="button"
      aria-checked={isChecked}
      disabled={disabled}
      role="switch"
      className={cn(
        "inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isChecked ? "bg-primary" : "bg-muted-foreground/30",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
      {...props}
      onClick={toggleSwitch}
    >
      <span
        className={cn(
          "pointer-events-none block size-4 rounded-full bg-background shadow transition-transform",
          isChecked && "-translate-x-4",
        )}
      />
    </button>
  );
}

export function PageTitle({
  title,
  description,
  actions,
  size = "large",
  className,
}: {
  title: string;
  description: string;
  actions?: React.ReactNode;
  size?: "large" | "compact";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between gap-4 md:flex-row",
        size === "compact"
          ? "min-h-14 md:items-center"
          : "min-h-[57px] md:items-start",
        className,
      )}
    >
      <div>
        <h1
          className={cn(
            "tracking-normal",
            size === "large"
              ? "text-3xl font-bold leading-9"
              : "text-2xl font-semibold leading-8",
          )}
        >
          {title}
        </h1>
        <p
          className={cn(
            "text-sm leading-5 text-muted-foreground",
            size === "compact" && "mt-1",
          )}
        >
          {description}
        </p>
      </div>
      {actions ? (
        <div
          className={cn(
            "flex shrink-0",
            size === "compact"
              ? "items-center gap-2"
              : "flex-col items-start gap-3 sm:flex-row sm:items-center",
          )}
        >
          {actions}
        </div>
      ) : null}
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-3 text-sm font-medium leading-none">
      {label}
      {children}
    </label>
  );
}

export function FormCard({
  title,
  children,
  right,
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="w-full rounded-lg border">
      <div className="flex min-h-[49px] items-center justify-between rounded-t-lg border-b bg-card px-4 py-3">
        <div className="text-sm font-bold">{title}</div>
        {right}
      </div>
      <div className="flex flex-col gap-4 rounded-b-lg bg-card p-4">
        {children}
      </div>
    </div>
  );
}

export function FilterBar({
  fields,
  disabled = false,
  showReset = true,
  className,
}: {
    fields: Array<{
      label: string;
      type?: "search" | "select";
      value?: string;
      options?: string[];
      placeholder?: string;
      disabled?: boolean;
      width?: string;
  }>;
  disabled?: boolean;
  showReset?: boolean;
  className?: string;
}) {
    return (
      <div
        className={cn(
          "flex flex-col justify-between gap-4 border-b p-0 md:flex-row md:items-end",
          className,
        )}
      >
        <div className="flex flex-1 flex-col gap-2 md:flex-row">
          {fields.map((field, index) => (
            <div
              key={field.label}
            className={cn(
              "flex flex-col gap-2",
              field.width ?? "md:w-44",
              index === 1 && "md:ms-2",
            )}
          >
            <div className="text-sm leading-5">{field.label}</div>
              {field.type === "search" ? (
                <div className="relative">
                  <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="h-10 ps-9"
                    placeholder={field.placeholder ?? "بحث..."}
                  />
              </div>
              ) : field.options?.length ? (
                <select
                  defaultValue={field.value ?? field.options[0]}
                  disabled={field.disabled}
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-muted-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <SelectBox className="h-10" disabled={field.disabled}>
                  {field.value ?? "الكل"}
                </SelectBox>
              )}
            </div>
          ))}
        </div>
        <div className="flex shrink-0 gap-2 md:order-last md:pb-0">
          {showReset ? (
            <Button
              variant="outline"
              className="h-10 w-10 px-0"
              disabled={disabled}
              aria-label="إعادة ضبط الفلاتر"
            >
              <X className="size-4" />
            </Button>
          ) : null}
          <Button variant="outline" className="h-10 px-4" disabled={disabled}>
            تطبيق الفلاتر
            <Filter className="size-4" />
          </Button>
      </div>
    </div>
  );
}

export function DataTable({
  headers,
  rows,
  rowHeight = "normal",
  minWidth = 980,
  onRowClick,
  columnWidths,
}: {
  headers: React.ReactNode[];
  rows: React.ReactNode[][];
  rowHeight?: "compact" | "normal" | "tall";
  minWidth?: number;
  onRowClick?: () => void;
  columnWidths?: number[];
}) {
  const rowClass =
    rowHeight === "compact"
      ? "h-[47px]"
      : rowHeight === "tall"
        ? "h-[57px]"
        : "h-[53px]";

  return (
    <div className="overflow-x-auto">
      <table
        className="w-full caption-bottom text-sm"
        style={{ minWidth, tableLayout: columnWidths ? "fixed" : undefined }}
      >
        {columnWidths ? (
          <colgroup>
            {columnWidths.map((width, index) => (
              <col key={index} style={{ width }} />
            ))}
          </colgroup>
        ) : null}
        <thead>
          <tr className="h-10 border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
            {headers.map((header, index) => (
              <th
                key={index}
                className="h-10 px-2 text-start align-middle text-xs font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={onRowClick}
              className={cn(
                rowClass,
                "border-b transition-colors hover:bg-muted/40",
                onRowClick && "cursor-pointer",
              )}
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className={cn(
                    "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
                    cellIndex === 0 && "p-0",
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Pagination({
  text,
  pages,
  perPage = "20",
  showPerPage = true,
  nextDisabled = false,
}: {
  text: string;
  pages: string;
  perPage?: string;
  showPerPage?: boolean;
  nextDisabled?: boolean;
}) {
  return (
    <div className="flex min-h-[53px] flex-col gap-3 px-0 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:py-0">
      <div className="flex flex-wrap items-center gap-3">
        <span>{text}</span>
        {showPerPage ? (
          <div className="flex items-center gap-1">
            <span>عدد العناصر في الصفحة:</span>
            <SelectBox className="h-9 w-[73px]">{perPage}</SelectBox>
          </div>
        ) : null}
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="icon" className="size-7" disabled>
          <ChevronRight className="size-4" />
        </Button>
        <span>{pages}</span>
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          disabled={nextDisabled}
        >
          <ChevronLeft className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("text-start", strong && "text-lg font-semibold")}>
        {value}
      </span>
    </div>
  );
}

export function SideInfo({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <div className="rounded-t-xl border-b bg-muted/30 px-6 py-4 font-semibold">
        {title}
      </div>
      <div className="flex flex-col gap-4 p-6 text-sm">{children}</div>
    </Card>
  );
}
