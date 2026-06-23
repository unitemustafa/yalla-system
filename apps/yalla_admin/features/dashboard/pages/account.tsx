"use client";

import Image from "next/image";
<<<<<<< HEAD
import { Camera, Mail, ShieldCheck, UserRound } from "lucide-react";
=======
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
>>>>>>> ddcd1d89cdee7f9089a4a648a3aec410ab2923a8

import { useAuth } from "@/features/auth/auth-provider";
import { currentUser } from "@/features/dashboard/profile-data";
import { Button, Card, Input, PageTitle } from "@/features/dashboard/primitives";
import { useSnackbar } from "@/features/dashboard/snackbar";
<<<<<<< HEAD

function displayName(firstName?: string, lastName?: string) {
  return [firstName, lastName].filter(Boolean).join(" ") || currentUser.fullName;
=======
import { uploadDashboardImage } from "@/features/dashboard/upload-dashboard-image";
import { removeInputWhitespace } from "@/lib/input-sanitizers";

const profileImageStorageKey = "yalla-dashboard-profile-image";

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
      label: "8 ط£ط­ط±ظپ ط¹ظ„ظ‰ ط§ظ„ط£ظ‚ظ„",
      isMet: password.length >= 8,
    },
    {
      label: "ط­ط±ظپ ظƒط¨ظٹط± ظˆطµط؛ظٹط±",
      isMet: /[A-Z]/.test(password) && /[a-z]/.test(password),
    },
    {
      label: "ط±ظ‚ظ… ظˆط±ظ…ط² ط®ط§طµ",
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
      aria-label="ظ…طھط·ظ„ط¨ط§طھ ظ‚ظˆط© ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±"
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
          showLastCharacter && index === password.length - 1 ? character : "â€¢",
        )
        .join("")}
    </span>
  );
}

function translatePasswordChangeError(message: string) {
  if (/current password is incorrect/i.test(message)) {
    return "ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ط§ظ„ط­ط§ظ„ظٹط© ط؛ظٹط± طµط­ظٹط­ط©.";
  }

  if (/passwords do not match/i.test(message)) {
    return "طھط£ظƒظٹط¯ ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ط؛ظٹط± ظ…ط·ط§ط¨ظ‚.";
  }

  if (/could not change password/i.test(message)) {
    return "طھط¹ط°ط± طھط؛ظٹظٹط± ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±. ط­ط§ظˆظ„ ظ…ط±ط© ط£ط®ط±ظ‰.";
  }

  return message;
>>>>>>> ddcd1d89cdee7f9089a4a648a3aec410ab2923a8
}

export function AccountPage() {
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
<<<<<<< HEAD
  const name = displayName(user?.first_name, user?.last_name);
  const email = user?.email ?? currentUser.email;
  const phone = user?.phone ?? currentUser.phone;

  function unavailable(feature: string) {
    showSnackbar({
      message: `${feature} غير مربوط بالـ backend حاليًا.`,
      tone: "danger",
    });
=======
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
      setStatus("طھظ… ط­ظپط¸ طµظˆط±ط© ط§ظ„ط¨ط±ظˆظپط§ظٹظ„.");
      showSnackbar({ message: "طھظ… ط­ظپط¸ طµظˆط±ط© ط§ظ„ط¨ط±ظˆظپط§ظٹظ„." });
    } catch {
      setStatus("طھط¹ط°ط± ط±ظپط¹ طµظˆط±ط© ط§ظ„ط¨ط±ظˆظپط§ظٹظ„ ط§ظ„ط¢ظ†.");
      showSnackbar({
        message: "طھط¹ط°ط± ط±ظپط¹ طµظˆط±ط© ط§ظ„ط¨ط±ظˆظپط§ظٹظ„.",
        tone: "danger",
      });
    } finally {
      setIsUploadingProfileImage(false);
      event.target.value = "";
    }
  }

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("طھظ… ط­ظپط¸ ط¨ظٹط§ظ†ط§طھ ط§ظ„ط¨ط±ظˆظپط§ظٹظ„ ط¹ظ„ظ‰ ط§ظ„طµظپط­ط©.");
    showSnackbar({ message: "طھظ… ط­ظپط¸ ط¨ظٹط§ظ†ط§طھ ط§ظ„ط¨ط±ظˆظپط§ظٹظ„." });
  }

  async function handleSavePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordStatus(null);

    if (!currentPassword) {
      setCurrentPasswordError("ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ط§ظ„ط­ط§ظ„ظٹط© ظ…ط·ظ„ظˆط¨ط©");
      setShowPasswordStrengthErrors(false);
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
      setConfirmPasswordError("طھط£ظƒظٹط¯ ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ظ…ط·ظ„ظˆط¨");
      return;
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("طھط£ظƒظٹط¯ ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ط؛ظٹط± ظ…ط·ط§ط¨ظ‚");
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
      setPasswordStatus("طھظ… طھط؛ظٹظٹط± ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±. ط³ط¬ظ„ ط§ظ„ط¯ط®ظˆظ„ طھط§ظ†ظٹ ط¨ط§ظ„ط¨ط§ط³ظˆط±ط¯ ط§ظ„ط¬ط¯ظٹط¯.");
      showSnackbar({ message: "طھظ… طھط؛ظٹظٹط± ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ط¨ظ†ط¬ط§ط­." });
      window.setTimeout(() => {
        window.location.assign("/login");
      }, 900);
    } catch (error) {
      const responseMessage =
        error instanceof Error
          ? error.message
          : "طھط¹ط°ط± طھط؛ظٹظٹط± ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±. ط­ط§ظˆظ„ ظ…ط±ط© ط£ط®ط±ظ‰.";
      const message = translatePasswordChangeError(responseMessage);
      setPasswordStatusTone("error");
      setPasswordStatus(message);
      showSnackbar({
        message: "طھط¹ط°ط± طھط؛ظٹظٹط± ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±.",
        tone: "danger",
      });
    } finally {
      setIsSavingPassword(false);
    }
