"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  PackageCheck,
  ShieldCheck,
  Store,
  Truck,
} from "lucide-react";

import { logoSrc } from "@/features/dashboard/data";
import { DashboardAutoTranslate } from "@/features/dashboard/auto-translate";
import { DashboardI18nProvider } from "@/features/dashboard/i18n";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  LoginSplash,
  getInitialLoginSplashVisibility,
  markLoginSplashSeen,
} from "@/features/auth/login-splash";
<<<<<<< HEAD
import { useAuth } from "@/features/auth/auth-provider";
import type { LoginDashboardSnapshot } from "@/features/dashboard/static-data";
import { isSafeNextPath } from "@/lib/auth";
=======
import type { LoginDashboardSnapshot } from "@/lib/login-dashboard-snapshot";
import { removeInputWhitespace } from "@/lib/input-sanitizers";
import { loginToBackend } from "@/lib/client-api";
>>>>>>> ddcd1d89cdee7f9089a4a648a3aec410ab2923a8

const productImages = [
  "https://bucket.ammenu.com/yalla-market/categoriesthumbnails/1775090694513-5coutf286d4.webp",
  "https://bucket.ammenu.com/yalla-market/categoriesthumbnails/1776777321164-qaj9r6n4xei.webp",
  "https://bucket.ammenu.com/yalla-market/items/1778544634562-e47zuvmo7jt.webp",
];

const tabSessionStorageKey = "yalla-dashboard-tab-session";

