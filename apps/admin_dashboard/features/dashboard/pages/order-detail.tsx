"use client";

import Link from "next/link";
import { ClipboardList, Edit, X } from "lucide-react";

import {
  Badge,
  Button,
  Card,
  CardHeader,
  Field,
  Pagination,
  Row,
  SelectBox,
  SideInfo,
} from "../primitives";
import { cn } from "@/lib/utils";
import type { DashboardOrder } from "@/lib/dashboard-store";

const currency = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const orderSteps = ["قيد الانتظار", "مؤكد", "قيد التجهيز", "جاهز", "مكتمل"];

function formatCurrency(value: number) {
  return `${currency.format(value)} جنيه`;
}

function currentStepIndex(status: string) {
  const index = orderSteps.indexOf(status);

  return index >= 0 ? index : 1;
}

export function OrderDetailPage({ order }: { order: DashboardOrder }) {
  const activeStep = currentStepIndex(order.status);

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
            <Badge tone="blue">{order.status}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-10 px-8" disabled>
            <Edit className="size-4" />
            حفظ التعديلات
          </Button>
          <Link
            href="/orders"
            className="inline-flex size-9 items-center justify-center rounded-md border bg-background shadow-sm hover:bg-accent"
          >
            <X className="size-4" />
          </Link>
        </div>
      </Card>

      <Card className="mb-6 p-6">
        <ol className="grid gap-3 md:grid-cols-5">
          {orderSteps.map(
            (step, index) => (
              <li
                key={step}
                className="relative flex items-center justify-center text-center text-sm"
              >
                <div
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full border",
                    index <= activeStep
                      ? "bg-primary text-primary-foreground"
                      : "bg-background",
                  )}
                />
                <div className="mr-2 text-right">
                  <div>{step}</div>
                  {index <= activeStep ? (
                    <time className="text-xs text-muted-foreground">
                      {order.time} · {order.date}
                    </time>
                  ) : null}
                </div>
              </li>
            ),
          )}
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
                    <th className="p-3 text-start">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3">1</td>
                    <td className="p-3">
                      إجمالي الطلب
                      <div className="text-xs text-muted-foreground">
                        {order.type} · {order.payment}
                      </div>
                    </td>
                    <td className="p-3">{formatCurrency(order.total)}</td>
                    <td className="p-3">1</td>
                    <td className="p-3">{formatCurrency(order.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <Pagination text="عرض 1 من 1 نتيجة" pages="1 / 1" nextDisabled />
            <div className="mt-6 flex flex-col gap-3 rounded-lg bg-muted/30 p-4 text-sm">
              <Row label="الإجمالي الفرعي" value={formatCurrency(order.total)} />
              <Row label="رسوم التوصيل" value="ضمن الإجمالي" />
              <Row label="وقت التوصيل المتوقع" value="حسب منطقة التوصيل" />
              <Row label="الإجمالي" value={formatCurrency(order.total)} strong />
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <SideInfo title="حالة الطلب">
            <Field label="تغيير الحالة">
              <SelectBox>{order.status}</SelectBox>
            </Field>
            <div className="mt-3 flex flex-wrap gap-2">
              {orderSteps.map(
                (s) => (
                  <Badge key={s} tone={s === order.status ? "blue" : "secondary"}>
                    {s}
                  </Badge>
                ),
              )}
            </div>
            <Field label="ملاحظة الطلب (اختياري)">
              <textarea className="min-h-[72px] rounded-md border bg-input p-2" />
            </Field>
          </SideInfo>
          <SideInfo title="بيانات العميل">
            <Row label="الاسم" value={order.customer} />
            <Row label="رقم الموبايل" value={order.phone} />
          </SideInfo>
          <SideInfo title="بيانات الطلب">
            <Row label="طريقة الدفع" value={order.payment} />
            <Row label="نوع الطلب" value={<Badge>{order.type}</Badge>} />
            <Row label="الفرع" value="اول اونلاين ماركت في التل الكبير" />
          </SideInfo>
          <SideInfo title="عنوان التوصيل">
            <Row label="منطقة التوصيل" value="السلام" />
            <Row label="اسم العنوان" value="السلام" />
            <Row label="المدينة" value="Eltall Elkbier" />
            <Row label="الإحداثيات" value="0, 0" />
          </SideInfo>
        </div>
      </div>
    </div>
  );
}
