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
  fixed: "ط³ط¹ط± ط«ط§ط¨طھ",
  distance_based: "ط­ط³ط¨ ط§ظ„ظ…ط³ط§ظپط©",
  mixed: "ط«ط§ط¨طھ + ظ…ط³ط§ظپط©",
};

const statusLabels: Record<DeliveryZoneStatus, string> = {
  active: "ظ…ظپط¹ظ„ط©",
  paused: "ظ…طھظˆظ‚ظپط© ظ…ط¤ظ‚طھظ‹ط§",
  unavailable: "ط؛ظٹط± ظ…طھط§ط­ط©",
};

const pricingTypeOptions = [
  { value: "fixed", label: "ط³ط¹ط± ط«ط§ط¨طھ" },
  { value: "distance_based", label: "ط­ط³ط¨ ط§ظ„ظ…ط³ط§ظپط©" },
  { value: "mixed", label: "ط³ط¹ط± ط«ط§ط¨طھ + ط²ظٹط§ط¯ط© ط­ط³ط¨ ط§ظ„ظ…ط³ط§ظپط©" },
] satisfies Array<{ value: DeliveryPricingType; label: string }>;

const statusOptions = [
  { value: "active", label: "ظ…ظپط¹ظ„ط©" },
  { value: "paused", label: "ظ…طھظˆظ‚ظپط© ظ…ط¤ظ‚طھظ‹ط§" },
  { value: "unavailable", label: "ط؛ظٹط± ظ…طھط§ط­ط©" },
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
    errors.name = "ط§ط³ظ… ط§ظ„ظ…ظ†ط·ظ‚ط© ظ…ط·ظ„ظˆط¨.";
  }

  if (
    (draft.pricingType === "fixed" || draft.pricingType === "mixed") &&
    fixedDeliveryPrice < 0
  ) {
    errors.fixedDeliveryPrice = "ط§ظ„ط³ط¹ط± ظ„ط§ ظٹظƒظˆظ† ط£ظ‚ظ„ ظ…ظ† طµظپط±.";
  }

  if (draft.pricingType === "distance_based" && basePrice < 0) {
    errors.basePrice = "ط§ظ„ط³ط¹ط± ط§ظ„ط£ط³ط§ط³ظٹ ظ„ط§ ظٹظƒظˆظ† ط£ظ‚ظ„ ظ…ظ† طµظپط±.";
  }

  if (
    (draft.pricingType === "distance_based" || draft.pricingType === "mixed") &&
    includedKm < 0
  ) {
    errors.includedKm = "ط¹ط¯ط¯ ط§ظ„ظƒظٹظ„ظˆظ…طھط±ط§طھ ظ„ط§ ظٹظƒظˆظ† ط£ظ‚ظ„ ظ…ظ† طµظپط±.";
  }

  if (
    (draft.pricingType === "distance_based" || draft.pricingType === "mixed") &&
    pricePerExtraKm < 0
  ) {
    errors.pricePerExtraKm = "ط³ط¹ط± ظƒظ„ ظƒظٹظ„ظˆ ط¥ط¶ط§ظپظٹ ظ„ط§ ظٹظƒظˆظ† ط£ظ‚ظ„ ظ…ظ† طµظپط±.";
  }

  if (minOrderAmount < 0) {
    errors.minOrderAmount = "ط§ظ„ط­ط¯ ط§ظ„ط£ط¯ظ†ظ‰ ظ„ظ„ط·ظ„ط¨ ظ„ط§ ظٹظ‚ظ„ ط¹ظ† طµظپط±.";
  }

  if (maxDistanceKm <= 0) {
    errors.maxDistanceKm = "ط£ظ‚طµظ‰ ظ…ط³ط§ظپط© ظٹط¬ط¨ ط£ظ† طھظƒظˆظ† ط£ظƒط¨ط± ظ…ظ† طµظپط±.";
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
    return `${formatCurrency(zone.basePrice)} + ${formatCurrency(zone.pricePerExtraKm)} / ظƒظ…`;
  }

  return `${formatCurrency(zone.fixedDeliveryPrice)} + ${formatCurrency(zone.pricePerExtraKm)} / ظƒظ…`;
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
          aria-label="ط¥ط؛ظ„ط§ظ‚"
        >
          <X className="size-4" />
        </button>

        <div className="border-b bg-muted/20 px-6 py-5 pe-14">
          <h2 className="text-xl font-semibold leading-7">
            {isEditing ? "طھط¹ط¯ظٹظ„ ظ…ظ†ط·ظ‚ط© طھظˆطµظٹظ„" : "ط¥ط¶ط§ظپط© ظ…ظ†ط·ظ‚ط© ط¬ط¯ظٹط¯ط©"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            ط§ط¶ط¨ط· ظ‚ظˆط§ط¹ط¯ ط§ظ„طھط³ط¹ظٹط± ظˆط­ط¯ظˆط¯ ط§ظ„طھظˆطµظٹظ„ ظ„ظ‡ط°ظ‡ ط§ظ„ظ…ظ†ط·ظ‚ط©.
          </p>
        </div>

        <form onSubmit={submitZone}>
          <div className="grid max-h-[calc(100vh-220px)] gap-5 overflow-y-auto p-6 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="rounded-lg border bg-card">
              <div className="border-b px-4 py-3 text-sm font-bold">
                ط¨ظٹط§ظ†ط§طھ ط§ظ„ظ…ظ†ط·ظ‚ط©
              </div>
              <div className="grid gap-4 p-4 md:grid-cols-2">
                <Field label="ط§ط³ظ… ط§ظ„ظ…ظ†ط·ظ‚ط© *">
                  <Input
                    autoFocus
                    dir="rtl"
                    value={draft.name}
                    onChange={(event) => updateDraft("name", event.target.value)}
                    placeholder="ظ…ط«ظ„ظ‹ط§: ط§ظ„ظ‚ط§ظ‡ط±ط© ط§ظ„ط¬ط¯ظٹط¯ط©"
                  />
                  <FieldError>{errors.name}</FieldError>
                </Field>

                <Field label="ظ†ظˆط¹ ط§ظ„طھط³ط¹ظٹط±">
                  <AppSelect
                    value={draft.pricingType}
                    onValueChange={(value) =>
                      updateDraft("pricingType", value as DeliveryPricingType)
                    }
                    options={pricingTypeOptions}
                    ariaLabel="ظ†ظˆط¹ ط§ظ„طھط³ط¹ظٹط±"
                    dir="rtl"
                  />
                </Field>

                {draft.pricingType === "fixed" ? (
                  <NumberField
                    label="ط³ط¹ط± ط§ظ„طھظˆطµظٹظ„ ط§ظ„ط«ط§ط¨طھ *"
                    value={draft.fixedDeliveryPrice}
                    onChange={(value) => updateDraft("fixedDeliveryPrice", value)}
                    error={errors.fixedDeliveryPrice}
                    placeholder="45"
                  />
                ) : null}

                {draft.pricingType === "distance_based" ? (
                  <>
                    <NumberField
                      label="ط§ظ„ط³ط¹ط± ط§ظ„ط£ط³ط§ط³ظٹ *"
                      value={draft.basePrice}
                      onChange={(value) => updateDraft("basePrice", value)}
                      error={errors.basePrice}
                      placeholder="20"
                    />
                    <NumberField
                      label="ط§ظ„ظƒظٹظ„ظˆظ…طھط±ط§طھ ط§ظ„ظ…ط´ظ…ظˆظ„ط© *"
                      value={draft.includedKm}
                      onChange={(value) => updateDraft("includedKm", value)}
                      error={errors.includedKm}
                      placeholder="3"
                    />
                    <NumberField
                      label="ط³ط¹ط± ظƒظ„ ظƒظٹظ„ظˆ ط¥ط¶ط§ظپظٹ *"
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
                      label="ط³ط¹ط± ط«ط§ط¨طھ ط¯ط§ط®ظ„ ط§ظ„ظ…ظ†ط·ظ‚ط© *"
                      value={draft.fixedDeliveryPrice}
                      onChange={(value) => updateDraft("fixedDeliveryPrice", value)}
                      error={errors.fixedDeliveryPrice}
                      placeholder="35"
                    />
                    <NumberField
                      label="ط§ظ„ط²ظٹط§ط¯ط© طھط¨ط¯ط£ ط¨ط¹ط¯ ظƒط§ظ… ظƒظٹظ„ظˆ *"
                      value={draft.includedKm}
                      onChange={(value) => updateDraft("includedKm", value)}
                      error={errors.includedKm}
                      placeholder="5"
                    />
                    <NumberField
                      label="ط³ط¹ط± ظƒظ„ ظƒظٹظ„ظˆ ط¥ط¶ط§ظپظٹ *"
                      value={draft.pricePerExtraKm}
                      onChange={(value) => updateDraft("pricePerExtraKm", value)}
                      error={errors.pricePerExtraKm}
                      placeholder="7"
                    />
                  </>
                ) : null}

                <NumberField
                  label="ط§ظ„ط­ط¯ ط§ظ„ط£ط¯ظ†ظ‰ ظ„ظ„ط·ظ„ط¨"
                  value={draft.minOrderAmount}
                  onChange={(value) => updateDraft("minOrderAmount", value)}
                  error={errors.minOrderAmount}
                  placeholder="100"
                />
                <NumberField
                  label="ط£ظ‚طµظ‰ ظ…ط³ط§ظپط© طھظˆطµظٹظ„ *"
                  value={draft.maxDistanceKm}
                  onChange={(value) => updateDraft("maxDistanceKm", value)}
                  error={errors.maxDistanceKm}
                  placeholder="15"
                />
                <Field label="ط§ظ„ط­ط§ظ„ط©">
                  <AppSelect
                    value={draft.status}
                    onValueChange={(value) =>
                      updateDraft("status", value as DeliveryZoneStatus)
                    }
                    options={statusOptions}
                    ariaLabel="ط§ظ„ط­ط§ظ„ط©"
                    dir="rtl"
                  />
                </Field>
                <label className="flex min-h-[132px] flex-col gap-3 text-sm font-medium md:col-span-2">
                  <span className="leading-5">ظ…ظ„ط§ط­ط¸ط§طھ ط§ط®طھظٹط§ط±ظٹط©</span>
                  <textarea
                    value={draft.notes}
                    onChange={(event) => updateDraft("notes", event.target.value)}
                    className="min-h-24 resize-none rounded-md border border-border bg-input px-3 py-2 text-sm font-normal leading-6 text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
                    placeholder="ط£ظٹ طھط¹ظ„ظٹظ…ط§طھ ط¯ط§ط®ظ„ظٹط© ظ„ظپط±ظٹظ‚ ط§ظ„طھط´ط؛ظٹظ„..."
                  />
                </label>
              </div>
            </div>

            <div className="rounded-lg border bg-card">
              <div className="border-b px-4 py-3 text-sm font-bold">
                ظ…ط¹ط§ظٹظ†ط© ط§ظ„طھط³ط¹ظٹط±
              </div>
              <div className="space-y-4 p-4 text-sm">
                <PreviewRow label="ط§ظ„ظ…ظ†ط·ظ‚ط©" value={draft.name || "ظ…ظ†ط·ظ‚ط© ط¬ط¯ظٹط¯ط©"} />
                <PreviewRow
                  label="ظ†ظˆط¹ ط§ظ„طھط³ط¹ظٹط±"
                  value={pricingTypeLabels[draft.pricingType]}
                />
                <PreviewRow
                  label="ط³ط¹ط± ط§ظ„طھظˆطµظٹظ„"
                  value={
                    draft.pricingType === "distance_based"
                      ? `${formatCurrency(parseNumber(draft.basePrice))} + ${formatCurrency(parseNumber(draft.pricePerExtraKm))} / ظƒظ…`
                      : `${formatCurrency(parseNumber(draft.fixedDeliveryPrice))}${
                          draft.pricingType === "mixed"
                            ? ` + ${formatCurrency(parseNumber(draft.pricePerExtraKm))} / ظƒظ…`
                            : ""
                        }`
                  }
                />
                <div className="rounded-md bg-muted/35 p-3 text-xs leading-5 text-muted-foreground">
                  ظٹطھظ… ط§ط³طھط®ط¯ط§ظ… ظ‡ط°ظ‡ ط§ظ„ظ‚ظٹظ… ظ…ط¨ط§ط´ط±ط© ظپظٹ ط£ط¯ط§ط© ط§ط®طھط¨ط§ط± ط³ط¹ط± ط§ظ„طھظˆطµظٹظ„.
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t bg-muted/15 px-6 py-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              ط¥ظ„ط؛ط§ط،
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
              ط¥ط¹ط§ط¯ط© ط¶ط¨ط·
            </Button>
            <Button type="submit">
              <Save className="size-4" />
              ط­ظپط¸ ط§ظ„ظ…ظ†ط·ظ‚ط©
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
            <h2 className="text-lg font-semibold">ط­ط°ظپ ظ…ظ†ط·ظ‚ط© ط§ظ„طھظˆطµظٹظ„</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              ظ‡ظ„ طھط±ظٹط¯ ط­ط°ظپ ظ…ظ†ط·ظ‚ط© {zone.name}طں ظ„ط§ ظٹظ…ظƒظ† ط§ظ„طھط±ط§ط¬ط¹ ط¹ظ† ظ‡ط°ط§ ط§ظ„ط¥ط¬ط±ط§ط،.
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            ط¥ظ„ط؛ط§ط،
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm}>
            <Trash2 className="size-4" />
            ط­ط°ظپ
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
        <div className="text-base font-semibold">ظ„ط§ طھظˆط¬ط¯ ظ…ظ†ط§ط·ظ‚ طھظˆطµظٹظ„</div>
        <p className="max-w-md text-sm leading-6 text-muted-foreground">
          ط£ط¶ظپ ط£ظˆظ„ ظ…ظ†ط·ظ‚ط© ظ„طھط­ط¯ظٹط¯ ظ†ط·ط§ظ‚ط§طھ ط§ظ„طھظˆطµظٹظ„ ظˆط£ط³ط¹ط§ط±ظ‡ط§.
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
                ط§ط³ظ… ط§ظ„ظ…ظ†ط·ظ‚ط© <ArrowUpDown className="size-4" />
              </span>,
              "ظ†ظˆط¹ ط§ظ„طھط³ط¹ظٹط±",
              "ط³ط¹ط± ط§ظ„طھظˆطµظٹظ„",
              "ط§ظ„ط­ط¯ ط§ظ„ط£ط¯ظ†ظ‰ ظ„ظ„ط·ظ„ط¨",
              "ط£ظ‚طµظ‰ ظ…ط³ط§ظپط© طھظˆطµظٹظ„",
              "ط§ظ„ط­ط§ظ„ط©",
              "طھط§ط±ظٹط® ط§ظ„ط¥ظ†ط´ط§ط،",
              <span key="actions" className="block text-center">
                ط§ظ„ط¥ط¬ط±ط§ط،ط§طھ
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
                    {zone.notes || "ظ…ظ†ط·ظ‚ط© طھظˆطµظٹظ„"}
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
              <td className="p-2 align-middle">{zone.maxDistanceKm} ظƒظ…</td>
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
                    label={`ط¥ط¬ط±ط§ط،ط§طھ ${zone.name}`}
                    triggerClassName="h-8 w-10"
                    menuClassName="w-36"
                    items={[
                      {
                        label: "طھط¹ط¯ظٹظ„",
                        icon: Edit3,
                        onClick: () => onEdit(zone),
                      },
                      {
                        label: "ط­ط°ظپ",
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
            <PreviewRow label="ط§ظ„ط­ط¯ ط§ظ„ط£ط¯ظ†ظ‰" value={formatCurrency(zone.minOrderAmount)} />
            <PreviewRow label="ط£ظ‚طµظ‰ ظ…ط³ط§ظپط©" value={`${zone.maxDistanceKm} ظƒظ…`} />
            <PreviewRow label="طھط§ط±ظٹط® ط§ظ„ط¥ظ†ط´ط§ط،" value={formatDate(zone.createdAt)} />
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onEdit(zone)}>
              <Edit3 className="size-4" />
              طھط¹ط¯ظٹظ„
            </Button>
            <Button type="button" variant="danger" size="sm" onClick={() => onDelete(zone)}>
              <Trash2 className="size-4" />
              ط­ط°ظپ
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
            ط¥ط¹ط¯ط§ط¯ط§طھ ط§ظ„طھط³ط¹ظٹط± ط§ظ„ط¹ط§ظ… ظ„ظ„ظ…ظ†ط§ط·ظ‚ ط؛ظٹط± ط§ظ„ظ…ط³ط¬ظ„ط©
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            طھط³طھط®ط¯ظ… ط¹ظ†ط¯ظ…ط§ ظٹظƒظˆظ† ط§ظ„ظ…ط³طھط®ط¯ظ… ط®ط§ط±ط¬ ظƒظ„ ط§ظ„ظ…ظ†ط§ط·ظ‚ ط§ظ„ظ…ط­ط¯ط¯ط©.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-md border bg-background px-3 py-2">
          <span className="text-sm font-medium">ط§ظ„طھظˆطµظٹظ„ ط®ط§ط±ط¬ ط§ظ„ظ…ظ†ط§ط·ظ‚</span>
          <Switch
            checked={settings.enableOutsideZonesDelivery}
            onCheckedChange={(checked) =>
              updateSetting("enableOutsideZonesDelivery", checked)
            }
            aria-label="طھظپط¹ظٹظ„ ط§ظ„طھظˆطµظٹظ„ ط®ط§ط±ط¬ ط§ظ„ظ…ظ†ط§ط·ظ‚ ط§ظ„ظ…ط­ط¯ط¯ط©"
          />
        </div>
      </div>
      <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">
        <Field label="ط§ظ„ط³ط¹ط± ط§ظ„ط£ط³ط§ط³ظٹ">
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
        <Field label="ط§ظ„ط³ط¹ط± ظٹط´ظ…ظ„ ط£ظˆظ„ ظƒط§ظ… ظƒظٹظ„ظˆ">
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
        <Field label="ط³ط¹ط± ظƒظ„ ظƒظٹظ„ظˆ ط¥ط¶ط§ظپظٹ">
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
        <Field label="ط£ظ‚طµظ‰ ظ…ط³ط§ظپط© طھظˆطµظٹظ„">
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
          <span className="leading-5">ط±ط³ط§ظ„ط© طھط¸ظ‡ط± ظ„ظ„ظ…ط³طھط®ط¯ظ… ظ„ظˆ ط®ط§ط±ط¬ ط§ظ„ظ†ط·ط§ظ‚</span>
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
          ط­ظپط¸ ط§ظ„ط¥ط¹ط¯ط§ط¯ط§طھ
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
        <h2 className="text-base font-semibold">ط§ط®طھط¨ط§ط± ط³ط¹ط± ط§ظ„طھظˆطµظٹظ„</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          ط§ط®طھط± ظ…ظ†ط·ظ‚ط© ط£ظˆ ط£ط¯ط®ظ„ ظ…ط³ط§ظپط© ظ„ط­ط³ط§ط¨ ط§ظ„ط³ط¹ط± ط§ظ„ظ†ظ‡ط§ط¦ظٹ.
        </p>
      </div>
      <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="ط§ظ„ظ…ظ†ط·ظ‚ط© ط§ظ„ظ…ط³طھط®ط¯ظ…ط©">
            <AppSelect
              value={selectedZoneId}
              onValueChange={setSelectedZoneId}
              options={[
                { value: "outside", label: "ط®ط§ط±ط¬ ط§ظ„ظ…ظ†ط§ط·ظ‚ ط§ظ„ظ…ط­ط¯ط¯ط©" },
                ...zones.map((zone) => ({ value: zone.id, label: zone.name })),
              ]}
              ariaLabel="ط§ط®طھظٹط§ط± ظ…ظ†ط·ظ‚ط©"
              dir="rtl"
            />
          </Field>
          <Field label="ط§ظ„ظ…ط³ط§ظپط© ط¨ط§ظ„ظƒظٹظ„ظˆظ…طھط±">
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
              ط§ط­ط³ط¨ ط§ظ„ط³ط¹ط±
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-muted/20 p-4">
          {result ? (
            <div className="space-y-3 text-sm">
              <PreviewRow label="ط§ظ„ظ…ظ†ط·ظ‚ط© ط§ظ„ظ…ط³طھط®ط¯ظ…ط©" value={result.zoneName} />
              <PreviewRow
                label="ظ†ظˆط¹ ط§ظ„طھط³ط¹ظٹط±"
                value={
                  result.pricingType === "outside_zone"
                    ? "طھط³ط¹ظٹط± ط¹ط§ظ…"
                    : pricingTypeLabels[result.pricingType]
                }
              />
              <PreviewRow label="ط§ظ„ظ…ط³ط§ظپط©" value={`${result.distanceKm} ظƒظ…`} />
              <PreviewRow
                label="ط³ط¹ط± ط§ظ„طھظˆطµظٹظ„ ط§ظ„ظ†ظ‡ط§ط¦ظٹ"
                value={formatCurrency(result.deliveryFee)}
              />
              <PreviewRow
                label="ط§ظ„طھظˆطµظٹظ„ ظ…طھط§ط­"
                value={
                  result.available ? (
                    <span className="text-emerald-600">ظ†ط¹ظ…</span>
                  ) : (
                    <span className="text-destructive">ظ„ط§</span>
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
              ظ†طھظٹط¬ط© ط§ظ„ط­ط³ط§ط¨ ط³طھط¸ظ‡ط± ظ‡ظ†ط§.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export function DeliveryZonesPage() {
  const { showSnackbar } = useSnackbar();
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
      showSnackbar({ message: "طھظ… طھط­ط¯ظٹط« ظ…ظ†ط·ظ‚ط© ط§ظ„طھظˆطµظٹظ„ ط¨ظ†ط¬ط§ط­." });
      return;
    }

    setZones((currentZones) => [zone, ...currentZones]);
    setCreating(false);
    setCurrentPage(1);
    showSnackbar({ message: "طھظ…طھ ط¥ط¶ط§ظپط© ظ…ظ†ط·ظ‚ط© ط§ظ„طھظˆطµظٹظ„ ط¨ظ†ط¬ط§ط­." });
  }

  function confirmDeleteZone() {
    if (!deleteZone) {
      return;
    }

    setZones((currentZones) =>
      currentZones.filter((zone) => zone.id !== deleteZone.id),
    );
    setDeleteZone(null);
    setOpenActionMenu(null);
    showSnackbar({
      message: `طھظ… ط­ط°ظپ ${deleteZone.name}.`,
      tone: "danger",
    });
  }

  return (
    <div dir="rtl" className="px-6 py-8">
      <PageTitle
        title="ظ…ظ†ط§ط·ظ‚ ط§ظ„طھظˆطµظٹظ„"
        description="ط¥ط¯ط§ط±ط© ط§ظ„ظ…ظ†ط§ط·ظ‚ ظˆظ‚ظˆط§ط¹ط¯ ط§ظ„طھط³ط¹ظٹط± ظˆط­ط¯ظˆط¯ ط§ظ„طھظˆطµظٹظ„ ظ…ظ† ظ…ظƒط§ظ† ظˆط§ط­ط¯."
        size="compact"
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            ظ…ظ†ط·ظ‚ط© ط¬ط¯ظٹط¯ط©
          </Button>
        }
      />

      <MetricCards
        cards={[
          ["ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ظ…ظ†ط§ط·ظ‚", String(zoneCount), MapPin, "text-primary"],
          ["ط£ظ‚ظ„ ط³ط¹ط±", formatCurrency(lowestPrice), DollarSign, "text-green-500"],
          ["ط£ط¹ظ„ظ‰ ط³ط¹ط±", formatCurrency(highestPrice), CheckCircle2, "text-blue-500"],
        ]}
      />

      <div className="mt-6 flex flex-wrap gap-2 rounded-lg border bg-card p-2">
        {[
          ["zones", "ط§ظ„ظ…ظ†ط§ط·ظ‚ ط§ظ„ط­ط§ظ„ظٹط©", Truck],
          ["settings", "ط¥ط¹ط¯ط§ط¯ط§طھ ط§ظ„طھط³ط¹ظٹط± ط§ظ„ط¹ط§ظ…", Settings2],
          ["tester", "ط§ط®طھط¨ط§ط± ط³ط¹ط± ط§ظ„طھظˆطµظٹظ„", BadgeCheck],
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
            <Field label="ط¨ط­ط«">
              <div className="relative min-w-0 md:w-[360px]">
                <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="h-10 ps-9"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="ط§ط¨ط­ط« ط¹ظ† ظ…ظ†ط·ظ‚ط© ط£ظˆ ط­ط§ظ„ط©..."
                />
              </div>
            </Field>
            <div className="text-sm text-muted-foreground">
              ط¹ط±ط¶ {filteredZones.length} ظ…ظ† {zoneCount} ظ…ظ†ط·ظ‚ط©
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
                text={`ط¹ط±ط¶ ${pagedZones.length} ظ…ظ† ${filteredZones.length} ظ†طھظٹط¬ط©`}
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
            showSnackbar({ message: "طھظ… ط­ظپط¸ ط¥ط¹ط¯ط§ط¯ط§طھ ط§ظ„طھط³ط¹ظٹط± ط§ظ„ط¹ط§ظ…." })
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
