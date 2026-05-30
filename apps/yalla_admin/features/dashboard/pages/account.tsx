"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  CalendarDays,
  Camera,
  Clock3,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  Send,
  ShieldCheck,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";

import { currentUser } from "@/features/dashboard/profile-data";
import { useDashboardI18n } from "@/features/dashboard/i18n";
import { Button, Card, Input, PageTitle } from "@/features/dashboard/primitives";
import { useSnackbar } from "@/features/dashboard/snackbar";

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-background px-4 py-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-1 truncate text-sm font-semibold">{value}</div>
      </div>
    </div>
  );
}

type PasswordResetStep = "idle" | "code-sent" | "verified";

export function AccountPage() {
  const { t } = useDashboardI18n();
  const { showSnackbar } = useSnackbar();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(currentUser.fullName);
  const [email, setEmail] = useState(currentUser.email);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [passwordStep, setPasswordStep] =
    useState<PasswordResetStep>("idle");
  const [passwordResetEmail, setPasswordResetEmail] =
    useState(currentUser.email);
  const [resetCode, setResetCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    return () => {
      if (profileImage) {
        URL.revokeObjectURL(profileImage);
      }
    };
  }, [profileImage]);

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const nextImage = URL.createObjectURL(file);
    setProfileImage((currentImage) => {
      if (currentImage) {
        URL.revokeObjectURL(currentImage);
      }

      return nextImage;
    });
    setStatus("تم تحديث صورة البروفايل للمعاينة.");
    showSnackbar({ message: "تم تحديث صورة البروفايل." });
  }

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("تم حفظ بيانات البروفايل على الصفحة.");
    showSnackbar({ message: "تم حفظ بيانات البروفايل." });
  }

  async function handleRequestPasswordCode() {
    const targetEmail = email.trim();

    setIsRequestingCode(true);
    setPasswordStatus(null);
    setResetToken("");
    setResetCode("");
    setNewPassword("");
    setConfirmPassword("");

    try {
      const response = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: targetEmail }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message ?? "Failed to send reset code");
      }

      setPasswordStep("code-sent");
      setPasswordResetEmail(targetEmail);
      setPasswordStatus(
        data?.devCode
          ? `تم إرسال كود التأكيد إلى البريد. كود التجربة: ${data.devCode}`
          : "تم إرسال كود التأكيد إلى البريد الإلكتروني.",
      );
      showSnackbar({ message: "تم إرسال كود تأكيد تغيير كلمة المرور." });
    } catch {
      setPasswordStatus("تعذر إرسال كود التأكيد الآن. حاول مرة أخرى.");
      showSnackbar({
        message: "تعذر إرسال كود التأكيد الآن.",
        tone: "danger",
      });
    } finally {
      setIsRequestingCode(false);
    }
  }

  async function handleVerifyPasswordCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsVerifyingCode(true);
    setPasswordStatus(null);

    try {
      const response = await fetch("/api/auth/password-reset/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: passwordResetEmail, code: resetCode }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.resetToken) {
        throw new Error(data?.message ?? "Invalid verification code");
      }

      setResetToken(data.resetToken);
      setPasswordStep("verified");
      setPasswordStatus("تم تأكيد الكود. يمكنك الآن إدخال كلمة مرور جديدة.");
      showSnackbar({ message: "تم تأكيد الكود بنجاح." });
    } catch {
      setPasswordStatus("الكود غير صحيح أو انتهت صلاحيته.");
      showSnackbar({
        message: "الكود غير صحيح أو انتهت صلاحيته.",
        tone: "danger",
      });
    } finally {
      setIsVerifyingCode(false);
    }
  }

  async function handleSavePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (newPassword.length < 6) {
      setPasswordStatus("كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus("تأكيد كلمة المرور غير مطابق.");
      return;
    }

    setIsSavingPassword(true);
    setPasswordStatus(null);

    try {
      const response = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: passwordResetEmail,
          password: newPassword,
          resetToken,
        }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message ?? "Failed to update password");
      }

      setPasswordStep("idle");
      setResetCode("");
      setResetToken("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordStatus("تم تغيير كلمة المرور بنجاح.");
      showSnackbar({ message: "تم تغيير كلمة المرور بنجاح." });
    } catch {
      setPasswordStatus("تعذر تغيير كلمة المرور. اطلب كود جديد وحاول مرة أخرى.");
      showSnackbar({
        message: "تعذر تغيير كلمة المرور.",
        tone: "danger",
      });
    } finally {
      setIsSavingPassword(false);
    }
  }

  async function handleDeleteAccount() {
    setIsDeleting(true);
    setStatus(null);

    try {
      const response = await fetch("/api/auth/delete-account", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      window.location.assign("/login");
    } catch {
      setIsDeleting(false);
      setStatus("تعذر حذف الحساب الآن. حاول مرة أخرى.");
      showSnackbar({
        message: "تعذر حذف الحساب الآن.",
        tone: "danger",
      });
    }
  }

  return (
    <div className="px-6 py-6">
      <PageTitle
        title={t("page.account")}
        description="إدارة مختصرة للبروفايل: الصورة، الاسم، الإيميل، وتفاصيل الدخول."
      />

      <div className="mt-6 grid gap-4 xl:grid-cols-[360px_1fr]">
        <Card className="overflow-hidden">
          <div className="border-b bg-muted/20 px-5 py-6 text-center">
            <div className="relative mx-auto size-28 overflow-hidden rounded-xl border bg-background shadow-sm">
              {profileImage ? (
                <Image
                  alt="صورة البروفايل"
                  className="size-full object-cover"
                  fill
                  sizes="112px"
                  src={profileImage}
                  unoptimized
                />
              ) : (
                <div className="flex size-full items-center justify-center text-3xl font-bold">
                  {currentUser.initials}
                </div>
              )}
              <button
                aria-label="إضافة صورة للبروفايل"
                className="absolute bottom-2 end-2 inline-flex size-9 items-center justify-center rounded-md border bg-background text-primary shadow-sm transition-colors hover:bg-accent"
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                <Camera className="size-4" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              accept="image/*"
              className="sr-only"
              onChange={handleImageChange}
              type="file"
            />
            <Button
              className="mt-4"
              onClick={() => fileInputRef.current?.click()}
              type="button"
              variant="outline"
            >
              <Upload className="size-4" />
              إضافة صورة
            </Button>
          </div>

          <div className="space-y-3 p-5">
            <InfoRow
              icon={<CalendarDays className="size-4" />}
              label="تاريخ الانضمام"
              value={t("account.joined.value")}
            />
            <InfoRow
              icon={<Clock3 className="size-4" />}
              label="آخر تسجيل دخول"
              value={t("account.lastLogin.value")}
            />
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <form className="grid gap-4" onSubmit={handleSave}>
              <label className="grid gap-2 text-sm font-medium">
                الاسم
                <div className="relative">
                  <UserRound className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="ps-9"
                    onChange={(event) => setName(event.target.value)}
                    value={name}
                  />
                </div>
              </label>

              <label className="grid gap-2 text-sm font-medium">
                الإيميل
                <div className="relative">
                  <Mail className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="ps-9"
                    dir="ltr"
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    value={email}
                  />
                </div>
              </label>

              <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <Button className="sm:w-auto" type="submit">
                  حفظ التغييرات
                </Button>
                {status ? (
                  <span className="text-sm text-muted-foreground">{status}</span>
                ) : null}
              </div>
            </form>
          </Card>

          <Card className="p-5">
            <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-base font-bold">
                  <LockKeyhole className="size-5 text-primary" />
                  كلمة المرور
                </div>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  تغيير كلمة المرور يتم بكود تأكيد مكون من 6 أرقام يصل إلى بريد الحساب.
                </p>
              </div>
              <Button
                disabled={isRequestingCode}
                onClick={handleRequestPasswordCode}
                type="button"
                variant="outline"
              >
                <Send className="size-4" />
                {isRequestingCode ? "جاري الإرسال..." : "إرسال كود التغيير"}
              </Button>
            </div>

            <div className="mt-4 grid gap-4">
              <label className="grid gap-2 text-sm font-medium">
                كلمة المرور الحالية
                <div className="relative">
                  <KeyRound className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="ps-9"
                    readOnly
                    type="password"
                    value="********"
                  />
                </div>
              </label>

              {passwordStep === "code-sent" ? (
                <form className="grid gap-4" onSubmit={handleVerifyPasswordCode}>
                  <label className="grid gap-2 text-sm font-medium">
                    كود التأكيد
                    <div className="relative">
                      <ShieldCheck className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        className="ps-9 text-center text-lg tracking-[0.35em]"
                        dir="ltr"
                        inputMode="numeric"
                        maxLength={6}
                        onChange={(event) =>
                          setResetCode(
                            event.target.value.replace(/\D/g, "").slice(0, 6),
                          )
                        }
                        placeholder="000000"
                        value={resetCode}
                      />
                    </div>
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      disabled={isVerifyingCode || resetCode.length !== 6}
                      type="submit"
                    >
                      {isVerifyingCode ? "جاري التأكيد..." : "تأكيد الكود"}
                    </Button>
                    <Button
                      disabled={isRequestingCode}
                      onClick={handleRequestPasswordCode}
                      type="button"
                      variant="outline"
                    >
                      إعادة إرسال الكود
                    </Button>
                  </div>
                </form>
              ) : null}

              {passwordStep === "verified" ? (
                <form className="grid gap-4" onSubmit={handleSavePassword}>
                  <label className="grid gap-2 text-sm font-medium">
                    كلمة المرور الجديدة
                    <div className="relative">
                      <KeyRound className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        autoComplete="new-password"
                        className="px-9"
                        onChange={(event) => setNewPassword(event.target.value)}
                        type={passwordVisible ? "text" : "password"}
                        value={newPassword}
                      />
                      <button
                        aria-label={
                          passwordVisible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
                        }
                        className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                        onClick={() => setPasswordVisible((visible) => !visible)}
                        type="button"
                      >
                        {passwordVisible ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </label>

                  <label className="grid gap-2 text-sm font-medium">
                    تأكيد كلمة المرور
                    <div className="relative">
                      <KeyRound className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        autoComplete="new-password"
                        className="px-9"
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        type={passwordVisible ? "text" : "password"}
                        value={confirmPassword}
                      />
                    </div>
                  </label>

                  <Button disabled={isSavingPassword} className="sm:w-fit" type="submit">
                    {isSavingPassword ? "جاري الحفظ..." : "حفظ كلمة المرور الجديدة"}
                  </Button>
                </form>
              ) : null}

              {passwordStatus ? (
                <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm leading-6 text-muted-foreground">
                  {passwordStatus}
                </div>
              ) : null}
            </div>
          </Card>

          <Card className="border-destructive/40 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-base font-bold text-destructive">
                  حذف الحساب نهائيًا
                </div>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  سيتم تسجيل خروجك ومسح جلسة الحساب الحالية.
                </p>
              </div>
              <Button
                onClick={() => setDeleteConfirmOpen(true)}
                type="button"
                variant="danger"
              >
                <Trash2 className="size-4" />
                حذف الحساب
              </Button>
            </div>

            {deleteConfirmOpen ? (
              <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-4">
                <div className="font-semibold text-destructive">
                  تأكيد الحذف النهائي؟
                </div>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  هذا الإجراء ينهي جلسة الحساب الحالية ولا يمكن التراجع عنه داخل هذه الصفحة.
                </p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Button
                    disabled={isDeleting}
                    onClick={handleDeleteAccount}
                    type="button"
                    variant="danger"
                  >
                    {isDeleting ? "جاري الحذف..." : "تأكيد الحذف النهائي"}
                  </Button>
                  <Button
                    disabled={isDeleting}
                    onClick={() => setDeleteConfirmOpen(false)}
                    type="button"
                    variant="outline"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            ) : null}
          </Card>
        </div>
      </div>
    </div>
  );
}
