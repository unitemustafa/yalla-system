"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpDown,
  BadgeCheck,
  CheckCircle2,
  DollarSign,
  Edit3,
  MapPin,
  PackageCheck,
  Plus,
  RotateCcw,
  Save,
  Search,
  Settings2,
  Trash2,
  Truck,
  X,
} from "lucide-react";

import {
  ActionMenu,
  AppSelect,
  Badge,
  Button,
  Card,
  Field,
  Input,
  PageTitle,
  Pagination,
  Switch,
} from "../primitives";
import { useSnackbar } from "../snackbar";
<<<<<<< HEAD
import {
  calculateDeliveryFee,
  initialDeliverySettings,
  initialManagedDeliveryZones,
  type DeliveryFeeResult,
  type DeliveryPricingType,
  type DeliverySettings,
  type DeliveryZone,
  type DeliveryZoneStatus,
} from "../delivery-pricing";
import { cn } from "@/lib/utils";
=======
import { dashboardFetch } from "@/lib/client-api";
>>>>>>> 56ecfc2 (link dashboard order, items,auth api with backend)

const deliveryListPageSize = 10;

type DeliveryTab = "zones" | "settings" | "tester";

type ZoneDraft = {
  name: string;
  pricingType: DeliveryPricingType;
  fixedDeliveryPrice: string;
  basePrice: string;
  includedKm: string;
  pricePerExtraKm: string;
  minOrderAmount: string;
  maxDistanceKm: string;
  estimatedDeliveryMinutes: string;
  status: DeliveryZoneStatus;
  notes: string;
};

type ZoneDraftErrors = Partial<Record<keyof ZoneDraft, string>>;

const pricingTypeLabels: Record<DeliveryPricingType, string> = {
  fixed: "سعر ثابت",
  distance_based: "حسب المسافة",
  mixed: "ثابت + مسافة",
};

const statusLabels: Record<DeliveryZoneStatus, string> = {
  active: "مفعلة",
  paused: "متوقفة مؤقتًا",
  unavailable: "غير متاحة",
};

const pricingTypeOptions = [
  { value: "fixed", label: "سعر ثابت" },
  { value: "distance_based", label: "حسب المسافة" },
  { value: "mixed", label: "سعر ثابت + زيادة حسب المسافة" },
] satisfies Array<{ value: DeliveryPricingType; label: string }>;

const statusOptions = [
  { value: "active", label: "مفعلة" },
  { value: "paused", label: "متوقفة مؤقتًا" },
  { value: "unavailable", label: "غير متاحة" },
] satisfies Array<{ value: DeliveryZoneStatus; label: string }>;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("ar-EG-u-nu-latn", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function getTodayIso() {
  return new Date().toISOString().slice(0, 10);
}

function createZoneId(name: string) {
  const normalizedName = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{Letter}\p{Number}-]/gu, "");

  return `${normalizedName || "zone"}-${Date.now()}`;
}