>>>>>>> ddcd1d89cdee7f9089a4a648a3aec410ab2923a8
  }

  return (
    <div className="px-6 py-6">
      <PageTitle
<<<<<<< HEAD
        title="الحساب"
        description="بيانات حساب المدير الحالي وإعدادات الملف الشخصي."
=======
        title={t("page.account")}
        description="ط¥ط¯ط§ط±ط© ظ…ط®طھطµط±ط© ظ„ظ„ط¨ط±ظˆظپط§ظٹظ„: ط§ظ„طµظˆط±ط©طŒ ط§ظ„ط§ط³ظ…طŒ ط§ظ„ط¥ظٹظ…ظٹظ„طŒ ظˆطھظپط§طµظٹظ„ ط§ظ„ط¯ط®ظˆظ„."
>>>>>>> ddcd1d89cdee7f9089a4a648a3aec410ab2923a8
      />

      <div className="mt-6 grid gap-4 xl:grid-cols-[360px_1fr]">
        <Card className="overflow-hidden">
          <div className="border-b bg-muted/20 px-5 py-6 text-center">
            <div className="relative mx-auto size-28 overflow-hidden rounded-xl border bg-background shadow-sm">
<<<<<<< HEAD
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
=======
              {profileImage ? (
                <Image
                  alt="طµظˆط±ط© ط§ظ„ط¨ط±ظˆظپط§ظٹظ„"
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
                aria-label="ط¥ط¶ط§ظپط© طµظˆط±ط© ظ„ظ„ط¨ط±ظˆظپط§ظٹظ„"
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
              {isUploadingProfileImage ? "ط¬ط§ط±ظٹ ط§ظ„ط±ظپط¹..." : "ط¥ط¶ط§ظپط© طµظˆط±ط©"}
            </Button>
          </div>

          <div className="space-y-3 p-5">
            <InfoRow
              icon={<CalendarDays className="size-4" />}
              label="طھط§ط±ظٹط® ط§ظ„ط§ظ†ط¶ظ…ط§ظ…"
              value={t("account.joined.value")}
            />
            <InfoRow
              icon={<Clock3 className="size-4" />}
              label="ط¢ط®ط± طھط³ط¬ظٹظ„ ط¯ط®ظˆظ„"
              value={t("account.lastLogin.value")}
            />
>>>>>>> ddcd1d89cdee7f9089a4a648a3aec410ab2923a8
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
<<<<<<< HEAD
                الاسم
                <Input value={name} readOnly />
=======
                ط§ظ„ط§ط³ظ…
                <div className="relative">
                  <UserRound className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="ps-9"
                    onChange={(event) => setName(event.target.value)}
                    value={name}
                  />
                </div>
>>>>>>> ddcd1d89cdee7f9089a4a648a3aec410ab2923a8
              </label>
              <label className="grid gap-2 text-sm font-medium">
<<<<<<< HEAD
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
=======
                ط§ظ„ط¥ظٹظ…ظٹظ„
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
                  ط­ظپط¸ ط§ظ„طھط؛ظٹظٹط±ط§طھ
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
                  ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±
                </span>
                <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                  ط؛ظٹظ‘ط± ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ط¨ط§ط³طھط®ط¯ط§ظ… ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ط§ظ„ط­ط§ظ„ظٹط©. ط¨ط¹ط¯ ط§ظ„ط­ظپط¸ ظ‡طھط­طھط§ط¬ طھط³ط¬ظ„ ط¯ط®ظˆظ„ ظ…ظ† ط¬ط¯ظٹط¯.
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
                  ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ط§ظ„ط­ط§ظ„ظٹط©
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
                  ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ط§ظ„ط¬ط¯ظٹط¯ط©
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
                          ? "ط¥ط®ظپط§ط، ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±"
                          : "ط¥ط¸ظ‡ط§ط± ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±"
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
                  طھط£ظƒظٹط¯ ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±
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
                    ? "ط¬ط§ط±ظٹ ط§ظ„ط­ظپط¸..."
                    : "ط­ظپط¸ ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ط§ظ„ط¬ط¯ظٹط¯ط©"}
                </Button>
              </form>
            ) : null}
>>>>>>> ddcd1d89cdee7f9089a4a648a3aec410ab2923a8
          </Card>
        </div>
      </div>
    </div>
  );
}
