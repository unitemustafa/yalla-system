"use client";

import { useSearchParams } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import {
  ArrowUpDown,
  AlertCircle,
  Camera,
  ChevronDown,
  CheckCircle2,
  DollarSign,
  Edit3,
  ImagePlus,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  RotateCcw,
  Save,
  Plus,
  Send,
  Trash2,
  Truck,
  UserRound,
  X,
} from "lucide-react";

import { DashboardImage } from "../dashboard-image";
import {
  ActionMenu,
  AppSelect,
  Badge,
  Button,
  Card,
  Field,
  FilterBar,
  Input,
  PageTitle,
  Pagination,
  SelectBox,
} from "../primitives";
import { deliveryZones } from "@/features/dashboard/reference-data";
import { removeInputWhitespace } from "@/lib/input-sanitizers";
import { cn } from "@/lib/utils";

const deliveryListPageSize = 10;
import { useSnackbar } from "../snackbar";

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

function formatReferenceCurrency(value: number) {
  return `${value.toFixed(2)} EGP`;
}

type DeliveryZone = {
  id: string;
  name: string;
  fixedDeliveryFee: number;
  createdAt: string;
};

type ZoneDraft = {
  name: string;
  fixedDeliveryFee: string;
};

const initialDeliveryZones: DeliveryZone[] = deliveryZones.map((zone) => ({
  ...zone,
}));

function createZoneDraft(zone?: DeliveryZone): ZoneDraft {
  return {
    name: zone?.name ?? "",
    fixedDeliveryFee: zone ? zone.fixedDeliveryFee.toFixed(2) : "",
  };
}

function parseDeliveryFee(value: string) {
  const fee = Number.parseFloat(value.replace(",", "."));

  return Number.isFinite(fee) && fee >= 0 ? fee : 0;
}

function getArabicToday() {
  return new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function createZoneId(name: string) {
  const normalizedName = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{Letter}\p{Number}-]/gu, "");

  return `${normalizedName || "zone"}-${Date.now()}`;
}

type CourierOrder = {
  id: string;
  customer: string;
  zone: string;
  total: number;
  status: "active" | "delivered" | "not-delivered";
  note: string;
};

type Courier = {
  id: string;
  name: string;
  phone: string;
  email: string;
  photoUrl?: string | null;
  vehicle: string;
  plateNumber: string;
  zone: string;
  performance: string;
  status: "متاح" | "مشغول" | "غير متصل";
  activeOrders: CourierOrder[];
  deliveredOrders: CourierOrder[];
  notDeliveredOrders: CourierOrder[];
};

const couriers: Courier[] = [
  {
    id: "COURIER-001",
    name: "كابتن مصطفى علي",
    phone: "+201001234567",
    email: "mostafa.courier@yalla.market",
    photoUrl: null,
    vehicle: "موتوسيكل",
    plateNumber: "ق ر ب 2481",
    zone: "القاهرة",
    performance: "96%",
    status: "متاح",
    activeOrders: [
      {
        id: "ORD-20260529-018",
        customer: "أحمد سامي",
        zone: "القاهرة",
        total: 620,
        status: "active",
        note: "في الطريق للعميل",
      },
      {
        id: "ORD-20260529-021",
        customer: "منة خالد",
        zone: "القاهرة",
        total: 410,
        status: "active",
        note: "تم استلام الطلب من الفرع",
      },
    ],
    deliveredOrders: [
      {
        id: "ORD-20260529-007",
        customer: "سارة عادل",
        zone: "القاهرة",
        total: 280,
        status: "delivered",
        note: "تم التسليم والدفع كاش",
      },
      {
        id: "ORD-20260529-009",
        customer: "كريم حسن",
        zone: "القاهرة",
        total: 735,
        status: "delivered",
        note: "تم التسليم بنجاح",
      },
    ],
    notDeliveredOrders: [
      {
        id: "ORD-20260528-114",
        customer: "نورا محمود",
        zone: "القاهرة",
        total: 195,
        status: "not-delivered",
        note: "العميل لم يرد على الهاتف",
      },
    ],
  },
];

function CourierStatusBadge({ status }: { status: Courier["status"] }) {
  const tone = status === "متاح" ? "green" : status === "مشغول" ? "blue" : "red";

  return <Badge tone={tone}>{status}</Badge>;
}

function readImageAsDataUrl(file: File, onLoad: (value: string) => void) {
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === "string") {
      onLoad(reader.result);
    }
  };
  reader.readAsDataURL(file);
}

function CourierAvatar({
  courier,
  size = "md",
}: {
  courier: Pick<Courier, "name" | "photoUrl">;
  size?: "sm" | "md" | "lg";
}) {
  const initials = courier.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
  const sizeClass =
    size === "sm" ? "size-11" : size === "lg" ? "size-16" : "size-14";

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-lg border bg-primary/10 text-primary",
        sizeClass,
      )}
    >
      {courier.photoUrl ? (
        <DashboardImage
          src={courier.photoUrl}
          alt={courier.name}
          width={96}
          height={96}
          sizes="96px"
          className="absolute inset-0 size-full"
          imageClassName="object-cover"
        />
      ) : (
        <div className="flex size-full items-center justify-center text-sm font-black">
          {initials || <UserRound className="size-6" />}
        </div>
      )}
    </div>
  );
}

