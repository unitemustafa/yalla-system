"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Banknote,
  Check,
  ChevronDown,
  ClipboardList,
  CreditCard,
  LockKeyhole,
  MapPin,
  PackageCheck,
  Phone,
  ReceiptText,
  Truck,
  UserRound,
  X,
} from "lucide-react";

import { Badge, Card } from "../primitives";
import { useSnackbar } from "../snackbar";
import { cn } from "@/lib/utils";
import type { DashboardOrder } from "@/lib/dashboard-store";

const currency = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const orderSteps = ["قيد الانتظار", "مؤكد", "قيد التجهيز", "جاهز", "مكتمل"] as const;

type OrderStatus = (typeof orderSteps)[number];

type OrderProduct = {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
};

type OrderCourier = {
  name: string;
  phone: string;
  vehicle: string;
  plateNumber: string;
  zone: string;
  status: string;
};

const demoOrderProducts: Record<string, OrderProduct[]> = {
  "ORD-20260524-UEETJE": [
    { name: "وجبه بلطي", description: "مشوي مع سلطة وطحينة", quantity: 1, unitPrice: 70 },
    { name: "طبق ارز جمبري", description: "طبق جانبي", quantity: 1, unitPrice: 60 },
    { name: "إضافة تغليف", quantity: 1, unitPrice: 5 },
  ],
  "ORD-20260524-YY3TSD": [
    {
      name: "وجبه ارز جمبري+قطعه بوري كبيره+سلطه+عيش+1شربه",
      quantity: 1,
      unitPrice: 170,
    },
    { name: "وجبه بلطي", quantity: 1, unitPrice: 110 },
    { name: "سفرديا مشوي", quantity: 1, unitPrice: 160 },
  ],
  "ORD-20260524-GK41OD": [
    { name: "جمبري جمبو مشوي", quantity: 1, unitPrice: 800 },
    { name: "جمبري مقلي وسط", quantity: 1, unitPrice: 500 },
    { name: "طبق ارز جمبري", quantity: 1, unitPrice: 145 },
  ],
  "ORD-20260524-V374YK": [
    { name: "وجبه بلطي", quantity: 2, unitPrice: 70 },
    { name: "سفرديا مشوي", quantity: 1, unitPrice: 160 },
    { name: "طبق ارز", quantity: 2, unitPrice: 30 },
    { name: "سلطة وطحينة", quantity: 1, unitPrice: 54 },
  ],
  "ORD-20260524-D2W0RJ": [
    { name: "ماكريل", description: "مشوي", quantity: 1, unitPrice: 250 },
  ],
};

const defaultOrderCourier: OrderCourier = {
  name: "كابتن مصطفى علي",
  phone: "+201001234567",
  vehicle: "موتوسيكل",
  plateNumber: "ق ر ب 2481",
  zone: "التل الكبير",
  status: "في الطريق",
};

const demoOrderCouriers: Record<string, OrderCourier> = {
  "ORD-20260524-UEETJE": defaultOrderCourier,
  "ORD-20260524-YY3TSD": {
    name: "كابتن أحمد سامي",
    phone: "+201130309753",
    vehicle: "موتوسيكل",
    plateNumber: "س د ن 3194",
    zone: "التل الكبير",
    status: "استلم الطلب",
  },
  "ORD-20260524-GK41OD": {
    name: "كابتن محمود حسن",
    phone: "+201127466586",
    vehicle: "موتوسيكل",
    plateNumber: "ط ل ب 5702",
    zone: "التل الكبير",
    status: "جاهز للتسليم",
  },
};

function formatCurrency(value: number) {
  return `${currency.format(value)} EGP`;
}

function productsForOrder(order: DashboardOrder & { products?: OrderProduct[] }) {
  if (order.products?.length) {
    return order.products;
  }

  return (
    demoOrderProducts[order.number] ?? [
      {
        name: "منتج الطلب",
        description: `${order.type} · ${order.payment}`,
        quantity: 1,
        unitPrice: order.total,
      },
    ]
  );
}

function normalizeOrderStatus(status: string): OrderStatus {
  return orderSteps.includes(status as OrderStatus)
    ? (status as OrderStatus)
    : orderSteps[0];
}

function currentStepIndex(status: string) {
  const index = orderSteps.indexOf(normalizeOrderStatus(status));

  return index >= 0 ? index : 0;
}

function orderDeliveryFee(order: DashboardOrder) {
  return order.type.includes("توصيل") ? 25 : 0;
}

function courierForOrder(order: DashboardOrder) {
  if (!order.type.includes("توصيل")) {
    return null;
  }

  return demoOrderCouriers[order.number] ?? defaultOrderCourier;
}

function courierInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join("");
}