function LoginPageContent({
  snapshot,
}: {
  snapshot: LoginDashboardSnapshot;
}) {
  const router = useRouter();
  const { login } = useAuth();
  const [showSplash, setShowSplash] = useState(
    getInitialLoginSplashVisibility,
  );
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [showLastPasswordCharacter, setShowLastPasswordCharacter] =
    useState(false);
  const passwordRevealTimeout = useRef<number | null>(null);
  const stats = [
    { label: "طلبات اليوم", value: String(snapshot.todayOrders), icon: PackageCheck },
    { label: "فروع نشطة", value: String(snapshot.activeBranches), icon: Store },
    { label: "مناطق توصيل", value: String(snapshot.deliveryZones), icon: Truck },
  ];

  const finishSplash = useCallback(() => {
    markLoginSplashSeen();
    setShowSplash(false);
  }, []);

  useEffect(() => {
    return () => {
      if (passwordRevealTimeout.current !== null) {
        window.clearTimeout(passwordRevealTimeout.current);
      }
    };
  }, []);

  function handlePasswordChange(nextValue: string) {
    const passwordWithoutWhitespace = removeInputWhitespace(nextValue);
    const appendedCharacter =
      passwordWithoutWhitespace.length > passwordValue.length;
    setPasswordValue(passwordWithoutWhitespace);
    if (passwordWithoutWhitespace) {
      setFieldErrors((current) => ({ ...current, password: "" }));
    }

    if (passwordRevealTimeout.current !== null) {
      window.clearTimeout(passwordRevealTimeout.current);
    }

    if (!passwordVisible && appendedCharacter) {
      setShowLastPasswordCharacter(true);
      passwordRevealTimeout.current = window.setTimeout(() => {
        setShowLastPasswordCharacter(false);
      }, 650);
    } else {
      setShowLastPasswordCharacter(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

<<<<<<< HEAD
    const formData = new FormData(event.currentTarget);
    try {
      await login({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        remember: formData.get("remember") === "on",
      });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "تعذر تسجيل الدخول. حاول مرة أخرى.",
      );
      setPending(false);
=======
    const nextFieldErrors = {
      email: !emailValue
        ? "البريد الإلكتروني مطلوب"
        : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)
          ? ""
          : "اكتب إيميل صحيح",
      password: passwordValue ? "" : "كلمة المرور مطلوبة",
    };
    setFieldErrors(nextFieldErrors);

    if (nextFieldErrors.email || nextFieldErrors.password) {
      return;
    }

    setPending(true);
    const remember =
      new FormData(event.currentTarget).get("remember") === "on";
    const result = await loginToBackend({
      email: emailValue,
      password: passwordValue,
      remember,
    }).catch((error: unknown) => {
      console.error("[login] backend request failed", error);
      return null;
    });

    setPending(false);

    if (!result?.ok) {
      if (result?.forbidden) {
        setError("الحساب ده ملوش صلاحية دخول للداشبورد.");
      } else if (!result) {
        setError("خدمة تسجيل الدخول مش متاحة دلوقتي.");
      } else if (result.incomplete) {
        setError("رد تسجيل الدخول من الباك إند ناقص.");
      } else {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
      }
>>>>>>> ddcd1d89cdee7f9089a4a648a3aec410ab2923a8
      return;
    }

    if (remember || result.remembered) {
      sessionStorage.removeItem(tabSessionStorageKey);
    } else {
      sessionStorage.setItem(
        tabSessionStorageKey,
        JSON.stringify({
          expiresAt: Date.now() + 8 * 60 * 60 * 1000,
        }),
      );
    }

    const nextPath = new URLSearchParams(window.location.search).get("next");
    const destination = isSafeNextPath(nextPath) ? nextPath! : "/dashboard";

    router.replace(destination);
    router.refresh();
  }

  return (
    <main className="relative h-dvh overflow-hidden bg-background text-foreground">
      {showSplash ? <LoginSplash onDone={finishSplash} /> : null}

      <div className="absolute left-4 top-4 z-20">
        <ThemeToggle />
      </div>

      <div className="grid h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(440px,560px)]">
        <section className="relative hidden overflow-hidden bg-primary px-10 py-8 text-primary-foreground lg:flex lg:flex-col lg:justify-between xl:px-14">
          <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(to_left,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:54px_54px]" />
          <div className="absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(to_top,hsl(190_88%_8%/0.28),transparent)]" />

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                alt="Yalla Market"
                src={logoSrc}
                width={56}
                height={56}
                priority
                className="size-14 rounded-xl border border-white/20 object-cover shadow-lg"
              />
              <div>
                <p className="text-xl font-bold leading-6">يلا ماركت</p>
                <p className="text-sm text-white/75">لوحة التحكم</p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white/80">
              <ShieldCheck className="size-4" />
              آمن وسريع
            </div>
          </div>

          <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center py-12">
            <div className="mb-8 grid grid-cols-3 gap-3">
              {stats.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-lg border border-white/20 bg-white/10 p-4 shadow-sm backdrop-blur"
                  >
                    <Icon className="mb-5 size-5 text-amber-200" />
                    <p className="text-3xl font-extrabold leading-none">
                      {item.value}
                    </p>
                    <p className="mt-2 text-xs font-medium text-white/75">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="rounded-xl border border-white/20 bg-white/10 p-5 shadow-2xl shadow-black/15 backdrop-blur">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-white/70">نظرة سريعة</p>
                  <h1 className="mt-1 text-3xl font-extrabold leading-tight xl:text-4xl">
                    إدارة الطلبات والمنتجات والفروع من مكان واحد
                  </h1>
                </div>
                <BarChart3 className="size-9 shrink-0 text-amber-200" />
              </div>

              <div className="mx-auto grid w-full max-w-xl grid-cols-3 gap-3">
                {productImages.map((src) => (
                  <Image
                    key={src}
                    alt=""
                    src={src}
                    width={180}
                    height={180}
                    sizes="(min-width: 1024px) 180px, 33vw"
                    className="aspect-square w-full rounded-lg border border-white/20 object-cover"
                  />
                ))}
              </div>
            </div>
          </div>

        </section>

        <section className="flex h-dvh items-center justify-center overflow-hidden px-5 py-8 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-9 flex items-center gap-3 lg:hidden">
              <Image
                alt="Yalla Market"
                src={logoSrc}
                width={52}
                height={52}
                priority
                className="size-12 rounded-xl object-cover shadow"
              />
              <div>
                <p className="text-xl font-bold">يلا ماركت</p>
                <p className="text-sm text-muted-foreground">لوحة التحكم</p>
              </div>
            </div>

            <div className="mb-8">
              <p className="mb-3 inline-flex rounded-md bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                دخول المدير
              </p>
              <h2 className="text-3xl font-extrabold leading-tight">
                أهلا بيك، كمّل إدارة متجرك
              </h2>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                ادخل بياناتك للوصول للطلبات، المنتجات، الفروع، والتقارير من لوحة واحدة.
              </p>
            </div>

            <form className="space-y-5" noValidate onSubmit={handleSubmit}>
              <label className="block text-sm font-bold">
                البريد الإلكتروني
                <span
                  className={`mt-2 flex h-12 items-center gap-3 rounded-lg border bg-card px-3 shadow-sm transition focus-within:ring-4 ${
                    fieldErrors.email
                      ? "border-destructive focus-within:border-destructive focus-within:ring-destructive/15"
                      : "border-border focus-within:border-primary focus-within:ring-primary/15"
                  }`}
                >
                  <Mail className="size-5 text-muted-foreground" />
                  <input
                    aria-describedby={
                      fieldErrors.email ? "login-email-error" : undefined
                    }
                    aria-invalid={Boolean(fieldErrors.email)}
                    autoComplete="email"
                    name="email"
                    onChange={(event) => {
                      const emailWithoutWhitespace = removeInputWhitespace(
                        event.currentTarget.value,
                      );
                      setEmailValue(emailWithoutWhitespace);
                      if (emailWithoutWhitespace) {
                        setFieldErrors((current) => ({
                          ...current,
                          email: "",
                        }));
                      }
                    }}
                    placeholder="البريد الإلكتروني"
                    className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-sm placeholder:font-bold placeholder:text-muted-foreground"
                    type="email"
                    value={emailValue}
                  />
                </span>
                {fieldErrors.email ? (
                  <span
                    className="mt-1.5 block text-xs font-semibold text-destructive"
                    id="login-email-error"
                    role="alert"
                  >
                    {fieldErrors.email}
                  </span>
                ) : null}
              </label>

              <label className="block text-sm font-bold">
                كلمة المرور
                <span
                  className={`mt-2 flex h-12 items-center gap-3 rounded-lg border bg-card px-3 shadow-sm transition focus-within:ring-4 ${
                    fieldErrors.password
                      ? "border-destructive focus-within:border-destructive focus-within:ring-destructive/15"
                      : "border-border focus-within:border-primary focus-within:ring-primary/15"
                  }`}
                >
                  <LockKeyhole className="size-5 text-muted-foreground" />
                  <span className="relative h-full min-w-0 flex-1">
                    <input
                      aria-describedby={
                        fieldErrors.password
                          ? "login-password-error"
                          : undefined
                      }
                      aria-invalid={Boolean(fieldErrors.password)}
                      autoComplete="current-password"
                      name="password"
                      type={passwordVisible ? "text" : "password"}
                      value={passwordValue}
                      onChange={(event) =>
                        handlePasswordChange(event.currentTarget.value)
                      }
                      placeholder="كلمة المرور"
                      className={`h-full w-full bg-transparent text-base outline-none caret-foreground placeholder:text-sm placeholder:font-bold placeholder:text-muted-foreground ${
                        passwordVisible ? "text-foreground" : "text-transparent"
                      }`}
                    />
                    {!passwordVisible && passwordValue ? (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 flex items-center text-base text-foreground"
                      >
                        {passwordValue
                          .split("")
                          .map((character, index) =>
                            showLastPasswordCharacter &&
                            index === passwordValue.length - 1
                              ? character
                              : "•",
                          )
                          .join("")}
                      </span>
                    ) : null}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setPasswordVisible((visible) => !visible);
                      setShowLastPasswordCharacter(false);
                    }}
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={
                      passwordVisible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
                    }
                    title={
                      passwordVisible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
                    }
                  >
                    {passwordVisible ? (
                      <Eye className="size-5" />
                    ) : (
                      <EyeOff className="size-5" />
                    )}
                  </button>
                </span>
                {fieldErrors.password ? (
                  <span
                    className="mt-1.5 block text-xs font-semibold text-destructive"
                    id="login-password-error"
                    role="alert"
                  >
                    {fieldErrors.password}
                  </span>
                ) : null}
              </label>

<<<<<<< HEAD
              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <input
                  name="remember"
                  type="checkbox"
                  className="size-4 rounded border-border accent-primary"
                />
                تذكّر تسجيل الدخول على هذا الجهاز
              </label>
=======
              <div className="flex items-center justify-between gap-4 text-sm font-semibold">
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <input
                    name="remember"
                    type="checkbox"
                    defaultChecked
                    className="size-4 rounded border-border accent-primary"
                  />
                  <span>تذكرني</span>
                </label>
                <a
                  href="https://web.whatsapp.com/send?phone=201016487371"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  الدعم الفني
                </a>
              </div>
>>>>>>> ddcd1d89cdee7f9089a4a648a3aec410ab2923a8

              {error ? (
                <div
                  role="alert"
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200"
                >
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={pending}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {pending ? "جاري الدخول..." : "دخول"}
                <ArrowLeft className="size-5" />
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

export function LoginPage({
  snapshot,
}: {
  snapshot: LoginDashboardSnapshot;
}) {
  return (
    <DashboardI18nProvider>
      <DashboardAutoTranslate>
        <LoginPageContent snapshot={snapshot} />
      </DashboardAutoTranslate>
    </DashboardI18nProvider>
  );
}
