"use client";

import { useRef, useState } from "react";
import { Camera, KeyRound, Mail, Phone, Save, UserRound } from "lucide-react";

import { useAuthUser } from "@/features/auth/auth-user-provider";
import { DashboardImage } from "@/features/dashboard/dashboard-image";
import { Button, Card, Input, PageTitle } from "@/features/dashboard/primitives";
import { useSnackbar } from "@/features/dashboard/snackbar";
import { authFetch } from "@/lib/client-api";

export function AccountPage() {
  const { user, setUser } = useAuthUser();
  const { showSnackbar } = useSnackbar();
  const fileInput = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  async function updateAccount(body: BodyInit, multipart = false) {
    const response = await authFetch("me", {
      method: "PATCH",
      headers: multipart ? undefined : { "content-type": "application/json" },
      body,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.user) {
      throw new Error(data?.message || "تعذر تحديث الحساب.");
    }
    setUser(data.user);
    return data.user;
  }

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    const form = new FormData(event.currentTarget as HTMLFormElement);
    setSaving(true);
    try {
      await updateAccount(
        JSON.stringify({
          firstName: form.get("firstName"),
          lastName: form.get("lastName"),
          username: form.get("username"),
          email: form.get("email"),
          phone: form.get("phone"),
        }),
      );
      showSnackbar({ message: "تم تحديث بيانات الحساب." });
    } catch (error) {
      showSnackbar({
        message: error instanceof Error ? error.message : "تعذر تحديث الحساب.",
        tone: "danger",
      });
    } finally {
      setSaving(false);
    }
  }

  async function uploadAvatar(file: File | undefined) {
    if (!file) return;
    const form = new FormData();
    form.set("avatar", file);
    try {
      await updateAccount(form, true);
      showSnackbar({ message: "تم تحديث صورة الحساب." });
    } catch (error) {
      showSnackbar({
        message: error instanceof Error ? error.message : "تعذر رفع الصورة.",
        tone: "danger",
      });
    }
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    const response = await authFetch("change-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        currentPassword,
        newPassword,
        passwordConfirm,
      }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      showSnackbar({
        message: data?.message || "تعذر تغيير كلمة المرور.",
        tone: "danger",
      });
      return;
    }
    window.location.href = "/login";
  }

  const initials = (user?.name || user?.email || "A")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="px-6 py-6">
      <PageTitle
        title="الحساب"
        description="بيانات الحساب الفعلية المسجلة في Django."
      />
      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="p-6 text-center">
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="relative mx-auto flex size-28 items-center justify-center overflow-hidden rounded-xl bg-primary/10 text-2xl font-bold text-primary"
          >
            {user?.avatarUrl ? (
              <DashboardImage
                alt={user.name}
                src={user.avatarUrl}
                width={112}
                height={112}
                unoptimized
                className="size-28 object-cover"
              />
            ) : initials}
            <span className="absolute bottom-2 end-2 rounded-full bg-background p-2 shadow">
              <Camera className="size-4" />
            </span>
          </button>
          <input
            ref={fileInput}
            hidden
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(event) => void uploadAvatar(event.target.files?.[0])}
          />
          <h2 className="mt-4 font-bold">{user?.name || "..."}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{user?.role}</p>
          <div className="mt-5 space-y-3 text-start text-sm">
            <p className="flex items-center gap-2"><Mail className="size-4" />{user?.email}</p>
            <p className="flex items-center gap-2"><Phone className="size-4" />{user?.phone || "—"}</p>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <form
              key={user?.id || user?.email}
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={saveProfile}
            >
              <label className="grid gap-2 text-sm font-medium">
                الاسم الأول
                <Input name="firstName" defaultValue={user?.firstName} />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                الاسم الأخير
                <Input name="lastName" defaultValue={user?.lastName} />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                اسم المستخدم
                <Input name="username" defaultValue={user?.username} />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                البريد الإلكتروني
                <Input name="email" type="email" defaultValue={user?.email} />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                الهاتف
                <Input name="phone" defaultValue={user?.phone} />
              </label>
              <div className="sm:col-span-2">
                <Button disabled={saving} type="submit">
                  <Save className="size-4" />
                  {saving ? "جارٍ الحفظ..." : "حفظ"}
                </Button>
              </div>
            </form>
          </Card>

          <Card className="p-6">
            <form className="grid gap-4" onSubmit={changePassword}>
              <h2 className="flex items-center gap-2 font-bold">
                <KeyRound className="size-5" /> تغيير كلمة المرور
              </h2>
              <Input
                type="password"
                placeholder="كلمة المرور الحالية"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <Input
                type="password"
                placeholder="كلمة المرور الجديدة"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Input
                type="password"
                placeholder="تأكيد كلمة المرور"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
              />
              <Button type="submit">
                <UserRound className="size-4" /> تحديث كلمة المرور
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
