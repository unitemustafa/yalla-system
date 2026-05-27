"use client";

import Link from "next/link";
import { useState } from "react";
import { ImageIcon, Plus, Settings, X } from "lucide-react";

import {
  Button,
  Card,
  Field,
  FormCard,
  Input,
  SelectBox,
  Switch,
} from "../primitives";
import { useSnackbar } from "../snackbar";

export function CreateItemPage() {
  const { showSnackbar } = useSnackbar();
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreviewLoaded, setImagePreviewLoaded] = useState(false);
  const [imagePreviewFailed, setImagePreviewFailed] = useState(false);
  const trimmedImageUrl = imageUrl.trim();
  const imageUrlError =
    trimmedImageUrl && !trimmedImageUrl.startsWith("https://")
      ? "Image URL must start with https://."
      : "";
  const canPreviewImage = Boolean(trimmedImageUrl) && !imageUrlError;

  function updateImageUrl(value: string) {
    setImageUrl(value);
    setImagePreviewLoaded(false);
    setImagePreviewFailed(false);
  }

  function saveProduct(message: string) {
    if (imageUrlError) {
      showSnackbar({ message: imageUrlError, tone: "danger" });
      return;
    }

    showSnackbar({ message });
  }

  return (
    <div className="px-8">
      <Card className="mx-6 mt-4 flex min-h-[59px] items-center justify-between rounded-lg px-4 md:px-4">
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => saveProduct("تم حفظ المنتج.")}
          >
            حفظ المنتج
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              saveProduct("تم حفظ المنتج ويمكنك إضافة جديد.")
            }
          >
            حفظ وإضافة جديد
          </Button>
        </div>
        <Link
          href="/items"
          className="inline-flex size-[41px] items-center justify-center rounded-lg border"
        >
          <X className="size-4" />
        </Link>
      </Card>

      <div className="mx-6 mt-8 grid gap-4 lg:grid-cols-[1fr_352px]">
        <div className="flex flex-col gap-4">
          <FormCard
            title="البيانات الأساسية"
            right={
              <div className="inline-flex overflow-hidden rounded border">
                <button className="bg-primary px-3 py-1 text-sm text-primary-foreground">
                  عربي
                </button>
                <button className="bg-card px-3 py-1 text-sm text-muted-foreground">
                  English
                </button>
              </div>
            }
          >
            <Field label="اسم المنتج">
              <Input placeholder="اكتب اسم المنتج" />
            </Field>
            <Field label="الوصف">
              <textarea
                placeholder="اكتب وصف المنتج"
                className="min-h-[60px] w-full rounded-md border border-border bg-input px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </Field>
          </FormCard>

          <FormCard title="إضافات المنتج">
            <Button variant="outline" size="sm" disabled className="w-fit">
              <Plus className="size-4" />
              إضافة تصنيف إضافات
            </Button>
          </FormCard>

          <FormCard title="اختيارات المنتج">
            <Button className="w-full">
              <Plus className="size-4" />
              إضافة مجموعة اختيارات
            </Button>
          </FormCard>

          <FormCard
            title="المعلومات الغذائية"
            right={<Settings className="size-4 text-muted-foreground" />}
          >
            <div className="flex min-h-24 flex-col justify-center gap-3 rounded-lg border bg-muted/30 p-4 text-sm">
              <div className="font-medium">المعلومات الغذائية غير مفعلة</div>
              <p className="text-muted-foreground">
                للتفعيل، افتح الإعدادات ثم ملف الشركة ثم تبويب الطلبات وشغّل عرض القيم الغذائية.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  فتح الإعدادات
                </Button>
                <Button variant="outline" size="sm">
                  تخطي
                </Button>
              </div>
            </div>
          </FormCard>
        </div>

        <div className="flex flex-col gap-4">
          <FormCard title="صورة المنتج">
            <div className="relative flex h-[220px] w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed bg-muted/30 p-8 text-center">
              {canPreviewImage && !imagePreviewFailed ? (
                <>
                  {!imagePreviewLoaded ? (
                    <div className="absolute inset-0 animate-pulse bg-muted" />
                  ) : null}
                  {/* eslint-disable-next-line @next/next/no-img-element -- User-provided preview URLs are validated as HTTPS without broadening next/image remotePatterns. */}
                  <img
                    alt=""
                    className="relative z-10 max-h-full max-w-full rounded-md object-contain"
                    onError={() => setImagePreviewFailed(true)}
                    onLoad={() => setImagePreviewLoaded(true)}
                    src={trimmedImageUrl}
                  />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4">
                  <ImageIcon className="size-8 text-muted-foreground" />
                  <span className="text-sm font-medium">Image URL preview</span>
                  <span className="text-xs text-muted-foreground">
                    Add a secure image URL to preview it here.
                  </span>
                </div>
              )}
            </div>
            <Field label="Image URL">
              <Input
                aria-invalid={Boolean(imageUrlError)}
                dir="ltr"
                onChange={(event) => updateImageUrl(event.target.value)}
                placeholder="https://example.com/product.webp"
                type="url"
                value={imageUrl}
              />
            </Field>
            {imageUrlError ? (
              <p className="text-xs font-medium text-destructive">
                {imageUrlError}
              </p>
            ) : null}
            {canPreviewImage && imagePreviewFailed ? (
              <p className="text-xs font-medium text-destructive">
                Image failed to load. Check the URL and try again.
              </p>
            ) : null}
          </FormCard>

          <FormCard title="تصنيف المنتج">
            <div className="flex gap-2">
              <SelectBox>اختر التصنيف</SelectBox>
              <Button variant="outline" size="icon">
                <Plus className="size-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <SelectBox>اختر التصنيف الفرعي</SelectBox>
              <Button variant="outline" size="icon">
                <Plus className="size-4" />
              </Button>
            </div>
          </FormCard>

          <FormCard title="فرع المنتج">
            <SelectBox>اختر الفرع</SelectBox>
          </FormCard>

          <FormCard title="سعر المنتج">
            <Field label="السعر الأصلي">
              <Input placeholder="السعر الافتراضي" />
            </Field>
            <Field label="سعر العرض">
              <Input placeholder="سعر العرض" />
            </Field>
          </FormCard>

          <FormCard title="التمييز">
            <div className="flex min-h-[98px] items-center justify-between rounded-lg border p-4">
              <div>
                <div className="text-base font-medium">منتج مميز</div>
                <p className="mt-2 text-sm text-muted-foreground">
                  إظهار المنتج بشكل أوضح في تطبيق العملاء
                </p>
              </div>
              <Switch checked={false} />
            </div>
          </FormCard>
        </div>
      </div>
    </div>
  );
}
