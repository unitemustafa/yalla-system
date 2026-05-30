"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useState } from "react";
import {
  ArrowUpDown,
  Banknote,
  Calendar,
  CheckCircle2,
  Edit,
  ImageIcon,
  MoreHorizontal,
  Package,
  PauseCircle,
  Percent,
  PlayCircle,
  Plus,
  Search,
  ShoppingCart,
  Tag,
  Trash2,
  Truck,
  UserRound,
  X,
  XCircle,
  Zap,
} from "lucide-react";

import { categoryRows, itemRows, type ItemRow } from "../data";
import { DashboardImage } from "../dashboard-image";
import {
  Button,
  Card,
  Field,
  FilterBar,
  FormCard,
  Input,
  PageTitle,
  Pagination,
  SelectBox,
  Switch,
} from "../primitives";
import { cn } from "@/lib/utils";
import { useSnackbar } from "../snackbar";

const currency = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatReferenceCurrency(value: number) {
  return `${currency.format(value)} EGP`;
}

function Textarea({
  placeholder,
  minHeight = "min-h-[84px]",
  dir,
}: {
  placeholder: string;
  minHeight?: string;
  dir?: "rtl" | "ltr";
}) {
  return (
    <textarea
      dir={dir}
      placeholder={placeholder}
      className={cn(
        "w-full rounded-md border border-border bg-input px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        minHeight,
      )}
    />
  );
}

function RefBadge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "green" | "yellow" | "blue" | "red" | "purple" | "orange" | "gray";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold leading-none",
        tone === "green" &&
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200",
        tone === "yellow" &&
          "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200",
        tone === "blue" &&
          "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200",
        tone === "red" &&
          "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-200",
        tone === "purple" && "bg-purple-100 text-purple-700",
        tone === "orange" &&
          "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-200",
        tone === "gray" && "bg-muted text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

