"use client";

import { useState } from "react";
import {
  ArrowUpDown,
  Box,
  CheckCircle2,
  Clock3,
  DollarSign,
  GripVertical,
  MapPin,
  MoreHorizontal,
  Plus,
  SlidersHorizontal,
  X,
  XCircle,
} from "lucide-react";

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
} from "../primitives";
import { deliveryZones } from "@/features/dashboard/reference-data";
import { cn } from "@/lib/utils";

function RefBadge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "green" | "blue" | "red";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold leading-none",
        tone === "green" &&
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200",
        tone === "blue" &&
          "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200",
        tone === "red" &&
          "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-200",
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
    <div className="mt-6 grid gap-3 md:grid-cols-3">
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

function formatReferenceCurrency(value: number) {
  return `${value.toFixed(2)} جنيه`;
}

function ZoneCreateView({ onBack }: { onBack: () => void }) {
  return (
    <div className="px-6 pb-10">
      <Card className="mt-4 flex min-h-[59px] items-center justify-between rounded-lg px-4">
        <div className="flex gap-2">
          <Button size="sm">إنشاء منطقة جديدة</Button>
          <Button variant="outline" size="sm">إعادة ضبط التغييرات</Button>
        </div>
        <button
          onClick={onBack}
          className="inline-flex size-[41px] items-center justify-center rounded-lg border bg-background hover:bg-accent"
          aria-label="الرجوع لمناطق التوصيل"
        >
          ›
        </button>
      </Card>

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex flex-col gap-4">
          <FormCard title="البيانات الأساسية">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="اسم المنطقة بالإنجليزي *">
                <Input defaultValue="Downtown Area" />
              </Field>
              <Field label="اسم المنطقة بالعربي *">
                <Input dir="rtl" defaultValue="منطقة وسط المدينة" />
              </Field>
              <Field label="المدينة *">
                <Input defaultValue="Cairo" />
              </Field>
              <Field label="الوصف">
                <textarea
                  defaultValue="منطقة توصيل وسط المدينة الرئيسية"
                  className="min-h-[60px] w-full rounded-md border border-border bg-input px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </Field>
            </div>
          </FormCard>

          <FormCard title="منطقة التوصيل *">
            <p className="text-sm text-muted-foreground">
              ارسم حدود منطقة التوصيل على الخريطة، وهيتم حساب المركز تلقائيًا.
            </p>
            <div className="relative flex h-[598px] items-center justify-center rounded-md border bg-muted/20">
              <div className="flex flex-col items-center text-sm text-muted-foreground">
                <span className="mb-4 size-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
                جار تحميل الخريطة...
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 border-t bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                <MapPin className="size-4" />
                ارسم حدود منطقة التوصيل على الخريطة، وهيتم حساب المركز تلقائيًا.
              </div>
            </div>
          </FormCard>
        </div>

        <FormCard title="إعدادات التوصيل" right={<Box className="size-4" />}>
          <Field label="رسوم التوصيل *">
            <div className="relative">
              <DollarSign className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pr-9" defaultValue="25.00" />
            </div>
          </Field>
          <Field label="أقل قيمة طلب *">
            <div className="relative">
              <DollarSign className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pr-9" defaultValue="50.00" />
            </div>
          </Field>
          <Field label="وقت التوصيل المتوقع *">
            <div className="relative">
              <Clock3 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pr-9" defaultValue="30" />
            </div>
          </Field>
          <Field label="الأولوية *">
            <Input defaultValue="1" />
          </Field>
          <Field label="لون المنطقة *">
            <div className="grid grid-cols-[80px_1fr] gap-3">
              <div className="rounded-md border bg-[#4A90E2]" />
              <Input defaultValue="#4A90E2" />
            </div>
          </Field>
          <div className="rounded-xl border bg-background p-6 text-center">
            <SlidersHorizontal className="mx-auto size-8 text-muted-foreground" />
            <div className="mt-3 font-semibold">اختر الفرع الأول</div>
            <p className="mt-3 text-sm text-muted-foreground">
              اختار فرع عشان تقدر تضبط إعدادات منطقة التوصيل.
            </p>
          </div>
        </FormCard>
      </div>
    </div>
  );
}