type MoneyStatTone = "default" | "green" | "amber";

const moneyStatToneStyles: Record<
  MoneyStatTone,
  {
    accent: string;
    icon: string;
    value: string;
  }
> = {
  default: {
    accent: "bg-primary",
    icon: "bg-primary/10 text-primary ring-primary/10",
    value: "text-foreground",
  },
  amber: {
    accent: "bg-amber-500",
    icon: "bg-amber-500/10 text-amber-500 ring-amber-500/10",
    value: "text-amber-600 dark:text-amber-300",
  },
  green: {
    accent: "bg-emerald-500",
    icon: "bg-emerald-500/10 text-emerald-500 ring-emerald-500/10",
    value: "text-emerald-600 dark:text-emerald-300",
  },
};

function AmountSummaryItem({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone?: MoneyStatTone;
}) {
  const styles = moneyStatToneStyles[tone];

  return (
    <div className="flex min-h-16 min-w-0 items-center justify-between gap-3 rounded-md px-3 py-2 transition hover:bg-background/60">
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-md ring-4",
          styles.icon,
        )}
      >
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 text-end">
        <span className="block text-xs font-semibold text-muted-foreground">
          {label}
        </span>
        <span
          dir="ltr"
          className={cn(
            "mt-1 block truncate text-base font-bold tabular-nums",
            styles.value,
          )}
        >
          {value}
        </span>
      </span>
    </div>
  );
}

function DetailRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <div className="flex min-h-10 items-center justify-between gap-4 rounded-md bg-muted/25 px-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("min-w-0 text-start", strong && "text-lg font-semibold")}>
        {value}
      </span>
    </div>
  );
}

function InfoPanel({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card className="overflow-hidden rounded-lg">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((currentOpen) => !currentOpen)}
        className={cn(
          "flex min-h-14 w-full items-center justify-between gap-3 bg-muted/25 px-5 text-start transition hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25",
          open && "border-b",
        )}
      >
        <span className="flex items-center gap-2">
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform duration-200",
              open && "rotate-180",
            )}
          />
          <span className="text-sm font-semibold">{title}</span>
        </span>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="grid gap-3 p-5 text-sm">{children}</div>
        </div>
      </div>
    </Card>
  );
}

