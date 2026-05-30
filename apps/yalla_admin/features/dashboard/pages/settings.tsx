"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  Check,
  ChevronLeft,
  ImagePlus,
  Paintbrush,
  Palette,
  RotateCcw,
  Store,
  Type,
} from "lucide-react";

import {
  dashboardCustomPaletteVariables,
  dashboardFonts,
  dashboardPalettes,
  type DashboardCustomization,
  type DashboardCustomColors,
  useDashboardCustomization,
} from "@/features/dashboard/customization";
import { DashboardImage } from "@/features/dashboard/dashboard-image";
import { logoSrc } from "@/features/dashboard/data";
import { useDashboardI18n } from "@/features/dashboard/i18n";
import { Button, Card, Input, PageTitle } from "@/features/dashboard/primitives";
import { useSnackbar } from "@/features/dashboard/snackbar";
import { cn } from "@/lib/utils";

function SettingBlock({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2 text-base font-bold">
        <span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
          {icon}
        </span>
        {title}
      </div>
      {children}
    </Card>
  );
}

export function SettingsPage() {
  const { t } = useDashboardI18n();
  const { showSnackbar } = useSnackbar();
  const { customization, setCustomization, resetCustomization } =
    useDashboardCustomization();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);

  const brandName = customization.brandName || t("brand.name");
  const branchName = customization.branchName || t("branch.default");
  const logo = customization.logoDataUrl || logoSrc;
  const selectedSwatches =
    customization.palette === "custom"
      ? dashboardCustomPaletteVariables(customization.customColors).swatches
      : (dashboardPalettes.find((palette) => palette.id === customization.palette)
          ?.swatches ?? dashboardPalettes[0].swatches);

  function updateCustomization(
    next: Partial<DashboardCustomization>,
    notify = true,
  ) {
    setCustomization({ ...customization, ...next });
    setStatus("تم تطبيق الإعدادات.");
    if (notify) {
      showSnackbar({ message: "تم تطبيق الإعدادات." });
    }
  }

  function handleLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateCustomization({ logoDataUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  }

  function handleReset() {
    resetCustomization();
    setStatus("تم الرجوع للشكل الافتراضي.");
    showSnackbar({ message: "تم الرجوع للشكل الافتراضي." });
  }

  function updateCustomColor(
    colorKey: keyof DashboardCustomColors,
    value: string,
  ) {
    updateCustomization(
      {
        palette: "custom",
        customColors: {
          ...customization.customColors,
          [colorKey]: value,
        },
      },
      false,
    );
  }

  return (
    <div className="px-6 py-6">
      <PageTitle
        title="الإعدادات"
        description="تخصيص ألوان اللوحة، الخط، وبيانات البراند الظاهرة في القائمة."
        actions={
          <Button onClick={handleReset} type="button" variant="outline">
            <RotateCcw className="size-4" />
            رجوع للافتراضي
          </Button>
        }
      />

      <Link
        href="/settings/themes"
        className="mt-6 flex items-center justify-between gap-4 rounded-lg border bg-card p-5 text-card-foreground shadow-sm transition-colors hover:bg-accent"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Palette className="size-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-base font-bold">المظهر والثيمات</span>
            <span className="mt-1 block text-sm text-muted-foreground">
              إدارة الثيمات الموسمية وتطبيقها على التوصيل، الماركت، ولوحة التحكم.
            </span>
          </span>
        </span>
        <ChevronLeft className="size-5 shrink-0 text-muted-foreground" />
      </Link>

      <div className="mt-6 grid gap-4 xl:grid-cols-[360px_1fr]">
        <Card className="overflow-hidden">
          <div className="border-b bg-muted/20 px-5 py-6">
            <div className="mx-auto flex size-20 items-center justify-center overflow-hidden rounded-xl border bg-background">
              <DashboardImage
                alt={brandName}
                className="size-full"
                height={80}
                src={logo}
                unoptimized={logo.startsWith("data:")}
                width={80}
              />
            </div>
            <div className="mt-4 text-center text-xl font-bold">{brandName}</div>
            <div className="mt-1 text-center text-sm text-muted-foreground">
              {branchName}
            </div>
          </div>

          <div className="space-y-3 p-5">
            <div className="rounded-lg border bg-background p-3">
              <div className="text-xs text-muted-foreground">اللون الحالي</div>
              <div className="mt-2 flex gap-2">
                {selectedSwatches.map((swatch) => (
                  <span
                    key={swatch}
                    className="size-8 rounded-md border"
                    style={{ backgroundColor: swatch }}
                  />
                ))}
              </div>
            </div>
            {status ? (
              <div className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
                {status}
              </div>
            ) : null}
          </div>
        </Card>

        <div className="space-y-4">
          <SettingBlock icon={<Paintbrush className="size-4" />} title="ألوان اللوحة">
            <div className="grid gap-3 md:grid-cols-2">
              {dashboardPalettes.map((palette) => {
                const selected = palette.id === customization.palette;

                return (
                  <button
                    key={palette.id}
                    aria-pressed={selected}
                    className={cn(
                      "flex min-h-20 items-center justify-between gap-3 rounded-lg border bg-background p-4 text-start transition-colors hover:bg-accent",
                      selected && "border-primary bg-primary/10 text-primary",
                    )}
                    onClick={() => updateCustomization({ palette: palette.id })}
                    type="button"
                  >
                    <span className="font-semibold">{palette.name}</span>
                    <span className="flex items-center gap-2">
                      {palette.swatches.map((swatch) => (
                        <span
                          key={swatch}
                          className="size-7 rounded-md border shadow-sm"
                          style={{ backgroundColor: swatch }}
                        />
                      ))}
                      {selected ? <Check className="size-4" /> : null}
                    </span>
                  </button>
                );
              })}
              <button
                aria-pressed={customization.palette === "custom"}
                className={cn(
                  "flex min-h-20 items-center justify-between gap-3 rounded-lg border bg-background p-4 text-start transition-colors hover:bg-accent",
                  customization.palette === "custom" &&
                    "border-primary bg-primary/10 text-primary",
                )}
                onClick={() => updateCustomization({ palette: "custom" })}
                type="button"
              >
                <span className="font-semibold">مخصص</span>
                <span className="flex items-center gap-2">
                  {dashboardCustomPaletteVariables(
                    customization.customColors,
                  ).swatches.map((swatch) => (
                    <span
                      key={swatch}
                      className="size-7 rounded-md border shadow-sm"
                      style={{ backgroundColor: swatch }}
                    />
                  ))}
                  {customization.palette === "custom" ? (
                    <Check className="size-4" />
                  ) : null}
                </span>
              </button>
            </div>

            <div className="mt-4 rounded-lg border bg-background p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold">
                <Palette className="size-4 text-primary" />
                تخصيص الألوان
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  ["primary", "اللون الأساسي"],
                  ["surface", "لون التحديد الخفيف"],
                  ["accent", "لون مساعد"],
                ].map(([colorKey, label]) => (
                  <label
                    key={colorKey}
                    className="grid gap-2 rounded-lg border bg-muted/20 p-3 text-sm font-medium"
                  >
                    {label}
                    <div className="flex items-center gap-2">
                      <Input
                        aria-label={label}
                        className="h-10 w-12 cursor-pointer p-1"
                        onChange={(event) =>
                          updateCustomColor(
                            colorKey as keyof DashboardCustomColors,
                            event.target.value,
                          )
                        }
                        type="color"
                        value={
                          customization.customColors[
                            colorKey as keyof DashboardCustomColors
                          ]
                        }
                      />
                      <Input
                        className="h-10 font-mono text-xs"
                        dir="ltr"
                        readOnly
                        value={
                          customization.customColors[
                            colorKey as keyof DashboardCustomColors
                          ]
                        }
                      />
                    </div>
                  </label>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-lg border bg-muted/20 p-3">
                <span className="text-sm text-muted-foreground">معاينة</span>
                {dashboardCustomPaletteVariables(
                  customization.customColors,
                ).swatches.map((swatch) => (
                  <span
                    key={swatch}
                    className="size-8 rounded-md border shadow-sm"
                    style={{ backgroundColor: swatch }}
                  />
                ))}
              </div>
            </div>
          </SettingBlock>

          <SettingBlock icon={<Type className="size-4" />} title="الخط">
            <div className="grid gap-2 sm:grid-cols-3">
              {dashboardFonts.map((font) => {
                const selected = font.id === customization.font;

                return (
                  <button
                    key={font.id}
                    aria-pressed={selected}
                    className={cn(
                      "flex h-12 items-center justify-center gap-2 rounded-lg border px-3 font-semibold transition-colors hover:bg-accent",
                      selected && "border-primary bg-primary/10 text-primary",
                    )}
                    onClick={() => updateCustomization({ font: font.id })}
                    style={{ fontFamily: font.cssValue }}
                    type="button"
                  >
                    {font.name}
                    {selected ? <Check className="size-4" /> : null}
                  </button>
                );
              })}
            </div>
          </SettingBlock>

          <SettingBlock icon={<Store className="size-4" />} title="اللوجو واسم البراند">
            <div className="grid gap-4">
              <label className="grid gap-2 text-sm font-medium">
                اسم البراند
                <Input
                  onChange={(event) =>
                    updateCustomization({ brandName: event.target.value }, false)
                  }
                  onBlur={() => showSnackbar({ message: "تم تحديث اسم البراند." })}
                  placeholder={t("brand.name")}
                  value={customization.brandName}
                />
              </label>

              <label className="grid gap-2 text-sm font-medium">
                الاسم الظاهر تحت اللوجو
                <Input
                  onChange={(event) =>
                    updateCustomization({ branchName: event.target.value }, false)
                  }
                  onBlur={() =>
                    showSnackbar({ message: "تم تحديث الاسم الظاهر تحت اللوجو." })
                  }
                  placeholder={t("branch.default")}
                  value={customization.branchName}
                />
              </label>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  ref={fileInputRef}
                  accept="image/*"
                  className="sr-only"
                  onChange={handleLogoUpload}
                  type="file"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                  variant="outline"
                >
                  <ImagePlus className="size-4" />
                  تغيير اللوجو
                </Button>
                {customization.logoDataUrl ? (
                  <Button
                    onClick={() => updateCustomization({ logoDataUrl: "" })}
                    type="button"
                    variant="ghost"
                  >
                    حذف اللوجو المخصص
                  </Button>
                ) : null}
              </div>
            </div>
          </SettingBlock>
        </div>
      </div>
    </div>
  );
}