export function DeliveryZonesPage() {
  const [creating, setCreating] = useState(false);

  if (creating) {
    return <ZoneCreateView onBack={() => setCreating(false)} />;
  }

  return (
    <div className="px-6 py-8">
      <PageTitle
        title="مناطق التوصيل"
        description="إدارة مناطق التوصيل والتغطية في كل الفروع"
        size="compact"
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            منطقة جديدة
          </Button>
        }
      />

      <MetricCards
        cards={[
          ["إجمالي المناطق", "12", MapPin, "text-primary"],
          ["نشط", "12", CheckCircle2, "text-green-500"],
          ["غير نشط", "12", XCircle, "text-destructive"],
        ]}
      />

      <div className="mt-6">
        <FilterBar
          className="border-b-0"
          disabled
          fields={[
            {
              label: "بحث",
              type: "search",
              placeholder: "ابحث عن منطقة توصيل...",
              width: "md:flex-1",
            },
            {
              label: "المدينة",
              type: "select",
              value: "كل المدن",
              options: [
                "كل المدن",
                "شرم الشيخ",
                "المنصورة",
                "طنطا",
                "القاهرة",
                "التل الكبير",
              ],
              width: "md:w-36",
            },
            {
              label: "الحالة",
              type: "select",
              value: "كل الحالات",
              options: ["كل الحالات", "نشط", "غير نشط"],
              width: "md:w-36",
            },
          ]}
        />
        <div className="mt-4 overflow-hidden rounded-md border">
          <DataTable
            minWidth={1040}
            columnWidths={[34, 30, 135, 105, 72, 145, 126, 76, 76, 60, 108, 64]}
            headers={[
              "#",
              "",
              <span key="name" className="inline-flex items-center gap-2">اسم المنطقة <ArrowUpDown className="size-4" /></span>,
              "المدينة",
              "الفرع",
              <span key="fee" className="inline-flex items-center gap-2">رسوم التوصيل <ArrowUpDown className="size-4" /></span>,
              <span key="time" className="inline-flex items-center gap-2">وقت التوصيل المتوقع <ArrowUpDown className="size-4" /></span>,
              <span key="priority" className="inline-flex items-center gap-2">الأولوية <ArrowUpDown className="size-4" /></span>,
              "الحالة",
              "الوصف",
              "تاريخ الإنشاء",
              "بيانات الطلب",
            ]}
            rows={deliveryZones.map((row) => [
              <span key={`idx-${row[0]}`} className="block px-3">{row[0]}</span>,
              <GripVertical key={`drag-${row[0]}`} className="size-4 text-muted-foreground" />,
              <div key={`name-${row[0]}`}>
                <div className="font-semibold">{row[1]}</div>
                <div className="text-xs text-muted-foreground">{row[1]}</div>
              </div>,
              row[2],
              "",
              <div key={`fee-${row[0]}`} className="flex items-center gap-3">
                <DollarSign className="size-4 text-green-500" />
                <span>
                  <span className="block font-semibold">{formatReferenceCurrency(row[3])}</span>
                  <span className="block text-xs text-muted-foreground">
                    الحد الأدنى: {formatReferenceCurrency(row[4])}
                  </span>
                </span>
              </div>,
              <div key={`time-${row[0]}`} className="flex items-center gap-2">
                <Clock3 className="size-4 text-purple-500" />
                {row[5]}
              </div>,
              <span key={`priority-${row[0]}`} className="inline-flex size-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">1</span>,
              <RefBadge key={`status-${row[0]}`} tone="green">نشط</RefBadge>,
              "—",
              row[6],
              <button
                key={`actions-${row[0]}`}
                type="button"
                className="inline-flex h-8 w-12 items-center justify-center rounded-md border bg-background text-sm font-bold shadow-sm hover:bg-accent"
              >
                <MoreHorizontal className="size-4" />
              </button>,
            ])}
          />
        </div>
        <Pagination text="عرض 12 من 12 نتيجة" pages="1 / 1" nextDisabled />
      </div>
    </div>
  );
}

