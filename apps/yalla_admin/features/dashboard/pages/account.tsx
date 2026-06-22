"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock3,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  Upload,
  UserRound,
} from "lucide-react";

import { currentUser } from "@/features/dashboard/profile-data";
import { useDashboardI18n } from "@/features/dashboard/i18n";
import { Button, Card, Input, PageTitle } from "@/features/dashboard/primitives";
import { useSnackbar } from "@/features/dashboard/snackbar";
<<<<<<< HEAD
import { uploadDashboardImage } from "@/features/dashboard/upload-dashboard-image";
import { removeInputWhitespace } from "@/lib/input-sanitizers";
=======
import { authFetch } from "@/lib/client-api";
>>>>>>> 56ecfc2 (link dashboard order, items,auth api with backend)

const profileImageStorageKey = "yalla-dashboard-profile-image";

<<<<<<< HEAD
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

function getPasswordRequirements(password: string) {
  return [
    {
      label: "8 أحرف على الأقل",
      isMet: password.length >= 8,
    },
    {
      label: "حرف كبير وصغير",
      isMet: /[A-Z]/.test(password) && /[a-z]/.test(password),
    },
    {
      label: "رقم ورمز خاص",
      isMet: /\d/.test(password) && /[^A-Za-z0-9]/.test(password),
    },
  ];
}

