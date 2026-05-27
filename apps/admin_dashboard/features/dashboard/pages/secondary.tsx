"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  Calendar,
  CreditCard,
  DollarSign,
  MapPin,
  Package,
  RefreshCcw,
  ShoppingCart,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";

import { orders } from "../data";
import { DashboardImage } from "../dashboard-image";
import {
  Button,
  Card,
  CardHeader,
  DataTable,
  FilterBar,
  PageTitle,
  Pagination,
} from "../primitives";
import { useSnackbar } from "../snackbar";
import { dashboardUsers, type DashboardUser } from "../users/default-dashboard-users";
import { cn } from "@/lib/utils";

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
        <CustomersEmptyState
          onRefresh={() => window.location.reload()}
        />
      ) : null}

      {!isLoading && hasCustomers ? (
        <CustomersTable customers={customers} onDelete={handleDeleteCustomer} />
      ) : null}
    </div>
  );
}

type CustomerPageState = "loading" | "error" | "ready";

const customerPageState: CustomerPageState = "ready";
type CustomerRow = DashboardUser;

export const customerRows: CustomerRow[] = [
  {
    id: "default-user",
    name: "mohamed Gamal",
    phone: "+201121675495",
    email: "mohamed.gamal@yalla-market.com",
    avatar: "/default-user-avatar.svg",
    role: "مستخدم",
    branch: "أول أونلاين ماركت في التل الكبير",
    location: "القاهرة، مصر",
    joinedAt: "26 مايو 2026",
    lastLogin: "اليوم، 4:12 م",
    orders: 1,
    totalSpent: "250.00 جنيه",
    lastOrder: "ORD-20260524-D2W0RJ",
    status: "نشط",
    notes: "مستخدم افتراضي جاهز لاختبار بيانات لوحة التحكم.",
  },
];

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
            <div className="font-semibold text-foreground">تعذر تحميل المستخدمين</div>
            <p className="mt-1 text-sm text-muted-foreground">
              حدثت مشكلة أثناء تحميل بيانات المستخدمين. يمكنك المحاولة مرة أخرى.
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