function MetricCards({
  cards,
}: {
  cards: Array<[string, string, React.ComponentType<{ className?: string }>, string]>;
}) {
  return (
    <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {cards.map(([label, value, Icon, tone]) => (
        <Card key={label} className="h-[75px] rounded-[12px]">
          <div className="flex h-full items-center gap-3 px-6">
            <div className={cn("rounded-full bg-muted/50 p-3", tone)}>
              <Icon className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-xl font-semibold leading-tight">{value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

type DateRangeKey = "today" | "yesterday" | "week" | "month" | "custom";

type DateRange = {
  start: Date;
  end: Date;
};

type DateRangeOption = {
  key: DateRangeKey;
  label: string;
  sublabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
};

const arabicMonthNames = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

const arabicMonthIndexes = new Map(
  arabicMonthNames.map((month, index) => [month, index]),
);

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const nextDate = startOfDay(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function parseInputDate(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return null;
  }

  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

function formatShortArabicDate(date: Date) {
  return `${date.getDate()} ${arabicMonthNames[date.getMonth()]}`;
}

function dateRangeLabel(range: DateRange) {
  const start = formatShortArabicDate(range.start);
  const end = formatShortArabicDate(range.end);

  return start === end ? start : `${start} - ${end}`;
}

function parseOrderDate(order: DashboardOrder, fallbackYear: number) {
  const numberDateMatch = order.number.match(/ORD-(\d{4})(\d{2})(\d{2})/);

  if (numberDateMatch) {
    const [, year, month, day] = numberDateMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const dateText = order.date.replace("،", " ");
  const dayMatch = dateText.match(/\d+/);
  const monthEntry = [...arabicMonthIndexes.entries()].find(([month]) =>
    dateText.includes(month),
  );

  if (!dayMatch || !monthEntry) {
    return null;
  }

  return new Date(fallbackYear, monthEntry[1], Number(dayMatch[0]));
}

function latestOrderDate(orders: DashboardOrder[]) {
  const fallback = startOfDay(new Date());
  const dates = orders
    .map((order) => parseOrderDate(order, fallback.getFullYear()))
    .filter((date): date is Date => Boolean(date));

  if (!dates.length) {
    return fallback;
  }

  return dates.reduce((latest, date) => (date > latest ? date : latest), dates[0]);
}

function rangeForDateKey(
  key: DateRangeKey,
  anchorDate: Date,
  customRange: { start: string; end: string },
) {
  const anchor = startOfDay(anchorDate);

  if (key === "yesterday") {
    const yesterday = addDays(anchor, -1);
    return { start: yesterday, end: yesterday };
  }

  if (key === "week") {
    return { start: addDays(anchor, -6), end: anchor };
  }

  if (key === "month") {
    return {
      start: new Date(anchor.getFullYear(), anchor.getMonth(), 1),
      end: anchor,
    };
  }

  if (key === "custom") {
    const start = parseInputDate(customRange.start) ?? anchor;
    const end = parseInputDate(customRange.end) ?? start;

    return start <= end ? { start, end } : { start: end, end: start };
  }

  return { start: anchor, end: anchor };
}

function dateRangeOptions(anchorDate: Date, customRange: { start: string; end: string }) {
  const weekRange = rangeForDateKey("week", anchorDate, customRange);
  const monthRange = rangeForDateKey("month", anchorDate, customRange);

  return [
    { key: "today", label: "النهارده" },
    { key: "yesterday", label: "امبارح" },
    { key: "week", label: "الأسبوع ده", sublabel: dateRangeLabel(weekRange) },
    { key: "month", label: "الشهر ده", sublabel: dateRangeLabel(monthRange) },
    { key: "custom", label: "مخصص", icon: Calendar },
  ] satisfies DateRangeOption[];
}

function DateSegmentedControl({
  activeDate,
  anchorDate,
  customRange,
}: {
  activeDate: DateRangeKey;
  anchorDate: Date;
  customRange: { start: string; end: string };
}) {
  return (
    <div className="hidden items-center gap-1 xl:flex">
      {dateRangeOptions(anchorDate, customRange).map(({ key, label, sublabel, icon: Icon }) => (
        <button
          key={key}
          type="button"
          disabled
          aria-pressed={activeDate === key}
          className={cn(
            "flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-muted/30 px-4 text-sm text-muted-foreground opacity-75 shadow-sm disabled:cursor-not-allowed",
            sublabel && "flex-col gap-0 px-5 text-xs leading-none",
          )}
        >
          <span className="inline-flex items-center gap-2">
            {Icon ? <Icon className="size-4" /> : null}
            {label}
          </span>
          {sublabel ? (
            <span className="text-[10px] opacity-70">{sublabel}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

function MiniIconButton({
  children,
  tone = "default",
  ariaLabel,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  tone?: "default" | "green" | "orange" | "red";
  ariaLabel?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      title={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md hover:bg-accent disabled:pointer-events-none disabled:opacity-35",
        tone === "green" && "text-green-600",
        tone === "orange" && "text-orange-500",
        tone === "red" && "text-red-500",
        tone === "default" && "text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}

function EmptyStateTable({
  headers,
  minWidth = 980,
}: {
  headers: React.ReactNode[];
  minWidth?: number;
}) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm" style={{ minWidth }}>
        <thead>
          <tr className="h-10 border-b bg-muted/40">
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-3 text-start text-xs font-medium text-muted-foreground"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={headers.length} className="h-24 text-center font-medium">
              مفيش بيانات
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

type DashboardOrder = {
  index: string;
  number: string;
  customer: string;
  phone: string;
  type: string;
  status: string;
  total: number;
  date: string;
  time: string;
  payment: string;
};

type OrderDraft = {
  customer: string;
  phone: string;
  type: string;
  status: string;
  total: string;
  date: string;
  time: string;
  payment: string;
};

type OrderFilters = {
  search: string;
  status: string;
  type: string;
  payment: string;
};

const defaultOrderFilters: OrderFilters = {
  search: "",
  status: "all",
  type: "all",
  payment: "all",
};

const emptyOrderDraft: OrderDraft = {
  customer: "",
  phone: "",
  type: "",
  status: "",
  total: "",
  date: "",
  time: "",
  payment: "",
};

function draftFromOrder(order: DashboardOrder): OrderDraft {
  return {
    customer: order.customer,
    phone: order.phone,
    type: order.type,
    status: order.status,
    total: String(order.total),
    date: order.date,
    time: order.time,
    payment: order.payment,
  };
}

function uniqueOrderValues(rows: DashboardOrder[], key: "status" | "type" | "payment") {
  return Array.from(new Set(rows.map((row) => row[key]).filter(Boolean)));
}

function orderMatchesFilters(order: DashboardOrder, filters: OrderFilters) {
  const search = filters.search.trim().toLowerCase();
  const matchesSearch =
    !search ||
    [order.number, order.customer, order.phone, order.total.toString()]
      .join(" ")
      .toLowerCase()
      .includes(search);
  const matchesStatus =
    filters.status === "all" || order.status === filters.status;
  const matchesType = filters.type === "all" || order.type === filters.type;
  const matchesPayment =
    filters.payment === "all" || order.payment === filters.payment;

  return matchesSearch && matchesStatus && matchesType && matchesPayment;
}

function orderStatusTone(status: string): "green" | "yellow" | "blue" | "red" | "gray" {
  if (status === "مكتمل") return "gray";
  if (status === "مؤكد") return "blue";
  if (status === "ملغي") return "red";
  return "yellow";
}

function OrdersFilters({
  filters,
  statuses,
  types,
  payments,
  onChange,
  onReset,
}: {
  filters: OrderFilters;
  statuses: string[];
  types: string[];
  payments: string[];
  onChange: (filters: OrderFilters) => void;
  onReset: () => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,320px)_180px_180px_180px_auto] md:items-end">
      <label className="grid gap-2 text-sm">
        بحث
        <input
          value={filters.search}
          onChange={(event) => onChange({ ...filters, search: event.target.value })}
          placeholder="رقم الطلب أو العميل..."
          className="h-9 rounded-md border border-border bg-input px-3 text-sm shadow-sm outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
        />
      </label>
      <label className="grid gap-2 text-sm">
        الحالة
        <select
          value={filters.status}
          onChange={(event) => onChange({ ...filters, status: event.target.value })}
          className="h-9 rounded-md border border-border bg-input px-3 text-sm shadow-sm outline-none"
        >
          <option value="all">الكل</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm">
        نوع الطلب
        <select
          value={filters.type}
          onChange={(event) => onChange({ ...filters, type: event.target.value })}
          className="h-9 rounded-md border border-border bg-input px-3 text-sm shadow-sm outline-none"
        >
          <option value="all">الكل</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm">
        طريقة الدفع
        <select
          value={filters.payment}
          onChange={(event) => onChange({ ...filters, payment: event.target.value })}
          className="h-9 rounded-md border border-border bg-input px-3 text-sm shadow-sm outline-none"
        >
          <option value="all">الكل</option>
          {payments.map((payment) => (
            <option key={payment} value={payment}>
              {payment}
            </option>
          ))}
        </select>
      </label>
      <Button type="button" variant="outline" size="sm" onClick={onReset}>
        إعادة ضبط
      </Button>
    </div>
  );
}

function OrderInlineEditor({
  order,
  draft,
  saving,
  onChange,
  onCancel,
  onSave,
}: {
  order: DashboardOrder;
  draft: OrderDraft;
  saving: boolean;
  onChange: (patch: Partial<OrderDraft>) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <form
      className="mt-3 rounded-md border bg-muted/20 p-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-sm font-semibold">تعديل بيانات الطلب</div>
          <div className="mt-1 text-xs text-muted-foreground">{order.number}</div>
        </div>
        <RefBadge tone={orderStatusTone(draft.status)}>{draft.status}</RefBadge>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Field label="اسم العميل">
          <Input
            value={draft.customer}
            onChange={(event) => onChange({ customer: event.target.value })}
            className="h-10"
            required
          />
        </Field>
        <Field label="رقم الهاتف">
          <Input
            value={draft.phone}
            onChange={(event) => onChange({ phone: event.target.value })}
            className="h-10"
            required
          />
        </Field>
        <Field label="نوع الطلب">
          <Input
            value={draft.type}
            onChange={(event) => onChange({ type: event.target.value })}
            className="h-10"
            required
          />
        </Field>
        <Field label="حالة الطلب">
          <Input
            value={draft.status}
            onChange={(event) => onChange({ status: event.target.value })}
            className="h-10"
            required
          />
        </Field>
        <Field label="الإجمالي">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={draft.total}
            onChange={(event) => onChange({ total: event.target.value })}
            className="h-10"
            required
          />
        </Field>
        <Field label="طريقة الدفع">
          <Input
            value={draft.payment}
            onChange={(event) => onChange({ payment: event.target.value })}
            className="h-10"
            required
          />
        </Field>
        <Field label="التاريخ">
          <Input
            value={draft.date}
            onChange={(event) => onChange({ date: event.target.value })}
            className="h-10"
            required
          />
        </Field>
        <Field label="الوقت">
          <Input
            value={draft.time}
            onChange={(event) => onChange({ time: event.target.value })}
            className="h-10"
            required
          />
        </Field>
      </div>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" size="sm" disabled={saving}>
          <CheckCircle2 className="size-4" />
          {saving ? "جاري الحفظ..." : "حفظ التعديل"}
        </Button>
      </div>
    </form>
  );
}

function OrdersMobileCards({
  orders,
  openMenu,
  onToggleMenu,
  editingOrderNumber,
  editDraft,
  savingOrderNumber,
  onStartEdit,
  onDraftChange,
  onCancelEdit,
  onSaveEdit,
  onDeleteOrder,
}: {
  orders: DashboardOrder[];
  openMenu: string | null;
  onToggleMenu: (orderNumber: string) => void;
  editingOrderNumber: string | null;
  editDraft: OrderDraft;
  savingOrderNumber: string | null;
  onStartEdit: (order: DashboardOrder) => void;
  onDraftChange: (patch: Partial<OrderDraft>) => void;
  onCancelEdit: () => void;
  onSaveEdit: (orderNumber: string) => void;
  onDeleteOrder: (orderNumber: string) => void;
}) {
  return (
    <div className="mt-4 grid min-w-0 gap-3 lg:hidden">
      {orders.map((order) => (
        <article
          key={order.number}
          className="min-w-0 overflow-hidden rounded-md border bg-card p-3 text-card-foreground shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                href={`/orders/view/${encodeURIComponent(order.number)}`}
                className="break-all text-sm font-semibold hover:text-primary"
              >
                {order.number}
              </Link>
              <div className="mt-1 text-sm">{order.customer}</div>
              <div className="text-xs text-muted-foreground">{order.phone}</div>
            </div>
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => onToggleMenu(order.number)}
                className="inline-flex size-9 items-center justify-center rounded-md border bg-background shadow-sm hover:bg-accent"
                aria-label={`إجراءات ${order.number}`}
              >
                <MoreHorizontal className="size-4" />
              </button>
              {openMenu === order.number ? (
                <div className="absolute left-0 top-10 z-20 w-44 rounded-md border bg-popover p-1 text-sm shadow-md">
                  <button
                    type="button"
                    onClick={() => onStartEdit(order)}
                    className="flex h-9 w-full items-center gap-2 rounded-sm px-3 text-start hover:bg-accent"
                  >
                    <Edit className="size-4" />
                    تعديل
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteOrder(order.number)}
                    className="flex h-9 w-full items-center gap-2 rounded-sm px-3 text-start text-destructive hover:bg-accent"
                  >
                    <Trash2 className="size-4" />
                    حذف من القائمة
                  </button>
                </div>
              ) : null}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <RefBadge tone={orderStatusTone(order.status)}>{order.status}</RefBadge>
            <RefBadge tone="gray">{order.type}</RefBadge>
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
              {order.payment}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-md bg-muted/40 p-2">
              <div className="text-muted-foreground">الإجمالي</div>
              <div className="mt-1 font-semibold">
                {formatReferenceCurrency(order.total)}
              </div>
            </div>
            <div className="rounded-md bg-muted/40 p-2">
              <div className="text-muted-foreground">التاريخ</div>
              <div className="mt-1 font-medium">{order.date}</div>
              <div className="text-muted-foreground">{order.time}</div>
            </div>
          </div>
          {editingOrderNumber === order.number ? (
            <OrderInlineEditor
              order={order}
              draft={editDraft}
              saving={savingOrderNumber === order.number}
              onChange={onDraftChange}
              onCancel={onCancelEdit}
              onSave={() => onSaveEdit(order.number)}
            />
          ) : null}
        </article>
      ))}
    </div>
  );
}

function MobileDateFilters({
  activeDate,
  anchorDate,
  customRange,
}: {
  activeDate: DateRangeKey;
  anchorDate: Date;
  customRange: { start: string; end: string };
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-2 xl:hidden">
      {dateRangeOptions(anchorDate, customRange).map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          type="button"
          disabled
          aria-pressed={activeDate === key}
          className={cn(
            "inline-flex h-8 items-center gap-2 rounded-md border border-border bg-muted/30 px-3 text-xs text-muted-foreground opacity-75 shadow-sm disabled:cursor-not-allowed",
          )}
        >
          {Icon ? <Icon className="size-3.5" /> : null}
          {label}
        </button>
      ))}
    </div>
  );
}

export function OrdersPage() {
  const { showSnackbar } = useSnackbar();
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [filters, setFilters] = useState<OrderFilters>(defaultOrderFilters);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [editingOrderNumber, setEditingOrderNumber] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<OrderDraft>(emptyOrderDraft);
  const [savingOrderNumber, setSavingOrderNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const activeDate: DateRangeKey = "today";
  const customRange = { start: "", end: "" };
  const anchorDate = useMemo(() => latestOrderDate(orders), [orders]);
  const dateFilteredOrders = orders;
  const visibleOrders = useMemo(
    () => dateFilteredOrders.filter((order) => orderMatchesFilters(order, filters)),
    [dateFilteredOrders, filters],
  );
  const statuses = useMemo(
    () => uniqueOrderValues(dateFilteredOrders, "status"),
    [dateFilteredOrders],
  );
  const types = useMemo(
    () => uniqueOrderValues(dateFilteredOrders, "type"),
    [dateFilteredOrders],
  );
  const payments = useMemo(
    () => uniqueOrderValues(dateFilteredOrders, "payment"),
    [dateFilteredOrders],
  );
  const waitingCount = dateFilteredOrders.filter(
    (order) => order.status === "قيد الانتظار",
  ).length;
  const completedCount = dateFilteredOrders.filter(
    (order) => order.status === "مكتمل",
  ).length;
  const cancelledCount = dateFilteredOrders.filter(
    (order) => order.status === "ملغي",
  ).length;

  useEffect(() => {
    let alive = true;

    async function loadOrders() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/dashboard/orders");

        if (!response.ok) {
          throw new Error("Failed to load orders");
        }

        const data = (await response.json()) as { orders: DashboardOrder[] };

        if (alive) {
          setOrders(data.orders);
        }
      } catch {
        if (alive) {
          setError("تعذر تحميل الطلبات. حاول تحديث الصفحة.");
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      alive = false;
    };
  }, []);

  function startEditingOrder(order: DashboardOrder) {
    setEditingOrderNumber(order.number);
    setEditDraft(draftFromOrder(order));
    setOpenMenu(null);
    setError("");
  }

  function cancelEditingOrder() {
    setEditingOrderNumber(null);
    setEditDraft(emptyOrderDraft);
  }

  async function saveOrder(orderNumber: string) {
    const total = Number(editDraft.total);

    if (!Number.isFinite(total) || total < 0) {
      setError("قيمة الإجمالي غير صحيحة.");
      showSnackbar({
        message: "قيمة الإجمالي غير صحيحة.",
        tone: "danger",
      });
      return;
    }

    setSavingOrderNumber(orderNumber);
    setError("");

    try {
      const response = await fetch(
        `/api/dashboard/orders/${encodeURIComponent(orderNumber)}`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            customer: editDraft.customer,
            phone: editDraft.phone,
            type: editDraft.type,
            status: editDraft.status,
            total,
            date: editDraft.date,
            time: editDraft.time,
            payment: editDraft.payment,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update order");
      }

      const data = (await response.json()) as { order: DashboardOrder };

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.number === orderNumber ? data.order : order,
        ),
      );
      setEditingOrderNumber(null);
      setEditDraft(emptyOrderDraft);
      showSnackbar({
        message: `تم حفظ تعديل الطلب ${orderNumber}.`,
        tone: "success",
      });
    } catch {
      setError("تعذر حفظ تعديل الطلب.");
      showSnackbar({
        message: "تعذر حفظ تعديل الطلب.",
        tone: "danger",
      });
    } finally {
      setSavingOrderNumber(null);
    }
  }

  async function deleteOrder(orderNumber: string) {
    const previousOrders = orders;
    const deletedOrderNumber = orderNumber;

    setOrders((currentOrders) =>
      currentOrders.filter((order) => order.number !== orderNumber),
    );
    setOpenMenu(null);
    if (editingOrderNumber === orderNumber) {
      cancelEditingOrder();
    }
    setError("");

    try {
      const response = await fetch(
        `/api/dashboard/orders/${encodeURIComponent(orderNumber)}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        throw new Error("Failed to delete order");
      }
      showSnackbar({
        message: `تم حذف الطلب ${deletedOrderNumber}.`,
        tone: "danger",
      });
    } catch {
      setOrders(previousOrders);
      setError("تعذر حذف الطلب.");
      showSnackbar({
        message: "تعذر حذف الطلب.",
        tone: "danger",
      });
    }
  }

  return (
    <div className="px-6 py-8">
      <PageTitle
        title="الطلبات"
        description="عرض وإدارة كل الطلبات الواردة"
        size="compact"
        actions={
          <>
            <DateSegmentedControl
              activeDate={activeDate}
              anchorDate={anchorDate}
              customRange={customRange}
            />
            <Link
              href="/orders/create"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
            >
              <Plus className="size-4" />
              إنشاء طلب جديد
            </Link>
          </>
        }
      />

      <MetricCards
        cards={[
          ["إجمالي الطلبات", String(dateFilteredOrders.length), ShoppingCart, "text-primary"],
          ["قيد الانتظار", String(waitingCount), Calendar, "text-amber-500"],
          ["مكتمل", String(completedCount), CheckCircle2, "text-green-500"],
          ["ملغي", String(cancelledCount), XCircle, "text-destructive"],
        ]}
      />

      <div className="mt-6">
        {error ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        ) : null}
        <MobileDateFilters
          activeDate={activeDate}
          anchorDate={anchorDate}
          customRange={customRange}
        />
        <OrdersFilters
          filters={filters}
          statuses={statuses}
          types={types}
          payments={payments}
          onChange={setFilters}
          onReset={() => setFilters(defaultOrderFilters)}
        />
        {loading ? (
          <div className="mt-4 flex h-24 items-center justify-center rounded-md border text-sm text-muted-foreground lg:hidden">
            جاري تحميل الطلبات...
          </div>
        ) : visibleOrders.length ? (
          <OrdersMobileCards
            orders={visibleOrders}
            openMenu={openMenu}
            onToggleMenu={(orderNumber) =>
              setOpenMenu((current) =>
                current === orderNumber ? null : orderNumber,
              )
            }
            editingOrderNumber={editingOrderNumber}
            editDraft={editDraft}
            savingOrderNumber={savingOrderNumber}
            onStartEdit={startEditingOrder}
            onDraftChange={(patch) =>
              setEditDraft((currentDraft) => ({ ...currentDraft, ...patch }))
            }
            onCancelEdit={cancelEditingOrder}
            onSaveEdit={saveOrder}
            onDeleteOrder={deleteOrder}
          />
        ) : (
          <div className="mt-4 flex h-24 items-center justify-center rounded-md border text-sm text-muted-foreground lg:hidden">
            لا توجد نتائج مطابقة.
          </div>
        )}
        <div className="mt-4 hidden overflow-hidden rounded-md border lg:block">
          <div className="overflow-x-auto">
            <table
              className="w-full caption-bottom text-sm"
              style={{ minWidth: 1050, tableLayout: "fixed" }}
            >
              <colgroup>
                {[42, 190, 190, 130, 150, 160, 140, 70].map((width, index) => (
                  <col key={index} style={{ width }} />
                ))}
              </colgroup>
              <thead>
                <tr className="h-10 border-b transition-colors hover:bg-muted/50">
                  <th className="h-10 px-2 text-start align-middle text-xs font-medium text-muted-foreground">
                    #
                  </th>
                  <th className="h-10 px-2 text-start align-middle text-xs font-medium text-muted-foreground">
                    رقم الطلب
                  </th>
                  <th className="h-10 px-2 text-start align-middle text-xs font-medium text-muted-foreground">
                    بيانات العميل
                  </th>
                  <th className="h-10 px-2 text-start align-middle text-xs font-medium text-muted-foreground">
                    <button type="button" className="inline-flex items-center gap-2">
                      نوع الطلب
                      <ArrowUpDown className="size-4" />
                    </button>
                  </th>
                  <th className="h-10 px-2 text-start align-middle text-xs font-medium text-muted-foreground">
                    <button type="button" className="inline-flex items-center gap-2">
                      حالة الطلب
                      <ArrowUpDown className="size-4" />
                    </button>
                  </th>
                  <th className="h-10 px-2 text-start align-middle text-xs font-medium text-muted-foreground">
                    السعر
                  </th>
                  <th className="h-10 px-2 text-start align-middle text-xs font-medium text-muted-foreground">
                    تاريخ الطلب
                  </th>
                  <th className="h-10 px-2 text-start align-middle text-xs font-medium text-muted-foreground" />
                </tr>
              </thead>
              <tbody>
                {(loading ? [] : visibleOrders).flatMap((order) => [
                  <tr
                    key={`row-${order.number}`}
                    className="h-[53px] border-b transition-colors hover:bg-muted/40"
                  >
                    <td className="p-0 align-middle">
                      <span className="block px-3">{order.index}</span>
                    </td>
                    <td className="p-2 align-middle">
                      <Link
                        href={`/orders/view/${encodeURIComponent(order.number)}`}
                        className="font-medium hover:text-primary"
                      >
                        {order.number}
                      </Link>
                    </td>
                    <td className="p-2 align-middle">
                      <div>{order.customer}</div>
                      <div className="text-xs text-muted-foreground">{order.phone}</div>
                    </td>
                    <td className="p-2 align-middle">{order.type}</td>
                    <td className="p-2 align-middle">
                      <RefBadge tone={orderStatusTone(order.status)}>
                        {order.status}
                      </RefBadge>
                    </td>
                    <td className="p-2 align-middle">
                      <div className="flex items-center gap-2">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-md border text-green-500">
                          <Banknote className="size-4" />
                        </span>
                        <span>
                          <span className="block font-medium">
                            {formatReferenceCurrency(order.total)}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {order.payment}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="p-2 align-middle">
                      <div>{order.date}</div>
                      <div className="text-xs text-muted-foreground">{order.time}</div>
                    </td>
                    <td className="p-2 align-middle">
                      <div className="relative flex justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenu((current) =>
                              current === order.number ? null : order.number,
                            )
                          }
                          className="inline-flex h-8 w-12 items-center justify-center rounded-md border bg-background text-sm font-bold shadow-sm hover:bg-accent"
                          aria-label={`إجراءات ${order.number}`}
                        >
                          <MoreHorizontal className="size-4" />
                        </button>
                        {openMenu === order.number ? (
                          <div className="absolute left-0 top-9 z-20 w-44 rounded-md border bg-popover p-1 text-sm shadow-md">
                            <button
                              type="button"
                              onClick={() => startEditingOrder(order)}
                              className="flex h-9 w-full items-center gap-2 rounded-sm px-3 text-start hover:bg-accent"
                            >
                              <Edit className="size-4" />
                              تعديل
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteOrder(order.number)}
                              className="flex h-9 w-full items-center gap-2 rounded-sm px-3 text-start text-destructive hover:bg-accent"
                            >
                              <Trash2 className="size-4" />
                              حذف من القائمة
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>,
                  editingOrderNumber === order.number ? (
                    <tr key={`editor-${order.number}`} className="border-b bg-muted/10">
                      <td colSpan={8} className="p-3 align-top">
                        <OrderInlineEditor
                          order={order}
                          draft={editDraft}
                          saving={savingOrderNumber === order.number}
                          onChange={(patch) =>
                            setEditDraft((currentDraft) => ({
                              ...currentDraft,
                              ...patch,
                            }))
                          }
                          onCancel={cancelEditingOrder}
                          onSave={() => saveOrder(order.number)}
                        />
                      </td>
                    </tr>
                  ) : null,
                ])}
              </tbody>
            </table>
          </div>
          {loading ? (
            <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
              جاري تحميل الطلبات...
            </div>
          ) : !visibleOrders.length ? (
            <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
              لا توجد نتائج مطابقة.
            </div>
          ) : null}
        </div>
        <Pagination
          text={`عرض ${visibleOrders.length} من ${orders.length} نتائج`}
          pages="1 / 1"
          nextDisabled
        />
      </div>
    </div>
  );
}

export function CreateOrderPage() {
  const { showSnackbar } = useSnackbar();
  const inputClass =
    "h-10 w-full rounded-md border border-border bg-input px-3 text-sm shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/15";
  const selectClass =
    "h-10 w-full rounded-md border border-border bg-input px-3 text-sm shadow-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/15";
  const summaryRows = [
    ["الإجمالي الفرعي", "0.00 EGP", ""],
    ["الخصم", "-0.00 EGP", "text-red-500"],
    ["ضريبة القيمة المضافة (15%)", "0.00 EGP", ""],
    ["رسوم التوصيل", "0.00 EGP", ""],
  ] as const;

  return (
    <div className="px-6 py-8">
      <Card className="flex flex-col gap-4 rounded-lg px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-primary">الطلبات</div>
          <h1 className="mt-1 text-2xl font-semibold leading-8">إنشاء طلب جديد</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            className="h-10"
            onClick={() => showSnackbar({ message: "تم حفظ الطلب." })}
          >
            حفظ الطلب
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-10"
            onClick={() => showSnackbar({ message: "تم حفظ الطلب ويمكنك إنشاء جديد." })}
          >
            حفظ وإنشاء جديد
          </Button>
          <Link
            href="/orders"
            className="inline-flex size-10 items-center justify-center rounded-md border bg-background shadow-sm transition hover:bg-accent"
            aria-label="الرجوع للطلبات"
          >
            <X className="size-4" />
          </Link>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_370px]">
        <div className="flex flex-col gap-6">
          <Card className="p-6">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <UserRound className="size-5" />
                </span>
                <h2 className="text-xl font-semibold">بيانات العميل</h2>
              </div>
              <button
                type="button"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md border bg-background px-3 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-accent hover:text-foreground"
              >
                <Plus className="size-4" />
                عميل جديد
              </button>
            </div>
            <div className="relative mb-5">
              <Search className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-11 pe-10"
                placeholder="ابحث عن العميل بالاسم أو الموبايل..."
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="اسم العميل">
                <Input className="h-10" placeholder="اكتب اسم العميل" />
              </Field>
              <Field label="رقم الموبايل">
                <Input className="h-10" placeholder="رقم الموبايل" />
              </Field>
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <ShoppingCart className="size-5" />
                </span>
                <h2 className="text-xl font-semibold">منتجات الطلب</h2>
              </div>
              <Button className="h-10">
                <Plus className="size-4" />
                إضافة منتج
              </Button>
            </div>
            <div className="rounded-md border border-dashed border-border bg-muted/20 p-8 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-md bg-background text-primary shadow-sm">
                <ShoppingCart className="size-6" />
              </div>
              <div className="mt-4 font-semibold">مفيش منتجات في الطلب ده</div>
              <div className="mt-1 text-sm text-muted-foreground">
                أضف المنتجات عشان يظهر الملخص والإجمالي تلقائيًا.
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Banknote className="size-5" />
              </span>
              <h2 className="text-xl font-semibold">ملخص الطلب</h2>
            </div>
            <div className="grid gap-3 text-sm">
              {summaryRows.map(([label, value, tone]) => (
                <div
                  key={label}
                  className="flex min-h-10 items-center justify-between gap-4 rounded-md bg-muted/25 px-3"
                >
                  <span className="text-muted-foreground">{label}</span>
                  <span className={cn("font-medium", tone)}>{value}</span>
                </div>
              ))}
              <div className="mt-1 flex min-h-12 items-center justify-between gap-4 rounded-md border bg-background px-3 text-base font-semibold">
                <span>الإجمالي</span>
                <span className="text-green-500">0.00 EGP</span>
              </div>
            </div>
          </Card>
        </div>

        <Card className="h-fit p-6 xl:sticky xl:top-20">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Calendar className="size-5" />
            </span>
            <h2 className="text-xl font-semibold">بيانات الطلب</h2>
          </div>
          <div className="space-y-5">
            <Field label="نوع الطلب">
              <select className={selectClass} defaultValue="pickup">
                <option value="pickup">استلام من الفرع</option>
                <option value="delivery">توصيل</option>
              </select>
            </Field>
            <div className="border-t" />
            <Field label="طريقة الدفع">
              <select className={selectClass} defaultValue="cash">
                <option value="cash">نقدي عند الاستلام</option>
                <option value="card">بطاقة بنكية</option>
                <option value="wallet">محفظة إلكترونية</option>
              </select>
            </Field>
            <div className="border-t" />
            <Field label="الفرع">
              <select className={selectClass} defaultValue="">
                <option value="">اختر الفرع</option>
                <option value="eltall">أول أونلاين ماركت في التل الكبير</option>
              </select>
            </Field>
            <div className="border-t" />
            <Field label="الخصم">
              <div className="relative">
                <input defaultValue="0" className={cn(inputClass, "pl-9")} />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
              </div>
            </Field>
            <div className="border-t" />
            <Field label="ملاحظة الطلب">
              <textarea
                className="min-h-24 rounded-md border border-border bg-input px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
                placeholder="اكتب أي ملاحظة للطلب"
              />
            </Field>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function AddonsPage() {
  const { showSnackbar } = useSnackbar();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="px-6 py-8">
      <div className="flex items-start justify-between gap-4">
        <PageTitle
          title="الإضافات"
          description="إدارة الإضافات والاختيارات الإضافية للمنيو"
          size="compact"
        />
        <div className="inline-flex rounded-xl bg-muted p-1 text-sm shadow-sm">
          <button className="rounded-lg bg-background px-4 py-2 shadow-sm">الإضافات</button>
          <button className="px-4 py-2 text-muted-foreground">فئات الإضافات</button>
        </div>
      </div>

      <Card className="mt-8 overflow-hidden">
        <div className="flex min-h-[77px] items-center justify-between border-b px-6">
          <div>
            <h2 className="font-semibold">كل الإضافات</h2>
            <p className="mt-2 text-sm text-muted-foreground">قائمة الإضافات</p>
          </div>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="size-4" />
            إضافة جديدة
          </Button>
        </div>
        <div className="p-6">
          <FilterBar
            className="border-b-0"
            disabled
            fields={[
              { label: "بحث", type: "search", placeholder: "ابحث عن إضافة...", width: "md:w-80" },
              { label: "التصنيف", type: "select", value: "الكل", width: "md:w-48" },
            ]}
          />
          <div className="mt-4">
            <EmptyStateTable
              minWidth={1000}
              headers={["#", "الاسم", "الاسم بالعربي", "سعر الإضافة", "السعرات", "تصنيف الإضافة", "عدد المنتجات", "إجراءات"]}
            />
          </div>
          <Pagination text="عرض 0-0 من 0 نتائج" pages="1 / 0" nextDisabled />
        </div>
      </Card>

      {modalOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-[1px]">
          <div className="w-full max-w-[540px] rounded-lg border bg-background p-6 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">إضافة جديدة</h2>
                <p className="mt-1 text-sm text-muted-foreground">أنشئ إضافة للمنتجات.</p>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-md border p-2 hover:bg-accent">
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-5 grid gap-4">
              <Field label="الاسم">
                <Input placeholder="اسم الإضافة" />
              </Field>
              <Field label="سعر الإضافة">
                <Input placeholder="0.00 EGP" />
              </Field>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setModalOpen(false)}>إلغاء</Button>
                <Button
                  onClick={() => {
                    setModalOpen(false);
                    showSnackbar({ message: "تم إنشاء الإضافة بنجاح." });
                  }}
                >
                  إنشاء
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

type OfferStatus = "نشط" | "متوقف" | "منتهي";

const offerTypeOptions = [
  { label: "باكج", icon: Package, accent: "text-sky-400", bg: "bg-sky-500/15" },
  { label: "فلاش", icon: Zap, accent: "text-amber-400", bg: "bg-amber-500/15" },
  { label: "خصم", icon: Percent, accent: "text-rose-400", bg: "bg-rose-500/15" },
  { label: "توصيل", icon: Truck, accent: "text-emerald-400", bg: "bg-emerald-500/15" },
] as const;

type OfferCard = {
  id: string;
  title: string;
  code: string;
  type: string;
  method: string;
  status: OfferStatus;
  period: string;
  endsAt: string;
  image?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  iconBg: string;
};

const initialOffers: OfferCard[] = [
  {
    id: "1",
    title: "عرض الباكج",
    code: "",
    type: "باكج",
    method: "تطبيق تلقائي",
    status: "نشط",
    period: "14 مايو 2026 → 1 يونيو 2026",
    endsAt: "2026-06-01T23:59:00+03:00",
    image: categoryRows[0]?.image,
    icon: Package,
    accent: "text-sky-400",
    iconBg: "bg-sky-500/15",
  },
  {
    id: "2",
    title: "عرض فلاش",
    code: "",
    type: "فلاش",
    method: "تطبيق تلقائي",
    status: "نشط",
    period: "10 مايو 2026 → 1 يونيو 2026",
    endsAt: "2026-06-01T23:59:00+03:00",
    image: categoryRows[1]?.image,
    icon: Zap,
    accent: "text-amber-400",
    iconBg: "bg-amber-500/15",
  },
  {
    id: "3",
    title: "خصم 50%",
    code: "",
    type: "خصم",
    method: "تطبيق تلقائي",
    status: "نشط",
    period: "10 مايو 2026 → 1 يونيو 2026",
    endsAt: "2026-06-01T23:59:00+03:00",
    image: categoryRows[2]?.image,
    icon: Percent,
    accent: "text-rose-400",
    iconBg: "bg-rose-500/15",
  },
  {
    id: "4",
    title: "توصيل مجاني",
    code: "YALLA26",
    type: "توصيل",
    method: "كود خصم",
    status: "نشط",
    period: "20 أبريل 2026 → 26 مايو 2026",
    endsAt: "2026-05-26T23:59:00+03:00",
    image: categoryRows[3]?.image,
    icon: Truck,
    accent: "text-emerald-400",
    iconBg: "bg-emerald-500/15",
  },
];

function getCountdownParts(endsAt: string, now: number | null) {
  if (now === null) {
    return { days: "--", hours: "--", minutes: "--", seconds: "--", expired: false };
  }

  const endTime = new Date(endsAt).getTime();

  if (!Number.isFinite(endTime)) {
    return { days: "--", hours: "--", minutes: "--", seconds: "--", expired: false };
  }

  const diffMs = endTime - now;
  const expired = diffMs <= 0;
  const totalSeconds = Math.max(0, Math.ceil(Math.abs(diffMs) / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days: String(days),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
    expired,
  };
}

function CountdownValue({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-md bg-background/80 px-2 py-2 text-center shadow-sm">
      <div className="text-lg font-semibold leading-none">{value}</div>
      <div className="mt-1 text-[11px] leading-none text-muted-foreground">{label}</div>
    </div>
  );
}

function OfferCountdown({ endsAt, now }: { endsAt: string; now: number | null }) {
  const countdown = getCountdownParts(endsAt, now);

  return (
    <div
      className={cn(
        "rounded-md border px-3 py-3",
        countdown.expired
          ? "border-red-500/20 bg-red-500/10"
          : "border-primary/20 bg-primary/10",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">
          {countdown.expired ? "انتهى منذ" : "متبقي"}
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-1 text-[11px] font-semibold leading-none",
            countdown.expired
              ? "bg-red-500/15 text-red-200"
              : "bg-primary/15 text-primary",
          )}
        >
          {countdown.expired ? "منتهي" : "ينتهي خلال"}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        <CountdownValue value={countdown.days} label="أيام" />
        <CountdownValue value={countdown.hours} label="ساعات" />
        <CountdownValue value={countdown.minutes} label="دقائق" />
        <CountdownValue value={countdown.seconds} label="ثواني" />
      </div>
    </div>
  );
}

type OfferVisualData = Pick<OfferCard, "title" | "type" | "endsAt"> & {
  image?: string;
  icon?: React.ComponentType<{ className?: string }>;
  accent?: string;
  iconBg?: string;
};

function offerVisualMeta(type: string) {
  return offerTypeOptions.find((option) => option.label === type) ?? offerTypeOptions[2];
}

function inlineCountdownText(countdown: ReturnType<typeof getCountdownParts>) {
  if (countdown.expired) return "انتهى";
  if (countdown.days !== "0" && countdown.days !== "--") {
    return `${countdown.days}ي ${countdown.hours}:${countdown.minutes}:${countdown.seconds}`;
  }
  return `${countdown.hours}:${countdown.minutes}:${countdown.seconds}`;
}

function OfferVisual({
  offer,
  now,
  className,
}: {
  offer: OfferVisualData;
  now: number | null;
  className?: string;
}) {
  const meta = offerVisualMeta(offer.type);
  const Icon = offer.icon ?? meta.icon;
  const accent = offer.accent ?? meta.accent;
  const iconBg = offer.iconBg ?? meta.bg;
  const countdown = offer.type === "فلاش" ? getCountdownParts(offer.endsAt, now) : null;

  return (
    <div className={cn("relative isolate overflow-hidden rounded-md border bg-muted", className)}>
      {offer.image ? (
        <DashboardImage
          src={offer.image}
          alt=""
          width={800}
          height={300}
          sizes="(min-width: 1280px) 360px, 100vw"
          className="absolute inset-0 size-full"
          imageClassName="object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-muted" />
      )}
      <div className="absolute inset-0 z-20 bg-gradient-to-l from-black/75 via-black/35 to-black/20" />
      <div className="relative z-30 flex h-full min-h-[136px] flex-col justify-between p-3 text-white">
        <div className="flex items-start justify-between gap-3">
          {countdown ? (
            <div
              className={cn(
                "rounded-md border px-2.5 py-2 text-center shadow-sm backdrop-blur",
                countdown.expired
                  ? "border-red-300/30 bg-red-500/25"
                  : "border-white/25 bg-black/35",
              )}
            >
              <div className="text-[11px] font-medium leading-none text-white/75">
                {countdown.expired ? "الحالة" : "متبقي"}
              </div>
              <div className="mt-1 font-mono text-sm font-semibold leading-none">
                {inlineCountdownText(countdown)}
              </div>
            </div>
          ) : (
            <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-md bg-white/90", accent)}>
              <Icon className="size-5" />
            </span>
          )}
          <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold", iconBg, accent)}>
            <Icon className="size-3.5" />
            {offer.type}
          </span>
        </div>

        <div className="max-w-[76%]">
          <h3 className="truncate text-base font-semibold leading-6">{offer.title}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/75">
            نوع العرض والعداد يظهران فوق الصورة تلقائيا.
          </p>
        </div>
      </div>
    </div>
  );
}

export function OffersPage() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [offers, setOffers] = useState(initialOffers);
  const [now, setNow] = useState<number | null>(null);
  const activeOffers = offers.filter((offer) => offer.status === "نشط").length;
  const expiredOffers = offers.filter((offer) => offer.status === "منتهي").length;

  useEffect(() => {
    const updateCountdown = () => setNow(Date.now());
    const timeoutId = window.setTimeout(updateCountdown, 0);
    const intervalId = window.setInterval(updateCountdown, 1000);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, []);

  function toggleOfferStatus(offerId: string) {
    setOffers((currentOffers) =>
      currentOffers.map((offer) =>
        offer.id === offerId
          ? { ...offer, status: offer.status === "نشط" ? "متوقف" : "نشط" }
          : offer,
      ),
    );
    showSnackbar({ message: "تم تحديث حالة العرض." });
  }

  function editOffer(offer: OfferCard) {
    showSnackbar({ message: `تم فتح تعديل ${offer.title}.` });
    router.push(`/offers/create?edit=${offer.id}`);
  }

  function deleteOffer(offerId: string) {
    setOffers((currentOffers) => currentOffers.filter((offer) => offer.id !== offerId));
    showSnackbar({ message: "تم حذف العرض." });
  }

  return (
    <div className="px-6 py-8">
      <PageTitle
        title="العروض"
        description="إدارة العروض والخصومات لكل الفروع"
        size="compact"
        actions={
          <Link
            href="/offers/create"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            <Plus className="size-4" />
            إنشاء عرض
          </Link>
        }
      />
      <MetricCards
        cards={[
          ["إجمالي العروض", String(offers.length), Tag, "text-primary"],
          ["نشط", String(activeOffers), CheckCircle2, "text-green-500"],
          ["مجدول", "0", Calendar, "text-orange-500"],
          ["منتهي", String(expiredOffers), XCircle, "text-destructive"],
        ]}
      />
      <div className="mt-6 grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
        {offers.map((offer) => {
          const Icon = offer.icon;

          return (
            <Card
              key={offer.id}
              className="overflow-hidden rounded-lg transition hover:border-primary/35 hover:bg-accent/20"
            >
              <div className="flex min-h-[410px] flex-col p-4">
                <OfferVisual offer={offer} now={now} className="h-36" />

                <div className="mt-4 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-md", offer.iconBg, offer.accent)}>
                      <Icon className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">#{offer.id}</div>
                      <h3 className="mt-1 truncate text-base font-semibold">{offer.title}</h3>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <RefBadge tone="gray">{offer.type}</RefBadge>
                  <RefBadge tone={offer.method === "كود خصم" ? "orange" : "purple"}>
                    {offer.method}
                  </RefBadge>
                  <RefBadge tone={offer.status === "نشط" ? "green" : offer.status === "منتهي" ? "red" : "yellow"}>
                    {offer.status}
                  </RefBadge>
                </div>

                <div className="mt-5 grid gap-3 text-sm">
                  <div className="flex items-center justify-between gap-3 rounded-md bg-muted/25 px-3 py-2">
                    <span className="text-muted-foreground">الفترة</span>
                    <span className="text-end font-medium">{offer.period}</span>
                  </div>
                  <OfferCountdown endsAt={offer.endsAt} now={now} />
                  <div className="flex items-center justify-between gap-3 rounded-md bg-muted/25 px-3 py-2">
                    <span className="text-muted-foreground">الكود</span>
                    <span className="font-medium">{offer.code || "بدون كود"}</span>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between border-t pt-4">
                  <span className="text-xs text-muted-foreground">إجراءات العرض</span>
                  <div className="flex items-center gap-1">
                    {offer.status === "متوقف" ? (
                      <MiniIconButton
                        tone="green"
                        ariaLabel="تشغيل العرض"
                        onClick={() => toggleOfferStatus(offer.id)}
                      >
                        <PlayCircle className="size-4" />
                      </MiniIconButton>
                    ) : offer.status === "نشط" ? (
                      <MiniIconButton
                        tone="orange"
                        ariaLabel="إيقاف العرض مؤقتا"
                        onClick={() => toggleOfferStatus(offer.id)}
                      >
                        <PauseCircle className="size-4" />
                      </MiniIconButton>
                    ) : null}
                    <MiniIconButton ariaLabel="تعديل العرض" onClick={() => editOffer(offer)}>
                      <Edit className="size-4" />
                    </MiniIconButton>
                    <MiniIconButton tone="red" ariaLabel="حذف العرض" onClick={() => deleteOffer(offer.id)}>
                      <Trash2 className="size-4" />
                    </MiniIconButton>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function UploadBox({
  arabic = false,
  compact = false,
  previewSrc,
  onImageSelected,
}: {
  arabic?: boolean;
  compact?: boolean;
  previewSrc?: string | null;
  onImageSelected?: (file: File | null) => void;
}) {
  const inputId = useId();

  return (
    <label
      htmlFor={inputId}
      className="block cursor-pointer rounded-md border border-dashed border-border bg-muted/10 p-3 transition hover:border-primary/40 hover:bg-primary/5"
    >
      <input
        id={inputId}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={(event) => onImageSelected?.(event.target.files?.[0] ?? null)}
      />
      <div
        className={cn(
          "relative flex flex-col items-center justify-center overflow-hidden rounded-md bg-muted/25 text-center",
          compact ? "min-h-[118px]" : "min-h-[150px]",
        )}
      >
        {previewSrc ? (
          <DashboardImage
            src={previewSrc}
            alt=""
            width={800}
            height={300}
            sizes="360px"
            className="absolute inset-0 size-full"
            imageClassName="object-cover"
          />
        ) : null}
        <div className={cn("relative z-10 flex flex-col items-center", previewSrc && "rounded-md bg-black/45 px-4 py-3 text-white backdrop-blur")}>
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ImageIcon className="size-6" />
          </span>
          <div className="mt-3 text-sm font-medium">
            {arabic ? "انقر لتحميل صورة أو اسحب وأفلت" : "اضغط للتحميل أو اسحب الصورة هنا"}
          </div>
          <div className={cn("mt-1 text-xs text-muted-foreground", previewSrc && "text-white/75")}>
            {arabic ? "PNG, JPG, WEBP حتى 10MB" : "PNG, JPG, WEBP حتى 10 MB لكل صورة"}
          </div>
        </div>
      </div>
    </label>
  );
}

const applicationMethods = ["تطبيق تلقائي", "كود خصم"] as const;
const orderTypeOptions = ["توصيل", "استلام", "داخل الفرع"] as const;
const weekDayOptions = ["الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"] as const;
const selectableItems = itemRows.filter((item) => item.active).slice(0, 12);
const packageSeedItems = selectableItems.slice(2, 5);
const offerMethodsByType: Record<string, readonly string[]> = {
  باكج: ["اختيار الباكج", "تطبيق تلقائي"],
  فلاش: ["تطبيق تلقائي"],
  خصم: applicationMethods,
  توصيل: applicationMethods,
};

type BundleLine = {
  id: string;
  itemId: string;
  quantity: number;
};

function parseItemPrice(price: string) {
  const value = Number(price.replace(/[^\d.]/g, ""));
  return Number.isFinite(value) ? value : 0;
}

function selectedBundleItem(itemId: string) {
  return selectableItems.find((item) => item.id === itemId) ?? selectableItems[0];
}

function PackageProductCard({
  line,
  item,
  lineTotal,
  canRemove,
  onChange,
  onRemove,
}: {
  line: BundleLine;
  item: ItemRow;
  lineTotal: number;
  canRemove: boolean;
  onChange: (patch: Partial<BundleLine>) => void;
  onRemove: () => void;
}) {
  const unitPrice = parseItemPrice(item.price);

  return (
    <div className="rounded-md border bg-background p-3 shadow-sm transition hover:border-primary/30">
      <div className="grid gap-3 lg:grid-cols-[92px_minmax(0,1fr)_220px]">
        <DashboardImage
          src={item.image}
          alt=""
          width={184}
          height={184}
          sizes="92px"
          className="size-[92px] rounded-md"
          imageClassName="object-cover"
        />

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <RefBadge tone="gray">#{item.index}</RefBadge>
            <RefBadge tone={item.active ? "green" : "red"}>
              {item.active ? "نشط" : "متوقف"}
            </RefBadge>
            {item.featured === "نعم" ? <RefBadge tone="purple">مميز</RefBadge> : null}
          </div>
          <h4 className="mt-2 truncate text-base font-semibold">{item.name}</h4>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {item.description || "لا يوجد وصف للمنتج حاليا."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-md bg-muted/40 px-2 py-1">{item.category}</span>
            <span className="rounded-md bg-muted/40 px-2 py-1">{item.subcategory}</span>
            <span className="rounded-md bg-muted/40 px-2 py-1">
              السعر الأصلي: {formatReferenceCurrency(unitPrice)}
            </span>
          </div>
        </div>

        <div className="grid gap-2">
          <label className="grid gap-1 text-xs font-medium text-muted-foreground">
            المنتج داخل الباكج
            <select
              value={line.itemId}
              onChange={(event) => onChange({ itemId: event.target.value })}
              className="h-10 min-w-0 rounded-md border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
            >
              {selectableItems.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-[86px_minmax(0,1fr)_40px] items-end gap-2">
            <label className="grid gap-1 text-xs font-medium text-muted-foreground">
              الكمية
              <Input
                type="number"
                min={1}
                value={line.quantity}
                onChange={(event) =>
                  onChange({ quantity: Number(event.target.value) || 1 })
                }
                className="h-10"
              />
            </label>
            <label className="grid gap-1 text-xs font-medium text-muted-foreground">
              إجمالي السطر
              <Input value={formatReferenceCurrency(lineTotal)} className="h-10" readOnly />
            </label>
            <MiniIconButton
              tone="red"
              ariaLabel="حذف منتج من الباكج"
              onClick={onRemove}
              disabled={!canRemove}
            >
              <Trash2 className="size-4" />
            </MiniIconButton>
          </div>
        </div>
      </div>

      <details className="mt-3 rounded-md border bg-muted/10 px-3 py-2">
        <summary className="cursor-pointer text-sm font-semibold text-primary">
          عرض تفاصيل المنتج داخل الباكج
        </summary>
        <div className="mt-3 grid gap-3 lg:grid-cols-3">
          <label className="grid gap-1 text-xs font-medium text-muted-foreground">
            سعر خاص داخل الباكج
            <Input placeholder={formatReferenceCurrency(unitPrice)} className="h-10" />
          </label>
          <label className="grid gap-1 text-xs font-medium text-muted-foreground">
            عنوان قصير للعميل
            <Input defaultValue={item.name} className="h-10" />
          </label>
          <label className="grid gap-1 text-xs font-medium text-muted-foreground">
            ترتيب الظهور
            <Input defaultValue={line.id.split("-").at(-1) ?? item.index} className="h-10" />
          </label>
          <label className="grid gap-1 text-xs font-medium text-muted-foreground lg:col-span-2">
            وصف المنتج داخل العرض
            <textarea
              defaultValue={item.description}
              className="min-h-[82px] rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
            />
          </label>
          <div className="rounded-md border bg-background p-3 text-xs leading-6 text-muted-foreground">
            <div className="flex justify-between gap-3">
              <span>معرّف المنتج</span>
              <span className="truncate font-medium text-foreground">{item.id}</span>
            </div>
            <div className="mt-1 flex justify-between gap-3">
              <span>السعر الحالي</span>
              <span className="font-medium text-foreground">{item.price}</span>
            </div>
            <div className="mt-1 flex justify-between gap-3">
              <span>السعرات</span>
              <span className="font-medium text-foreground">{item.calories || "غير محدد"}</span>
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

function formatDateInputValue(date: Date) {
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
}

function formatTimeInputValue(date: Date) {
  return `${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`;
}

function parseOfferEndDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

function offerEndsAtIso(dateValue: string, timeValue: string) {
  if (!dateValue) return "";
  return `${dateValue}T${timeValue || "23:59"}:00+03:00`;
}

const defaultOfferStartDate = parseOfferEndDate("2026-05-29T12:00:00+03:00")!;
const defaultFlashEndDate = parseOfferEndDate("2026-06-01T23:59:00+03:00")!;

export function CreateOfferPage() {
  const { showSnackbar } = useSnackbar();
  const [editingOfferId, setEditingOfferId] = useState("");
  const editingOffer = initialOffers.find((offer) => offer.id === editingOfferId);
  const formMode = editingOffer ? "edit" : "create";
  const [selectedType, setSelectedType] = useState(editingOffer?.type ?? "خصم");
  const [selectedMethod, setSelectedMethod] = useState(editingOffer?.method ?? "تطبيق تلقائي");
  const [bundleItems, setBundleItems] = useState<BundleLine[]>(() =>
    packageSeedItems.map((item, index) => ({
      id: `bundle-${item.id}`,
      itemId: item.id,
      quantity: index === 0 ? 2 : 1,
    })),
  );
  const [packagePrice, setPackagePrice] = useState("850");
  const selectedTypeOption =
    offerTypeOptions.find((option) => option.label === selectedType) ?? offerTypeOptions[2];
  const SelectedTypeIcon = selectedTypeOption.icon;
  const methodOptions = offerMethodsByType[selectedType] ?? applicationMethods;
  const activeMethod = methodOptions.includes(selectedMethod) ? selectedMethod : methodOptions[0];
  const packageSubtotal = bundleItems.reduce((total, line) => {
    const item = selectedBundleItem(line.itemId);
    return total + parseItemPrice(item.price) * line.quantity;
  }, 0);
  const packageFinalPrice = Number(packagePrice) || 0;
  const packageSaving = Math.max(packageSubtotal - packageFinalPrice, 0);
  const [now, setNow] = useState<number | null>(null);
  const [offerImagePreview, setOfferImagePreview] = useState<string | null>(
    editingOffer?.image ?? null,
  );
  const [startDate, setStartDate] = useState(() => formatDateInputValue(defaultOfferStartDate));
  const [endDate, setEndDate] = useState(() => formatDateInputValue(defaultFlashEndDate));
  const [startTime, setStartTime] = useState(() => formatTimeInputValue(defaultOfferStartDate));
  const [endTime, setEndTime] = useState(() => formatTimeInputValue(defaultFlashEndDate));
  const previewEndsAt = offerEndsAtIso(endDate, endTime);
  const previewOffer: OfferVisualData = {
    title: editingOffer?.title ?? "عرض جديد",
    type: selectedType,
    image: offerImagePreview ?? editingOffer?.image ?? categoryRows[0]?.image,
    endsAt: previewEndsAt,
    icon: SelectedTypeIcon,
    accent: selectedTypeOption.accent,
    iconBg: selectedTypeOption.bg,
  };

  useEffect(() => {
    const updateCountdown = () => setNow(Date.now());
    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    return () => {
      if (offerImagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(offerImagePreview);
      }
    };
  }, [offerImagePreview]);

  function selectOfferType(nextType: string) {
    const nextMethods = offerMethodsByType[nextType] ?? applicationMethods;
    setSelectedType(nextType);
    setSelectedMethod(nextMethods[0]);
  }

  function handleOfferImageSelected(file: File | null) {
    if (!file) return;
    setOfferImagePreview(URL.createObjectURL(file));
  }

  function addBundleLine() {
    const fallbackItem = selectableItems.find(
      (item) => !bundleItems.some((line) => line.itemId === item.id),
    ) ?? selectableItems[0];

    if (!fallbackItem) return;

    setBundleItems((currentLines) => [
      ...currentLines,
      {
        id: `bundle-${fallbackItem.id}-${Date.now()}`,
        itemId: fallbackItem.id,
        quantity: 1,
      },
    ]);
  }

  function updateBundleLine(lineId: string, patch: Partial<BundleLine>) {
    setBundleItems((currentLines) =>
      currentLines.map((line) =>
        line.id === lineId
          ? {
              ...line,
              ...patch,
              quantity: Math.max(1, Math.min(99, patch.quantity ?? line.quantity)),
            }
          : line,
      ),
    );
  }

  function removeBundleLine(lineId: string) {
    setBundleItems((currentLines) =>
      currentLines.length > 1 ? currentLines.filter((line) => line.id !== lineId) : currentLines,
    );
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const searchParams = new URLSearchParams(window.location.search);
      const nextEditingOfferId = searchParams.get("edit") ?? "";
      const nextEditingOffer = initialOffers.find((offer) => offer.id === nextEditingOfferId);

      setEditingOfferId(nextEditingOfferId);

      if (nextEditingOffer) {
        const nextEndDate = parseOfferEndDate(nextEditingOffer.endsAt) ?? defaultFlashEndDate;
        setSelectedType(nextEditingOffer.type);
        setSelectedMethod(nextEditingOffer.method);
        setOfferImagePreview(nextEditingOffer.image ?? null);
        setEndDate(formatDateInputValue(nextEndDate));
        setEndTime(formatTimeInputValue(nextEndDate));
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <div className="px-6 py-8">
      <PageTitle
        title={formMode === "edit" ? "تعديل العرض" : "إنشاء عرض"}
        description={
          formMode === "edit"
            ? `تعديل بيانات ${editingOffer?.title ?? "العرض"}`
            : "اضبط نوع العرض، الاستهداف، الجدولة، وحدود الاستخدام"
        }
        size="compact"
        actions={
          <>
            <Link
              href="/offers"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border bg-background px-3 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-accent hover:text-foreground"
            >
              <X className="size-4" />
              الرجوع
            </Link>
            <Button
              className="h-10"
              onClick={() =>
                showSnackbar({
                  message: formMode === "edit" ? "تم حفظ تعديل العرض بنجاح." : "تم إنشاء العرض بنجاح.",
                })
              }
            >
              <CheckCircle2 className="size-4" />
              {formMode === "edit" ? "حفظ التعديل" : "إنشاء"}
            </Button>
          </>
        }
      />

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-5">
          <FormCard
            title="البيانات الأساسية"
            right={formMode === "edit" ? <RefBadge tone="blue">#{editingOffer?.id}</RefBadge> : null}
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="العنوان بالعربي *">
                <Input
                  dir="rtl"
                  defaultValue={editingOffer?.title ?? ""}
                  className="h-10"
                  placeholder="مثلاً: خصم 20% على البيتزا"
                />
              </Field>
              <Field label="العنوان بالإنجليزي">
                <Input
                  className="h-10"
                  placeholder="Example: 20% Off All Pizzas"
                />
              </Field>
              <Field label="الوصف بالعربي">
                <Textarea dir="rtl" minHeight="min-h-[92px]" placeholder="وصف مختصر يظهر للعميل..." />
              </Field>
              <Field label="الوصف بالإنجليزي">
                <Textarea minHeight="min-h-[92px]" placeholder="Optional customer-facing description..." />
              </Field>
            </div>
          </FormCard>

          <FormCard title="نوع العرض وطريقة التطبيق">
            <div>
              <div className="mb-3 text-sm font-medium">نوع العرض *</div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {offerTypeOptions.map((option) => {
                  const Icon = option.icon;
                  const active = selectedType === option.label;

                  return (
                    <button
                      key={option.label}
                      type="button"
                      aria-pressed={active}
                      onClick={() => selectOfferType(option.label)}
                      className={cn(
                        "flex h-16 items-center gap-3 rounded-md border bg-background px-3 text-sm font-semibold shadow-sm transition hover:border-primary/40 hover:bg-accent",
                        active && "border-primary bg-primary/10 text-primary",
                      )}
                    >
                      <span className={cn("flex size-9 items-center justify-center rounded-md", option.bg, option.accent)}>
                        <Icon className="size-4" />
                      </span>
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
              <div>
                <div className="mb-3 text-sm font-medium">طريقة التطبيق *</div>
                <div className={cn("grid gap-2", methodOptions.length > 1 && "sm:grid-cols-2")}>
                  {methodOptions.map((method) => (
                    <button
                      key={method}
                      type="button"
                      aria-pressed={activeMethod === method}
                      onClick={() => setSelectedMethod(method)}
                      className={cn(
                        "h-10 rounded-md border bg-background px-3 text-sm text-muted-foreground shadow-sm transition hover:border-primary/40 hover:bg-accent",
                        activeMethod === method && "border-primary bg-primary/10 font-semibold text-primary",
                      )}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
              {activeMethod === "كود خصم" ? (
                <Field label="كود العرض">
                  <Input defaultValue={editingOffer?.code ?? ""} className="h-10" placeholder="YALLA26" />
                </Field>
              ) : (
                <div className="rounded-md border bg-muted/20 px-3 py-3">
                  <div className="text-xs text-muted-foreground">تطبيق العرض</div>
                  <div className="mt-2 flex items-center gap-2 text-sm font-semibold">
                    <CheckCircle2 className="size-4 text-green-500" />
                    {activeMethod === "اختيار الباكج" ? "يظهر كباكج جاهز للشراء" : "تلقائي عند تحقق الشروط"}
                  </div>
                </div>
              )}
            </div>

            {selectedType === "باكج" ? (
              <div className="grid gap-4">
                <div className="grid gap-4 lg:grid-cols-3">
                  <Field label="سعر الباكج *">
                    <div className="relative">
                      <Input
                        value={packagePrice}
                        onChange={(event) => setPackagePrice(event.target.value)}
                        className="h-10 ps-12"
                      />
                      <span className="absolute start-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                        EGP
                      </span>
                    </div>
                  </Field>
                  <Field label="مجموع المنتجات">
                    <Input value={formatReferenceCurrency(packageSubtotal)} className="h-10" readOnly />
                  </Field>
                  <Field label="توفير العميل">
                    <Input value={formatReferenceCurrency(packageSaving)} className="h-10" readOnly />
                  </Field>
                </div>

                <div className="rounded-md border bg-muted/10 p-3">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">منتجات الباكج</div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        افتح تفاصيل أي منتج لضبط وصفه وسعره الظاهر داخل العرض. واجهة فقط حاليا.
                      </p>
                    </div>
                    <RefBadge tone="blue">{bundleItems.length} منتجات</RefBadge>
                  </div>
                  <div className="grid gap-3">
                    {bundleItems.map((line) => {
                      const item = selectedBundleItem(line.itemId);
                      const lineTotal = parseItemPrice(item.price) * line.quantity;

                      return (
                        <PackageProductCard
                          key={line.id}
                          line={line}
                          item={item}
                          lineTotal={lineTotal}
                          canRemove={bundleItems.length > 1}
                          onChange={(patch) => updateBundleLine(line.id, patch)}
                          onRemove={() => removeBundleLine(line.id)}
                        />
                      );
                    })}
                  </div>
                </div>

                <Button type="button" variant="outline" className="h-10 w-fit" onClick={addBundleLine}>
                  <Plus className="size-4" />
                  إضافة منتج للباكج
                </Button>
              </div>
            ) : selectedType === "فلاش" ? (
              <div className="grid gap-4 lg:grid-cols-3">
                <Field label="نسبة الفلاش *">
                  <div className="relative">
                    <Input defaultValue="30" className="h-10 ps-10" />
                    <span className="absolute start-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">%</span>
                  </div>
                </Field>
                <Field label="الكمية المتاحة">
                  <Input defaultValue="50" className="h-10" />
                </Field>
                <Field label="الحد لكل عميل">
                  <Input defaultValue="2" className="h-10" />
                </Field>
                <Field label="منتجات الفلاش">
                  <div className="relative lg:col-span-2">
                    <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input className="h-10 ps-9" placeholder="اختر منتجات الفلاش..." />
                  </div>
                </Field>
              </div>
            ) : selectedType === "توصيل" ? (
              <div className="grid gap-4 lg:grid-cols-3">
                <Field label="نوع عرض التوصيل">
                  <SelectBox className="h-10">توصيل مجاني</SelectBox>
                </Field>
                <Field label="قيمة يتحملها العميل">
                  <div className="relative">
                    <Input defaultValue="0" className="h-10 ps-12" />
                    <span className="absolute start-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">EGP</span>
                  </div>
                </Field>
                <Field label="أقصى دعم توصيل">
                  <Input defaultValue="50" className="h-10" />
                </Field>
                <Field label="مناطق التوصيل">
                  <SelectBox className="h-10">كل مناطق التوصيل</SelectBox>
                </Field>
                <Field label="أقل قيمة طلب للتوصيل">
                  <Input defaultValue="150" className="h-10" />
                </Field>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-3">
                <Field label="نوع الخصم">
                  <SelectBox className="h-10">نسبة مئوية</SelectBox>
                </Field>
                <Field label="قيمة الخصم *">
                  <div className="relative">
                    <Input defaultValue="20" className="h-10 ps-10" />
                    <span className="absolute start-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">%</span>
                  </div>
                </Field>
                <Field label="أقصى خصم (EGP)">
                  <Input defaultValue="50" className="h-10" />
                </Field>
                <Field label="المنتجات أو الفئات">
                  <div className="relative lg:col-span-2">
                    <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input className="h-10 ps-9" placeholder="اختر المنتجات أو الفئات..." />
                  </div>
                </Field>
              </div>
            )}
          </FormCard>

          <FormCard title="الاستهداف">
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="أقل قيمة طلب (EGP)">
                <Input defaultValue={selectedType === "توصيل" ? "150" : "100"} className="h-10" />
              </Field>
              <Field label="شريحة العملاء">
                <SelectBox className="h-10">كل العملاء</SelectBox>
              </Field>
              <Field label="الفروع المطبقة">
                <SelectBox className="h-10">كل الفروع</SelectBox>
              </Field>
              {selectedType === "باكج" ? (
                <Field label="ظهور الباكج">
                  <SelectBox className="h-10">ضمن عروض الباكجات</SelectBox>
                </Field>
              ) : selectedType === "توصيل" ? (
                <Field label="مدن أو مناطق التوصيل">
                  <SelectBox className="h-10">كل المناطق</SelectBox>
                </Field>
              ) : (
                <Field label="المنتجات أو الفئات">
                  <div className="relative">
                    <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input className="h-10 ps-9" placeholder="اختر المنتجات أو الفئات..." />
                  </div>
                </Field>
              )}
            </div>
            <div>
              <div className="mb-3 text-sm font-medium">أنواع الطلبات</div>
              <div className="flex flex-wrap gap-2 text-sm">
                {orderTypeOptions.map((label) => (
                  <label key={label} className="inline-flex h-9 items-center gap-2 rounded-md border bg-background px-3 shadow-sm">
                    <input type="checkbox" className="size-4 rounded border" />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </FormCard>

          <FormCard title="الجدولة">
            <div className="grid gap-4 lg:grid-cols-4">
              <Field label="تاريخ البداية *">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="h-10"
                />
              </Field>
              <Field label="تاريخ النهاية *">
                <Input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="h-10"
                />
              </Field>
              <Field label="بداية الوقت">
                <Input
                  type="time"
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  className="h-10"
                />
              </Field>
              <Field label="نهاية الوقت">
                <Input
                  type="time"
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                  className="h-10"
                />
              </Field>
            </div>
            <div>
              <div className="mb-3 text-sm font-medium">أيام التفعيل</div>
              <div className="flex flex-wrap gap-2 text-sm">
                {weekDayOptions.map((label) => (
                  <label key={label} className="inline-flex h-9 items-center gap-2 rounded-md border bg-background px-3 shadow-sm">
                    <input type="checkbox" className="size-4 rounded border" />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </FormCard>
        </div>

        <div className="flex flex-col gap-5 xl:sticky xl:top-20 xl:self-start">
          <FormCard title="ملخص العرض">
            <OfferVisual offer={previewOffer} now={now} className="h-40" />
            <div className="flex items-start gap-3">
              <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-md", selectedTypeOption.bg, selectedTypeOption.accent)}>
                <SelectedTypeIcon className="size-5" />
              </span>
              <div className="min-w-0">
                <div className="text-base font-semibold">{editingOffer?.title ?? "عرض جديد"}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <RefBadge tone="gray">{selectedType}</RefBadge>
                  <RefBadge tone={activeMethod === "كود خصم" ? "orange" : "purple"}>{activeMethod}</RefBadge>
                  <RefBadge tone="green">نشط</RefBadge>
                </div>
              </div>
            </div>
            {selectedType === "باكج" ? (
              <div className="grid gap-3">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-md bg-muted/25 px-2 py-2">
                    <div className="text-base font-semibold">{bundleItems.length}</div>
                    <div className="mt-1 text-muted-foreground">منتجات</div>
                  </div>
                  <div className="rounded-md bg-muted/25 px-2 py-2">
                    <div className="text-base font-semibold">{packagePrice || "0"}</div>
                    <div className="mt-1 text-muted-foreground">سعر</div>
                  </div>
                  <div className="rounded-md bg-muted/25 px-2 py-2">
                    <div className="text-base font-semibold">{Math.round(packageSaving)}</div>
                    <div className="mt-1 text-muted-foreground">توفير</div>
                  </div>
                </div>
                <div className="rounded-md border bg-muted/10 p-2">
                  <div className="mb-2 text-xs font-semibold text-muted-foreground">
                    مكونات الباكج
                  </div>
                  <div className="grid gap-2">
                    {bundleItems.map((line) => {
                      const item = selectedBundleItem(line.itemId);

                      return (
                        <div key={line.id} className="flex items-center gap-2 rounded-md bg-background p-2">
                          <DashboardImage
                            src={item.image}
                            alt=""
                            width={72}
                            height={72}
                            sizes="36px"
                            className="size-9 rounded-md"
                            imageClassName="object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-xs font-semibold">{item.name}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {line.quantity} × {item.price}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}
          </FormCard>

          <FormCard title="صور العرض">
            <UploadBox
              arabic
              compact
              previewSrc={offerImagePreview ?? editingOffer?.image}
              onImageSelected={handleOfferImageSelected}
            />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-md border bg-muted/20 p-3 text-xs leading-5 text-muted-foreground">
                الغلاف: 800 x 300 px
                <br />
                الصيغ: PNG, JPG, WEBP
                <br />
                نوع العرض والتايمر يظهران فوق الصورة تلقائيا في التطبيق.
              </div>
            </div>
          </FormCard>

          <FormCard title="حدود الاستخدام">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <Field label="إجمالي الاستخدام">
                <Input className="h-10" placeholder="غير محدود" />
              </Field>
              <Field label="الحد لكل عميل">
                <Input className="h-10" placeholder="غير محدود" />
              </Field>
            </div>
          </FormCard>

          <FormCard title="العرض والحالة">
            <Field label="الأولوية">
              <Input defaultValue="0" className="h-10" />
            </Field>
            <div className="flex min-h-[74px] items-center justify-between rounded-md border bg-background px-3">
              <div>
                <div className="text-sm font-medium">عرض مميز</div>
                <p className="mt-1 text-xs text-muted-foreground">يظهر بأولوية في تطبيق العملاء</p>
              </div>
              <Switch checked={false} />
            </div>
          </FormCard>
        </div>
      </div>
    </div>
  );
}