function parseNumber(value: string) {
  const numberValue = Number.parseFloat(value.replace(",", "."));
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function numberToDraftValue(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function useLockedPageScroll() {
  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);
}

function createZoneDraft(zone?: DeliveryZone): ZoneDraft {
  return {
    name: zone?.name ?? "",
    pricingType: zone?.pricingType ?? "fixed",
    fixedDeliveryPrice: numberToDraftValue(zone?.fixedDeliveryPrice ?? 0),
    basePrice: numberToDraftValue(zone?.basePrice ?? 0),
    includedKm: numberToDraftValue(zone?.includedKm ?? 0),
    pricePerExtraKm: numberToDraftValue(zone?.pricePerExtraKm ?? 0),
    minOrderAmount: numberToDraftValue(zone?.minOrderAmount ?? 0),
    maxDistanceKm: numberToDraftValue(zone?.maxDistanceKm ?? 10),
    estimatedDeliveryMinutes: numberToDraftValue(
      zone?.estimatedDeliveryMinutes ?? 30,
    ),
    status: zone?.status ?? "active",
    notes: zone?.notes ?? "",
  };
}

function validateZoneDraft(draft: ZoneDraft) {
  const errors: ZoneDraftErrors = {};
  const fixedDeliveryPrice = parseNumber(draft.fixedDeliveryPrice);
  const basePrice = parseNumber(draft.basePrice);
  const includedKm = parseNumber(draft.includedKm);
  const pricePerExtraKm = parseNumber(draft.pricePerExtraKm);
  const minOrderAmount = parseNumber(draft.minOrderAmount);
  const maxDistanceKm = parseNumber(draft.maxDistanceKm);

  if (!draft.name.trim()) {
    errors.name = "اسم المنطقة مطلوب.";
  }

  if (
    (draft.pricingType === "fixed" || draft.pricingType === "mixed") &&
    fixedDeliveryPrice < 0
  ) {
    errors.fixedDeliveryPrice = "السعر لا يكون أقل من صفر.";
  }

  if (draft.pricingType === "distance_based" && basePrice < 0) {
    errors.basePrice = "السعر الأساسي لا يكون أقل من صفر.";
  }

  if (
    (draft.pricingType === "distance_based" || draft.pricingType === "mixed") &&
    includedKm < 0
  ) {
    errors.includedKm = "عدد الكيلومترات لا يكون أقل من صفر.";
  }

  if (
    (draft.pricingType === "distance_based" || draft.pricingType === "mixed") &&
    pricePerExtraKm < 0
  ) {
    errors.pricePerExtraKm = "سعر كل كيلو إضافي لا يكون أقل من صفر.";
  }

  if (minOrderAmount < 0) {
    errors.minOrderAmount = "الحد الأدنى للطلب لا يقل عن صفر.";
  }

  if (maxDistanceKm <= 0) {
    errors.maxDistanceKm = "أقصى مسافة يجب أن تكون أكبر من صفر.";
  }

  return errors;
}

function zoneFromDraft(draft: ZoneDraft, currentZone?: DeliveryZone): DeliveryZone {
  const today = getTodayIso();

  return {
    id: currentZone?.id ?? createZoneId(draft.name),
    name: draft.name.trim(),
    pricingType: draft.pricingType,
    fixedDeliveryPrice:
      draft.pricingType === "distance_based"
        ? 0
        : parseNumber(draft.fixedDeliveryPrice),
    basePrice:
      draft.pricingType === "distance_based" ? parseNumber(draft.basePrice) : 0,
    includedKm:
      draft.pricingType === "fixed" ? 0 : parseNumber(draft.includedKm),
    pricePerExtraKm:
      draft.pricingType === "fixed" ? 0 : parseNumber(draft.pricePerExtraKm),
    minOrderAmount: parseNumber(draft.minOrderAmount),
    maxDistanceKm: parseNumber(draft.maxDistanceKm),
    estimatedDeliveryMinutes: parseNumber(draft.estimatedDeliveryMinutes),
    status: draft.status,
    notes: draft.notes.trim(),
    createdAt: currentZone?.createdAt ?? today,
    updatedAt: today,
  };
}

function deliveryPriceLabel(zone: DeliveryZone) {
  if (zone.pricingType === "fixed") {
    return formatCurrency(zone.fixedDeliveryPrice);
  }

  if (zone.pricingType === "distance_based") {
    return `${formatCurrency(zone.basePrice)} + ${formatCurrency(zone.pricePerExtraKm)} / كم`;
  }

  return `${formatCurrency(zone.fixedDeliveryPrice)} + ${formatCurrency(zone.pricePerExtraKm)} / كم`;
}

function PricingBadge({ type }: { type: DeliveryPricingType }) {
  const tone =
    type === "fixed" ? "green" : type === "distance_based" ? "blue" : "secondary";

  return <Badge tone={tone}>{pricingTypeLabels[type]}</Badge>;
}

function StatusBadge({ status }: { status: DeliveryZoneStatus }) {
  const tone =
    status === "active" ? "green" : status === "paused" ? "blue" : "red";

  return <Badge tone={tone}>{statusLabels[status]}</Badge>;
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

function FieldError({ children }: { children?: string }) {
  return children ? (
    <p className="text-xs font-medium text-destructive">{children}</p>
  ) : null;
}

function NumberField({
  label,
  value,
  onChange,
  error,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}) {
  return (
    <Field label={label}>
      <Input
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        dir="ltr"
        className="text-right"
      />
      <FieldError>{error}</FieldError>
    </Field>
  );
}

function ZoneFormDialog({
  zone,
  onClose,
  onSave,
}: {
  zone?: DeliveryZone;
  onClose: () => void;
  onSave: (zone: DeliveryZone) => void;
}) {
  useLockedPageScroll();

  const [draft, setDraft] = useState<ZoneDraft>(() => createZoneDraft(zone));
  const [errors, setErrors] = useState<ZoneDraftErrors>({});
  const isEditing = Boolean(zone);

  function updateDraft<K extends keyof ZoneDraft>(field: K, value: ZoneDraft[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function submitZone(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateZoneDraft(draft);

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    onSave(zoneFromDraft(draft, zone));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-foreground/60 px-4 py-6 backdrop-blur-sm sm:px-6">
      <section
        dir="rtl"
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-4xl overflow-hidden rounded-xl border bg-background shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute left-4 top-4 z-10 inline-flex size-8 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-accent"
          aria-label="إغلاق"
        >
          <X className="size-4" />
        </button>

        <div className="border-b bg-muted/20 px-6 py-5 pe-14">
          <h2 className="text-xl font-semibold leading-7">
            {isEditing ? "تعديل منطقة توصيل" : "إضافة منطقة جديدة"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            اضبط قواعد التسعير وحدود التوصيل لهذه المنطقة.
          </p>
        </div>

        <form onSubmit={submitZone}>
          <div className="grid max-h-[calc(100vh-220px)] gap-5 overflow-y-auto p-6 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="rounded-lg border bg-card">
              <div className="border-b px-4 py-3 text-sm font-bold">
                بيانات المنطقة
              </div>
              <div className="grid gap-4 p-4 md:grid-cols-2">
                <Field label="اسم المنطقة *">
                  <Input
                    autoFocus
                    dir="rtl"
                    value={draft.name}
                    onChange={(event) => updateDraft("name", event.target.value)}
                    placeholder="مثلًا: القاهرة الجديدة"
                  />
                  <FieldError>{errors.name}</FieldError>
                </Field>

                <Field label="نوع التسعير">
                  <AppSelect
                    value={draft.pricingType}
                    onValueChange={(value) =>
                      updateDraft("pricingType", value as DeliveryPricingType)
                    }
                    options={pricingTypeOptions}
                    ariaLabel="نوع التسعير"
                    dir="rtl"
                  />
                </Field>

                {draft.pricingType === "fixed" ? (
                  <NumberField
                    label="سعر التوصيل الثابت *"
                    value={draft.fixedDeliveryPrice}
                    onChange={(value) => updateDraft("fixedDeliveryPrice", value)}
                    error={errors.fixedDeliveryPrice}
                    placeholder="45"
                  />
                ) : null}

                {draft.pricingType === "distance_based" ? (
                  <>
                    <NumberField
                      label="السعر الأساسي *"
                      value={draft.basePrice}
                      onChange={(value) => updateDraft("basePrice", value)}
                      error={errors.basePrice}
                      placeholder="20"
                    />
                    <NumberField
                      label="الكيلومترات المشمولة *"
                      value={draft.includedKm}
                      onChange={(value) => updateDraft("includedKm", value)}
                      error={errors.includedKm}
                      placeholder="3"
                    />
                    <NumberField
                      label="سعر كل كيلو إضافي *"
                      value={draft.pricePerExtraKm}
                      onChange={(value) => updateDraft("pricePerExtraKm", value)}
                      error={errors.pricePerExtraKm}
                      placeholder="5"
                    />
                  </>
                ) : null}

                {draft.pricingType === "mixed" ? (
                  <>
                    <NumberField
                      label="سعر ثابت داخل المنطقة *"
                      value={draft.fixedDeliveryPrice}
                      onChange={(value) => updateDraft("fixedDeliveryPrice", value)}
                      error={errors.fixedDeliveryPrice}
                      placeholder="35"
                    />
                    <NumberField
                      label="الزيادة تبدأ بعد كام كيلو *"
                      value={draft.includedKm}
                      onChange={(value) => updateDraft("includedKm", value)}
                      error={errors.includedKm}
                      placeholder="5"
                    />
                    <NumberField
                      label="سعر كل كيلو إضافي *"
                      value={draft.pricePerExtraKm}
                      onChange={(value) => updateDraft("pricePerExtraKm", value)}
                      error={errors.pricePerExtraKm}
                      placeholder="7"
                    />
                  </>
                ) : null}

                <NumberField
                  label="الحد الأدنى للطلب"
                  value={draft.minOrderAmount}
                  onChange={(value) => updateDraft("minOrderAmount", value)}
                  error={errors.minOrderAmount}
                  placeholder="100"
                />
                <NumberField
                  label="أقصى مسافة توصيل *"
                  value={draft.maxDistanceKm}
                  onChange={(value) => updateDraft("maxDistanceKm", value)}
                  error={errors.maxDistanceKm}
                  placeholder="15"
                />
                <Field label="الحالة">
                  <AppSelect
                    value={draft.status}
                    onValueChange={(value) =>
                      updateDraft("status", value as DeliveryZoneStatus)
                    }
                    options={statusOptions}
                    ariaLabel="الحالة"
                    dir="rtl"
                  />
                </Field>
                <label className="flex min-h-[132px] flex-col gap-3 text-sm font-medium md:col-span-2">
                  <span className="leading-5">ملاحظات اختيارية</span>
                  <textarea
                    value={draft.notes}
                    onChange={(event) => updateDraft("notes", event.target.value)}
                    className="min-h-24 resize-none rounded-md border border-border bg-input px-3 py-2 text-sm font-normal leading-6 text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
                    placeholder="أي تعليمات داخلية لفريق التشغيل..."
                  />
                </label>
              </div>
            </div>

            <div className="rounded-lg border bg-card">
              <div className="border-b px-4 py-3 text-sm font-bold">
                معاينة التسعير
              </div>
              <div className="space-y-4 p-4 text-sm">
                <PreviewRow label="المنطقة" value={draft.name || "منطقة جديدة"} />
                <PreviewRow
                  label="نوع التسعير"
                  value={pricingTypeLabels[draft.pricingType]}
                />
                <PreviewRow
                  label="سعر التوصيل"
                  value={
                    draft.pricingType === "distance_based"
                      ? `${formatCurrency(parseNumber(draft.basePrice))} + ${formatCurrency(parseNumber(draft.pricePerExtraKm))} / كم`
                      : `${formatCurrency(parseNumber(draft.fixedDeliveryPrice))}${
                          draft.pricingType === "mixed"
                            ? ` + ${formatCurrency(parseNumber(draft.pricePerExtraKm))} / كم`
                            : ""
                        }`
                  }
                />
                <div className="rounded-md bg-muted/35 p-3 text-xs leading-5 text-muted-foreground">
                  يتم استخدام هذه القيم مباشرة في أداة اختبار سعر التوصيل.
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t bg-muted/15 px-6 py-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDraft(createZoneDraft(zone));
                setErrors({});
              }}
            >
              <RotateCcw className="size-4" />
              إعادة ضبط
            </Button>
            <Button type="submit">
              <Save className="size-4" />
              حفظ المنطقة
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-start font-semibold">{value}</span>
    </div>
  );
}

function ConfirmDeleteDialog({
  zone,
  onCancel,
  onConfirm,
}: {
  zone: DeliveryZone;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useLockedPageScroll();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 px-4 py-6 backdrop-blur-sm">
      <section
        dir="rtl"
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-xl border bg-background p-5 shadow-2xl"
      >
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-destructive/10 p-2 text-destructive">
            <AlertCircle className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">حذف منطقة التوصيل</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              هل تريد حذف منطقة {zone.name}؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            إلغاء
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm}>
            <Trash2 className="size-4" />
            حذف
          </Button>
        </div>
      </section>
    </div>
  );
}

function ZonesTable({
  zones,
  startIndex,
  openActionMenu,
  onToggleMenu,
  onEdit,
  onDelete,
}: {
  zones: DeliveryZone[];
  startIndex: number;
  openActionMenu: string | null;
  onToggleMenu: (zoneId: string) => void;
  onEdit: (zone: DeliveryZone) => void;
  onDelete: (zone: DeliveryZone) => void;
}) {
  if (!zones.length) {
    return (
      <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-md border bg-card px-4 py-10 text-center">
        <div className="rounded-full bg-muted p-3 text-primary">
          <MapPin className="size-6" />
        </div>
        <div className="text-base font-semibold">لا توجد مناطق توصيل</div>
        <p className="max-w-md text-sm leading-6 text-muted-foreground">
          أضف أول منطقة لتحديد نطاقات التوصيل وأسعارها.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border bg-card">
      <table
        className="w-full caption-bottom text-sm"
        style={{ minWidth: 1015, tableLayout: "fixed" }}
      >
        <colgroup>
          {[40, 160, 115, 175, 110, 125, 105, 110, 75].map(
            (width, index) => (
              <col key={index} style={{ width }} />
            ),
          )}
        </colgroup>
        <thead>
          <tr className="h-10 border-b transition-colors hover:bg-muted/50">
            {[
              "#",
              <span key="name" className="inline-flex items-center gap-2">
                اسم المنطقة <ArrowUpDown className="size-4" />
              </span>,
              "نوع التسعير",
              "سعر التوصيل",
              "الحد الأدنى للطلب",
              "أقصى مسافة توصيل",
              "الحالة",
              "تاريخ الإنشاء",
              <span key="actions" className="block text-center">
                الإجراءات
              </span>,
            ].map((header, index) => (
              <th
                key={index}
                className="h-10 px-2 text-start align-middle text-xs font-medium text-muted-foreground"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {zones.map((zone, index) => (
            <tr
              key={zone.id}
              className="h-[62px] border-b transition-colors hover:bg-muted/40"
            >
              <td className="p-0 align-middle">
                <span className="block px-3">{startIndex + index + 1}</span>
              </td>
              <td className="p-2 align-middle">
                <div>
                  <div className="font-semibold">{zone.name}</div>
                  <div className="mt-1 truncate text-xs text-muted-foreground">
                    {zone.notes || "منطقة توصيل"}
                  </div>
                </div>
              </td>
              <td className="p-2 align-middle">
                <PricingBadge type={zone.pricingType} />
              </td>
              <td className="p-2 align-middle font-semibold">
                {deliveryPriceLabel(zone)}
              </td>
              <td className="p-2 align-middle">
                {formatCurrency(zone.minOrderAmount)}
              </td>
              <td className="p-2 align-middle">{zone.maxDistanceKm} كم</td>
              <td className="p-2 align-middle">
                <StatusBadge status={zone.status} />
              </td>
              <td className="p-2 align-middle">{formatDate(zone.createdAt)}</td>
              <td className="p-2 align-middle">
                <div className="flex justify-center">
                  <ActionMenu
                    open={openActionMenu === zone.id}
                    onToggle={() => onToggleMenu(zone.id)}
                    align="end"
                    label={`إجراءات ${zone.name}`}
                    triggerClassName="h-8 w-10"
                    menuClassName="w-36"
                    items={[
                      {
                        label: "تعديل",
                        icon: Edit3,
                        onClick: () => onEdit(zone),
                      },
                      {
                        label: "حذف",
                        icon: Trash2,
                        onClick: () => onDelete(zone),
                        tone: "danger",
                      },
                    ]}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ZonesMobileList({
  zones,
  onEdit,
  onDelete,
}: {
  zones: DeliveryZone[];
  onEdit: (zone: DeliveryZone) => void;
  onDelete: (zone: DeliveryZone) => void;
}) {
  if (!zones.length) {
    return null;
  }

  return (
    <div className="grid gap-3 lg:hidden">
      {zones.map((zone) => (
        <article key={zone.id} className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold">{zone.name}</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <PricingBadge type={zone.pricingType} />
                <StatusBadge status={zone.status} />
              </div>
            </div>
            <div className="text-start text-sm font-semibold">
              {deliveryPriceLabel(zone)}
            </div>
          </div>
          <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <PreviewRow label="الحد الأدنى" value={formatCurrency(zone.minOrderAmount)} />
            <PreviewRow label="أقصى مسافة" value={`${zone.maxDistanceKm} كم`} />
            <PreviewRow label="تاريخ الإنشاء" value={formatDate(zone.createdAt)} />
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onEdit(zone)}>
              <Edit3 className="size-4" />
              تعديل
            </Button>
            <Button type="button" variant="danger" size="sm" onClick={() => onDelete(zone)}>
              <Trash2 className="size-4" />
              حذف
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}

function SettingsPanel({
  settings,
  onChange,
  onSave,
}: {
  settings: DeliverySettings;
  onChange: (settings: DeliverySettings) => void;
  onSave: () => void;
}) {
  function updateSetting<K extends keyof DeliverySettings>(
    field: K,
    value: DeliverySettings[K],
  ) {
    onChange({ ...settings, [field]: value, updatedAt: getTodayIso() });
  }

  return (
    <Card className="mt-6 overflow-hidden">
      <div className="flex min-h-[72px] flex-col gap-3 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">
            إعدادات التسعير العام للمناطق غير المسجلة
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            تستخدم عندما يكون المستخدم خارج كل المناطق المحددة.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-md border bg-background px-3 py-2">
          <span className="text-sm font-medium">التوصيل خارج المناطق</span>
          <Switch
            checked={settings.enableOutsideZonesDelivery}
            onCheckedChange={(checked) =>
              updateSetting("enableOutsideZonesDelivery", checked)
            }
            aria-label="تفعيل التوصيل خارج المناطق المحددة"
          />
        </div>
      </div>
      <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">
        <Field label="السعر الأساسي">
          <Input
            inputMode="decimal"
            value={numberToDraftValue(settings.basePrice)}
            onChange={(event) =>
              updateSetting("basePrice", Math.max(0, parseNumber(event.target.value)))
            }
            dir="ltr"
            className="text-right"
          />
        </Field>
        <Field label="السعر يشمل أول كام كيلو">
          <Input
            inputMode="decimal"
            value={numberToDraftValue(settings.includedKm)}
            onChange={(event) =>
              updateSetting("includedKm", Math.max(0, parseNumber(event.target.value)))
            }
            dir="ltr"
            className="text-right"
          />
        </Field>
        <Field label="سعر كل كيلو إضافي">
          <Input
            inputMode="decimal"
            value={numberToDraftValue(settings.pricePerExtraKm)}
            onChange={(event) =>
              updateSetting(
                "pricePerExtraKm",
                Math.max(0, parseNumber(event.target.value)),
              )
            }
            dir="ltr"
            className="text-right"
          />
        </Field>
        <Field label="أقصى مسافة توصيل">
          <Input
            inputMode="decimal"
            value={numberToDraftValue(settings.maxDistanceKm)}
            onChange={(event) =>
              updateSetting(
                "maxDistanceKm",
                Math.max(1, parseNumber(event.target.value)),
              )
            }
            dir="ltr"
            className="text-right"
          />
        </Field>
        <label className="flex min-h-[126px] flex-col gap-3 text-sm font-medium md:col-span-2 xl:col-span-4">
          <span className="leading-5">رسالة تظهر للمستخدم لو خارج النطاق</span>
          <textarea
            value={settings.outsideZoneUnavailableMessage}
            onChange={(event) =>
              updateSetting("outsideZoneUnavailableMessage", event.target.value)
            }
            className="min-h-24 resize-none rounded-md border border-border bg-input px-3 py-2 text-sm font-normal leading-6 text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
          />
        </label>
      </div>
      <div className="flex justify-end border-t bg-muted/15 px-6 py-4">
        <Button type="button" onClick={onSave}>
          <Save className="size-4" />
          حفظ الإعدادات
        </Button>
      </div>
    </Card>
  );
}

function DeliveryFeeTester({
  zones,
  settings,
}: {
  zones: DeliveryZone[];
  settings: DeliverySettings;
}) {
  const [selectedZoneId, setSelectedZoneId] = useState("outside");
  const [distanceKm, setDistanceKm] = useState("5");
  const [result, setResult] = useState<DeliveryFeeResult | null>(null);
  const selectedZone =
    selectedZoneId === "outside"
      ? null
      : zones.find((zone) => zone.id === selectedZoneId) ?? null;

  function runCalculation() {
    setResult(
      calculateDeliveryFee({
        zone: selectedZone,
        settings,
        distanceKm: parseNumber(distanceKm),
      }),
    );
  }

  return (
    <Card className="mt-6 overflow-hidden">
      <div className="border-b px-6 py-5">
        <h2 className="text-base font-semibold">اختبار سعر التوصيل</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          اختر منطقة أو أدخل مسافة لحساب السعر النهائي.
        </p>
      </div>
      <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="المنطقة المستخدمة">
            <AppSelect
              value={selectedZoneId}
              onValueChange={setSelectedZoneId}
              options={[
                { value: "outside", label: "خارج المناطق المحددة" },
                ...zones.map((zone) => ({ value: zone.id, label: zone.name })),
              ]}
              ariaLabel="اختيار منطقة"
              dir="rtl"
            />
          </Field>
          <Field label="المسافة بالكيلومتر">
            <Input
              inputMode="decimal"
              value={distanceKm}
              onChange={(event) => setDistanceKm(event.target.value)}
              dir="ltr"
              className="text-right"
            />
          </Field>
          <div className="md:col-span-2">
            <Button type="button" onClick={runCalculation}>
              <PackageCheck className="size-4" />
              احسب السعر
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-muted/20 p-4">
          {result ? (
            <div className="space-y-3 text-sm">
              <PreviewRow label="المنطقة المستخدمة" value={result.zoneName} />
              <PreviewRow
                label="نوع التسعير"
                value={
                  result.pricingType === "outside_zone"
                    ? "تسعير عام"
                    : pricingTypeLabels[result.pricingType]
                }
              />
              <PreviewRow label="المسافة" value={`${result.distanceKm} كم`} />
              <PreviewRow
                label="سعر التوصيل النهائي"
                value={formatCurrency(result.deliveryFee)}
              />
              <PreviewRow
                label="التوصيل متاح"
                value={
                  result.available ? (
                    <span className="text-emerald-600">نعم</span>
                  ) : (
                    <span className="text-destructive">لا</span>
                  )
                }
              />
              {!result.available ? (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-xs font-semibold leading-5 text-destructive">
                  {result.unavailableReason}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex min-h-44 items-center justify-center rounded-md border border-dashed text-center text-sm text-muted-foreground">
              نتيجة الحساب ستظهر هنا.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export function DeliveryZonesPage() {
  const { showSnackbar } = useSnackbar();
<<<<<<< HEAD
  const [activeTab, setActiveTab] = useState<DeliveryTab>("zones");
  const [loading, setLoading] = useState(true);
  const [zones, setZones] = useState<DeliveryZone[]>(initialManagedDeliveryZones);
  const [settings, setSettings] = useState<DeliverySettings>(
    initialDeliverySettings,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteZone, setDeleteZone] = useState<DeliveryZone | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  const filteredZones = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLocaleLowerCase("ar-EG");

    if (!normalizedSearch) {
      return zones;
    }

    return zones.filter((zone) =>
      [zone.name, pricingTypeLabels[zone.pricingType], statusLabels[zone.status]]
        .join(" ")
        .toLocaleLowerCase("ar-EG")
        .includes(normalizedSearch),
=======
  const [cities, setCities] = useState<City[]>([]);
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function loadCities() {
    const response = await dashboardFetch("cities", { cache: "no-store" });
    const data = await response.json().catch(() => null);
    if (response.ok) setCities(data?.cities ?? []);
  }

  useEffect(() => {
    let active = true;
    dashboardFetch("cities", { cache: "no-store" })
      .then(async (response) => ({
        response,
        data: await response.json().catch(() => null),
      }))
      .then(({ response, data }) => {
        if (active && response.ok) setCities(data?.cities ?? []);
      });
    return () => {
      active = false;
    };
  }, []);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    const response = await dashboardFetch(
      editingId ? `cities/${encodeURIComponent(editingId)}` : "cities",
      {
        method: editingId ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(draft),
      },
>>>>>>> 56ecfc2 (link dashboard order, items,auth api with backend)
    );
  }, [searchQuery, zones]);

  const zoneCount = zones.length;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredZones.length / deliveryListPageSize),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStartIndex = (safeCurrentPage - 1) * deliveryListPageSize;
  const pagedZones = filteredZones.slice(
    pageStartIndex,
    pageStartIndex + deliveryListPageSize,
  );
  const displayPrices = zones.map((zone) =>
    zone.pricingType === "distance_based"
      ? zone.basePrice
      : zone.fixedDeliveryPrice,
  );
  const lowestPrice = displayPrices.length ? Math.min(...displayPrices) : 0;
  const highestPrice = displayPrices.length ? Math.max(...displayPrices) : 0;

  function saveZone(zone: DeliveryZone) {
    if (editingZone) {
      setZones((currentZones) =>
        currentZones.map((currentZone) =>
          currentZone.id === zone.id ? zone : currentZone,
        ),
      );
      setEditingZone(null);
      showSnackbar({ message: "تم تحديث منطقة التوصيل بنجاح." });
      return;
    }

    setZones((currentZones) => [zone, ...currentZones]);
    setCreating(false);
    setCurrentPage(1);
    showSnackbar({ message: "تمت إضافة منطقة التوصيل بنجاح." });
  }

<<<<<<< HEAD
  function confirmDeleteZone() {
    if (!deleteZone) {
=======
  async function remove(city: City) {
    const response = await fetch(
      `cities/${encodeURIComponent(city.id)}`,
      { method: "DELETE" },
    );
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      showSnackbar({ message: data?.message || "تعذر حذف المدينة.", tone: "danger" });
>>>>>>> 56ecfc2 (link dashboard order, items,auth api with backend)
      return;
    }

    setZones((currentZones) =>
      currentZones.filter((zone) => zone.id !== deleteZone.id),
    );
    setDeleteZone(null);
    setOpenActionMenu(null);
    showSnackbar({
      message: `تم حذف ${deleteZone.name}.`,
      tone: "danger",
    });
  }

  return (
    <div dir="rtl" className="px-6 py-8">
      <PageTitle
        title="مناطق التوصيل"
        description="إدارة المناطق وقواعد التسعير وحدود التوصيل من مكان واحد."
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
          ["إجمالي المناطق", String(zoneCount), MapPin, "text-primary"],
          ["أقل سعر", formatCurrency(lowestPrice), DollarSign, "text-green-500"],
          ["أعلى سعر", formatCurrency(highestPrice), CheckCircle2, "text-blue-500"],
        ]}
      />

      <div className="mt-6 flex flex-wrap gap-2 rounded-lg border bg-card p-2">
        {[
          ["zones", "المناطق الحالية", Truck],
          ["settings", "إعدادات التسعير العام", Settings2],
          ["tester", "اختبار سعر التوصيل", BadgeCheck],
        ].map(([tab, label, Icon]) => (
          <button
            key={tab as string}
            type="button"
            onClick={() => setActiveTab(tab as DeliveryTab)}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold transition",
              activeTab === tab
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {label as string}
          </button>
        ))}
      </div>

      {activeTab === "zones" ? (
        <section className="mt-6">
          <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-end md:justify-between">
            <Field label="بحث">
              <div className="relative min-w-0 md:w-[360px]">
                <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="h-10 ps-9"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="ابحث عن منطقة أو حالة..."
                />
              </div>
            </Field>
            <div className="text-sm text-muted-foreground">
              عرض {filteredZones.length} من {zoneCount} منطقة
            </div>
          </div>

          {loading ? (
            <div className="mt-4 grid gap-3">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-16 animate-pulse rounded-md border bg-muted/30"
                />
              ))}
            </div>
          ) : (
            <>
              <div className="mt-4 hidden lg:block">
                <ZonesTable
                  zones={pagedZones}
                  startIndex={pageStartIndex}
                  openActionMenu={openActionMenu}
                  onToggleMenu={(zoneId) =>
                    setOpenActionMenu((current) =>
                      current === zoneId ? null : zoneId,
                    )
                  }
                  onEdit={(zone) => {
                    setEditingZone(zone);
                    setOpenActionMenu(null);
                  }}
                  onDelete={(zone) => {
                    setDeleteZone(zone);
                    setOpenActionMenu(null);
                  }}
                />
              </div>
              <div className="mt-4">
                <ZonesMobileList
                  zones={pagedZones}
                  onEdit={setEditingZone}
                  onDelete={setDeleteZone}
                />
                {!pagedZones.length ? (
                  <ZonesTable
                    zones={pagedZones}
                    startIndex={pageStartIndex}
                    openActionMenu={openActionMenu}
                    onToggleMenu={() => undefined}
                    onEdit={setEditingZone}
                    onDelete={setDeleteZone}
                  />
                ) : null}
              </div>
              <Pagination
                text={`عرض ${pagedZones.length} من ${filteredZones.length} نتيجة`}
                pages={`${safeCurrentPage} / ${totalPages}`}
                previousDisabled={safeCurrentPage === 1}
                nextDisabled={safeCurrentPage === totalPages}
                onPrevious={() =>
                  setCurrentPage((page) =>
                    Math.max(1, Math.min(page, totalPages) - 1),
                  )
                }
                onNext={() =>
                  setCurrentPage((page) =>
                    Math.min(totalPages, Math.min(page, totalPages) + 1),
                  )
                }
              />
            </>
          )}
        </section>
      ) : null}

      {activeTab === "settings" ? (
        <SettingsPanel
          settings={settings}
          onChange={setSettings}
          onSave={() =>
            showSnackbar({ message: "تم حفظ إعدادات التسعير العام." })
          }
        />
      ) : null}

      {activeTab === "tester" ? (
        <DeliveryFeeTester zones={zones} settings={settings} />
      ) : null}

      {creating ? (
        <ZoneFormDialog
          onClose={() => setCreating(false)}
          onSave={saveZone}
        />
      ) : null}
      {editingZone ? (
        <ZoneFormDialog
          zone={editingZone}
          onClose={() => setEditingZone(null)}
          onSave={saveZone}
        />
      ) : null}
      {deleteZone ? (
        <ConfirmDeleteDialog
          zone={deleteZone}
          onCancel={() => setDeleteZone(null)}
          onConfirm={confirmDeleteZone}
        />
      ) : null}
    </div>
  );
}