function StatusTimeline({
  activeStep,
  order,
}: {
  activeStep: number;
  order: DashboardOrder;
}) {
  return (
    <Card className="overflow-hidden rounded-lg">
      <div className="flex flex-col gap-2 border-b bg-muted/20 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500">
            <PackageCheck className="size-5" />
          </span>
          <div>
            <h2 className="text-base font-semibold">مسار الطلب</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              آخر تحديث {order.time} · {order.date}
            </p>
          </div>
        </div>
        <div className="self-start md:self-center">
          <Badge tone="green">{orderSteps[activeStep]}</Badge>
        </div>
      </div>

      <ol className="grid gap-y-5 px-5 py-6 md:grid-cols-5 md:gap-y-0">
        {orderSteps.map((step, index) => {
          const isReached = index <= activeStep;
          const isActive = index === activeStep;
          const isConnectorReached = index < activeStep;

          return (
            <li
              key={step}
              className="relative flex min-w-0 items-start gap-3 text-sm md:flex-col md:items-center md:gap-3 md:text-center"
            >
              {index < orderSteps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute start-[15px] top-8 z-0 h-[calc(100%+1.25rem)] w-0.5 transition-colors md:start-auto md:right-1/2 md:top-4 md:h-0.5 md:w-full",
                    isConnectorReached ? "bg-emerald-500" : "bg-border",
                  )}
                />
              ) : null}
              <span
                className={cn(
                  "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                  isReached
                    ? "border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-500/25"
                    : "border-border bg-card text-muted-foreground",
                  isActive && "ring-4 ring-emerald-500/10",
                )}
              >
                {isReached ? <Check className="size-4 stroke-[3]" /> : null}
              </span>
              <div className="min-w-0 text-right md:text-center">
                <div
                  className={cn(
                    "font-semibold transition-colors",
                    isReached
                      ? "text-emerald-600 dark:text-emerald-300"
                      : "text-muted-foreground",
                  )}
                >
                  {step}
                </div>
                <time
                  className={cn(
                    "mt-0.5 block text-xs",
                    isReached
                      ? "text-emerald-600/75 dark:text-emerald-300/75"
                      : "text-muted-foreground/60",
                  )}
                >
                  {isReached ? `${order.time} · ${order.date}` : "في الانتظار"}
                </time>
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

export function OrderDetailPage({ order }: { order: DashboardOrder }) {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [currentStatus, setCurrentStatus] = useState(() =>
    normalizeOrderStatus(order.status),
  );
  const [savingStatus, setSavingStatus] = useState(false);
  const activeStep = currentStepIndex(currentStatus);
  const orderProducts = productsForOrder(order);
  const productsSubtotal = orderProducts.reduce(
    (total, product) => total + product.unitPrice * product.quantity,
    0,
  );
  const deliveryFee = orderDeliveryFee(order);
  const finalTotal = productsSubtotal + deliveryFee;
  const assignedCourier = courierForOrder(order);

  async function updateOrderStatus(nextStatus: OrderStatus) {
    if (nextStatus === currentStatus || savingStatus) {
      return;
    }

    const previousStatus = currentStatus;
    setCurrentStatus(nextStatus);
    setSavingStatus(true);

    try {
      const response = await fetch(
        `/api/dashboard/orders/${encodeURIComponent(order.number)}`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      const data = (await response.json()) as { order?: DashboardOrder };
      const savedStatus = data.order?.status
        ? normalizeOrderStatus(data.order.status)
        : nextStatus;

      setCurrentStatus(savedStatus);
      router.refresh();
      showSnackbar({ message: `تم تحديث حالة الطلب إلى ${savedStatus}.` });
    } catch {
      setCurrentStatus(previousStatus);
      showSnackbar({
        message: "تعذر تحديث حالة الطلب. حاول مرة أخرى.",
        tone: "danger",
      });
    } finally {
      setSavingStatus(false);
    }
  }

  return (
    <div className="px-4 py-5 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
            <span>الطلبات</span>
            <span>/</span>
            <span className="text-foreground">تفاصيل الطلب</span>
          </div>
          <h1 className="flex min-w-0 flex-wrap items-center gap-3 text-2xl font-bold leading-8 tracking-normal">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <ClipboardList className="size-5" />
            </span>
            <span dir="ltr" className="min-w-0 break-all">
              #{order.number}
            </span>
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{order.date} الساعة {order.time}</span>
            <Badge>{order.type}</Badge>
            <Badge tone="blue">{currentStatus}</Badge>
            <Badge tone="secondary">{order.payment}</Badge>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/orders"
            aria-label="إغلاق تفاصيل الطلب"
            className="inline-flex size-10 items-center justify-center rounded-md border bg-background shadow-sm transition hover:bg-accent hover:text-accent-foreground"
          >
            <X className="size-4" />
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <StatusTimeline activeStep={activeStep} order={order} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:[direction:ltr]">
        <Card className="overflow-hidden rounded-lg xl:[direction:rtl]">
          <div className="flex min-h-16 flex-col gap-3 border-b bg-muted/20 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <ClipboardList className="size-5" />
              </span>
              <div>
                <h2 className="text-base font-semibold">منتجات الطلب</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {orderProducts.length} عنصر في هذا الطلب
                </p>
              </div>
            </div>
            <div className="text-sm font-semibold text-emerald-500">
              {formatCurrency(finalTotal)}
            </div>
          </div>

          <div className="p-5">
            <div className="grid gap-3 md:hidden">
              {orderProducts.map((product, index) => (
                <div
                  key={`${product.name}-${index}`}
                  className="rounded-md border border-border/80 bg-muted/15 p-3"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <PackageCheck className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold leading-6">{product.name}</div>
                        {product.description ? (
                          <div className="text-xs leading-5 text-muted-foreground">
                            {product.description}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      #{index + 1}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded-md bg-background/45 p-2">
                      <div className="text-muted-foreground">سعر الوحدة</div>
                      <div className="mt-1 font-semibold">
                        {formatCurrency(product.unitPrice)}
                      </div>
                    </div>
                    <div className="rounded-md bg-background/45 p-2">
                      <div className="text-muted-foreground">الكمية</div>
                      <div className="mt-1 font-semibold">{product.quantity}</div>
                    </div>
                    <div className="rounded-md bg-background/45 p-2">
                      <div className="text-muted-foreground">الإجمالي</div>
                      <div className="mt-1 font-semibold">
                        {formatCurrency(product.unitPrice * product.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto rounded-md border border-border/80 md:block">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b bg-muted/35">
                    <th className="w-14 px-4 py-3 text-start text-xs font-semibold text-muted-foreground">
                      #
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-semibold text-muted-foreground">
                      المنتج
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-semibold text-muted-foreground">
                      سعر الوحدة
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-semibold text-muted-foreground">
                      الكمية
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-semibold text-muted-foreground">
                      الإجمالي
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orderProducts.map((product, index) => (
                    <tr
                      key={`${product.name}-${index}`}
                      className="border-b last:border-0 hover:bg-muted/20"
                    >
                      <td className="px-4 py-4 align-top text-muted-foreground">
                        {index + 1}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex items-start gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <PackageCheck className="size-4" />
                          </span>
                          <div className="min-w-0">
                            <div className="font-semibold leading-6">{product.name}</div>
                            {product.description ? (
                              <div className="text-xs leading-5 text-muted-foreground">
                                {product.description}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        {formatCurrency(product.unitPrice)}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <span className="inline-flex min-w-9 items-center justify-center rounded-md bg-muted/40 px-2 py-1 font-semibold">
                          {product.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-4 align-top font-semibold">
                        {formatCurrency(product.unitPrice * product.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 grid gap-2 rounded-lg border border-border/70 bg-muted/20 p-2 text-sm md:grid-cols-3">
              <AmountSummaryItem
                icon={ReceiptText}
                label="إجمالي المنتجات"
                value={formatCurrency(productsSubtotal)}
              />
              <AmountSummaryItem
                icon={Truck}
                label="رسوم التوصيل"
                value={formatCurrency(deliveryFee)}
                tone="amber"
              />
              <AmountSummaryItem
                icon={Banknote}
                label="إجمالي الطلب"
                value={formatCurrency(finalTotal)}
                tone="green"
              />
            </div>
          </div>
        </Card>

        <div className="grid content-start gap-4 xl:[direction:rtl]">
          <InfoPanel title="حالة الطلب" icon={LockKeyhole}>
            <div className="flex items-center justify-between gap-3 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
              <div>
                <div className="text-xs text-muted-foreground">الحالة الحالية</div>
                <div className="mt-1 font-semibold text-emerald-500">{currentStatus}</div>
              </div>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-emerald-500 text-white">
                <Check className="size-4 stroke-[3]" />
              </span>
            </div>
            <div className="grid gap-2">
              <div className="text-xs font-semibold text-muted-foreground">
                تغيير الحالة
              </div>
              <div className="grid grid-cols-2 gap-2">
                {orderSteps.map((status) => {
                  const selected = status === currentStatus;

                  return (
                    <button
                      key={status}
                      type="button"
                      disabled={savingStatus}
                      onClick={() => updateOrderStatus(status)}
                      className={cn(
                        "min-h-10 rounded-md border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-60",
                        selected
                          ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-500"
                          : "border-border/80 bg-background/40 text-muted-foreground hover:border-primary/30 hover:bg-primary/10 hover:text-primary",
                      )}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>
              <div className="min-h-5 text-xs text-muted-foreground">
                {savingStatus ? "جار حفظ الحالة..." : "اختر الحالة الجديدة وسيتم حفظها فورًا."}
              </div>
            </div>
          </InfoPanel>

          {assignedCourier ? (
            <InfoPanel title="طيار الطلب" icon={Truck}>
              <div className="flex items-center justify-between gap-3 rounded-md border border-primary/20 bg-primary/10 px-4 py-3">
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">المندوب الحالي</div>
                  <div className="mt-1 truncate font-semibold text-primary">
                    {assignedCourier.name}
                  </div>
                </div>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
                  {courierInitials(assignedCourier.name)}
                </span>
              </div>
              <DetailRow
                label="رقم الموبايل"
                value={
                  <span dir="ltr" className="inline-flex items-center gap-2">
                    <Phone className="size-3.5 text-primary" />
                    {assignedCourier.phone}
                  </span>
                }
              />
              <DetailRow label="المركبة" value={assignedCourier.vehicle} />
              <DetailRow label="رقم اللوحة" value={assignedCourier.plateNumber} />
              <DetailRow label="منطقة العمل" value={assignedCourier.zone} />
              <DetailRow
                label="حالة التوصيل"
                value={
                  <span className="inline-flex rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-500">
                    {assignedCourier.status}
                  </span>
                }
              />
            </InfoPanel>
          ) : null}

          <InfoPanel title="بيانات العميل" icon={UserRound}>
            <DetailRow label="الاسم" value={order.customer} />
            <DetailRow
              label="رقم الموبايل"
              value={
                <span dir="ltr" className="inline-flex items-center gap-2">
                  <Phone className="size-3.5 text-primary" />
                  {order.phone}
                </span>
              }
            />
          </InfoPanel>

          <InfoPanel title="تفاصيل الدفع" icon={CreditCard}>
            <DetailRow label="طريقة الدفع" value={order.payment} />
            <DetailRow label="نوع الطلب" value={order.type} />
          </InfoPanel>

          <InfoPanel title="عنوان التوصيل" icon={MapPin}>
            <DetailRow label="منطقة التوصيل" value="السلام" />
            <DetailRow label="اسم العنوان" value="السلام" />
            <DetailRow label="المدينة" value="Eltall Elkbier" />
          </InfoPanel>
        </div>
      </div>
    </div>
  );
}