function CustomersEmptyState({
  onRefresh,
}: {
  onRefresh: () => void;
}) {
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
              {["#", "الصورة", "اسم المستخدم", "رقم الهاتف", "البريد الإلكتروني", ""].map(
                (header) => (
                  <th
                    key={header || "actions"}
                    className="h-10 px-4 text-center align-middle text-xs font-medium text-muted-foreground"
                  >
                    {header}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {customers.map((customer, index) => (
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
                  {index + 1}
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
                  <div className="font-medium text-foreground">{customer.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{customer.role}</div>
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
    </Card>
  );
}

export function CustomersTableLegacy({ customers }: { customers: CustomerRow[] }) {
  return (
    <Card className="overflow-hidden shadow">
      <DataTable
        minWidth={980}
        headers={[
          "اسم المستخدم",
          "رقم الهاتف",
          "البريد الإلكتروني",
          "عدد الطلبات",
          "إجمالي الإنفاق",
          "آخر طلب",
          "الحالة",
          "إجراءات",
        ]}
        rows={customers.map((customer) => [
          <div key={`${customer.id}-name`} className="px-2 font-medium">
            {customer.name}
          </div>,
          customer.phone,
          customer.email,
          customer.orders.toLocaleString("en-US"),
          customer.totalSpent,
          customer.lastOrder,
          customer.status,
          "...",
        ])}
      />
    </Card>
  );
}

export function GenericTablePage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="px-6 py-8">
      <PageTitle title={title} description={description} size="compact" />
      <Card className="mt-6">
        <FilterBar
          className="p-0"
          disabled
          fields={[
            { label: "بحث", type: "search", width: "md:w-72" },
            { label: "الحالة", type: "select", value: "الكل", width: "md:w-44" },
          ]}
        />
        <DataTable
          minWidth={1119}
          headers={["#", "المرجع", "الاسم", "الحالة", "التاريخ", "إجراءات"]}
          rows={orders.map((order) => [
            order[0],
            order[1],
            order[2],
            order[5],
            order[8],
            "...",
          ])}
        />
        <Pagination text="عرض 1-7 من 7 نتائج" pages="1 / 1" nextDisabled />
      </Card>
    </div>
  );
}

export function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<AnalyticsTabKey>("overview");
  const analytics = useMemo(() => buildAnalyticsData(), []);

  return (
    <div className="w-full space-y-6 p-6">
      <PageTitle
        title="Analytics"
        description="Detailed analytics and performance insights"
        actions={<AnalyticsDateActions />}
      />
      <AnalyticsTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div
        id={`analytics-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`analytics-tab-${activeTab}`}
      >
        {activeTab === "overview" ? (
          <AnalyticsOverviewTab analytics={analytics} />
        ) : null}
        {activeTab === "revenue" ? (
          <RevenueTab analytics={analytics} />
        ) : null}
        {activeTab === "orders" ? <OrdersTab analytics={analytics} /> : null}
        {activeTab === "items" ? <ItemsTab /> : null}
        {activeTab === "customers" ? (
          <CustomersTab analytics={analytics} />
        ) : null}
        {activeTab === "payments" ? (
          <PaymentsTab />
        ) : null}
        {activeTab === "zones" ? <ZonesTab /> : null}
      </div>
    </div>
  );
}

function AnalyticsDateActions() {
  return (
    <>
      <div className="hidden items-center gap-2 text-sm md:flex">
        <span>From</span>
        <Button
          variant="outline"
          className="w-[150px] justify-start text-left font-normal"
        >
          <Calendar className="mr-2 size-4 shrink-0" />
          Dec 01, 2025
        </Button>
        <span>—</span>
        <span>To</span>
        <Button
          variant="outline"
          className="w-[150px] justify-start text-left font-normal"
        >
          <Calendar className="mr-2 size-4 shrink-0" />
          Dec 30, 2025
        </Button>
      </div>
      <Button variant="outline" size="sm" className="self-start">
        <RefreshCcw className="mr-2 size-4" />
        Refresh
      </Button>
    </>
  );
}

const analyticsTabs = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "revenue", label: "Revenue", icon: DollarSign },
  { key: "orders", label: "Orders", icon: ShoppingCart },
  { key: "items", label: "Items", icon: Package },
  { key: "customers", label: "Customers", icon: Users },
  { key: "payments", label: "Payments", icon: CreditCard },
  { key: "zones", label: "Zones", icon: MapPin },
] as const;

type AnalyticsTabKey = (typeof analyticsTabs)[number]["key"];

type AnalyticsOrder = {
  index: string;
  orderNumber: string;
  customer: string;
  type: string;
  status: string;
  total: number;
  payment: string;
  date: string;
};

type ItemAnalytics = {
  name: string;
  revenue: number;
  sold: number;
  orders: number;
};

type PaymentAnalytics = {
  method: string;
  total: number;
  orders: number;
  percent: number;
};

type ZoneAnalytics = {
  zone: string;
  orders: number;
  revenue: number;
  completionRate: number;
};

type AnalyticsData = {
  orders: AnalyticsOrder[];
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  completionRate: number;
  grossRevenue: number;
  netRevenue: number;
  fees: number;
  discounts: number;
  avgOrderValue: number;
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  retentionRate: number;
  items: ItemAnalytics[];
  totalItemRevenue: number;
  totalItemQuantity: number;
  lowPerformingItems: ItemAnalytics[];
  paymentMethods: PaymentAnalytics[];
  zones: ZoneAnalytics[];
  revenueChartData: Array<{ name: string; gross: number; net: number }>;
  orderChartData: Array<{ name: string; completed: number; pending: number; cancelled: number }>;
  customerChartData: Array<{ name: string; newCustomers: number; returningCustomers: number }>;
};

function AnalyticsTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: AnalyticsTabKey;
  onTabChange: (tab: AnalyticsTabKey) => void;
}) {
  return (
    <div
      className="flex w-full max-w-full flex-wrap gap-1 overflow-x-auto rounded-xl bg-muted p-1 text-muted-foreground shadow-sm"
      role="tablist"
      aria-label="Analytics sections"
    >
      {analyticsTabs.map((tab) => {
        const Icon = tab.icon;
        const active = tab.key === activeTab;

        return (
          <button
            key={tab.key}
            id={`analytics-tab-${tab.key}`}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={`analytics-panel-${tab.key}`}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              "inline-flex h-[30px] items-center justify-center gap-2 rounded-md px-3 text-xs font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow"
                : "hover:bg-background/60 hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function AnalyticsOverviewTab({ analytics }: { analytics: AnalyticsData }) {
  const primaryPayment = analytics.paymentMethods[0];

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2">
        <AnalyticsMetricCard
          title="Total Revenue"
          value={formatCurrency(analytics.grossRevenue)}
          description={`${analytics.totalOrders} orders`}
          icon={<DollarSign className="size-4 text-muted-foreground" />}
        />
        <AnalyticsMetricCard
          title="Net Revenue"
          value={formatCurrency(analytics.netRevenue)}
          description="After fees and discounts"
          icon={<TrendingUp className="size-4 text-muted-foreground" />}
        />
        <AnalyticsMetricCard
          title="Avg Order Value"
          value={formatCurrency(analytics.avgOrderValue)}
          description="Per completed order"
          icon={<ShoppingCart className="size-4 text-muted-foreground" />}
        />
        <AnalyticsMetricCard
          title="Completion Rate"
          value={formatPercent(analytics.completionRate)}
          description={`${analytics.completedOrders} of ${analytics.totalOrders} orders`}
          icon={<Package className="size-4 text-muted-foreground" />}
        />
      </div>
      <div className="mt-6 grid gap-4">
        <AnalyticsMetricCard
          title="Total Customers"
          value={formatNumber(analytics.totalCustomers)}
          description={`+${formatNumber(analytics.newCustomers)} New Customers`}
          icon={<Users className="size-4 text-muted-foreground" />}
        />
        <AnalyticsMetricCard
          title="Retention Rate"
          value={formatPercent(analytics.retentionRate)}
          description={`${formatNumber(analytics.returningCustomers)} Returning Customers`}
          icon={<TrendingUp className="size-4 text-muted-foreground" />}
        />
        <AnalyticsMetricCard
          title="Payment Methods"
          value={formatPercent(primaryPayment?.percent ?? 0)}
          description={`${primaryPayment?.method ?? "Cash"} Payments`}
          icon={<CreditCard className="size-4 text-muted-foreground" />}
        />
      </div>
    </div>
  );
}

function RevenueTab({ analytics }: { analytics: AnalyticsData }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <AnalyticsMetricCard
          title="Total Revenue"
          value={formatCurrency(analytics.grossRevenue)}
          description={`${analytics.totalOrders} orders`}
          icon={<DollarSign className="size-4 text-muted-foreground" />}
        />
        <AnalyticsMetricCard
          title="Net Revenue"
          value={formatCurrency(analytics.netRevenue)}
          description="After fees and discounts"
          icon={<TrendingUp className="size-4 text-muted-foreground" />}
        />
        <AnalyticsMetricCard
          title="Avg Order Value"
          value={formatCurrency(analytics.avgOrderValue)}
          description="Per completed order"
          icon={<ShoppingCart className="size-4 text-muted-foreground" />}
        />
        <AnalyticsMetricCard
          title="Completion Rate"
          value={formatPercent(analytics.completionRate)}
          description={`${analytics.completedOrders} / ${analytics.totalOrders}`}
          icon={<Package className="size-4 text-muted-foreground" />}
        />
      </div>
      <CenteredEmptyCard
        title="Revenue Breakdown"
        description="Detailed revenue components"
        message="Detailed revenue components"
        className="min-h-[470px]"
      />
    </div>
  );
}

function OrdersTab({ analytics }: { analytics: AnalyticsData }) {
  const incompleteOrders = analytics.pendingOrders + analytics.cancelledOrders;

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <AnalyticsMetricCard
          title="Total Orders"
          value={formatNumber(analytics.totalOrders)}
          description={`${formatNumber(analytics.completedOrders)} Completed`}
          icon={<ShoppingCart className="size-4 text-muted-foreground" />}
        />
        <AnalyticsMetricCard
          title="Completion Rate"
          value={formatPercent(analytics.completionRate)}
          description={`${formatNumber(incompleteOrders)} Incomplete`}
          icon={<Package className="size-4 text-muted-foreground" />}
        />
        <AnalyticsMetricCard
          title="Avg Order Value"
          value={formatCurrency(analytics.avgOrderValue)}
          description="Per completed order"
          icon={<TrendingUp className="size-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="flex min-h-[420px] flex-col overflow-hidden shadow">
          <CardHeader
            title="Orders Overview"
            description="Order statistics and completion"
            className="min-h-[65px] border-b"
          />
          <div className="flex flex-1 flex-col items-center justify-between px-6 py-10 text-center">
            <div />
            <div>
              <div className="text-3xl font-bold leading-none">
                {formatNumber(analytics.totalOrders)}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Total Orders
              </div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 text-sm font-semibold">
                Completion Rate: {formatPercent(analytics.completionRate)}
                <TrendingUp className="size-4 text-muted-foreground" />
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Completed: {formatNumber(analytics.completedOrders)} ·
                Incomplete: {formatNumber(incompleteOrders)}
              </div>
            </div>
          </div>
        </Card>
        <CenteredEmptyCard
          title="Order Types"
          description="Distribution of orders by type"
          message="No data available"
          className="min-h-[420px]"
          alignHeader="left"
        />
      </div>
    </div>
  );
}

function ItemsTab() {
  return (
    <Card className="min-h-[235px] overflow-hidden shadow">
      <div className="flex min-h-[66px] flex-col justify-between gap-3 px-6 py-4 md:flex-row md:items-start">
        <div>
          <div className="text-sm font-semibold leading-none">Top Items</div>
          <div className="mt-2 text-xs text-muted-foreground">
            Best performing menu items
          </div>
        </div>
        <div className="flex rounded-xl bg-muted p-1 text-xs text-muted-foreground shadow-sm">
          <button className="h-8 rounded-md bg-background px-4 font-medium text-foreground shadow">
            Top Items by Revenue
          </button>
          <button className="h-8 rounded-md px-4 font-medium">
            Best Selling by Quantity
          </button>
        </div>
      </div>
      <div className="flex h-[150px] items-center justify-center text-sm text-muted-foreground">
        No data available
      </div>
    </Card>
  );
}

function CustomersTab({ analytics }: { analytics: AnalyticsData }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <AnalyticsMetricCard
          title="Total Customers"
          value={formatNumber(analytics.totalCustomers)}
          description=""
          icon={<Users className="size-4 text-muted-foreground" />}
        />
        <AnalyticsMetricCard
          title="New Customers"
          value={formatNumber(analytics.newCustomers)}
          description=""
          icon={<TrendingUp className="size-4 text-muted-foreground" />}
        />
        <AnalyticsMetricCard
          title="Retention Rate"
          value={formatPercent(analytics.retentionRate)}
          description={`${formatNumber(analytics.returningCustomers)} Returning Customers`}
          icon={<Users className="size-4 text-muted-foreground" />}
        />
      </div>
    </div>
  );
}

function PaymentsTab() {
  return (
    <Card className="flex min-h-[455px] flex-col overflow-hidden shadow">
      <CardHeader
        title="Payment Methods"
        description="Payment breakdown and success rates"
        className="min-h-[65px] border-b"
      />
      <div className="flex flex-1 flex-col items-center justify-between px-6 py-16 text-center">
        <div />
        <div className="text-sm text-muted-foreground">
          Payment breakdown and success rates
        </div>
        <div>
          <div className="flex items-center justify-center gap-2 text-sm font-semibold">
            Cash Payments: {formatPercent(0)} · Digital Payments:{" "}
            {formatPercent(0)}
            <TrendingUp className="size-4 text-muted-foreground" />
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            Payment breakdown and success rates
          </div>
        </div>
      </div>
    </Card>
  );
}

function ZonesTab() {
  return (
    <CenteredEmptyCard
      title="High Volume Zones"
      description="Top delivery zones by order volume"
      message="No data available"
      className="min-h-[235px]"
      alignHeader="left"
    />
  );
}

function CenteredEmptyCard({
  title,
  description,
  message,
  className,
  alignHeader = "center",
}: {
  title: string;
  description: string;
  message: string;
  className?: string;
  alignHeader?: "left" | "center";
}) {
  return (
    <Card className={cn("flex flex-col overflow-hidden shadow", className)}>
      <CardHeader
        title={title}
        description={description}
        className={cn(
          "min-h-[65px] border-b",
          alignHeader === "left" &&
            "items-start justify-start text-left [&>div]:items-start",
        )}
      />
      <div className="flex flex-1 items-center justify-center px-6 py-10 text-center text-sm text-muted-foreground">
        {message}
      </div>
    </Card>
  );
}

function AnalyticsMetricCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="h-[126px] overflow-hidden shadow">
      <div className="flex h-[52px] flex-row items-center justify-between rounded-t-lg bg-muted/30 px-6 py-4">
        <div className="text-sm font-medium tracking-tight">{title}</div>
        {icon}
      </div>
      <div className="px-6 py-4">
        <div className="text-base font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </Card>
  );
}

function buildAnalyticsData(): AnalyticsData {
  return {
    orders: [],
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
    completionRate: 0,
    grossRevenue: 0,
    netRevenue: 0,
    fees: 0,
    discounts: 0,
    avgOrderValue: 0,
    totalCustomers: 0,
    newCustomers: 0,
    returningCustomers: 0,
    retentionRate: 0,
    items: [],
    totalItemRevenue: 0,
    totalItemQuantity: 0,
    lowPerformingItems: [],
    paymentMethods: [{ method: "Cash", total: 0, orders: 0, percent: 0 }],
    zones: [],
    revenueChartData: [],
    orderChartData: [],
    customerChartData: [],
  };

}

function formatCurrency(value: number) {
  return `EGP ${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatPercent(value: number) {
  return `${value.toLocaleString("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

function formatNumber(value: number) {
  return value.toLocaleString("en-US");
}