function CourierDrawer({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 bg-foreground/70 backdrop-blur-sm">
      <aside className="absolute right-0 top-0 h-full w-full max-w-[384px] overflow-y-auto bg-background p-6 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute left-4 top-4 inline-flex size-7 items-center justify-center rounded-full border hover:bg-accent"
          aria-label="إغلاق"
        >
          <X className="size-4" />
        </button>
        <h2 className="text-lg font-semibold">إضافة مندوب</h2>
        <p className="mt-4 text-sm text-muted-foreground">
          إنشاء حساب مندوب توصيل جديد
        </p>
        <div className="mt-8 flex flex-col gap-5">
          <Field label="الاسم">
            <Input placeholder="الاسم" />
          </Field>
          <Field label="رقم الموبايل">
            <Input placeholder="+201001234567" />
          </Field>
          <Field label="البريد الإلكتروني">
            <Input placeholder="courier@example.com" />
          </Field>
          <Field label="كلمة المرور">
            <Input type="password" placeholder="••••••" />
          </Field>
          <Field label="نوع المركبة">
            <SelectBox>موتوسيكل</SelectBox>
          </Field>
          <Field label="الفروع المخصصة">
            <label className="flex h-11 items-center gap-3 rounded-md border px-3 text-sm">
              <input type="checkbox" className="size-4 rounded border" />
              اول اونلاين ماركت في التل الكبير
            </label>
          </Field>
          <Field label="رقم اللوحة">
            <Input placeholder="ABC-1234" />
          </Field>
          <Field label="أقصى عدد طلبات في نفس الوقت">
            <Input defaultValue="3" />
          </Field>
          <Button className="mt-2 w-full">
            <Plus className="size-4" />
            إضافة مندوب
          </Button>
        </div>
      </aside>
    </div>
  );
}

export function CouriersPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="px-6 py-8">
      <PageTitle
        title="المندوبين"
        description="إدارة مندوبي التوصيل والشيفتات"
        size="compact"
      />

      <div className="mt-8 inline-flex rounded-xl bg-muted p-1 text-sm shadow-sm">
        <button className="rounded-lg bg-background px-4 py-2 shadow-sm">المندوبين</button>
        <button className="px-4 py-2 text-muted-foreground">الشيفتات</button>
        <button className="px-4 py-2 text-muted-foreground">العهدة النقدية</button>
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="flex min-h-[88px] items-center justify-between border-b px-6">
          <div>
            <h2 className="font-semibold">كل المندوبين</h2>
            <p className="mt-4 text-sm text-muted-foreground">
              عرض وإدارة كل مندوبي التوصيل
            </p>
          </div>
          <Button onClick={() => setDrawerOpen(true)}>
            <Plus className="size-4" />
            إضافة مندوب
          </Button>
        </div>
        <div className="p-6">
          <FilterBar
            className="border-b-0"
            disabled
            fields={[
              {
                label: "بحث",
                type: "search",
                placeholder: "ابحث عن مندوب...",
                width: "md:w-80",
              },
              { label: "الحالة", type: "select", value: "الكل", width: "md:w-48" },
            ]}
          />
          <div className="mt-4">
            <EmptyStateTable
              minWidth={980}
              headers={[
                "#",
                "الاسم",
                "رقم الموبايل",
                "نوع المركبة",
                "الفروع المخصصة",
                "مستوى الأداء",
                "الحالة",
                "إجراءات",
              ]}
            />
          </div>
          <Pagination text="عرض 0 من 0 نتائج" pages="1 / 0" nextDisabled />
        </div>
      </Card>

      {drawerOpen ? <CourierDrawer onClose={() => setDrawerOpen(false)} /> : null}
    </div>
  );
}
