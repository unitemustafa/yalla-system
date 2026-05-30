"use client";

import Link from "next/link";
import { Check, ClipboardList, LockKeyhole, X } from "lucide-react";

import {
  Badge,
  Card,
  CardHeader,
  Row,
  SideInfo,
} from "../primitives";
import { cn } from "@/lib/utils";
import type { DashboardOrder } from "@/lib/dashboard-store";

const currency = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const orderSteps = ["قيد الانتظار", "مؤكد", "قيد التجهيز", "جاهز", "مكتمل"];

type OrderProduct = {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
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

function normalizeOrderStatus(status: string) {
  return orderSteps.includes(status) ? status : orderSteps[0];
}

function currentStepIndex(status: string) {
  const index = orderSteps.indexOf(normalizeOrderStatus(status));

  return index >= 0 ? index : 0;
}

function orderDeliveryFee(order: DashboardOrder) {
  return order.type.includes("توصيل") ? 25 : 0;
}

export function OrderDetailPage({ order }: { order: DashboardOrder }) {
  const currentStatus = normalizeOrderStatus(order.status);
  const activeStep = currentStepIndex(currentStatus);
  const orderProducts = productsForOrder(order);
  const productsSubtotal = orderProducts.reduce(
    (total, product) => total + product.unitPrice * product.quantity,
    0,
  );
  const deliveryFee = orderDeliveryFee(order);
  const finalTotal = productsSubtotal + deliveryFee;
  const estimatedDeliveryTime = deliveryFee > 0 ? "30 - 45 دقيقة" : "استلام من الفرع";

  return (
    <div className="px-8 py-6">
      <Card className="mb-6 flex flex-col items-center justify-between gap-4 px-6 py-4 md:flex-row">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-semibold">
            <ClipboardList className="size-5" />
            رقم الطلب #{order.number}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>
              {order.date} الساعة {order.time}
            </span>
            <span>-</span>
            <Badge>{order.type}</Badge>
            <Badge tone="blue">{currentStatus}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/orders"
            className="inline-flex size-9 items-center justify-center rounded-md border bg-background shadow-sm hover:bg-accent"
          >
            <X className="size-4" />
          </Link>
        </div>
      </Card>

      <Card className="mb-6 p-6">
        <ol className="grid gap-y-6 md:grid-cols-5 md:gap-y-0">
          {orderSteps.map((step, index) => {
            const isReached = index <= activeStep;
            const isConnectorReached = index < activeStep;

            return (
              <li
                key={step}
                className="relative flex min-w-0 items-start gap-3 text-sm md:flex-col md:items-center md:gap-2 md:text-center"
              >
                {index < orderSteps.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute start-[13px] top-7 z-0 h-[calc(100%+1.5rem)] w-0.5 transition-colors md:start-auto md:right-1/2 md:top-3.5 md:h-0.5 md:w-full",
                      isConnectorReached ? "bg-emerald-500" : "bg-border",
                    )}
                  />
                ) : null}
                <span
                  className={cn(
                    "relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    isReached
                      ? "border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-500/20"
                      : "border-border bg-card text-muted-foreground",
                  )}
                >
                  {isReached ? <Check className="size-4 stroke-[3]" /> : null}
                </span>
                <div className="min-w-0 text-right md:text-center">
                  <div
                    className={cn(
                      "font-medium transition-colors",
                      isReached
                        ? "text-emerald-600 dark:text-emerald-300"
                        : "text-muted-foreground",
                    )}
                  >
                    {step}
                  </div>
                  {isReached ? (
                    <time className="text-xs text-emerald-600/80 dark:text-emerald-300/80">
                      {order.time} · {order.date}
                    </time>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1fr_368px]">
        <Card>
          <CardHeader
            title="منتجات الطلب"
            icon={<ClipboardList className="size-5" />}
          />
          <div className="p-6">
            <div className="overflow-hidden rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="p-3 text-start">#</th>
                    <th className="p-3 text-start">منتجات الطلب</th>
                    <th className="p-3 text-start">الإجمالي الفرعي</th>
                    <th className="p-3 text-start">الكمية</th>
                    <th className="p-3 text-start">قيمة المنتج</th>
                  </tr>
                </thead>
                <tbody>
                  {orderProducts.map((product, index) => (
                    <tr key={`${product.name}-${index}`}>
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3">
                        <div className="font-medium">{product.name}</div>
                        {product.description ? (
                          <div className="text-xs text-muted-foreground">
                            {product.description}
                          </div>
                        ) : null}
                      </td>
                      <td className="p-3">{formatCurrency(product.unitPrice)}</td>
                      <td className="p-3">{product.quantity}</td>
                      <td className="p-3">
                        {formatCurrency(product.unitPrice * product.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex flex-col gap-3 rounded-lg bg-muted/30 p-4 text-sm">
              <Row label="إجمالي المنتجات" value={formatCurrency(productsSubtotal)} />
              <Row label="رسوم التوصيل" value={formatCurrency(deliveryFee)} />
              <Row label="وقت التوصيل المتوقع" value={estimatedDeliveryTime} />
              <Row label="إجمالي الطلب" value={formatCurrency(finalTotal)} strong />
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <SideInfo title="حالة الطلب">
            <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-4 py-3">
              <div>
                <div className="text-xs text-muted-foreground">الحالة الحالية</div>
                <div className="mt-1 font-semibold">{currentStatus}</div>
              </div>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <LockKeyhole className="size-4" />
              </span>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              تغيير حالة الطلب مقفول من هذه الصفحة.
            </p>
          </SideInfo>
          <SideInfo title="بيانات العميل">
            <Row label="الاسم" value={order.customer} />
            <Row label="رقم الموبايل" value={order.phone} />
          </SideInfo>
          <SideInfo title="عنوان التوصيل">
            <Row label="منطقة التوصيل" value="السلام" />
            <Row label="اسم العنوان" value="السلام" />
            <Row label="المدينة" value="Eltall Elkbier" />
          </SideInfo>
        </div>
      </div>
    </div>
  );
}
