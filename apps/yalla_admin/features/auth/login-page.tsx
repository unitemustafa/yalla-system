"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { type FormEvent, useCallback, useState } from "react";
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
import type { LoginDashboardSnapshot } from "@/lib/login-dashboard-snapshot";

const productImages = [
  "https://bucket.ammenu.com/yalla-market/categoriesthumbnails/1775090694513-5coutf286d4.webp",
  "https://bucket.ammenu.com/yalla-market/categoriesthumbnails/1776777321164-qaj9r6n4xei.webp",
  "https://bucket.ammenu.com/yalla-market/items/1778544634562-e47zuvmo7jt.webp",
];

function LoginPageContent({
  snapshot,
}: {
  snapshot: LoginDashboardSnapshot;
}) {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(
    getInitialLoginSplashVisibility,
  );
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const stats = [
    { label: "طلبات اليوم", value: String(snapshot.todayOrders), icon: PackageCheck },
    { label: "فروع نشطة", value: String(snapshot.activeBranches), icon: Store },
    { label: "مناطق توصيل", value: String(snapshot.deliveryZones), icon: Truck },
  ];

  const finishSplash = useCallback(() => {
    markLoginSplashSeen();
    setShowSplash(false);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
        remember: formData.get("remember") === "on",
      }),
    });

    setPending(false);

    if (!response.ok) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
      return;
    }

    const nextPath = new URLSearchParams(window.location.search).get("next");
    const destination =
      nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
        ? nextPath
        : "/dashboard";

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

              <div className="grid grid-cols-[1fr_0.7fr] gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-md bg-white/15 px-4 py-3">
                    <span className="text-sm text-white/75">طلبات مكتملة</span>
                    <span className="text-lg font-bold">
                      {snapshot.completedPercent}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-white/15 px-4 py-3">
                    <span className="text-sm text-white/75">متوسط التجهيز</span>
                    <span className="text-lg font-bold">
                      {snapshot.averagePreparationMinutes} د
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/15">
                    <div
                      className="h-full rounded-full bg-amber-300"
                      style={{ width: `${snapshot.completedPercent}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {productImages.map((src, index) => (
                    <Image
                      key={src}
                      alt=""
                      src={src}
                      width={140}
                      height={140}
                      sizes="(min-width: 1024px) 140px, 33vw"
                      className={[
                        "h-full min-h-24 rounded-lg border border-white/20 object-cover",
                        index === 0 ? "col-span-2 aspect-[2/1]" : "aspect-square",
                      ].join(" ")}
                    />
                  ))}
                </div>
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

            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block text-sm font-bold">
                البريد الإلكتروني
                <span className="mt-2 flex h-12 items-center gap-3 rounded-lg border border-border bg-card px-3 shadow-sm transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
                  <Mail className="size-5 text-muted-foreground" />
                  <input
                    name="email"
                    type="email"
                    defaultValue="dashboard@admin.com"
                    required
                    className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
                    autoComplete="email"
                  />
                </span>
              </label>

              <label className="block text-sm font-bold">
                كلمة المرور
                <span className="mt-2 flex h-12 items-center gap-3 rounded-lg border border-border bg-card px-3 shadow-sm transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
                  <LockKeyhole className="size-5 text-muted-foreground" />
                  <input
                    name="password"
                    type={passwordVisible ? "text" : "password"}
                    placeholder="Demo password"
                    required
                    className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible((visible) => !visible)}
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={
                      passwordVisible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
                    }
                    title={
                      passwordVisible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
                    }
                  >
                    {passwordVisible ? (
                      <EyeOff className="size-5" />
                    ) : (
                      <Eye className="size-5" />
                    )}
                  </button>
                </span>
              </label>

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
