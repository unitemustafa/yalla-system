"use client";

import Image from "next/image";
import { Camera, Mail, ShieldCheck, UserRound } from "lucide-react";

import { useAuth } from "@/features/auth/auth-provider";
import { currentUser } from "@/features/dashboard/profile-data";
import { Button, Card, Input, PageTitle } from "@/features/dashboard/primitives";
import { useSnackbar } from "@/features/dashboard/snackbar";

function displayName(firstName?: string, lastName?: string) {
  return [firstName, lastName].filter(Boolean).join(" ") || currentUser.fullName;
}

export function AccountPage() {
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const name = displayName(user?.first_name, user?.last_name);
  const email = user?.email ?? currentUser.email;
  const phone = user?.phone ?? currentUser.phone;

  function unavailable(feature: string) {
    showSnackbar({
      message: `${feature} غير مربوط بالـ backend حاليًا.`,
      tone: "danger",
    });
  }

  return (
    <div className="px-6 py-6">
      <PageTitle
        title="الحساب"
        description="بيانات حساب المدير الحالي وإعدادات الملف الشخصي."
      />

      <div className="mt-6 grid gap-4 xl:grid-cols-[360px_1fr]">
        <Card className="overflow-hidden">
          <div className="border-b bg-muted/20 px-5 py-6 text-center">
            <div className="relative mx-auto size-28 overflow-hidden rounded-xl border bg-background shadow-sm">
              <Image
                alt={name}
                src="/default-user-avatar.svg"
                fill
                className="object-cover"
              />
            </div>
            <h2 className="mt-4 text-xl font-bold">{name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{email}</p>
            <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="size-3.5" />
              مدير
            </span>
          </div>
          <div className="grid gap-3 p-5 text-sm">
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Mail className="size-4 text-primary" />
              <span className="truncate">{email}</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <UserRound className="size-4 text-primary" />
              <span>{phone || "غير مسجل"}</span>
            </div>
          </div>
        </Card>

        <div className="grid gap-4">
          <Card className="p-5">
            <h3 className="text-lg font-bold">بيانات البروفايل</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              البيانات معروضة من جلسة Django. تعديل الحساب يحتاج endpoint مخصص.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium">
                الاسم
                <Input value={name} readOnly />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                البريد الإلكتروني
                <Input value={email} readOnly />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                الهاتف
                <Input value={phone} readOnly />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                الصلاحية
                <Input value={user?.role ?? "admin"} readOnly />
              </label>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button type="button" onClick={() => unavailable("تعديل الحساب")}>
                حفظ التعديلات
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => unavailable("رفع صورة البروفايل")}
              >
                <Camera className="size-4" />
                تغيير الصورة
              </Button>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-lg font-bold">الأمان</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              تغيير كلمة المرور والبريد غير مربوطين بلوحة الإدارة بعد.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-5"
              onClick={() => unavailable("تغيير كلمة المرور")}
            >
              تغيير كلمة المرور
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
