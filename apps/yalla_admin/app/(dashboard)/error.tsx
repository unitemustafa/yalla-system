"use client";

import { useEffect } from "react";
import { AlertTriangle, Bug, Home, LifeBuoy, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button, Card } from "@/features/dashboard/primitives";

export default function DashboardError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-10 sm:px-6">
      <Card className="w-full max-w-3xl overflow-hidden border-destructive/20 shadow-xl shadow-destructive/5">
        <div className="border-b bg-muted/30 px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-destructive/20 bg-destructive/10 text-destructive">
                <AlertTriangle className="size-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-destructive">
                  خطأ في لوحة التحكم
                </p>
                <h1 className="mt-1 text-2xl font-bold leading-8 tracking-normal">
                  تعذر تحميل هذه الصفحة
                </h1>
              </div>
            </div>
            <span className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-background px-3 text-xs font-semibold text-muted-foreground">
              Yalla Admin
            </span>
          </div>
        </div>

        <div className="px-6 py-6 sm:px-8">
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
            حدث خلل غير متوقع أثناء تجهيز بيانات الداشبورد. يمكنك إعادة
            المحاولة الآن، أو الرجوع للصفحة الرئيسية للوحة التحكم لحين مراجعة
            المشكلة.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border bg-background p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Bug className="size-4 text-destructive" />
                مرجع الخطأ
              </div>
              <p className="mt-2 break-all text-sm text-muted-foreground" dir="ltr">
                {error.digest ?? "غير متاح"}
              </p>
            </div>
            <div className="rounded-lg border bg-background p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <LifeBuoy className="size-4 text-primary" />
                الإجراء المقترح
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                جرب إعادة التحميل. إذا استمرت المشكلة، استخدم مرجع الخطأ مع
                فريق الدعم.
              </p>
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              onClick={unstable_retry}
              className="h-10 w-full sm:w-auto"
            >
              <RefreshCcw className="size-4" />
              إعادة المحاولة
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="h-10 w-full sm:w-auto"
            >
              <Home className="size-4" />
              العودة للوحة التحكم
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
