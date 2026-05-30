"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import {
  CheckCircle2,
  Eye,
  ImagePlus,
  Plus,
  Power,
  PowerOff,
  Save,
  Trash2,
  Upload,
} from "lucide-react";

import { Badge, Button, Input, Switch } from "@/features/dashboard/primitives";
import { cn } from "@/lib/utils";

const targetOptions = ["delivery", "market", "dashboard"] as const;
const occasionOptions = [
  "default",
  "ramadan",
  "eid-al-fitr",
  "eid-al-adha",
  "national-day",
  "custom",
] as const;
const assetTypeOptions = ["banner", "splash", "logo", "decorative"] as const;

type TargetKey = (typeof targetOptions)[number];
type OccasionKey = (typeof occasionOptions)[number];
type AssetTypeKey = (typeof assetTypeOptions)[number];

type ThemeColors = {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  button: string;
  headerNavigation: string;
};

type ThemeDto = {
  id: string;
  name: string;
  slug: string;
  description: string;
  occasion: string;
  status: "active" | "inactive";
  colors: ThemeColors;
  darkColors: Partial<Record<keyof ThemeColors, string | null>>;
  welcomeMessage: string | null;
  autoActivate: boolean;
  revertToDefault: boolean;
  startAt: string | null;
  endAt: string | null;
  targets: string[];
  applyToAll: boolean;
  assets: {
    bannerUrl: string | null;
    splashScreenUrl: string | null;
    logoUrl: string | null;
    decorativeAssets: Array<{ id: string; url: string; alt?: string | null }>;
  };
  accessibilityWarnings: string[];
  updatedAt: string;
};

type ActiveThemeResponse = {
  theme: ThemeDto;
  source: string;
  isFallback: boolean;
};

type ThemeListResponse = {
  themes: ThemeDto[];
  activeByTarget: Record<TargetKey, ActiveThemeResponse>;
};

type ThemeFormState = {
  id: string | null;
  name: string;
  slug: string;
  description: string;
  occasion: OccasionKey;
  status: "active" | "inactive";
  colors: ThemeColors;
  darkColors: ThemeColors;
  welcomeMessage: string;
  autoActivate: boolean;
  revertToDefault: boolean;
  startAt: string;
  endAt: string;
  applyToAll: boolean;
  targets: TargetKey[];
  bannerUrl: string;
  splashScreenUrl: string;
  logoUrl: string;
  decorativeAssets: string;
};

const emptyForm: ThemeFormState = {
  id: null,
  name: "ثيم مخصص",
  slug: "custom-theme",
  description: "",
  occasion: "custom",
  status: "inactive",
  colors: {
    primary: "#155e75",
    secondary: "#0f766e",
    background: "#ffffff",
    text: "#111827",
    button: "#155e75",
    headerNavigation: "#ffffff",
  },
  darkColors: {
    primary: "#22d3ee",
    secondary: "#2dd4bf",
    background: "#1b2229",
    text: "#f8fafc",
    button: "#22d3ee",
    headerNavigation: "#1b2229",
  },
  welcomeMessage: "أهلا بك في يلا",
  autoActivate: false,
  revertToDefault: true,
  startAt: "",
  endAt: "",
  applyToAll: true,
  targets: [...targetOptions],
  bannerUrl: "",
  splashScreenUrl: "",
  logoUrl: "",
  decorativeAssets: "",
};

const targetLabels: Record<TargetKey, string> = {
  delivery: "التوصيل",
  market: "الماركت",
  dashboard: "لوحة التحكم",
};

const occasionLabels: Record<OccasionKey, string> = {
  default: "افتراضي",
  ramadan: "رمضان",
  "eid-al-fitr": "عيد الفطر",
  "eid-al-adha": "عيد الأضحى",
  "national-day": "اليوم الوطني",
  custom: "مخصص",
};