function EditableCourierAvatar({
  courier,
  onPhotoChange,
}: {
  courier: Pick<Courier, "id" | "name" | "photoUrl">;
  onPhotoChange: (courierId: string, photoUrl: string | null) => void;
}) {
  function handleImageSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.currentTarget.value = "";

    if (!file) {
      return;
    }

    readImageAsDataUrl(file, (value) => onPhotoChange(courier.id, value));
  }

  return (
    <div className="group relative shrink-0">
      <label className="block cursor-pointer" title="تغيير الصورة">
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={handleImageSelected}
          aria-label="تغيير صورة المندوب"
        />
        <CourierAvatar courier={courier} size="lg" />
        <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-foreground/55 text-background opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <Camera className="size-5" />
        </span>
        <span className="absolute -bottom-1 -left-1 inline-flex size-7 items-center justify-center rounded-md border bg-background text-primary shadow-sm">
          <ImagePlus className="size-4" />
        </span>
      </label>
      {courier.photoUrl ? (
        <button
          type="button"
          onClick={() => onPhotoChange(courier.id, null)}
          className="absolute -right-2 -top-2 inline-flex size-6 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm hover:bg-accent hover:text-foreground"
          aria-label="حذف صورة المندوب"
          title="حذف الصورة"
        >
          <X className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}

function CourierStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="min-h-[92px] rounded-lg border bg-background p-4 shadow-sm">
      <div className={cn("mb-3 inline-flex rounded-md bg-muted/60 p-2", tone)}>
        <Icon className="size-4" />
      </div>
      <div className="text-lg font-semibold leading-none">{value}</div>
      <div className="mt-2 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function CourierOrdersSection({
  title,
  orders,
  emptyText,
  defaultOpen = false,
}: {
  title: string;
  orders: CourierOrder[];
  emptyText: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="overflow-hidden rounded-lg border bg-card">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((currentOpen) => !currentOpen)}
        className="flex min-h-12 w-full items-center justify-between gap-3 bg-muted/20 px-4 py-3 text-start transition hover:bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
      >
        <span className="flex items-center gap-2">
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
          <span className="text-sm font-bold">{title}</span>
        </span>
        <Badge tone="secondary">{orders.length}</Badge>
      </button>
      {open ? (
      <div className="flex flex-col gap-3 border-t p-4">
        {orders.length === 0 ? (
          <div className="rounded-md bg-muted/30 px-3 py-4 text-center text-sm text-muted-foreground">
            {emptyText}
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="rounded-md border bg-background/80 px-3 py-3 text-sm shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{order.id}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {order.customer} • {order.zone}
                  </div>
                </div>
                <div className="shrink-0 font-semibold">
                  {formatReferenceCurrency(order.total)}
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">{order.note}</div>
            </div>
          ))
        )}
      </div>
      ) : null}
    </section>
  );
}

function CourierInfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border bg-background/70 px-3 py-2.5">
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      <div className="mt-1 min-h-5 text-sm font-semibold leading-6 text-foreground">
        {children}
      </div>
    </div>
  );
}

function CollapsibleCourierPanel({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="overflow-hidden rounded-lg border bg-card">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((currentOpen) => !currentOpen)}
        className="flex min-h-[49px] w-full items-center justify-between gap-3 border-b bg-card px-4 py-3 text-start transition hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
      >
        <span className="flex items-center gap-2">
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
          <span className="text-sm font-bold">{title}</span>
        </span>
      </button>
      {open ? (
        <div className="flex flex-col gap-4 rounded-b-lg bg-card p-4">
          {children}
        </div>
      ) : null}
    </section>
  );
}

