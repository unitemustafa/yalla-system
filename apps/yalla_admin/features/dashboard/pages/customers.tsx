"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, RefreshCcw, Trash2, Users } from "lucide-react";

import { DashboardImage } from "../dashboard-image";
import { Button, Card, PageTitle, Pagination } from "../primitives";
import { useSnackbar } from "../snackbar";
import {
  dashboardUsers,
  type DashboardUser,
} from "../users/default-dashboard-users";

type CustomerPageState = "loading" | "error" | "ready";

const customerPageState: CustomerPageState = "ready";
const customersPageSize = 10;

export function CustomersPage() {
  const [customers, setCustomers] = useState<DashboardUser[]>(dashboardUsers);
  const { showSnackbar } = useSnackbar();
  const isLoading = customerPageState === "loading";
  const hasError = customerPageState === "error";
  const hasCustomers = customers.length > 0;

  function handleDeleteCustomer(userId: string) {
    const user = customers.find((customer) => customer.id === userId);

    setCustomers((currentCustomers) =>
      currentCustomers.filter((customer) => customer.id !== userId),
    );
    showSnackbar({
      message: `تم حذف ${user?.name ?? "المستخدم"}.`,
      tone: "danger",
    });
  }

  return (
    <div className="space-y-6 px-6 py-10">
      <PageTitle
        title="المستخدمين"
        description="إدارة مستخدمي النظام وصلاحيات الدخول"
        size="compact"
      />

      {hasError ? <CustomerErrorAlert /> : null}
      {isLoading ? <CustomersLoadingState /> : null}

      {!isLoading && !hasCustomers ? (
        <CustomersEmptyState onRefresh={() => window.location.reload()} />
      ) : null}

      {!isLoading && hasCustomers ? (
        <CustomersTable customers={customers} onDelete={handleDeleteCustomer} />
      ) : null}
    </div>
  );
}

function CustomerErrorAlert() {
  return (
    <Card className="border-destructive/30 bg-destructive/10 shadow-none">
      <div
        role="alert"
        className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex gap-3">
          <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
            <AlertCircle className="size-4" />
          </div>
          <div>
            <div className="font-semibold text-foreground">
              تعذر تحميل المستخدمين
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              حدثت مشكلة أثناء تحميل بيانات المستخدمين. يمكنك المحاولة مرة
              أخرى.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          className="self-start sm:self-center"
        >
          <RefreshCcw className="size-4" />
          إعادة المحاولة
        </Button>
      </div>
    </Card>
  );
}

function CustomersLoadingState() {
  return (
    <Card className="min-h-[360px] overflow-hidden shadow">
      <div className="space-y-4 p-6">
        <div className="h-9 w-56 animate-pulse rounded-md bg-muted" />
        <div className="grid gap-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="h-12 animate-pulse rounded-md bg-muted/60"
            />
          ))}
        </div>
      </div>
    </Card>
  );
}

function CustomersEmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <Card className="flex min-h-[420px] items-center justify-center bg-card shadow">
      <div className="mx-auto flex w-full max-w-[520px] flex-col items-center px-6 py-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
          <Users className="size-8" />
        </div>
        <h2 className="mt-6 text-xl font-semibold leading-7">
          لا يوجد مستخدمين حتى الآن
        </h2>
        <p className="mt-2 max-w-[430px] text-sm leading-6 text-muted-foreground">
          سيظهر هنا المستخدمين بعد ربطهم بالنظام.
        </p>
        <div className="mt-6 flex w-full flex-col justify-center gap-2 sm:w-auto sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={onRefresh}
            className="h-10"
          >
            <RefreshCcw className="size-4" />
            تحديث البيانات
          </Button>
        </div>
      </div>
    </Card>
  );
}

function CustomersTable({
  customers,
  onDelete,
}: {
  customers: DashboardUser[];
  onDelete: (userId: string) => void;
}) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(customers.length / customersPageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStartIndex = (safeCurrentPage - 1) * customersPageSize;
  const pagedCustomers = customers.slice(
    pageStartIndex,
    pageStartIndex + customersPageSize,
  );

  function openUser(userId: string) {
    router.push(`/customers/${userId}`);
  }

  return (
    <Card className="overflow-hidden shadow">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] caption-bottom text-sm">
          <colgroup>
            <col className="w-16" />
            <col className="w-24" />
            <col className="w-[28%]" />
            <col className="w-[28%]" />
            <col className="w-[28%]" />
            <col className="w-20" />
          </colgroup>
          <thead>
            <tr className="h-10 border-b transition-colors hover:bg-muted/50">
              {[
                "#",
                "الصورة",
                "اسم المستخدم",
                "رقم الهاتف",
                "البريد الإلكتروني",
                "",
              ].map((header) => (
                <th
                  key={header || "actions"}
                  className="h-10 px-4 text-center align-middle text-xs font-medium text-muted-foreground"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedCustomers.map((customer, index) => (
              <tr
                key={customer.id}
                role="button"
                tabIndex={0}
                onClick={() => openUser(customer.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openUser(customer.id);
                  }
                }}
                className="h-[68px] cursor-pointer border-b transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <td className="px-4 text-center align-middle font-medium text-muted-foreground">
                  {pageStartIndex + index + 1}
                </td>
                <td className="px-4 align-middle">
                  <DashboardImage
                    src={customer.avatar}
                    alt={customer.name}
                    width={40}
                    height={40}
                    className="mx-auto size-10 rounded-full border"
                  />
                </td>
                <td className="px-4 text-center align-middle">
                  <div className="font-medium text-foreground">
                    {customer.name}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {customer.role}
                  </div>
                </td>
                <td className="px-4 text-center align-middle">
                  <span dir="ltr" className="inline-block font-medium">
                    {customer.phone}
                  </span>
                </td>
                <td className="px-4 text-center align-middle">
                  <span dir="ltr" className="inline-block font-medium">
                    {customer.email}
                  </span>
                </td>
                <td className="px-4 text-center align-middle">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`حذف ${customer.name}`}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete(customer.id);
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        text={`عرض ${pagedCustomers.length} من ${customers.length} نتيجة`}
        pages={`${safeCurrentPage} / ${totalPages}`}
        previousDisabled={safeCurrentPage === 1}
        nextDisabled={safeCurrentPage === totalPages}
        onPrevious={() =>
          setCurrentPage((page) => Math.max(1, Math.min(page, totalPages) - 1))
        }
        onNext={() =>
          setCurrentPage((page) =>
            Math.min(totalPages, Math.min(page, totalPages) + 1),
          )
        }
      />
    </Card>
  );
}