const assetTypeLabels: Record<AssetTypeKey, string> = {
  banner: "بانر",
  splash: "شاشة البداية",
  logo: "لوجو",
  decorative: "عنصر زخرفي",
};

const colorLabels: Record<keyof ThemeColors, string> = {
  primary: "اللون الأساسي",
  secondary: "اللون الثانوي",
  background: "الخلفية",
  text: "النص",
  button: "الأزرار",
  headerNavigation: "الهيدر والتنقل",
};

const statusLabels: Record<ThemeDto["status"], string> = {
  active: "نشط",
  inactive: "غير نشط",
};

function toDateTimeLocal(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

function formFromTheme(theme: ThemeDto): ThemeFormState {
  const targets = theme.targets.filter((target): target is TargetKey =>
    targetOptions.includes(target as TargetKey),
  );

  return {
    id: theme.id,
    name: theme.name,
    slug: theme.slug,
    description: theme.description,
    occasion: occasionOptions.includes(theme.occasion as OccasionKey)
      ? (theme.occasion as OccasionKey)
      : "custom",
    status: theme.status,
    colors: theme.colors,
    darkColors: {
      primary: theme.darkColors.primary ?? "",
      secondary: theme.darkColors.secondary ?? "",
      background: theme.darkColors.background ?? "",
      text: theme.darkColors.text ?? "",
      button: theme.darkColors.button ?? "",
      headerNavigation: theme.darkColors.headerNavigation ?? "",
    },
    welcomeMessage: theme.welcomeMessage ?? "",
    autoActivate: theme.autoActivate,
    revertToDefault: theme.revertToDefault,
    startAt: toDateTimeLocal(theme.startAt),
    endAt: toDateTimeLocal(theme.endAt),
    applyToAll: theme.applyToAll,
    targets: targets.length ? targets : [...targetOptions],
    bannerUrl: theme.assets.bannerUrl ?? "",
    splashScreenUrl: theme.assets.splashScreenUrl ?? "",
    logoUrl: theme.assets.logoUrl ?? "",
    decorativeAssets: theme.assets.decorativeAssets
      .map((asset) => asset.url)
      .join("\n"),
  };
}

function payloadFromForm(form: ThemeFormState) {
  const decorativeAssets = form.decorativeAssets
    .split(/\r?\n/)
    .map((asset) => asset.trim())
    .filter(Boolean);

  return {
    name: form.name,
    slug: form.slug,
    description: form.description,
    occasion: form.occasion,
    status: form.status,
    colors: form.colors,
    darkColors: Object.fromEntries(
      Object.entries(form.darkColors).map(([key, value]) => [
        key,
        value.trim() || null,
      ]),
    ),
    welcomeMessage: form.welcomeMessage,
    autoActivate: form.autoActivate,
    revertToDefault: form.revertToDefault,
    startAt: form.startAt ? new Date(form.startAt).toISOString() : null,
    endAt: form.endAt ? new Date(form.endAt).toISOString() : null,
    applyToAll: form.applyToAll,
    targets: form.applyToAll ? [...targetOptions] : form.targets,
    assets: {
      bannerUrl: form.bannerUrl || null,
      splashScreenUrl: form.splashScreenUrl || null,
      logoUrl: form.logoUrl || null,
      decorativeAssets,
    },
  };
}

async function readJson(response: Response) {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function messageFromError(data: unknown, fallback: string) {
  if (typeof data !== "object" || data === null) {
    return fallback;
  }

  const payload = data as { message?: string; errors?: string[] };
  return payload.message ?? payload.errors?.join(" ") ?? fallback;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      {children}
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <select
        className="h-9 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
    </label>
  );
}

function ThemePreview({ form, preview }: { form: ThemeFormState; preview?: ThemeDto }) {
  const colors = preview?.colors ?? form.colors;
  const banner = preview?.assets.bannerUrl ?? form.bannerUrl;
  const logo = preview?.assets.logoUrl ?? form.logoUrl;
  const welcomeMessage = preview?.welcomeMessage ?? form.welcomeMessage;
  const decorativeAssets =
    preview?.assets.decorativeAssets.map((asset) => asset.url) ??
    form.decorativeAssets
      .split(/\r?\n/)
      .map((asset) => asset.trim())
      .filter(Boolean);
  const previewStyle = {
    "--preview-primary": colors.primary,
    "--preview-secondary": colors.secondary,
    "--preview-background": colors.background,
    "--preview-text": colors.text,
    "--preview-button": colors.button,
    "--preview-header": colors.headerNavigation,
  } as CSSProperties;

  return (
    <div
      className="overflow-hidden rounded-lg border bg-background"
      style={previewStyle}
    >
      <div className="flex items-center justify-between bg-[var(--preview-header)] px-4 py-3 text-[var(--preview-text)]">
        <div className="flex min-w-0 items-center gap-2">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="" className="size-8 rounded-md object-cover" src={logo} />
          ) : (
            <span className="size-8 rounded-md bg-[var(--preview-primary)]" />
          )}
          <span className="truncate font-semibold">{form.name || "ثيم"}</span>
        </div>
        <span className="rounded-md bg-[var(--preview-primary)] px-2 py-1 text-xs text-white">
          الهيدر
        </span>
      </div>

      <div className="bg-[var(--preview-background)] p-4 text-[var(--preview-text)]">
        <div
          className="relative mb-4 min-h-24 overflow-hidden rounded-lg border"
          style={{
            background: banner
              ? `center/cover url(${banner})`
              : `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
          }}
        >
          <div className="absolute inset-0 bg-black/15" />
          <div className="relative flex min-h-24 flex-col justify-end p-4 text-white">
            <span className="text-xs tracking-normal">الشاشة الرئيسية</span>
            <strong className="text-xl leading-6">{welcomeMessage || "أهلا بك"}</strong>
          </div>
          {decorativeAssets.slice(0, 3).map((asset, index) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={asset}
              alt=""
              className="absolute size-8 rounded-md object-cover opacity-90"
              src={asset}
              style={{ insetInlineEnd: 16 + index * 38, top: 12 }}
            />
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border bg-white/70 p-3 text-gray-900 shadow-sm dark:bg-black/20 dark:text-white">
            <div className="h-20 rounded-md bg-[var(--preview-secondary)]/20" />
            <div className="mt-3 text-sm font-semibold">كارت منتج</div>
            <div className="mt-1 text-xs opacity-70">120 EGP</div>
            <button className="mt-3 h-8 w-full rounded-md bg-[var(--preview-button)] text-xs font-semibold text-white">
              إضافة
            </button>
          </div>
          <div className="rounded-lg border bg-white/70 p-3 text-gray-900 shadow-sm dark:bg-black/20 dark:text-white">
            <div className="flex size-12 items-center justify-center rounded-md bg-[var(--preview-primary)]/15 text-[var(--preview-primary)]">
              <CheckCircle2 className="size-5" />
            </div>
            <div className="mt-3 text-sm font-semibold">كارت فئة</div>
            <div className="mt-1 text-xs opacity-70">مجموعة موسمية</div>
          </div>
          <div className="rounded-lg border bg-white/70 p-3 text-gray-900 shadow-sm dark:bg-black/20 dark:text-white">
            <div className="flex items-center justify-between border-b pb-2 text-xs">
              <span>لوحة التحكم</span>
              <span className="rounded-md bg-[var(--preview-primary)] px-2 py-1 text-white">
                نشط
              </span>
            </div>
            <div className="mt-3 grid gap-2">
              <span className="h-2 rounded bg-[var(--preview-primary)]/80" />
              <span className="h-2 rounded bg-[var(--preview-secondary)]/70" />
              <span className="h-2 rounded bg-gray-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ThemeManager({ className }: { className?: string }) {
  const [themes, setThemes] = useState<ThemeDto[]>([]);
  const [activeByTarget, setActiveByTarget] =
    useState<ThemeListResponse["activeByTarget"] | null>(null);
  const [form, setForm] = useState<ThemeFormState>(emptyForm);
  const [preview, setPreview] = useState<ThemeDto | undefined>();
  const [assetType, setAssetType] = useState<AssetTypeKey>("banner");
  const [assetFile, setAssetFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selectedTheme = useMemo(
    () => themes.find((theme) => theme.id === form.id) ?? null,
    [form.id, themes],
  );

  async function refreshThemes(nextSelectedId = form.id) {
    setLoading(true);
    const response = await fetch("/api/dashboard/themes");
    const data = (await readJson(response)) as ThemeListResponse;

    if (!response.ok) {
      throw new Error(messageFromError(data, "تعذر تحميل الثيمات."));
    }

    setThemes(data.themes);
    setActiveByTarget(data.activeByTarget);

    const nextTheme =
      data.themes.find((theme) => theme.id === nextSelectedId) ?? data.themes[0];

    if (nextTheme) {
      setForm(formFromTheme(nextTheme));
    }

    setLoading(false);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      refreshThemes().catch((error: unknown) => {
        setMessage(error instanceof Error ? error.message : "تعذر تحميل الثيمات.");
        setLoading(false);
      });
    }, 0);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateColor(key: keyof ThemeColors, value: string, dark = false) {
    setForm((current) => ({
      ...current,
      [dark ? "darkColors" : "colors"]: {
        ...(dark ? current.darkColors : current.colors),
        [key]: value,
      },
    }));
  }

  function updateTarget(target: TargetKey, enabled: boolean) {
    setForm((current) => {
      const targets = enabled
        ? Array.from(new Set([...current.targets, target]))
        : current.targets.filter((item) => item !== target);

      return {
        ...current,
        targets,
        applyToAll: targets.length === targetOptions.length,
      };
    });
  }

  async function saveTheme() {
    setBusy(true);
    setMessage(null);

    try {
      const response = await fetch(
        form.id
          ? `/api/dashboard/themes/${encodeURIComponent(form.id)}`
          : "/api/dashboard/themes",
        {
          method: form.id ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payloadFromForm(form)),
        },
      );
      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(messageFromError(data, "تعذر حفظ الثيم."));
      }

      const savedTheme = (data as { theme: ThemeDto }).theme;
      await refreshThemes(savedTheme.id);
      setPreview(savedTheme);
      setMessage("تم حفظ الثيم.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر حفظ الثيم.");
    } finally {
      setBusy(false);
    }
  }

  async function previewTheme() {
    setBusy(true);
    setMessage(null);

    try {
      const response = await fetch("/api/dashboard/themes/preview", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payloadFromForm(form)),
      });
      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(messageFromError(data, "تعذر تحديث المعاينة."));
      }

      setPreview((data as { preview: { theme: ThemeDto } }).preview.theme);
      setMessage("تم تحديث المعاينة.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر تحديث المعاينة.");
    } finally {
      setBusy(false);
    }
  }

  async function activateSelectedTheme() {
    if (!form.id) {
      setMessage("احفظ الثيم قبل التفعيل.");
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/dashboard/themes/${encodeURIComponent(form.id)}/activate`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            applyToAll: form.applyToAll,
            targets: form.applyToAll ? [...targetOptions] : form.targets,
          }),
        },
      );
      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(messageFromError(data, "تعذر تفعيل الثيم."));
      }

      await refreshThemes(form.id);
      setMessage("تم تفعيل الثيم.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر تفعيل الثيم.");
    } finally {
      setBusy(false);
    }
  }

  async function deactivateSelectedTheme() {
    if (!form.id) {
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/dashboard/themes/${encodeURIComponent(form.id)}/deactivate`,
        { method: "POST" },
      );
      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(messageFromError(data, "تعذر إيقاف الثيم."));
      }

      await refreshThemes(form.id);
      setMessage("تم إيقاف الثيم.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر إيقاف الثيم.");
    } finally {
      setBusy(false);
    }
  }

  async function disableTheme() {
    if (!form.id) {
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/dashboard/themes/${encodeURIComponent(form.id)}`,
        { method: "DELETE" },
      );
      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(messageFromError(data, "تعذر حذف الثيم."));
      }

      await refreshThemes();
      setMessage("تم حذف الثيم.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر حذف الثيم.");
    } finally {
      setBusy(false);
    }
  }

  async function uploadAsset() {
    if (!form.id || !assetFile) {
      setMessage("اختر ثيما محفوظا وصورة أولا.");
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.set("type", assetType);
      formData.set("file", assetFile);

      const response = await fetch(
        `/api/dashboard/themes/${encodeURIComponent(form.id)}/assets`,
        { method: "POST", body: formData },
      );
      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(messageFromError(data, "تعذر رفع الصورة."));
      }

      await refreshThemes(form.id);
      setAssetFile(null);
      setMessage("تم رفع الصورة.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر رفع الصورة.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={cn("mt-6", className)}>
      <div className="mb-4 flex flex-col justify-between gap-3 rounded-lg border bg-card px-4 py-3 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-semibold leading-8 tracking-normal">
            المظهر والثيمات
          </h2>
          <p className="text-sm text-muted-foreground">
            إدارة الثيمات الموسمية للتوصيل، الماركت، ولوحة التحكم.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setForm(emptyForm);
            setPreview(undefined);
            setMessage(null);
          }}
        >
          <Plus className="size-4" />
          ثيم جديد
        </Button>
      </div>

      {message ? (
        <div className="mb-4 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
          {message}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="rounded-lg border bg-card lg:sticky lg:top-4 lg:max-h-[calc(100vh-7rem)]">
          <div className="border-b px-4 py-3 text-sm font-semibold">
            إدارة الثيمات
          </div>
          <div className="max-h-[inherit] overflow-y-auto p-2">
            {loading ? (
              <div className="p-4 text-sm text-muted-foreground">جاري تحميل الثيمات...</div>
            ) : null}
            {themes.map((theme) => {
              const selected = theme.id === form.id;
              const activeTargets = targetOptions.filter(
                (target) => activeByTarget?.[target]?.theme.id === theme.id,
              );

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    setForm(formFromTheme(theme));
                    setPreview(theme);
                    setMessage(null);
                  }}
                  className={cn(
                    "mb-2 w-full rounded-md border bg-background p-3 text-start transition-colors hover:border-primary/40 hover:bg-accent/70",
                    selected && "border-primary bg-primary/10 shadow-sm",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">
                        {theme.name}
                      </div>
                      <div className="mt-1 truncate text-xs text-muted-foreground">
                        {theme.slug}
                      </div>
                    </div>
                    <Badge tone={theme.status === "active" ? "green" : "secondary"}>
                      {statusLabels[theme.status]}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {theme.targets.map((target) => (
                      <span
                        key={target}
                        className="rounded bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                      >
                        {targetLabels[target as TargetKey] ?? target}
                      </span>
                    ))}
                  </div>
                  {activeTargets.length ? (
                    <div className="mt-2 text-xs font-medium text-primary">
                      نشط على {activeTargets.map((target) => targetLabels[target]).join("، ")}
                    </div>
                  ) : null}
                  <div className="mt-3 flex gap-1">
                    {Object.values(theme.colors).slice(0, 5).map((color) => (
                      <span
                        key={color}
                        className="size-4 rounded border"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid min-w-0 gap-4">
          <div className="rounded-lg border bg-card">
            <div className="flex flex-col gap-3 border-b px-4 py-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-semibold">
                  {form.id ? "تعديل الثيم" : "إنشاء ثيم"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {selectedTheme?.updatedAt
                    ? `آخر تحديث ${new Date(selectedTheme.updatedAt).toLocaleString("ar-EG-u-nu-latn")}`
                    : "ثيم غير محفوظ"}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={previewTheme} disabled={busy}>
                  <Eye className="size-4" />
                  معاينة
                </Button>
                <Button type="button" onClick={saveTheme} disabled={busy}>
                  <Save className="size-4" />
                  حفظ
                </Button>
              </div>
            </div>

            <div className="grid gap-4 p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="اسم الثيم">
                  <Input
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, name: event.target.value }))
                    }
                  />
                </Field>
                <Field label="المعرف / المفتاح">
                  <Input
                    dir="ltr"
                    value={form.slug}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, slug: event.target.value }))
                    }
                  />
                </Field>
              </div>

              <Field label="الوصف">
                <textarea
                  className="min-h-20 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                />
              </Field>

              <div className="grid gap-3 md:grid-cols-3">
                <SelectField
                  label="المناسبة"
                  value={form.occasion}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      occasion: value as OccasionKey,
                    }))
                  }
                >
                  {occasionOptions.map((occasion) => (
                    <option key={occasion} value={occasion}>
                      {occasionLabels[occasion]}
                    </option>
                  ))}
                </SelectField>
                <SelectField
                  label="الحالة"
                  value={form.status}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      status: value as "active" | "inactive",
                    }))
                  }
                >
                  <option value="active">{statusLabels.active}</option>
                  <option value="inactive">{statusLabels.inactive}</option>
                </SelectField>
                <Field label="رسالة الترحيب">
                  <Input
                    value={form.welcomeMessage}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        welcomeMessage: event.target.value,
                      }))
                    }
                  />
                </Field>
              </div>

              <div className="rounded-lg border bg-background/40 p-4">
                <div className="mb-3 text-sm font-semibold">خيارات تطبيق الثيم</div>
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  <label className="flex min-h-12 items-center justify-between gap-3 rounded-md border bg-card px-3 py-2 text-sm">
                    تطبيق على الكل
                    <Switch
                      checked={form.applyToAll}
                      onCheckedChange={(checked) =>
                        setForm((current) => ({
                          ...current,
                          applyToAll: checked,
                          targets: checked ? [...targetOptions] : current.targets,
                        }))
                      }
                    />
                  </label>
                  {targetOptions.map((target) => (
                    <label
                      key={target}
                      className="flex min-h-12 items-center justify-between gap-3 rounded-md border bg-card px-3 py-2 text-sm"
                    >
                      {targetLabels[target]}
                      <Switch
                        checked={form.targets.includes(target)}
                        disabled={form.applyToAll}
                        onCheckedChange={(checked) => updateTarget(target, checked)}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border bg-background/40 p-4">
                <div className="mb-3 text-sm font-semibold">الألوان</div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {Object.entries(form.colors).map(([key, value]) => (
                    <Field key={key} label={colorLabels[key as keyof ThemeColors]}>
                      <div className="flex gap-2">
                        <Input
                          className="w-12 shrink-0 p-1"
                          type="color"
                          value={value}
                          onChange={(event) =>
                            updateColor(key as keyof ThemeColors, event.target.value)
                          }
                        />
                        <Input
                          dir="ltr"
                          value={value}
                          onChange={(event) =>
                            updateColor(key as keyof ThemeColors, event.target.value)
                          }
                        />
                      </div>
                    </Field>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border bg-background/40 p-4">
                <div className="mb-3 text-sm font-semibold">ألوان الوضع الداكن</div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {Object.entries(form.darkColors).map(([key, value]) => (
                    <Field key={key} label={colorLabels[key as keyof ThemeColors]}>
                      <div className="flex gap-2">
                        <Input
                          className="w-12 shrink-0 p-1"
                          type="color"
                          value={value || "#000000"}
                          onChange={(event) =>
                            updateColor(key as keyof ThemeColors, event.target.value, true)
                          }
                        />
                        <Input
                          dir="ltr"
                          value={value}
                          onChange={(event) =>
                            updateColor(key as keyof ThemeColors, event.target.value, true)
                          }
                        />
                      </div>
                    </Field>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Field label="تاريخ البداية">
                  <Input
                    type="datetime-local"
                    value={form.startAt}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, startAt: event.target.value }))
                    }
                  />
                </Field>
                <Field label="تاريخ النهاية">
                  <Input
                    type="datetime-local"
                    value={form.endAt}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, endAt: event.target.value }))
                    }
                  />
                </Field>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex min-h-12 items-center justify-between gap-3 rounded-md border bg-background/40 px-3 py-2 text-sm">
                  تفعيل تلقائي حسب التاريخ
                  <Switch
                    checked={form.autoActivate}
                    onCheckedChange={(checked) =>
                      setForm((current) => ({ ...current, autoActivate: checked }))
                    }
                  />
                </label>
                <label className="flex min-h-12 items-center justify-between gap-3 rounded-md border bg-background/40 px-3 py-2 text-sm">
                  الرجوع للافتراضي بعد الانتهاء
                  <Switch
                    checked={form.revertToDefault}
                    onCheckedChange={(checked) =>
                      setForm((current) => ({ ...current, revertToDefault: checked }))
                    }
                  />
                </label>
              </div>

              <div className="rounded-lg border bg-background/40 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <ImagePlus className="size-4 text-primary" />
                  صور وأصول الثيم
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <Field label="رابط البانر">
                    <Input
                      dir="ltr"
                      value={form.bannerUrl}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          bannerUrl: event.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="رابط شاشة البداية">
                    <Input
                      dir="ltr"
                      value={form.splashScreenUrl}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          splashScreenUrl: event.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="رابط اللوجو الموسمي">
                    <Input
                      dir="ltr"
                      value={form.logoUrl}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          logoUrl: event.target.value,
                        }))
                      }
                    />
                  </Field>
                </div>
                <Field label="روابط العناصر الزخرفية">
                  <textarea
                    dir="ltr"
                    className="min-h-20 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                    value={form.decorativeAssets}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        decorativeAssets: event.target.value,
                      }))
                    }
                  />
                </Field>
                <div className="mt-3 grid gap-3 rounded-md border bg-card p-3 md:grid-cols-[160px_minmax(0,1fr)_auto]">
                  <select
                    className="h-9 rounded-md border border-border bg-background px-3 text-sm outline-none"
                    value={assetType}
                    onChange={(event) => setAssetType(event.target.value as AssetTypeKey)}
                  >
                    {assetTypeOptions.map((type) => (
                      <option key={type} value={type}>
                        {assetTypeLabels[type]}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(event) => setAssetFile(event.target.files?.[0] ?? null)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={uploadAsset}
                    disabled={busy || !form.id}
                  >
                    <Upload className="size-4" />
                    رفع
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 border-t pt-4">
                <Button type="button" onClick={activateSelectedTheme} disabled={busy || !form.id}>
                  <Power className="size-4" />
                  تفعيل
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={deactivateSelectedTheme}
                  disabled={busy || !form.id}
                >
                  <PowerOff className="size-4" />
                  إيقاف
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={disableTheme}
                  disabled={busy || !form.id || selectedTheme?.slug === "default"}
                >
                  <Trash2 className="size-4" />
                  حذف
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card">
            <div className="border-b px-4 py-3 text-sm font-semibold">
              معاينة الثيم
            </div>
            <div className="grid gap-4 p-4">
              <ThemePreview form={form} preview={preview} />
              {(preview?.accessibilityWarnings ?? selectedTheme?.accessibilityWarnings ?? [])
                .length ? (
                <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-100">
                  {(preview?.accessibilityWarnings ?? selectedTheme?.accessibilityWarnings)?.join(
                    " ",
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