function CourierDetailsDrawer({
  courier,
  onClose,
  onPhotoChange,
}: {
  courier: Courier;
  onClose: () => void;
  onPhotoChange: (courierId: string, photoUrl: string | null) => void;
}) {
  const [passwordDraft, setPasswordDraft] = useState({
    password: "",
    confirmPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState("");

  function updateCourierPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (passwordDraft.password.length < 6) {
      setPasswordMessage("كلمة المرور يجب ألا تقل عن 6 أحرف.");
      return;
    }

    if (passwordDraft.password !== passwordDraft.confirmPassword) {
      setPasswordMessage("تأكيد كلمة المرور غير مطابق.");
      return;
    }

    setPasswordDraft({ password: "", confirmPassword: "" });
    setPasswordMessage("تم تغيير كلمة مرور المندوب.");
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center overflow-y-auto bg-foreground/60 px-4 py-6 backdrop-blur-sm sm:px-6">
      <section className="relative mx-auto flex max-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col overflow-hidden rounded-xl border bg-background shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute left-4 top-4 z-10 inline-flex size-8 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-accent"
          aria-label="إغلاق"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-start gap-4 border-b bg-muted/20 px-5 py-5 pe-12 sm:px-8">
          <EditableCourierAvatar courier={courier} onPhotoChange={onPhotoChange} />
          <div>
            <h2 className="text-2xl font-semibold leading-8">{courier.name}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span dir="ltr">{courier.phone}</span>
              <span>•</span>
              <span>{courier.zone}</span>
              <CourierStatusBadge status={courier.status} />
            </div>
          </div>
        </div>

        <div className="grid gap-3 border-b bg-muted/20 px-5 py-5 sm:grid-cols-3 sm:px-8">
          <CourierStat
            icon={PackageCheck}
            label="طلبات شغال عليها"
            value={String(courier.activeOrders.length)}
            tone="text-blue-500"
          />
          <CourierStat
            icon={CheckCircle2}
            label="طلبات سلمها"
            value={String(courier.deliveredOrders.length)}
            tone="text-green-500"
          />
          <CourierStat
            icon={AlertCircle}
            label="طلبات متسلمتش"
            value={String(courier.notDeliveredOrders.length)}
            tone="text-red-500"
          />
        </div>

        <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto p-5 sm:p-8 lg:grid-cols-[1fr_300px]">
          <div className="flex flex-col gap-4">
            <CourierOrdersSection
              title="الطلبات اللي شغال عليها"
              orders={courier.activeOrders}
              emptyText="مفيش طلبات نشطة"
            />
            <CourierOrdersSection
              title="الطلبات اللي سلمها"
              orders={courier.deliveredOrders}
              emptyText="مفيش طلبات مسلمة"
            />
            <CourierOrdersSection
              title="الطلبات اللي متسلمتش"
              orders={courier.notDeliveredOrders}
              emptyText="مفيش طلبات غير مسلمة"
            />
          </div>

          <div className="flex flex-col gap-4">
            <CollapsibleCourierPanel title="بيانات المندوب">
              <div className="space-y-2">
                <CourierInfoRow label="البريد">
                  <span className="block break-all text-right" dir="ltr">
                    {courier.email}
                  </span>
                </CourierInfoRow>
                <CourierInfoRow label="المركبة">
                  {courier.vehicle}
                </CourierInfoRow>
                <CourierInfoRow label="رقم اللوحة">
                  {courier.plateNumber}
                </CourierInfoRow>
              </div>
            </CollapsibleCourierPanel>

            <CollapsibleCourierPanel title="تغيير كلمة المرور">
              <form className="grid gap-3" onSubmit={updateCourierPassword}>
                <Field label="كلمة المرور الجديدة">
                  <Input
                    type="password"
                    autoComplete="new-password"
                    value={passwordDraft.password}
                    onChange={(event) =>
                      setPasswordDraft((current) => ({
                        ...current,
                        password: removeInputWhitespace(event.target.value),
                      }))
                    }
                    placeholder="••••••"
                  />
                </Field>
                <Field label="تأكيد كلمة المرور">
                  <Input
                    type="password"
                    autoComplete="new-password"
                    value={passwordDraft.confirmPassword}
                    onChange={(event) =>
                      setPasswordDraft((current) => ({
                        ...current,
                        confirmPassword: removeInputWhitespace(
                          event.target.value,
                        ),
                      }))
                    }
                    placeholder="••••••"
                  />
                </Field>
                {passwordMessage ? (
                  <div className="rounded-md bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
                    {passwordMessage}
                  </div>
                ) : null}
                <Button type="submit" className="w-full">
                  <Save className="size-4" />
                  حفظ كلمة المرور
                </Button>
              </form>
            </CollapsibleCourierPanel>

            <CollapsibleCourierPanel title="إرسال طلب">
              <Field label="اختيار الطلب">
                <SelectBox>ORD-20260529-024 • {courier.zone}</SelectBox>
              </Field>
              <Button className="w-full">
                <Send className="size-4" />
                إرسال الطلب للمندوب
              </Button>
            </CollapsibleCourierPanel>
          </div>
        </div>
      </section>
    </div>
  );
}

function ZoneActionsMenu({
  zone,
  open,
  onToggle,
  onEdit,
  onDelete,
}: {
  zone: DeliveryZone;
  open: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex justify-center">
      <ActionMenu
        open={open}
        onToggle={onToggle}
        align="center"
        label={`\u0625\u062c\u0631\u0627\u0621\u0627\u062a ${zone.name}`}
        triggerClassName="h-8 w-10"
        menuClassName="w-36"
        items={[
          { label: "\u062a\u0639\u062f\u064a\u0644", icon: Edit3, onClick: onEdit },
          { label: "\u062d\u0630\u0641", icon: Trash2, onClick: onDelete, tone: "danger" },
        ]}
      />
    </div>
  );
}
function ZoneInlineEditPanel({
  draft,
  zoneName,
  onCancel,
  onChange,
  onSave,
}: {
  draft: ZoneDraft;
  zoneName: string;
  onCancel: () => void;
  onChange: (draft: ZoneDraft) => void;
  onSave: () => void;
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
      className="rounded-md border border-primary/20 bg-primary/[0.035] p-4 shadow-sm"
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="text-sm font-semibold">تعديل منطقة {zoneName}</div>
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel} aria-label="إغلاق التعديل">
          <X className="size-4" />
        </Button>
      </div>
      <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_220px_auto] lg:items-end">
        <Field label="اسم المنطقة الجديد">
          <Input
            dir="rtl"
            value={draft.name}
            onChange={(event) => onChange({ ...draft, name: event.target.value })}
          />
        </Field>
        <Field label="سعر التوصيل الجديد">
          <div className="relative">
            <DollarSign className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pr-9"
              inputMode="decimal"
              value={draft.fixedDeliveryFee}
              onChange={(event) =>
                onChange({ ...draft, fixedDeliveryFee: event.target.value })
              }
            />
          </div>
        </Field>
        <div className="flex flex-wrap gap-2">
          <Button type="submit">
            <Save className="size-4" />
            حفظ
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            إلغاء
          </Button>
        </div>
      </div>
    </form>
  );
}

