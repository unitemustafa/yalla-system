"use client";

import Link from "next/link";
import type { ComponentPropsWithoutRef, MouseEvent } from "react";
import { useState } from "react";
import { Select } from "radix-ui";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  MoreHorizontal,
  Search,
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

export function HoverTooltip({
  children,
  content,
  className,
  tooltipClassName,
}: {
  children: React.ReactNode;
  content?: React.ReactNode;
  className?: string;
  tooltipClassName?: string;
}) {
  if (!content) {
    return className ? <div className={className}>{children}</div> : <>{children}</>;
  }

  return (
    <div
      className={cn("group/tooltip relative", className)}
      tabIndex={0}
    >
      {children}
      <div
        role="tooltip"
        className={cn(
          "pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 min-w-[9rem] -translate-x-1/2 translate-y-1 rounded-lg border border-border/50 bg-background px-3 py-2 text-center text-xs text-foreground opacity-0 shadow-xl transition duration-150 group-hover/tooltip:translate-y-0 group-hover/tooltip:opacity-100 group-focus-visible/tooltip:translate-y-0 group-focus-visible/tooltip:opacity-100",
          tooltipClassName,
        )}
      >
        {content}
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

type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export function AppSelect({
  value,
  defaultValue,
  onValueChange,
  options,
  placeholder = "اختر",
  ariaLabel,
  icon,
  className,
  contentClassName,
  disabled,
}: {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  ariaLabel?: string;
  icon?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
}) {
  return (
    <Select.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <Select.Trigger
        aria-label={ariaLabel}
        className={cn(
          "group inline-flex h-9 w-full min-w-0 items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground shadow-sm outline-none transition hover:border-primary/40 hover:bg-accent/70 hover:text-accent-foreground focus:border-primary focus:ring-2 focus:ring-primary/15 data-[state=open]:border-primary data-[state=open]:bg-accent data-[state=open]:text-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          {icon ? (
            <span className="shrink-0 text-muted-foreground transition-colors group-data-[state=open]:text-primary">
              {icon}
            </span>
          ) : null}
          <Select.Value className="truncate text-start" placeholder={placeholder} />
        </span>
        <Select.Icon asChild>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          align="start"
          position="popper"
          sideOffset={8}
          className={cn(
            "z-50 max-h-[300px] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-border/80 bg-popover p-1 text-popover-foreground shadow-2xl shadow-black/20 outline-none",
            contentClassName,
          )}
        >
          <Select.ScrollUpButton className="flex h-7 items-center justify-center text-muted-foreground">
            <ChevronUp className="size-4" />
          </Select.ScrollUpButton>
          <Select.Viewport>
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="relative flex h-10 cursor-default select-none items-center rounded-md py-2 pe-9 ps-3 text-sm font-medium outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[state=checked]:bg-primary/10 data-[state=checked]:text-primary"
              >
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator className="absolute end-3 inline-flex size-4 items-center justify-center">
                  <Check className="size-4" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton className="flex h-7 items-center justify-center text-muted-foreground">
            <ChevronDown className="size-4" />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
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
      type="button"
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

type ActionMenuItem = {
  label: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  tone?: "default" | "danger";
};

export function ActionMenu({
  open,
  onToggle,
  label,
  title,
  items,
  align = "end",
  triggerClassName,
  menuClassName,
}: {
  open: boolean;
  onToggle: () => void;
  label: string;
  title?: React.ReactNode;
  items: ActionMenuItem[];
  align?: "start" | "end" | "center";
  triggerClassName?: string;
  menuClassName?: string;
}) {
  return (
    <div className="relative flex justify-end" onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
        className={cn(
          "inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background/90 px-2 text-muted-foreground shadow-sm shadow-black/5 backdrop-blur transition-all hover:border-primary/25 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 dark:bg-card/90",
          open && "border-primary/40 bg-primary/10 text-primary shadow-primary/10",
          triggerClassName,
        )}
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <MoreHorizontal className="size-4" />
      </button>
      {open ? (
        <div
          role="menu"
          className={cn(
            "absolute top-11 z-30 w-48 overflow-hidden rounded-xl border border-border/70 bg-popover/95 p-1.5 text-popover-foreground shadow-2xl shadow-black/20 backdrop-blur-md animate-in fade-in-0 zoom-in-95 dark:shadow-black/40",
            align === "end" && "end-0",
            align === "start" && "start-0",
            align === "center" && "left-1/2 -translate-x-1/2",
            menuClassName,
          )}
        >
          {title ? (
            <div className="mb-1 rounded-lg bg-muted/50 px-3 py-2 text-xs font-semibold text-muted-foreground">
              {title}
            </div>
          ) : null}
          {items.map((item, index) => {
            const Icon = item.icon;
            const itemClassName = cn(
              "group flex h-10 w-full items-center justify-between gap-3 rounded-lg px-2.5 text-sm font-semibold transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:outline-none",
              item.tone === "danger" &&
                "text-destructive hover:bg-destructive/10 hover:text-destructive focus-visible:bg-destructive/10",
            );
            const content = (
              <>
                <span className="truncate">{item.label}</span>
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:bg-background/80 group-hover:text-foreground",
                    item.tone === "danger" &&
                      "bg-destructive/10 text-destructive group-hover:bg-destructive/20 group-hover:text-destructive",
                  )}
                >
                  <Icon className="size-3.5" />
                </span>
              </>
            );

            return (
              <div key={index}>
                {item.href ? (
                  <Link
                    href={item.href}
                    role="menuitem"
                    className={itemClassName}
                    onClick={(event) => event.stopPropagation()}
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={(event) => {
                      event.stopPropagation();
                      item.onClick?.(event);
                    }}
                    className={itemClassName}
                  >
                    {content}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
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
                <AppSelect
                  defaultValue={field.value ?? field.options[0]}
                  disabled={field.disabled}
                  options={field.options.map((option) => ({
                    value: option,
                    label: option,
                  }))}
                  className="h-10"
                  ariaLabel={field.label}
                />
              ) : (
                <SelectBox className="h-10" disabled={field.disabled}>
                  {field.value ?? "الكل"}
                </SelectBox>
              )}
            </div>
          ))}
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
  getRowProps,
}: {
  headers: React.ReactNode[];
  rows: React.ReactNode[][];
  rowHeight?: "compact" | "normal" | "tall";
  minWidth?: number;
  onRowClick?: () => void;
  columnWidths?: number[];
  getRowProps?: (
    rowIndex: number,
  ) => ComponentPropsWithoutRef<"tr"> | undefined;
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
          {rows.map((row, rowIndex) => {
            const rowProps = getRowProps?.(rowIndex);

            return (
              <tr
                key={rowIndex}
                {...rowProps}
                onClick={rowProps?.onClick ?? onRowClick}
                className={cn(
                  rowClass,
                  "border-b transition-colors hover:bg-muted/40",
                  onRowClick && "cursor-pointer",
                  rowProps?.className,
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function Pagination({
  text,
  pages,
  previousDisabled = true,
  nextDisabled = false,
  onPrevious,
  onNext,
}: {
  text: string;
  pages: string;
  perPage?: string;
  showPerPage?: boolean;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
}) {
  return (
    <div className="flex min-h-[53px] flex-col gap-3 px-0 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:py-0">
      <div className="flex flex-wrap items-center gap-3">
        <span>{text}</span>
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          disabled={previousDisabled}
          onClick={onPrevious}
        >
          <ChevronRight className="size-4" />
        </Button>
        <span>{pages}</span>
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          disabled={nextDisabled}
          onClick={onNext}
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
