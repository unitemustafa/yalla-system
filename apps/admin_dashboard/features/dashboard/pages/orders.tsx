"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpDown,
  Banknote,
  Calendar,
  CheckCircle2,
  Clock3,
  MoreHorizontal,
  Plus,
  ShoppingCart,
  X,
} from "lucide-react";

import { orderRows } from "../data";
import {
  Badge,
  Card,
  DataTable,
  FilterBar,
  PageTitle,
  Pagination,
} from "../primitives";
import { cn } from "@/lib/utils";

const orderStats = [
  ["Total Orders", "3", ShoppingCart, "text-primary"],
  ["قيد الانتظار", "0", Clock3, "text-amber-500"],
  ["مكتمل", "3", CheckCircle2, "text-green-500"],
  ["Cancelled", "0", X, "text-destructive"],
] as const;

type DateFilter = {
  label: string;
  sublabel?: string;
  icon?: typeof Calendar;
};

const dateFilters: DateFilter[] = [
  { label: "Today" },
  { label: "Yesterday" },
  { label: "This Week", sublabel: "May 18 – May 22" },
  { label: "This Month", sublabel: "May 1 – May 22" },
  { label: "Custom", icon: Calendar },
];

export function OrdersPage() {
  const router = useRouter();

  return (
    <div className="px-6 py-8">
      <PageTitle
        title="Orders"
        description="View and manage all incoming orders"
        size="compact"
        actions={
          <>
            <div className="hidden rounded-md bg-muted p-1 xl:flex">
              {dateFilters.map((filter, index) => {
                const Icon = filter.icon;

                return (
                  <button
                    key={filter.label}
                    className={cn(
                      "flex min-h-7 items-center justify-center rounded px-3 py-1 text-sm leading-none",
                      filter.sublabel && "flex-col gap-0.5",
                      index === 0 && "bg-background shadow-sm",
                    )}
                  >
                    <span className="flex items-center gap-1">
                      {Icon ? <Icon className="size-3.5" /> : null}
                      {filter.label}
                    </span>
                    {filter.sublabel ? (
                      <span className="text-[10px] leading-none text-muted-foreground">
                        {filter.sublabel}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            <Link
              href="/orders/create"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
            >
              <Plus className="size-4" />
              Create New Order
            </Link>
          </>
        }
      />

      <div className="mt-6 grid gap-3 md:grid-cols-4">
        {orderStats.map(([label, value, Icon, tone]) => (
          <Card
            key={String(label)}
            className="flex h-[75px] items-center gap-3 px-6"
          >
            <div className={cn("rounded-full bg-muted/50 p-2", String(tone))}>
              <Icon className="size-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{String(label)}</p>
              <p className="text-xl font-semibold leading-tight">{String(value)}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <FilterBar
          className="p-0"
          disabled
          fields={[
            { label: "Status", type: "select", value: "All", width: "md:w-44" },
            { label: "Order Type", type: "select", value: "All", width: "md:w-44" },
            {
              label: "Payment Method",
              type: "select",
              value: "All",
              width: "md:w-44",
            },
          ]}
        />
        <div className="mt-4 overflow-hidden rounded-md border">
          <DataTable
            minWidth={1119}
            columnWidths={[32, 22, 22, 22, 185, 128, 169, 181, 143, 125, 89]}
            onRowClick={() =>
              router.push("/orders/view/6a09a642a50111681ea423a5")
            }
            headers={[
              "#",
              "",
              "",
              "",
              "Order Number",
              "Customer Info",
              <button key="order-type-sort" className="inline-flex items-center gap-1">
                Order Type
                <ArrowUpDown className="size-3" />
              </button>,
              <button key="order-status-sort" className="inline-flex items-center gap-1">
                Order Status
                <ArrowUpDown className="size-3" />
              </button>,
              "Price",
              "Order Date",
              "",
            ]}
            rows={orderRows.map((row) => [
              <span key={`index-${row.orderNumber}`} className="block px-2">
                {row.index}
              </span>,
              "",
              "",
              "",
              row.orderNumber,
              <div key={`customer-${row.orderNumber}`}>
                <div>{row.customer}</div>
                <div className="text-xs text-muted-foreground">{row.phone}</div>
              </div>,
              row.type,
              <Badge
                key={`status-${row.orderNumber}`}
                tone={row.status === "مكتمل" ? "green" : "blue"}
              >
                {row.status}
              </Badge>,
              <div
                key={`price-${row.orderNumber}`}
                className="flex items-center gap-2"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Banknote className="size-4" />
                </span>
                <span>
                  <span className="block">{row.total}</span>
                  <span className="block text-xs text-muted-foreground">
                    {row.payment}
                  </span>
                </span>
              </div>,
              <div key={`date-${row.orderNumber}`}>
                <div>{row.date}</div>
                <div className="text-xs text-muted-foreground">{row.time}</div>
              </div>,
              <div key={`actions-${row.orderNumber}`} className="flex justify-end">
                <button
                  type="button"
                  className="inline-flex h-8 w-[58px] items-center justify-center rounded-md border bg-background text-sm font-bold hover:bg-accent"
                  aria-label={`Actions for ${row.orderNumber}`}
                  onClick={(event) => event.stopPropagation()}
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </div>,
            ])}
          />
        </div>
        <Pagination
          text="Showing 1–3 Of 3 Results"
          pages="1 / 1"
          nextDisabled
        />
      </Card>
    </div>
  );
}