function DeliveryZonesTable({
  zones,
  startIndex = 0,
  openActionMenu,
  editingZoneId,
  editDraft,
  onToggleMenu,
  onEdit,
  onDelete,
  onCancelEdit,
  onChangeDraft,
  onSaveEdit,
}: {
  zones: DeliveryZone[];
  startIndex?: number;
  openActionMenu: string | null;
  editingZoneId: string | null;
  editDraft: ZoneDraft;
  onToggleMenu: (zoneId: string) => void;
  onEdit: (zone: DeliveryZone) => void;
  onDelete: (zone: DeliveryZone) => void;
  onCancelEdit: () => void;
  onChangeDraft: (draft: ZoneDraft) => void;
  onSaveEdit: () => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table
        className="w-full caption-bottom text-sm"
        style={{ minWidth: 840, tableLayout: "fixed" }}
      >
        <colgroup>
          {[54, 260, 220, 150, 170].map((width, index) => (
            <col key={index} style={{ width }} />
          ))}
        </colgroup>
        <thead>
          <tr className="h-10 border-b transition-colors hover:bg-muted/50">
            {[
              "#",
              <span key="name" className="inline-flex items-center gap-2">
                اسم المنطقة <ArrowUpDown className="size-4" />
              </span>,
              <span key="fee" className="inline-flex items-center gap-2">
                سعر التوصيل الثابت <ArrowUpDown className="size-4" />
              </span>,
              "تاريخ الإنشاء",
              <span key="actions" className="block text-center">
                إجراءات
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
          {zones.map((zone, index) => {
            const isEditing = editingZoneId === zone.id;

            return (
              <Fragment key={zone.id}>
                <tr
                  className={cn(
                    "h-[53px] border-b transition-colors hover:bg-muted/40",
                    isEditing && "bg-primary/[0.035]",
                  )}
                >
                  <td className="p-0 align-middle">
                    <span className="block px-3">{startIndex + index + 1}</span>
                  </td>
                  <td className="p-2 align-middle">
                    <div>
                      <div className="font-semibold">{zone.name}</div>
                      <div className="text-xs text-muted-foreground">منطقة توصيل</div>
                    </div>
                  </td>
                  <td className="p-2 align-middle">
                    <div className="flex items-center gap-3">
                      <DollarSign className="size-4 text-green-500" />
                      <span className="font-semibold">
                        {formatReferenceCurrency(zone.fixedDeliveryFee)}
                      </span>
                    </div>
                  </td>
                  <td className="p-2 align-middle">{zone.createdAt}</td>
                  <td className="p-2 align-middle">
                    <ZoneActionsMenu
                      zone={zone}
                      open={openActionMenu === zone.id}
                      onToggle={() => onToggleMenu(zone.id)}
                      onEdit={() => onEdit(zone)}
                      onDelete={() => onDelete(zone)}
                    />
                  </td>
                </tr>
                {isEditing ? (
                  <tr className="border-b bg-primary/[0.035]">
                    <td colSpan={5} className="px-3 py-3 align-top">
                      <ZoneInlineEditPanel
                        draft={editDraft}
                        zoneName={zone.name}
                        onCancel={onCancelEdit}
                        onChange={onChangeDraft}
                        onSave={onSaveEdit}
                      />
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ZoneCreateDialog({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (zone: DeliveryZone) => void;
}) {
  const [draft, setDraft] = useState<ZoneDraft>(createZoneDraft());
  const normalizedName = draft.name.trim() || "منطقة جديدة";
  const previewFee = parseDeliveryFee(draft.fixedDeliveryFee);

  function resetDraft() {
    setDraft(createZoneDraft());
  }

  function submitZone(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onCreate({
      id: createZoneId(normalizedName),
      name: normalizedName,
      fixedDeliveryFee: previewFee,
      createdAt: getArabicToday(),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-foreground/60 px-4 py-6 backdrop-blur-sm sm:px-6">
      <section className="relative w-full max-w-3xl overflow-hidden rounded-xl border bg-background shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute left-4 top-4 z-10 inline-flex size-8 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-accent"
          aria-label="إغلاق إضافة المنطقة"
        >
          <X className="size-4" />
        </button>
        <div className="border-b bg-muted/20 px-6 py-5 pe-14">
          <h1 className="text-xl font-semibold leading-7">إضافة منطقة جديدة</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            بيانات المنطقة وسعر التوصيل الثابت
          </p>
        </div>

        <form id="zone-create-form" onSubmit={submitZone}>
          <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="rounded-lg border bg-card">
              <div className="border-b px-4 py-3 text-sm font-bold">بيانات المنطقة</div>
              <div className="grid gap-4 p-4 md:grid-cols-2">
              <Field label="اسم المنطقة *">
                <Input
                  autoFocus
                  dir="rtl"
                  value={draft.name}
                  onChange={(event) =>
                    setDraft({ ...draft, name: event.target.value })
                  }
                  placeholder="مثلاً: القاهرة الجديدة"
                />
              </Field>
              <Field label="سعر التوصيل الثابت *">
                <div className="relative">
                  <DollarSign className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pr-9"
                    inputMode="decimal"
                    value={draft.fixedDeliveryFee}
                    onChange={(event) =>
                      setDraft({ ...draft, fixedDeliveryFee: event.target.value })
                    }
                    placeholder="45.00"
                  />
                </div>
              </Field>
              </div>
            </div>

            <div className="rounded-lg border bg-card">
              <div className="border-b px-4 py-3 text-sm font-bold">معاينة سريعة</div>
              <div className="space-y-4 p-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">المنطقة</span>
                  <span className="font-semibold">{normalizedName}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">السعر الثابت</span>
                  <span className="font-semibold">{formatReferenceCurrency(previewFee)}</span>
                </div>
                <div className="flex items-center gap-2 rounded-md bg-muted/40 px-3 py-2 text-muted-foreground">
                  <MapPin className="size-4 text-primary" />
                  <span>{getArabicToday()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t bg-muted/15 px-6 py-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="button" variant="outline" onClick={resetDraft}>
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
export function DeliveryZonesPage() {
  const [creating, setCreating] = useState(false);
  const [zones, setZones] = useState<DeliveryZone[]>(initialDeliveryZones);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ZoneDraft>(createZoneDraft());
  const { showSnackbar } = useSnackbar();
  const [currentPage, setCurrentPage] = useState(1);
  const zoneCount = zones.length;
  const totalPages = Math.max(1, Math.ceil(zoneCount / deliveryListPageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStartIndex = (safeCurrentPage - 1) * deliveryListPageSize;
  const pagedZones = zones.slice(
    pageStartIndex,
    pageStartIndex + deliveryListPageSize,
  );
  const prices = zones.map((zone) => zone.fixedDeliveryFee);
  const lowestPrice = prices.length ? Math.min(...prices) : 0;
  const highestPrice = prices.length ? Math.max(...prices) : 0;
  const editingZone = zones.find((zone) => zone.id === editingZoneId);

  function addZone(zone: DeliveryZone) {
    setZones((currentZones) => [zone, ...currentZones]);
    setCreating(false);
    showSnackbar({ message: "تمت إضافة المنطقة بنجاح." });
  }

  function startEditing(zone: DeliveryZone) {
    setEditingZoneId(zone.id);
    setEditDraft(createZoneDraft(zone));
    setOpenActionMenu(null);
  }

  function saveEditingZone() {
    if (!editingZone) {
      return;
    }

    const nextName = editDraft.name.trim() || editingZone.name;
    const nextFee = parseDeliveryFee(editDraft.fixedDeliveryFee);

    setZones((currentZones) =>
      currentZones.map((zone) =>
        zone.id === editingZone.id
          ? { ...zone, name: nextName, fixedDeliveryFee: nextFee }
          : zone,
      ),
    );
    setEditingZoneId(null);
    showSnackbar({ message: "تم تحديث المنطقة." });
  }

  function deleteZone(zone: DeliveryZone) {
    setZones((currentZones) =>
      currentZones.filter((currentZone) => currentZone.id !== zone.id),
    );
    setOpenActionMenu(null);

    if (editingZoneId === zone.id) {
      setEditingZoneId(null);
    }

    showSnackbar({
      message: `تم حذف ${zone.name}.`,
      tone: "danger",
    });
  }

  return (
    <div className="px-6 py-8">
      <PageTitle
        title="مناطق التوصيل"
        description="إدارة المناطق وسعر التوصيل الثابت لكل منطقة"
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
          ["أقل سعر ثابت", formatReferenceCurrency(lowestPrice), DollarSign, "text-green-500"],
          ["أعلى سعر ثابت", formatReferenceCurrency(highestPrice), CheckCircle2, "text-blue-500"],
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
              placeholder: "ابحث عن منطقة...",
              width: "md:flex-1",
            },
          ]}
        />
        <div className="mt-4 rounded-md border bg-card">
          <DeliveryZonesTable
            zones={pagedZones}
            startIndex={pageStartIndex}
            openActionMenu={openActionMenu}
            editingZoneId={editingZoneId}
            editDraft={editDraft}
            onToggleMenu={(zoneId) =>
              setOpenActionMenu((current) =>
                current === zoneId ? null : zoneId,
              )
            }
            onEdit={startEditing}
            onDelete={deleteZone}
            onCancelEdit={() => setEditingZoneId(null)}
            onChangeDraft={setEditDraft}
            onSaveEdit={saveEditingZone}
          />
        </div>
        <Pagination
          text={`عرض ${pagedZones.length} من ${zoneCount} نتيجة`}
          pages={`${safeCurrentPage} / ${totalPages}`}
          previousDisabled={safeCurrentPage === 1}
          nextDisabled={safeCurrentPage === totalPages}
          onPrevious={() =>
            setCurrentPage((page) => Math.max(1, Math.min(page, totalPages) - 1))
          }
          onNext={() =>
            setCurrentPage((page) =>
              Math.min(totalPages, Math.min(page, totalPages) + 1),
            )
          }
        />
      </div>
      {creating ? (
        <ZoneCreateDialog
          onClose={() => setCreating(false)}
          onCreate={addZone}
        />
      ) : null}
    </div>
  );
}

type CourierDraft = {
  name: string;
  phone: string;
  email: string;
  password: string;
  photoUrl: string | null;
  vehicle: string;
  plateNumber: string;
  zone: string;
  maxActiveOrders: string;
};

function createCourierDraft(): CourierDraft {
  return {
    name: "",
    phone: "",
    email: "",
    password: "",
    photoUrl: null,
    vehicle: "",
    plateNumber: "",
    zone: deliveryZones[0]?.name ?? "القاهرة",
    maxActiveOrders: "3",
  };
}

function CourierPhotoPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  function handleImageSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    readImageAsDataUrl(file, onChange);
    event.currentTarget.value = "";
  }

  return (
    <label className="block cursor-pointer rounded-lg border border-dashed bg-muted/15 p-3 transition hover:border-primary/40 hover:bg-primary/5 sm:col-span-2">
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={handleImageSelected}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-background text-muted-foreground">
          {value ? (
            <DashboardImage
              src={value}
              alt=""
              width={160}
              height={160}
              sizes="96px"
              className="absolute inset-0 size-full"
              imageClassName="object-cover"
            />
          ) : (
            <Camera className="size-8" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ImagePlus className="size-4 text-primary" />
            صورة المندوب
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            اضغط لاختيار صورة واضحة تظهر في قائمة المناديب ونافذة التفاصيل.
          </p>
          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={(event) => {
                event.preventDefault();
                onChange(null);
              }}
            >
              حذف الصورة
            </Button>
          ) : null}
        </div>
      </div>
    </label>
  );
}

function CourierDrawer({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (draft: CourierDraft) => Promise<void>;
}) {
  const [draft, setDraft] = useState<CourierDraft>(createCourierDraft);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function updateDraft(field: keyof CourierDraft, value: string | null) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function submitCourier(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await onCreate(draft);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "تعذر إنشاء حساب المندوب.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-foreground/60 px-4 py-6 backdrop-blur-sm sm:px-6">
      <section className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-3xl flex-col justify-center">
        <div className="relative overflow-hidden rounded-xl border bg-background shadow-2xl">
          <button
          type="button"
          onClick={onClose}
          className="absolute left-4 top-4 z-10 inline-flex size-8 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-accent"
          aria-label="إغلاق"
        >
          <X className="size-4" />
          </button>
          <div className="border-b bg-muted/20 px-6 py-5 pe-12">
        <h2 className="text-lg font-semibold">إضافة مندوب</h2>
        <p className="mt-4 text-sm text-muted-foreground">
          إنشاء حساب مندوب توصيل جديد
        </p>
          </div>
          <form onSubmit={submitCourier} className="grid gap-5 p-6 sm:grid-cols-2">
          <CourierPhotoPicker
            value={draft.photoUrl}
            onChange={(value) => updateDraft("photoUrl", value)}
          />
          <Field label="الاسم">
            <Input
              required
              value={draft.name}
              onChange={(event) => updateDraft("name", event.target.value)}
              placeholder="الاسم"
            />
          </Field>
          <Field label="رقم الموبايل">
            <Input
              required
              dir="ltr"
              value={draft.phone}
              onChange={(event) => updateDraft("phone", event.target.value)}
              placeholder="+201001234567"
            />
          </Field>
          <Field label="البريد الإلكتروني">
            <Input
              required
              type="email"
              dir="ltr"
              value={draft.email}
              onChange={(event) =>
                updateDraft("email", removeInputWhitespace(event.target.value))
              }
              placeholder="courier@example.com"
            />
          </Field>
          <Field label="كلمة المرور">
            <Input
              required
              type="password"
              value={draft.password}
              onChange={(event) =>
                updateDraft(
                  "password",
                  removeInputWhitespace(event.target.value),
                )
              }
              placeholder="••••••"
            />
          </Field>
          <Field label="نوع المركبة">
            <Input
              value={draft.vehicle}
              onChange={(event) => updateDraft("vehicle", event.target.value)}
              placeholder="اكتب نوع المركبة"
            />
          </Field>
          <Field label="رقم اللوحة">
            <Input
              value={draft.plateNumber}
              onChange={(event) => updateDraft("plateNumber", event.target.value)}
              placeholder="ABC-1234"
            />
          </Field>
          <Field label="المنطقة">
            <AppSelect
              value={draft.zone}
              onValueChange={(value) => updateDraft("zone", value)}
              options={deliveryZones.map((zone) => ({
                value: zone.name,
                label: zone.name,
              }))}
              className="h-10 bg-input"
              contentClassName="rounded-xl border-border/80 bg-popover p-1.5 shadow-2xl"
              ariaLabel="المنطقة"
            />
          </Field>
          <Field label="أقصى عدد طلبات في نفس الوقت">
            <Input
              value={draft.maxActiveOrders}
              onChange={(event) => updateDraft("maxActiveOrders", event.target.value)}
              inputMode="numeric"
            />
          </Field>
          {error ? (
            <p className="text-sm font-semibold text-destructive sm:col-span-2" role="alert">
              {error}
            </p>
          ) : null}
          <Button
            type="submit"
            className="w-full sm:col-span-2"
            disabled={submitting}
          >
            <Plus className="size-4" />
            {submitting ? "جارٍ إنشاء الحساب..." : "إضافة مندوب"}
          </Button>
        </form>
        </div>
      </section>
    </div>
  );
}

function CourierCard({
  courier,
  index,
  onDetails,
  onSendOrder,
}: {
  courier: Courier;
  index: number;
  onDetails: () => void;
  onSendOrder: () => void;
}) {
  return (
    <article className="rounded-lg border bg-background p-4 shadow-sm transition hover:border-primary/25 hover:bg-muted/20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="mt-3 w-6 shrink-0 text-center text-sm font-semibold text-muted-foreground">
            {index + 1}
          </span>
          <CourierAvatar courier={courier} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-semibold leading-6">
                {courier.name}
              </h3>
              <CourierStatusBadge status={courier.status} />
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1" dir="ltr">
                <Phone className="size-3.5" />
                {courier.phone}
              </span>
              <span className="inline-flex min-w-0 items-center gap-1">
                <Mail className="size-3.5" />
                <span className="truncate" dir="ltr">
                  {courier.email}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-2 text-sm sm:grid-cols-3 lg:w-[420px]">
          <div className="rounded-md bg-muted/30 px-3 py-2">
            <div className="text-xs text-muted-foreground">المركبة</div>
            <div className="mt-1 flex items-center gap-1 font-semibold">
              <Truck className="size-4 text-primary" />
              {courier.vehicle}
            </div>
          </div>
          <div className="rounded-md bg-muted/30 px-3 py-2">
            <div className="text-xs text-muted-foreground">المنطقة</div>
            <div className="mt-1 font-semibold">{courier.zone}</div>
          </div>
          <div className="rounded-md bg-muted/30 px-3 py-2">
            <div className="text-xs text-muted-foreground">طلبات نشطة</div>
            <div className="mt-1 font-semibold">{courier.activeOrders.length}</div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
          <Button size="sm" variant="outline" onClick={onDetails}>
            التفاصيل
          </Button>
          <Button size="sm" onClick={onSendOrder}>
            <Send className="size-4" />
            إرسال طلب
          </Button>
        </div>
      </div>
    </article>
  );
}

export function CouriersPage() {
  const searchParams = useSearchParams();
  const requestedCourier = searchParams.get("courier");
  const initialCourierIndex = requestedCourier
    ? couriers.findIndex((courier) =>
        [courier.id, courier.phone, courier.name].some(
          (value) =>
            value.trim().toLocaleLowerCase("ar-EG") ===
            requestedCourier.trim().toLocaleLowerCase("ar-EG"),
        ),
      )
    : -1;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState<Courier | null>(
    () => (initialCourierIndex >= 0 ? couriers[initialCourierIndex] : null),
  );
  const [sendOrderCourier, setSendOrderCourier] = useState<Courier | null>(null);
  const [courierRows, setCourierRows] = useState<Courier[]>(couriers);
  const [currentPage, setCurrentPage] = useState(() =>
    initialCourierIndex >= 0
      ? Math.floor(initialCourierIndex / deliveryListPageSize) + 1
      : 1,
  );
  const totalPages = Math.max(
    1,
    Math.ceil(courierRows.length / deliveryListPageSize),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStartIndex = (safeCurrentPage - 1) * deliveryListPageSize;
  const pagedCouriers = courierRows.slice(
    pageStartIndex,
    pageStartIndex + deliveryListPageSize,
  );

  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    let cancelled = false;

    void fetch("/api/dashboard/couriers", { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json().catch(() => null)) as
          | { couriers?: Courier[]; message?: string }
          | null;
        if (!response.ok) {
          throw new Error(data?.message || "تعذر تحميل حسابات المناديب.");
        }
        if (!cancelled && Array.isArray(data?.couriers)) {
          setCourierRows(data.couriers);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          showSnackbar({
            message:
              error instanceof Error
                ? error.message
                : "تعذر تحميل حسابات المناديب.",
            tone: "danger",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [showSnackbar]);

  async function addCourier(draft: CourierDraft) {
    const response = await fetch("/api/dashboard/couriers", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...draft,
        maxActiveOrders: Number.parseInt(draft.maxActiveOrders, 10) || 3,
      }),
    });
    const data = (await response.json().catch(() => null)) as
      | { courier?: Courier; message?: string }
      | null;

    if (!response.ok || !data?.courier) {
      throw new Error(data?.message || "تعذر إنشاء حساب المندوب.");
    }

    const courier = data.courier;
    setCourierRows((current) => [courier, ...current]);
    setDrawerOpen(false);
    showSnackbar({ message: `تم إنشاء حساب المندوب ${courier.name} بنجاح.` });
  }

  function updateCourierPhoto(courierId: string, photoUrl: string | null) {
    setCourierRows((currentRows) =>
      currentRows.map((courier) =>
        courier.id === courierId ? { ...courier, photoUrl } : courier,
      ),
    );
    setSelectedCourier((currentCourier) =>
      currentCourier?.id === courierId
        ? { ...currentCourier, photoUrl }
        : currentCourier,
    );
  }

  return (
    <div className="px-6 py-8">
      <PageTitle
        title="المندوبين"
        description="إدارة مندوبي التوصيل"
        size="compact"
      />

      <Card className="mt-8 overflow-hidden">
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
                width: "md:flex-1",
              },
              {
                label: "المنطقة",
                type: "select",
                value: "كل المناطق",
                options: ["كل المناطق", ...deliveryZones.map((zone) => zone.name)],
                width: "md:flex-1",
              },
            ]}
          />
          <div className="mt-4">
            <div className="grid gap-3">
              {pagedCouriers.map((courier, index) => (
                <CourierCard
                  key={courier.id}
                  courier={courier}
                  index={pageStartIndex + index}
                  onDetails={() => setSelectedCourier(courier)}
                  onSendOrder={() => setSendOrderCourier(courier)}
                />
              ))}
            </div>
          </div>
          <Pagination
            text={`عرض ${pagedCouriers.length} من ${courierRows.length} نتيجة`}
            pages={`${safeCurrentPage} / ${totalPages}`}
            previousDisabled={safeCurrentPage === 1}
            nextDisabled={safeCurrentPage === totalPages}
            onPrevious={() =>
              setCurrentPage((page) => Math.max(1, Math.min(page, totalPages) - 1))
            }
            onNext={() =>
              setCurrentPage((page) =>
                Math.min(totalPages, Math.min(page, totalPages) + 1),
              )
            }
          />
        </div>
      </Card>

      {drawerOpen ? (
        <CourierDrawer onClose={() => setDrawerOpen(false)} onCreate={addCourier} />
      ) : null}
      {selectedCourier ? (
        <CourierDetailsDrawer
          courier={selectedCourier}
          onClose={() => setSelectedCourier(null)}
          onPhotoChange={updateCourierPhoto}
        />
      ) : null}
      {sendOrderCourier ? (
        <SendOrderDrawer
          courier={sendOrderCourier}
          onClose={() => setSendOrderCourier(null)}
          onSend={(orderCode) => {
            showSnackbar({
              message: `تم إرسال الطلب ${orderCode} إلى ${sendOrderCourier.name}.`,
            });
            setSendOrderCourier(null);
          }}
        />
      ) : null}
    </div>
  );
}

function SendOrderDrawer({
  courier,
  onClose,
  onSend,
}: {
  courier: Courier;
  onClose: () => void;
  onSend: (orderCode: string) => void;
}) {
  const [orderCode, setOrderCode] = useState("");

  function submitOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedCode = orderCode.trim();

    if (!normalizedCode) return;
    onSend(normalizedCode);
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-foreground/60 px-4 py-6 backdrop-blur-sm sm:px-6">
      <section className="relative w-full max-w-md rounded-xl border bg-background p-5 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute left-4 top-4 inline-flex size-8 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-accent"
          aria-label="إغلاق"
        >
          <X className="size-4" />
        </button>

        <div className="mb-5 pe-10">
          <h2 className="text-lg font-semibold">إرسال طلب</h2>
          <p className="mt-1 text-sm text-muted-foreground">{courier.name}</p>
        </div>

        <form onSubmit={submitOrder} className="space-y-4">
          <Field label="كود الطلب">
            <Input
              autoFocus
              value={orderCode}
              onChange={(event) => setOrderCode(event.target.value)}
              placeholder="ORD-20260529-024"
              dir="ltr"
              className="text-right"
            />
          </Field>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={!orderCode.trim()}>
              <Send className="size-4" />
              إرسال طلب
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
