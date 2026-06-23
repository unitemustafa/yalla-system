import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  CalendarClock,
  Eye,
  Mail,
  MapPin,
  Phone,
  ShoppingCart,
} from "lucide-react";

import type { DashboardUser } from "../users/default-dashboard-users";
import { DashboardImage } from "../dashboard-image";
import { Badge, Card, PageTitle } from "../primitives";
import type { DashboardOrder } from "@/features/dashboard/static-data";

const currency = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatCurrency(value: number) {
  return `${currency.format(value)} EGP`;
}

export function UserDetailPage({
  user,
  orders,
}: {
  user: DashboardUser;
  orders: DashboardOrder[];
}) {
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const lastOrder = orders[0]?.number ?? "لا يوجد";

  return (
    <div className="space-y-6 px-6 py-10">
      <PageTitle
        title={user.name}
        description="ملف شامل لبيانات المستخدم ونشاطه داخل لوحة التحكم"
        size="compact"
        actions={
          <Link
            href="/customers"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowRight className="size-4" />
            رجوع للمستخدمين
          </Link>
        }
      />

      <Card className="overflow-hidden shadow">
        <div className="flex flex-col gap-5 border-b p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <DashboardImage
              src={user.avatar}
              alt={user.name}
              width={80}
              height={80}
              priority
              className="size-20 rounded-2xl border"
            />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold leading-8">{user.name}</h2>
              <Badge tone="green">{user.status}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{user.role}</p>
          </div>
        </div>
        </div>

        <div className="grid gap-0 md:grid-cols-3">
          <DetailBlock
            icon={<Mail className="size-4" />}
            label="البريد الإلكتروني"
            value={user.email}
            extraValue={`@${user.username}`}
            dir="ltr"
          />
          <DetailBlock icon={<Phone className="size-4" />} label="رقم الهاتف" value={user.phone} dir="ltr" />
          <DetailBlock icon={<MapPin className="size-4" />} label="الموقع" value={user.location} />
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <InfoCard title="نشاط الطلبات" icon={<ShoppingCart className="size-4" />}>
          <InfoRow
            label="عدد الطلبات"
            href="#user-orders"
            value={
              <span className="inline-flex items-center gap-1 font-semibold text-primary">
                {orders.length.toLocaleString("en-US")}
                <Eye className="size-4" />
              </span>
            }
          />
          <InfoRow label="إجمالي الإنفاق" value={formatCurrency(totalSpent)} />
          <InfoRow label="آخر طلب" value={lastOrder} />
        </InfoCard>

        <InfoCard title="التوقيتات" icon={<CalendarClock className="size-4" />}>
          <InfoRow label="تاريخ الانضمام" value={user.joinedAt} />
          <InfoRow label="آخر تسجيل دخول" value={user.lastLogin} />
          <InfoRow label="آخر تحديث" value="اليوم" />
        </InfoCard>
      </div>

      <UserOrdersSection orders={orders} />
    </div>
  );
}

function DetailBlock({
  icon,
  label,
  value,
  extraValue,
  dir,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  extraValue?: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div className="flex min-h-24 items-center gap-3 border-b p-6 md:border-b-0 md:border-e">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2" dir={dir}>
          <span className="truncate text-sm font-medium">{value}</span>
          {extraValue ? (
            <span className="shrink-0 rounded-md border border-primary/25 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {extraValue}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="p-5 shadow">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <span className="text-primary">{icon}</span>
        {title}
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </Card>
  );
}

function InfoRow({
  label,
  value,
  href,
}: {
  label: string;
  value: ReactNode;
  href?: string;
}) {
  const className =
    "flex items-center justify-between gap-4 border-b pb-3 last:border-0 last:pb-0";

  if (href) {
    return (
      <Link
        href={href}
        className={`${className} rounded-md transition hover:bg-muted/40`}
      >
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-medium text-foreground">{value}</span>
      </Link>
    );
  }

  return (
    <div className={className}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function UserOrdersSection({ orders }: { orders: DashboardOrder[] }) {
  return (
    <div id="user-orders" className="scroll-mt-24">
      <Card className="overflow-hidden shadow">
        <div className="flex flex-col gap-2 border-b p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-base font-semibold">طلبات المستخدم</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              اضغط على أي طلب لعرض تفاصيله كاملة.
            </p>
          </div>
          <Badge>{orders.length.toLocaleString("en-US")} طلب</Badge>
        </div>

        {orders.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="h-10 border-b bg-muted/30 text-xs text-muted-foreground">
                  <th className="px-4 text-start font-medium">رقم الطلب</th>
                  <th className="px-4 text-start font-medium">الحالة</th>
                  <th className="px-4 text-start font-medium">نوع الطلب</th>
                  <th className="px-4 text-start font-medium">طريقة الدفع</th>
                  <th className="px-4 text-start font-medium">الإجمالي</th>
                  <th className="px-4 text-start font-medium">التاريخ</th>
                  <th className="px-4 text-start font-medium">التفاصيل</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.number} className="h-14 border-b last:border-0">
                    <td className="px-4 font-medium">
                      <Link
                        href={`/orders/view/${encodeURIComponent(order.number)}`}
                        className="hover:text-primary"
                      >
                        {order.number}
                      </Link>
                    </td>
                    <td className="px-4">{order.status}</td>
                    <td className="px-4">{order.type}</td>
                    <td className="px-4">{order.payment}</td>
                    <td className="px-4 font-semibold">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-4">
                      <div>{order.date}</div>
                      <div className="text-xs text-muted-foreground">
                        {order.time}
                      </div>
                    </td>
                    <td className="px-4">
                      <Link
                        href={`/orders/view/${encodeURIComponent(order.number)}`}
                        className="inline-flex h-8 items-center justify-center rounded-md border bg-background px-3 text-xs font-semibold shadow-sm hover:bg-accent"
                      >
                        عرض الطلب
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">
            لا توجد طلبات مرتبطة بهذا المستخدم حتى الآن.
          </div>
        )}
      </Card>
    </div>
  );
}