function PasswordStrengthMeter({
  password,
  showErrors,
}: {
  password: string;
  showErrors: boolean;
}) {
  const requirements = getPasswordRequirements(password);

  return (
    <div
      aria-label="متطلبات قوة كلمة المرور"
      aria-live="polite"
      className="grid grid-cols-3 gap-2 text-center"
      role="status"
    >
      {requirements.map((requirement) => {
        const RequirementIcon = requirement.isMet ? CheckCircle2 : Circle;

        return (
          <div
            className={`flex min-w-0 items-center justify-center gap-1.5 text-xs font-semibold sm:gap-2 ${
              requirement.isMet
                ? "text-emerald-600 dark:text-emerald-400"
                : showErrors
                  ? "text-destructive"
                  : "text-muted-foreground"
            }`}
            key={requirement.label}
          >
            <RequirementIcon className="size-4 shrink-0" aria-hidden="true" />
            <span>{requirement.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function useTemporaryLastPasswordCharacter(
  password: string,
  passwordVisible: boolean,
) {
  const [showLastCharacter, setShowLastCharacter] = useState(false);
  const previousLength = useRef(password.length);

  useEffect(() => {
    const appendedCharacter = password.length > previousLength.current;
    previousLength.current = password.length;

    if (passwordVisible || !appendedCharacter) {
      setShowLastCharacter(false);
      return;
=======
  async function updateAccount(body: BodyInit, multipart = false) {
    const response = await authFetch("me", {
      method: "PATCH",
      headers: multipart ? undefined : { "content-type": "application/json" },
      body,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.user) {
      throw new Error(data?.message || "تعذر تحديث الحساب.");
>>>>>>> 56ecfc2 (link dashboard order, items,auth api with backend)
    }

    setShowLastCharacter(true);
    const timeout = window.setTimeout(() => {
      setShowLastCharacter(false);
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [password, passwordVisible]);

  return showLastCharacter;
}

function HiddenPasswordValue({
  password,
  showLastCharacter,
}: {
  password: string;
  showLastCharacter: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 start-9 end-9 flex items-center text-sm text-foreground"
    >
      {password
        .split("")
        .map((character, index) =>
          showLastCharacter && index === password.length - 1 ? character : "•",
        )
        .join("")}
    </span>
  );
}

function translatePasswordChangeError(message: string) {
  if (/current password is incorrect/i.test(message)) {
    return "كلمة المرور الحالية غير صحيحة.";
  }

  if (/passwords do not match/i.test(message)) {
    return "تأكيد كلمة المرور غير مطابق.";
  }

  if (/could not change password/i.test(message)) {
    return "تعذر تغيير كلمة المرور. حاول مرة أخرى.";
  }

  return message;
}

export function AccountPage() {
  const { t } = useDashboardI18n();
  const { showSnackbar } = useSnackbar();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(currentUser.fullName);
  const [email, setEmail] = useState(currentUser.email);
  const [profileImage, setProfileImage] = useState<string | null>(() =>
    typeof window === "undefined"
      ? null
      : localStorage.getItem(profileImageStorageKey),
  );
  const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isPasswordSectionOpen, setIsPasswordSectionOpen] = useState(true);
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [showPasswordStrengthErrors, setShowPasswordStrengthErrors] =
    useState(false);
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [passwordStatusTone, setPasswordStatusTone] = useState<
    "error" | "success"
  >("error");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const showLastCurrentPasswordCharacter = useTemporaryLastPasswordCharacter(
    currentPassword,
    false,
  );
  const showLastNewPasswordCharacter = useTemporaryLastPasswordCharacter(
    newPassword,
    passwordVisible,
  );
  const showLastConfirmPasswordCharacter = useTemporaryLastPasswordCharacter(
    confirmPassword,
    passwordVisible,
  );

  useEffect(() => {
    let alive = true;

    async function loadAccountEmail() {
      const response = await fetch("/api/auth/account");
      const data = await response.json().catch(() => null);

      if (!alive || !response.ok || typeof data?.email !== "string") {
        return;
      }

      setEmail(data.email);
    }

    void loadAccountEmail();

    return () => {
      alive = false;
    };
  }, []);

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploadingProfileImage(true);
    setStatus(null);

    try {
      const uploadedImageUrl = await uploadDashboardImage(file);
      localStorage.setItem(profileImageStorageKey, uploadedImageUrl);
      setProfileImage(uploadedImageUrl);
      setStatus("تم حفظ صورة البروفايل.");
      showSnackbar({ message: "تم حفظ صورة البروفايل." });
    } catch {
      setStatus("تعذر رفع صورة البروفايل الآن.");
      showSnackbar({
        message: "تعذر رفع صورة البروفايل.",
        tone: "danger",
      });
    } finally {
      setIsUploadingProfileImage(false);
      event.target.value = "";
    }
  }

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
<<<<<<< HEAD
    setStatus("تم حفظ بيانات البروفايل على الصفحة.");
    showSnackbar({ message: "تم حفظ بيانات البروفايل." });
  }

  async function handleSavePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordStatus(null);

    if (!currentPassword) {
      setCurrentPasswordError("كلمة المرور الحالية مطلوبة");
      setShowPasswordStrengthErrors(false);
=======
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
>>>>>>> 56ecfc2 (link dashboard order, items,auth api with backend)
      return;
    }

    setCurrentPasswordError("");
    const passwordRequirements = getPasswordRequirements(newPassword);
    const passwordMeetsAllRequirements = passwordRequirements.every(
      (requirement) => requirement.isMet,
    );
    setShowPasswordStrengthErrors(!passwordMeetsAllRequirements);

    if (!passwordMeetsAllRequirements) {
      return;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("تأكيد كلمة المرور مطلوب");
      return;
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("تأكيد كلمة المرور غير مطابق");
      return;
    }

    setConfirmPasswordError("");
    setIsSavingPassword(true);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          passwordConfirm: confirmPassword,
        }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message ?? "Failed to update password");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordStrengthErrors(false);
      setPasswordStatusTone("success");
      setPasswordStatus("تم تغيير كلمة المرور. سجل الدخول تاني بالباسورد الجديد.");
      showSnackbar({ message: "تم تغيير كلمة المرور بنجاح." });
      window.setTimeout(() => {
        window.location.assign("/login");
      }, 900);
    } catch (error) {
      const responseMessage =
        error instanceof Error
          ? error.message
          : "تعذر تغيير كلمة المرور. حاول مرة أخرى.";
      const message = translatePasswordChangeError(responseMessage);
      setPasswordStatusTone("error");
      setPasswordStatus(message);
      showSnackbar({
        message: "تعذر تغيير كلمة المرور.",
        tone: "danger",
      });
    } finally {
      setIsSavingPassword(false);
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
                disabled={isUploadingProfileImage}
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
              disabled={isUploadingProfileImage}
              onClick={() => fileInputRef.current?.click()}
              type="button"
              variant="outline"
            >
              <Upload className="size-4" />
              {isUploadingProfileImage ? "جاري الرفع..." : "إضافة صورة"}
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
                    aria-readonly="true"
                    className="pe-9 text-right cursor-not-allowed bg-muted/40 text-muted-foreground"
                    dir="ltr"
                    readOnly
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
            <button
              aria-controls="password-settings-content"
              aria-expanded={isPasswordSectionOpen}
              className={`flex w-full items-start justify-between gap-4 text-start ${
                isPasswordSectionOpen ? "border-b pb-4" : ""
              }`}
              onClick={() => setIsPasswordSectionOpen((isOpen) => !isOpen)}
              type="button"
            >
              <span>
                <span className="flex items-center gap-2 text-base font-bold">
                  <LockKeyhole className="size-5 text-primary" />
                  كلمة المرور
                </span>
                <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                  غيّر كلمة المرور باستخدام كلمة المرور الحالية. بعد الحفظ هتحتاج تسجل دخول من جديد.
                </span>
              </span>
              <ChevronDown
                aria-hidden="true"
                className={`mt-1 size-5 shrink-0 text-muted-foreground transition-transform ${
                  isPasswordSectionOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isPasswordSectionOpen ? (
              <form
                className="mt-4 grid gap-4"
                id="password-settings-content"
                onSubmit={handleSavePassword}
              >
                <label className="grid gap-2 text-sm font-medium">
                  كلمة المرور الحالية
                  <div className="relative">
                    <KeyRound className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      aria-describedby={
                        currentPasswordError
                          ? "current-password-error"
                          : undefined
                      }
                      aria-invalid={Boolean(currentPasswordError)}
                      autoComplete="current-password"
                      className={`ps-9 ${
                        currentPassword
                          ? "text-transparent caret-foreground"
                          : ""
                      } ${
                        currentPasswordError
                          ? "border-destructive focus-visible:ring-destructive/30"
                          : ""
                      }`}
                      onChange={(event) => {
                        const nextPassword = removeInputWhitespace(
                          event.target.value,
                        );
                        setCurrentPassword(nextPassword);
                        if (nextPassword) {
                          setCurrentPasswordError("");
                        } else {
                          setNewPassword("");
                          setConfirmPassword("");
                          setConfirmPasswordError("");
                          setShowPasswordStrengthErrors(false);
                          setPasswordVisible(false);
                        }
                      }}
                      type="password"
                      value={currentPassword}
                    />
                    {currentPassword ? (
                      <HiddenPasswordValue
                        password={currentPassword}
                        showLastCharacter={showLastCurrentPasswordCharacter}
                      />
                    ) : null}
                  </div>
                  {currentPasswordError ? (
                    <span
                      className="text-xs font-semibold text-destructive"
                      id="current-password-error"
                      role="alert"
                    >
                      {currentPasswordError}
                    </span>
                  ) : null}
                </label>

                <label className="grid gap-2 text-sm font-medium">
                  كلمة المرور الجديدة
                  <div className="relative">
                    <KeyRound className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      autoComplete="new-password"
                      className={`px-9 ${
                        !passwordVisible && newPassword
                          ? "text-transparent caret-foreground"
                          : ""
                      }`}
                      disabled={!currentPassword}
                      onChange={(event) =>
                        setNewPassword(
                          removeInputWhitespace(event.target.value),
                        )
                      }
                      type={passwordVisible ? "text" : "password"}
                      value={newPassword}
                    />
                    {!passwordVisible && newPassword ? (
                      <HiddenPasswordValue
                        password={newPassword}
                        showLastCharacter={showLastNewPasswordCharacter}
                      />
                    ) : null}
                    <button
                      aria-label={
                        passwordVisible
                          ? "إخفاء كلمة المرور"
                          : "إظهار كلمة المرور"
                      }
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!currentPassword}
                      onClick={() =>
                        setPasswordVisible((visible) => !visible)
                      }
                      type="button"
                    >
                      {passwordVisible ? (
                        <Eye className="size-4" />
                      ) : (
                        <EyeOff className="size-4" />
                      )}
                    </button>
                  </div>
                  <PasswordStrengthMeter
                    password={newPassword}
                    showErrors={showPasswordStrengthErrors}
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium">
                  تأكيد كلمة المرور
                  <div className="relative">
                    <KeyRound className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      aria-describedby={
                        confirmPasswordError
                          ? "confirm-password-error"
                          : undefined
                      }
                      aria-invalid={Boolean(confirmPasswordError)}
                      autoComplete="new-password"
                      className={`px-9 ${
                        !passwordVisible && confirmPassword
                          ? "text-transparent caret-foreground"
                          : ""
                      } ${
                        confirmPasswordError
                          ? "border-destructive focus-visible:ring-destructive/30"
                          : ""
                      }`}
                      disabled={!currentPassword}
                      onChange={(event) => {
                        const nextPassword = removeInputWhitespace(
                          event.target.value,
                        );
                        setConfirmPassword(nextPassword);
                        if (nextPassword) {
                          setConfirmPasswordError("");
                        }
                      }}
                      type={passwordVisible ? "text" : "password"}
                      value={confirmPassword}
                    />
                    {!passwordVisible && confirmPassword ? (
                      <HiddenPasswordValue
                        password={confirmPassword}
                        showLastCharacter={showLastConfirmPasswordCharacter}
                      />
                    ) : null}
                  </div>
                  {confirmPasswordError ? (
                    <span
                      className="text-xs font-semibold text-destructive"
                      id="confirm-password-error"
                      role="alert"
                    >
                      {confirmPasswordError}
                    </span>
                  ) : null}
                </label>

                {passwordStatus ? (
                  <div
                    className={`rounded-lg border px-4 py-3 text-sm font-semibold leading-6 ${
                      passwordStatusTone === "error"
                        ? "border-destructive/30 bg-destructive/10 text-destructive"
                        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    }`}
                    role="alert"
                  >
                    {passwordStatus}
                  </div>
                ) : null}

                <Button
                  className="sm:w-fit"
                  disabled={isSavingPassword}
                  type="submit"
                >
                  {isSavingPassword
                    ? "جاري الحفظ..."
                    : "حفظ كلمة المرور الجديدة"}
                </Button>
              </form>
            ) : null}
          </Card>


        </div>
      </div>
    </div>
  );
}
