"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpDown,
  Banknote,
  Calendar,
  CheckCircle2,
  Edit,
  ImageIcon,
  MoreHorizontal,
  PauseCircle,
  PlayCircle,
  Plus,
  Search,
  ShoppingCart,
  Tag,
  Trash2,
  UserRound,
  X,
  XCircle,
} from "lucide-react";

import { categoryRows } from "../data";
import { DashboardImage } from "../dashboard-image";
import {
  Button,
  Card,
  DataTable,
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
  return `${currency.format(value)} جنيه`;
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

function DateSegmentedControl() {
  return (
    <div className="hidden items-center gap-1 xl:flex">
      {[
        ["النهارده", ""],
        ["امبارح", ""],
        ["الأسبوع ده", "18 مايو - 24 مايو"],
        ["الشهر ده", "1 مايو - 24 مايو"],
        ["مخصص", ""],
      ].map(([label, sublabel], index) => (
        <button
          key={label}
          type="button"
          className={cn(
            "flex h-9 items-center justify-center gap-2 rounded-md border bg-background px-4 text-sm shadow-sm",
            sublabel && "flex-col gap-0 px-5 text-xs leading-none",
            index === 0 && "border-primary bg-primary text-primary-foreground",
          )}
        >
          <span className="inline-flex items-center gap-2">
            {label === "مخصص" ? <Calendar className="size-4" /> : null}
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
}: {
  children: React.ReactNode;
  tone?: "default" | "green" | "orange" | "red";
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md hover:bg-accent",
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

function OrdersMobileCards({
  orders,
  openMenu,
  onToggleMenu,
  onUpdateStatus,
  onDeleteOrder,
}: {
  orders: DashboardOrder[];
  openMenu: string | null;
  onToggleMenu: (orderNumber: string) => void;
  onUpdateStatus: (orderNumber: string, status: string) => void;
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
                    onClick={() => onUpdateStatus(order.number, "مؤكد")}
                    className="flex h-9 w-full items-center rounded-sm px-3 text-start hover:bg-accent"
                  >
                    تأكيد الطلب
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(order.number, "مكتمل")}
                    className="flex h-9 w-full items-center rounded-sm px-3 text-start hover:bg-accent"
                  >
                    تعيين كمكتمل
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(order.number, "ملغي")}
                    className="flex h-9 w-full items-center rounded-sm px-3 text-start text-destructive hover:bg-accent"
                  >
                    إلغاء الطلب
                  </button>
                  <div className="-mx-1 my-1 border-t" />
                  <button
                    type="button"
                    onClick={() => onDeleteOrder(order.number)}
                    className="flex h-9 w-full items-center rounded-sm px-3 text-start text-destructive hover:bg-accent"
                  >
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
        </article>
      ))}
    </div>
  );
}

export function OrdersPage() {
  const { showSnackbar } = useSnackbar();
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [filters, setFilters] = useState<OrderFilters>(defaultOrderFilters);
  const [activeDate, setActiveDate] = useState("today");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const visibleOrders = useMemo(
    () => orders.filter((order) => orderMatchesFilters(order, filters)),
    [filters, orders],
  );
  const statuses = useMemo(() => uniqueOrderValues(orders, "status"), [orders]);
  const types = useMemo(() => uniqueOrderValues(orders, "type"), [orders]);
  const payments = useMemo(() => uniqueOrderValues(orders, "payment"), [orders]);
  const waitingCount = orders.filter((order) => order.status === "قيد الانتظار").length;
  const completedCount = orders.filter((order) => order.status === "مكتمل").length;
  const cancelledCount = orders.filter((order) => order.status === "ملغي").length;

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

  async function updateStatus(orderNumber: string, status: string) {
    const previousOrders = orders;

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.number === orderNumber ? { ...order, status } : order,
      ),
    );
    setOpenMenu(null);
    setError("");

    try {
      const response = await fetch(
        `/api/dashboard/orders/${encodeURIComponent(orderNumber)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update order");
      }

      const data = (await response.json()) as { order: DashboardOrder };
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.number === data.order.number ? data.order : order,
        ),
      );
      showSnackbar({ message: "تم تحديث حالة الطلب." });
    } catch {
      setOrders(previousOrders);
      setError("تعذر تحديث حالة الطلب.");
      showSnackbar({
        message: "تعذر تحديث حالة الطلب.",
        tone: "danger",
      });
    }
  }

  async function deleteOrder(orderNumber: string) {
    const previousOrders = orders;
    const deletedOrderNumber = orderNumber;

    setOrders((currentOrders) =>
      currentOrders.filter((order) => order.number !== orderNumber),
    );
    setOpenMenu(null);
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
            <DateSegmentedControl />
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
          ["إجمالي الطلبات", String(orders.length), ShoppingCart, "text-primary"],
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
        <div className="mb-4 flex flex-wrap gap-2 xl:hidden">
          {[
            ["today", "النهارده"],
            ["yesterday", "امبارح"],
            ["week", "الأسبوع ده"],
            ["month", "الشهر ده"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveDate(key)}
              className={cn(
                "h-8 rounded-md border px-3 text-xs shadow-sm",
                activeDate === key && "border-primary bg-primary text-primary-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
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
            onUpdateStatus={updateStatus}
            onDeleteOrder={deleteOrder}
          />
        ) : (
          <div className="mt-4 flex h-24 items-center justify-center rounded-md border text-sm text-muted-foreground lg:hidden">
            لا توجد نتائج مطابقة.
          </div>
        )}
        <div className="mt-4 hidden overflow-hidden rounded-md border lg:block">
          <DataTable
            minWidth={1050}
            columnWidths={[42, 190, 190, 130, 150, 160, 140, 70]}
            headers={[
              "#",
              "رقم الطلب",
              "بيانات العميل",
              <button key="type" className="inline-flex items-center gap-2">
                نوع الطلب
                <ArrowUpDown className="size-4" />
              </button>,
              <button key="status" className="inline-flex items-center gap-2">
                حالة الطلب
                <ArrowUpDown className="size-4" />
              </button>,
              "السعر",
              "تاريخ الطلب",
              "",
            ]}
            rows={(loading ? [] : visibleOrders).map((order) => [
              <span key={`index-${order.number}`} className="block px-3">
                {order.index}
              </span>,
              <Link
                key={`number-${order.number}`}
                href={`/orders/view/${encodeURIComponent(order.number)}`}
                className="font-medium hover:text-primary"
              >
                {order.number}
              </Link>,
              <div key={`customer-${order.number}`}>
                <div>{order.customer}</div>
                <div className="text-xs text-muted-foreground">{order.phone}</div>
              </div>,
              order.type,
              <RefBadge
                key={`status-${order.number}`}
                tone={orderStatusTone(order.status)}
              >
                {order.status}
              </RefBadge>,
              <div key={`price-${order.number}`} className="flex items-center gap-2">
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
              </div>,
              <div key={`date-${order.number}`}>
                <div>{order.date}</div>
                <div className="text-xs text-muted-foreground">{order.time}</div>
              </div>,
              <div key={`actions-${order.number}`} className="relative flex justify-end">
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
                      onClick={() => updateStatus(order.number, "مؤكد")}
                      className="flex h-9 w-full items-center rounded-sm px-3 text-start hover:bg-accent"
                    >
                      تأكيد الطلب
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStatus(order.number, "مكتمل")}
                      className="flex h-9 w-full items-center rounded-sm px-3 text-start hover:bg-accent"
                    >
                      تعيين كمكتمل
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStatus(order.number, "ملغي")}
                      className="flex h-9 w-full items-center rounded-sm px-3 text-start text-destructive hover:bg-accent"
                    >
                      إلغاء الطلب
                    </button>
                    <div className="-mx-1 my-1 border-t" />
                    <button
                      type="button"
                      onClick={() => deleteOrder(order.number)}
                      className="flex h-9 w-full items-center rounded-sm px-3 text-start text-destructive hover:bg-accent"
                    >
                      حذف من القائمة
                    </button>
                  </div>
                ) : null}
              </div>,
            ])}
          />
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

  return (
    <div className="px-6 pb-10">
      <Card className="mt-4 flex min-h-[59px] items-center justify-between rounded-lg px-4">
        <div className="flex gap-2">
          <Button size="sm" onClick={() => showSnackbar({ message: "تم حفظ الطلب." })}>حفظ الطلب</Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => showSnackbar({ message: "تم حفظ الطلب ويمكنك إنشاء جديد." })}
          >
            حفظ وإنشاء جديد
          </Button>
        </div>
        <Link
          href="/orders"
          className="inline-flex size-[41px] items-center justify-center rounded-lg border bg-background hover:bg-accent"
          aria-label="الرجوع للطلبات"
        >
          ›
        </Link>
      </Card>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-6">
          <Card className="p-6">
            <div className="mb-6 flex items-center gap-3 text-xl font-semibold">
              <UserRound className="size-5" />
              بيانات العميل
            </div>
            <div className="mb-4 flex gap-2">
              <SelectBox className="h-10 flex-1">ابحث عن العميل بالاسم أو الموبايل...</SelectBox>
              <Button variant="outline" size="icon"><Plus className="size-4" /></Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="اسم العميل">
                <Input placeholder="اكتب اسم العميل" />
              </Field>
              <Field label="رقم الموبايل">
                <Input placeholder="رقم الموبايل" />
              </Field>
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">منتجات الطلب</h2>
              <Button>
                <Plus className="size-4" />
                إضافة منتج
              </Button>
            </div>
            <div className="flex h-[104px] items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
              مفيش منتجات في الطلب ده
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="mb-6 text-xl font-semibold">ملخص الطلب</h2>
            <div className="space-y-5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">الإجمالي الفرعي</span><span>0.00 جنيه</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">الخصم</span><span className="text-red-500">-0.00 جنيه</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">ضريبة القيمة المضافة (15%)</span><span>0.00 جنيه</span></div>
              <div className="border-t" />
              <div className="flex justify-between text-base font-semibold"><span>الإجمالي</span><span className="text-green-600">0.00 جنيه</span></div>
            </div>
          </Card>
        </div>

        <Card className="h-fit p-6">
          <h2 className="mb-8 text-xl font-semibold">بيانات الطلب</h2>
          <div className="space-y-6">
            <Field label="نوع الطلب">
              <SelectBox>استلام من الفرع</SelectBox>
            </Field>
            <div className="border-t" />
            <Field label="طريقة الدفع">
              <SelectBox>نقدي عند الاستلام</SelectBox>
            </Field>
            <div className="border-t" />
            <Field label="الفرع">
              <SelectBox>اختر الفرع</SelectBox>
            </Field>
            <div className="border-t" />
            <Field label="الخصم">
              <div className="relative">
                <Input defaultValue="0" className="pl-9" />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
              </div>
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
                <Input placeholder="0.00 جنيه" />
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

const offerImages = categoryRows.slice(0, 14).map((row) => row.image);
const offers = [
  ["1", "خصم 50%", "", "باكدج", "تطبيق تلقائي", "نشط", "14 مايو 2026 → 1 يونيو 2026"],
  ["2", "عرض منتجات الالبان", "", "باكدج", "تطبيق تلقائي", "نشط", "10 مايو 2026 → 1 يونيو 2026"],
  ["3", "عرض المعمول", "", "فلاش سيل", "تطبيق تلقائي", "نشط", "10 مايو 2026 → 1 يونيو 2026"],
  ["4", "عرض الحلويات", "", "باكدج", "تطبيق تلقائي", "منتهي", "1 مايو 2026 → 20 مايو 2026"],
  ["5", "عرض الفاكهه", "", "باكدج", "تطبيق تلقائي", "منتهي", "28 أبريل 2026 → 5 مايو 2026"],
  ["6", "عرض العسل", "", "باكدج", "تطبيق تلقائي", "منتهي", "27 أبريل 2026 → 21 مايو 2026"],
  ["7", "عرض الخضار", "", "باكدج", "تطبيق تلقائي", "منتهي", "25 أبريل 2026 → 4 مايو 2026"],
  ["8", "كوكتيل الصيف", "", "باكدج", "تطبيق تلقائي", "متوقف", "25 أبريل 2026 → 4 مايو 2026"],
  ["9", "عرض التوفير", "", "باكدج", "تطبيق تلقائي", "متوقف", "25 أبريل 2026 → 4 مايو 2026"],
  ["10", "عرض التوفير", "", "فلاش سيل", "تطبيق تلقائي", "متوقف", "26 أبريل 2026 → 7 مايو 2026"],
  ["11", "توصيل مجاني", "YALLA26", "توصيل مجاني", "كود خصم", "نشط", "20 أبريل 2026 → 26 مايو 2026"],
  ["12", "عرض الروقان", "", "فلاش سيل", "تطبيق تلقائي", "متوقف", "31 مارس 2026 → 1 مايو 2026"],
  ["13", "عرض المنظفات", "SAVE15", "فلاش سيل", "تطبيق تلقائي", "متوقف", "30 مارس 2026 → 30 أبريل 2026"],
  ["14", "عرض علي المشروبات", "", "خصم بالنسبة", "تطبيق تلقائي", "متوقف", "30 مارس 2026 → 30 أبريل 2026"],
] as const;

export function OffersPage() {
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
          ["إجمالي العروض", "14", Tag, "text-primary"],
          ["نشط", "8", CheckCircle2, "text-green-500"],
          ["مجدول", "0", Calendar, "text-orange-500"],
          ["منتهي", "0", XCircle, "text-destructive"],
        ]}
      />
      <div className="mt-6">
        <FilterBar
          className="border-b-0"
          disabled
          fields={[
            { label: "بحث", type: "search", placeholder: "ابحث في العروض...", width: "md:w-80" },
          ]}
        />
        <div className="mt-4 overflow-hidden rounded-md border">
          <DataTable
            minWidth={1080}
            columnWidths={[40, 78, 190, 170, 140, 120, 210, 128]}
            headers={["#", "", "العنوان", "نوع العرض", "طريقة التطبيق", "الحالة", "الفترة", "إجراءات"]}
            rows={offers.map((row, index) => [
              <span key={`idx-${row[0]}`} className="block px-3">{row[0]}</span>,
              offerImages[index] ? (
                <DashboardImage
                  key={`img-${row[0]}`}
                  src={offerImages[index]}
                  alt=""
                  width={40}
                  height={40}
                  sizes="40px"
                  className="size-10 rounded-md"
                />
              ) : (
                <div key={`blank-${row[0]}`} className="size-10 rounded-md bg-muted" />
              ),
              <div key={`title-${row[0]}`}>
                <div>{row[1]}</div>
                {row[2] ? <div className="text-xs text-muted-foreground">{row[2]}</div> : null}
              </div>,
              <RefBadge key={`type-${row[0]}`} tone="gray">{row[3]}</RefBadge>,
              <RefBadge key={`method-${row[0]}`} tone={row[4] === "كود خصم" ? "orange" : "purple"}>{row[4]}</RefBadge>,
              <RefBadge
                key={`status-${row[0]}`}
                tone={row[5] === "نشط" ? "green" : row[5] === "منتهي" ? "red" : "yellow"}
              >
                {row[5]}
              </RefBadge>,
              row[6],
              <div key={`actions-${row[0]}`} className="flex items-center gap-2">
                {row[5] === "متوقف" ? (
                  <MiniIconButton tone="green"><PlayCircle className="size-4" /></MiniIconButton>
                ) : row[5] === "نشط" ? (
                  <MiniIconButton tone="orange"><PauseCircle className="size-4" /></MiniIconButton>
                ) : null}
                <MiniIconButton><Edit className="size-4" /></MiniIconButton>
                <MiniIconButton tone="red"><Trash2 className="size-4" /></MiniIconButton>
              </div>,
            ])}
          />
        </div>
        <Pagination text="عرض 1-14 من 14 نتيجة" pages="1 / 1" nextDisabled />
      </div>
    </div>
  );
}

function UploadBox({
  arabic = false,
}: {
  arabic?: boolean;
}) {
  return (
    <div className="rounded-md border border-dashed p-4">
      <div className="flex h-[150px] flex-col items-center justify-center rounded-md bg-muted/30 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ImageIcon className="size-7" />
        </span>
        <div className="mt-4 text-sm font-medium">
          {arabic ? "انقر لتحميل صورة أو اسحب وأفلت" : "اضغط للتحميل أو اسحب الصورة هنا"}
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          {arabic ? "PNG, JPG, WEBP حتى 10MB" : "PNG, JPG, WEBP حتى 10 MB لكل صورة"}
        </div>
      </div>
    </div>
  );
}

export function CreateOfferPage() {
  const { showSnackbar } = useSnackbar();

  return (
    <div className="px-6 pb-10">
      <Card className="mt-4 flex min-h-[59px] items-center justify-between rounded-lg px-4">
        <Button size="sm" onClick={() => showSnackbar({ message: "تم إنشاء العرض بنجاح." })}>إنشاء</Button>
        <Link
          href="/offers"
          className="inline-flex size-[41px] items-center justify-center rounded-lg border bg-background hover:bg-accent"
          aria-label="الرجوع للعروض"
        >
          ›
        </Link>
      </Card>

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-4">
          <FormCard title="البيانات الأساسية">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="العنوان بالإنجليزي *"><Input placeholder="مثال: 20% Off All Pizzas" /></Field>
              <Field label="العنوان بالعربي"><Input dir="rtl" placeholder="مثلاً: خصم 20% على البيتزا" /></Field>
              <Field label="الوصف بالإنجليزي"><Textarea placeholder="وصف اختياري بالإنجليزي..." /></Field>
              <Field label="الوصف بالعربي"><Textarea dir="rtl" placeholder="وصف اختياري..." /></Field>
            </div>
          </FormCard>

          <FormCard title="نوع العرض وطريقة التطبيق">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="نوع العرض *"><SelectBox>خصم بالنسبة</SelectBox></Field>
              <Field label="طريقة التطبيق *"><SelectBox>تطبيق تلقائي</SelectBox></Field>
            </div>
            <div className="-mx-4 border-t" />
            <div className="text-sm text-muted-foreground">إعدادات حسب نوع العرض</div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="قيمة الخصم *">
                <div className="relative"><Input defaultValue="20" className="pl-8" /><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span></div>
              </Field>
              <Field label="أقصى خصم (جنيه)"><Input defaultValue="50" /></Field>
            </div>
            <Field label="المنتجات المطبقة">
                <div className="relative"><Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="ps-9" placeholder="اضغط لاختيار المنتجات..." /></div>
            </Field>
            <Field label="الفئات المطبقة">
              <div className="relative"><Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="ps-9" placeholder="اضغط لاختيار الفئات..." /></div>
            </Field>
            <Field label="الفئات الفرعية المطبقة">
              <div className="relative"><Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="ps-9" placeholder="اضغط لاختيار الفئات الفرعية..." /></div>
            </Field>
          </FormCard>

          <FormCard title="الاستهداف">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="أقل قيمة طلب (جنيه)"><Input defaultValue="100" /></Field>
              <Field label="شريحة العملاء"><SelectBox>كل العملاء</SelectBox></Field>
            </div>
            <Field label="الفروع المطبقة"><SelectBox>اختر الفروع...</SelectBox></Field>
            <p className="text-xs text-muted-foreground">سيبها فاضية عشان العرض يتطبق على كل الفروع</p>
            <div>
              <div className="mb-3 text-sm font-medium">أنواع الطلبات</div>
              <div className="flex flex-wrap gap-4 text-sm">
                {["توصيل", "استلام", "داخل الفرع"].map((label) => (
                  <label key={label} className="flex items-center gap-2">
                    <input type="checkbox" className="size-4 rounded border" />
                    {label}
                  </label>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">سيبها من غير تحديد عشان العرض يتطبق على كل أنواع الطلبات</p>
            </div>
          </FormCard>

          <FormCard title="الجدولة">
            <div className="text-xs font-semibold uppercase text-muted-foreground">الفترة</div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="تاريخ البداية *"><Input type="date" /></Field>
              <Field label="تاريخ النهاية *"><Input type="date" /></Field>
            </div>
            <div className="text-xs font-semibold uppercase text-muted-foreground">نافذة الوقت اليومية</div>
            <p className="text-xs text-muted-foreground">اختياري. حدد ساعات معينة لتفعيل العرض كل يوم.</p>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="بداية الوقت"><Input type="time" /></Field>
              <Field label="نهاية الوقت"><Input type="time" /></Field>
            </div>
            <div>
              <div className="mb-3 text-sm font-medium">أيام التفعيل</div>
              <div className="flex flex-wrap gap-4 text-sm">
                {["الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"].map((label) => (
                  <label key={label} className="flex items-center gap-2">
                    <input type="checkbox" className="size-4 rounded border" />
                    {label}
                  </label>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">سيبها من غير تحديد عشان العرض يتطبق كل الأيام</p>
            </div>
          </FormCard>
        </div>

        <div className="flex flex-col gap-4">
          <FormCard title="صورة الغلاف">
            <UploadBox arabic />
            <p className="text-xs text-muted-foreground">المقاس المقترح: 800 x 300 px، WebP، أقل من 150 KB بنسبة 8:3</p>
          </FormCard>
          <FormCard title="معرض العرض"><UploadBox /></FormCard>
          <FormCard title="حدود الاستخدام">
            <Field label="إجمالي مرات الاستخدام"><Input placeholder="غير محدود" /></Field>
            <p className="text-xs text-muted-foreground">أقصى عدد مرات استخدام للعرض. سيبها فاضية لو غير محدود.</p>
            <Field label="الحد لكل عميل"><Input placeholder="غير محدود" /></Field>
            <p className="text-xs text-muted-foreground">أقصى عدد مرات استخدام لنفس العميل. سيبها فاضية لو غير محدود.</p>
          </FormCard>
          <FormCard title="العرض والحالة">
            <Field label="الأولوية"><Input defaultValue="0" /></Field>
            <p className="text-xs text-muted-foreground">الرقم الأعلى بيتراجع الأول لما يكون فيه أكتر من عرض مناسب</p>
            <div className="flex min-h-[98px] items-center justify-between rounded-lg border p-4">
              <div>
                <div className="text-base font-medium">عرض مميز</div>
                <p className="mt-2 text-sm text-muted-foreground">إظهار العرض بشكل أوضح في تطبيق العملاء</p>
              </div>
              <Switch checked={false} />
            </div>
          </FormCard>
        </div>
      </div>
    </div>
  );
}
