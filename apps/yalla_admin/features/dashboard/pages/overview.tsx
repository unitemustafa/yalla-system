"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  TrendingUp,
} from "lucide-react";
import type { TooltipContentProps } from "recharts";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { topItems } from "../data";
import {
  AnimatedChartWrapper,
  AnimatedNumber,
  AnimatedProgressBar,
} from "../animations";
import { AnimatedCircularStatCard } from "../animated-circular-stat-card";
import { Button, Card, CardHeader, HoverTooltip, PageTitle } from "../primitives";
import { useDashboardI18n } from "../i18n";
import { cn } from "@/lib/utils";

function formatMoney(value: number, locale: string, prefix: string, suffix: string) {
  return `${prefix}${value.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}${suffix}`;
}

const revenueProductKeys = [
  "overview.product.beefRound",
  "overview.product.tomatoes",
  "overview.product.whiteChicken",
  "overview.product.bananas",
  "overview.product.redChicken",
] as const;

const revenueDotColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const topShopItems = [
  {
    rank: 1,
    nameAr: "يلا ماركت - الرئيسي",
    nameEn: "Yalla Market - Main",
    zoneAr: "التل الكبير",
    zoneEn: "El Tall El Kebir",
    orders: 74,
    average: 3.28,
    revenue: 18240.5,
  },
  {
    rank: 2,
    nameAr: "خضار البلد",
    nameEn: "Balad Produce",
    zoneAr: "الحي الشرقي",
    zoneEn: "East District",
    orders: 58,
    average: 2.84,
    revenue: 14980,
  },
  {
    rank: 3,
    nameAr: "فراخ الطازة",
    nameEn: "Fresh Chicken",
    zoneAr: "وسط البلد",
    zoneEn: "Downtown",
    orders: 44,
    average: 2.32,
    revenue: 11275.25,
  },
  {
    rank: 4,
    nameAr: "مخبوزات الصباح",
    nameEn: "Morning Bakery",
    zoneAr: "المحطة",
    zoneEn: "Station",
    orders: 38,
    average: 1.92,
    revenue: 7650.75,
  },
  {
    rank: 5,
    nameAr: "بيت الفاكهة",
    nameEn: "Fruit House",
    zoneAr: "الحي الغربي",
    zoneEn: "West District",
    orders: 29,
    average: 2.14,
    revenue: 6205.5,
  },
];

function TopCategoriesCard() {
  const { direction, language, numberLocale, t } = useDashboardI18n();
  const totalRevenue = topShopItems.reduce((total, item) => total + item.revenue, 0);
  const currencyPrefix = t("common.egpPrefix");
  const currencySuffix = t("common.egpSuffix");
  const progressColorClass = "bg-cyan-500";
  const rankBadgeClass =
    "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-200";
  const zoneBadgeClass =
    "rounded border border-amber-200 bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium leading-[15px] text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/15 dark:text-amber-200";
  const shopMeta = (item: (typeof topShopItems)[number]) =>
    `${item.orders.toLocaleString(numberLocale)} ${t("common.orders")} · ${t(
      "overview.topItems.average",
    )} ${item.average.toLocaleString(numberLocale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}/${t("common.order")}`;
  const displayItems = [...topShopItems]
    .sort((left, right) => right.revenue - left.revenue)
    .map((item, index) => ({
      rank: index + 1,
      name: language === "ar" ? item.nameAr : item.nameEn,
      zone: language === "ar" ? item.zoneAr : item.zoneEn,
      meta: shopMeta(item),
      value: item.revenue,
    }));
  const maxValue = Math.max(...displayItems.map((item) => item.value));

  return (
    <Card className="mt-6 border-border bg-card text-card-foreground shadow-sm">
      <div
        className="flex flex-col gap-3 px-5 pt-5 sm:flex-row sm:items-start sm:justify-between"
        dir={direction}
      >
        <div className="text-start">
          <div className="text-base font-bold leading-5 text-card-foreground">
            {t("overview.topItems.title")}
          </div>
          <div className="mt-1 text-sm leading-5 text-muted-foreground">
            {t("overview.topItems.revenueTab")}
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 pt-6" dir={direction}>
        <div className="text-start">
          <div className="text-sm leading-5 text-muted-foreground">
            {t("overview.topItems.totalRevenue")}
          </div>
          <div className="mt-1 text-3xl font-bold leading-9 text-card-foreground">
            <AnimatedNumber
              value={totalRevenue}
              decimals={2}
              locale={numberLocale}
              prefix={currencyPrefix}
              suffix={currencySuffix}
            />
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3.5">
          {displayItems.map((item, index) => {
            const progress = (item.value / maxValue) * 100;
            const delay = 120 + index * 70;

            return (
              <div key={item.name}>
                <div className="mb-2 flex items-end justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                        rankBadgeClass,
                      )}
                    >
                      {item.rank}
                    </div>
                    <div className="min-w-0 text-start">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="truncate text-base font-semibold leading-5 text-card-foreground">
                          {item.name}
                        </span>
                        <span className={zoneBadgeClass}>{item.zone}</span>
                      </div>
                      <div className="mt-0.5 truncate text-xs leading-4 text-muted-foreground">
                        {item.meta}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 pb-1 text-left text-sm font-bold leading-5 text-card-foreground">
                    <AnimatedNumber
                      value={item.value}
                      decimals={2}
                      delay={delay}
                      locale={numberLocale}
                      prefix={currencyPrefix}
                      suffix={currencySuffix}
                    />
                  </div>
                </div>
                <div
                  className="flex h-2 w-full justify-end overflow-hidden rounded-full bg-muted"
                  dir="ltr"
                >
                  <AnimatedProgressBar
                    value={progress}
                    className={cn("h-full rounded-full", progressColorClass)}
                    delay={delay}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

function RevenueTooltip({ active, label, payload }: TooltipContentProps) {
  const { numberLocale, t } = useDashboardI18n();

  if (!active || !payload?.length) {
    return null;
  }

  const value = Number(payload[0]?.value ?? 0);
  const item = payload[0]?.payload as
    | { sold?: number; orders?: number }
    | undefined;
  const currencyPrefix = t("common.egpPrefix");
  const currencySuffix = t("common.egpSuffix");

  return (
    <div className="grid min-w-[9rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
      <div className="font-medium">{label}</div>
      <div className="font-semibold" dir="ltr">
        {formatMoney(
          value,
          numberLocale,
          currencyPrefix,
          currencySuffix,
        ).replace(" ", "\u00A0")}
      </div>
      {item ? (
        <div className="text-muted-foreground">
          {typeof item.sold === "number"
            ? `${item.sold.toLocaleString(numberLocale)} ${t("overview.topItems.sold")}`
            : null}
          {typeof item.orders === "number"
            ? ` · ${item.orders.toLocaleString(numberLocale)} ${t("common.orders")}`
            : null}
        </div>
      ) : null}
    </div>
  );
}

function MetricTooltip({
  title,
  value,
  detail,
}: {
  title: React.ReactNode;
  value: React.ReactNode;
  detail?: React.ReactNode;
}) {
  return (
    <div className="grid gap-1">
      <div className="font-semibold">{title}</div>
      <div className="font-bold" dir="ltr">
        {value}
      </div>
      {detail ? <div className="text-muted-foreground">{detail}</div> : null}
    </div>
  );
}

function UpdateCadenceLabel({
  children,
  cadence,
}: {
  children: React.ReactNode;
  cadence: React.ReactNode;
}) {
  return (
    <span className="inline-flex flex-wrap items-center justify-center gap-2">
      <span>{children}</span>
      <span className="rounded border border-amber-200 bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium leading-[15px] text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/15 dark:text-amber-200">
        {cadence}
      </span>
    </span>
  );
}

function OrdersKpiCard({
  height = "h-[388px]",
}: {
  height?: string;
}) {
  const { numberLocale, t } = useDashboardI18n();
  const completedOrders = 168;
  const incompleteOrders = 105;
  const totalOrders = 273;
  const completionRate = 61.5;

  return (
    <Card className={cn("flex flex-col shadow", height)}>
      <CardHeader
        title={t("overview.ordersSummary.title")}
        description={
          <UpdateCadenceLabel cadence={t("overview.period.daily")}>
            {t("overview.ordersSummary.subtitle")}
          </UpdateCadenceLabel>
        }
      />
      <div className="flex flex-1 flex-col justify-center px-6 pb-6 pt-3">
        <HoverTooltip
          content={
            <MetricTooltip
              title={t("overview.ordersSummary.label")}
              value={totalOrders.toLocaleString(numberLocale)}
              detail={`${completedOrders.toLocaleString(numberLocale)} ${t("common.completed")} / ${incompleteOrders.toLocaleString(numberLocale)} ${t("common.incomplete")}`}
            />
          }
          className="mx-auto w-full max-w-[300px] text-center"
        >
          <div className="text-4xl font-bold leading-none text-foreground">
            <AnimatedNumber
              value={totalOrders}
              locale={numberLocale}
              delay={80}
            />
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            {t("overview.ordersSummary.label")}
          </div>
        </HoverTooltip>

        <div className="mx-auto mt-8 w-full max-w-[300px] space-y-4">
          <HoverTooltip
            content={
              <MetricTooltip
                title={t("overview.ordersSummary.completionRate")}
                value={`${completionRate.toLocaleString(numberLocale, {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}%`}
                detail={`${completedOrders.toLocaleString(numberLocale)} ${t("common.completed")} / ${incompleteOrders.toLocaleString(numberLocale)} ${t("common.incomplete")}`}
              />
            }
          >
            <div>
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="text-muted-foreground">
                  {t("overview.ordersSummary.completionRate")}
                </span>
                <span className="font-semibold">
                  <AnimatedNumber
                    value={completionRate}
                    decimals={1}
                    suffix="%"
                    delay={80}
                    locale={numberLocale}
                  />
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <AnimatedProgressBar
                  value={completionRate}
                  className="h-full rounded-full bg-[var(--chart-2)]"
                  delay={80}
                />
              </div>
            </div>
          </HoverTooltip>

          <div className="grid grid-cols-2 gap-4 border-t pt-4 text-sm">
            <HoverTooltip
              content={
                <MetricTooltip
                  title={t("common.completed")}
                  value={completedOrders.toLocaleString(numberLocale)}
                  detail={t("overview.ordersSummary.label")}
                />
              }
            >
              <div className="text-center">
                <div className="font-semibold">
                  <AnimatedNumber
                    value={completedOrders}
                    delay={80}
                    locale={numberLocale}
                  />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {t("common.completed")}
                </div>
              </div>
            </HoverTooltip>
            <HoverTooltip
              content={
                <MetricTooltip
                  title={t("common.incomplete")}
                  value={incompleteOrders.toLocaleString(numberLocale)}
                  detail={t("overview.ordersSummary.label")}
                />
              }
            >
              <div className="text-center">
                <div className="font-semibold">
                  <AnimatedNumber
                    value={incompleteOrders}
                    delay={80}
                    locale={numberLocale}
                  />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {t("common.incomplete")}
                </div>
              </div>
            </HoverTooltip>
          </div>
        </div>
      </div>
    </Card>
  );
}

function RevenuePerformanceChart() {
  const { t } = useDashboardI18n();
  const revenueChartData = topItems.map((item, index) => {
    const name = t(revenueProductKeys[index]);

    return {
      ...item,
      chartName:
        name.length > 14 ? `${name.slice(0, 14).trimEnd()}...` : name,
    };
  });

  return (
    <div
      data-chart="chart-revenue-performance"
      className="flex h-full w-full justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-layer]:outline-none [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted/60 [&_.recharts-surface]:outline-none"
    >
      <style>
        {`[data-chart=chart-revenue-performance] {
  --color-revenue: var(--chart-1);
}

.dark [data-chart=chart-revenue-performance] {
  --color-revenue: var(--chart-1);
}

@keyframes revenue-bar-rise {
  from {
    opacity: 0;
    transform: scaleY(0.82);
  }

  to {
    opacity: 1;
    transform: scaleY(1);
  }
}

[data-chart=chart-revenue-performance] .recharts-bar-rectangle {
  animation: revenue-bar-rise 700ms cubic-bezier(0.16, 1, 0.3, 1) both;
  transform-box: fill-box;
  transform-origin: center bottom;
}

@media (prefers-reduced-motion: reduce) {
  [data-chart=chart-revenue-performance] .recharts-bar-rectangle {
    animation: none;
    opacity: 1;
    transform: none;
  }
}`}
      </style>
      <AnimatedChartWrapper className="h-full w-full">
        {() => (
          <ResponsiveContainer minWidth={0} minHeight={0}>
            <BarChart
              data={revenueChartData}
              barCategoryGap="28%"
              margin={{ top: 18, right: 14, bottom: 0, left: 14 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="var(--border)"
                strokeOpacity={0.72}
              />
              <XAxis
                dataKey="chartName"
                axisLine={false}
                height={36}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickMargin={10}
                tickLine={false}
              />
              <YAxis hide domain={[0, "dataMax + 220"]} tickCount={4} />
              <Tooltip
                content={(props) => <RevenueTooltip {...props} />}
                cursor={{ fill: "var(--muted)" }}
              />
              <Bar
                dataKey="revenue"
                radius={[8, 8, 3, 3]}
                maxBarSize={54}
                isAnimationActive={false}
              >
                {revenueChartData.map((item, index) => (
                  <Cell
                    key={`${item.chartName}-${index}`}
                    fill={revenueDotColors[index % revenueDotColors.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </AnimatedChartWrapper>
    </div>
  );
}

type DateField = "from" | "to";

type DateRange = {
  from: Date;
  to: Date;
};

function createMonthFormatter(locale: string) {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  });
}

function createDateButtonFormatter(locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function createWeekdayLabels(locale: string) {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
  const sunday = new Date(2026, 4, 24);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(sunday);
    date.setDate(sunday.getDate() + index);
    return formatter.format(date);
  });
}

function sameDate(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function atStartOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isInRange(date: Date, range: DateRange) {
  const time = atStartOfDay(date).getTime();
  return (
    time >= atStartOfDay(range.from).getTime() &&
    time <= atStartOfDay(range.to).getTime()
  );
}

function getCalendarCells(viewDate: Date) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingDays = firstDay.getDay();
  const cellCount = Math.ceil((leadingDays + daysInMonth) / 7) * 7;

  return Array.from({ length: cellCount }, (_, index) => {
    const dayNumber = index - leadingDays + 1;
    const date = new Date(year, month, dayNumber);

    return {
      date,
      currentMonth: date.getMonth() === month,
    };
  });
}

function OverviewDateActions() {
  const { direction, numberLocale, t } = useDashboardI18n();
  const rootRef = useRef<HTMLDivElement>(null);
  const [range, setRange] = useState<DateRange>({
    from: new Date(2026, 4, 1),
    to: new Date(2026, 4, 22),
  });
  const [activeField, setActiveField] = useState<DateField | null>(null);
  const [refreshState, setRefreshState] = useState<"idle" | "loading">("idle");

  useEffect(() => {
    function handlePointerDown(event: globalThis.PointerEvent) {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setActiveField(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveField(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function updateDate(field: DateField, date: Date) {
    setRange((currentRange) => {
      const nextDate = atStartOfDay(date);

      if (field === "from") {
        return {
          from: nextDate,
          to: nextDate > currentRange.to ? nextDate : currentRange.to,
        };
      }

      return {
        from: nextDate < currentRange.from ? nextDate : currentRange.from,
        to: nextDate,
      };
    });
    setActiveField(null);
  }

  function refreshDashboard() {
    setRefreshState("loading");
    window.location.reload();
  }

  return (
    <div
      ref={rootRef}
      className="flex flex-wrap items-center gap-2 text-sm"
      aria-label={t("common.dateRangeFilter")}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-foreground">{t("common.from")}</span>
        <DatePickerButton
          field="from"
          label={t("common.startDate")}
          date={range.from}
          range={range}
          activeField={activeField}
          onOpenChange={setActiveField}
          onSelect={updateDate}
          direction={direction}
          locale={numberLocale}
        />
        <span className="text-muted-foreground">-</span>
        <span className="text-foreground">{t("common.to")}</span>
        <DatePickerButton
          field="to"
          label={t("common.endDate")}
          date={range.to}
          range={range}
          activeField={activeField}
          onOpenChange={setActiveField}
          onSelect={updateDate}
          direction={direction}
          locale={numberLocale}
        />
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-10 w-[116px] self-start"
        disabled={refreshState === "loading"}
        onClick={refreshDashboard}
      >
        <RefreshCcw
          className={cn(
            "size-4",
            refreshState === "loading" && "animate-spin",
          )}
        />
        {refreshState === "loading" ? t("common.loading") : t("common.refresh")}
      </Button>
    </div>
  );
}

function DatePickerButton({
  field,
  label,
  date,
  range,
  activeField,
  onOpenChange,
  onSelect,
  direction,
  locale,
}: {
  field: DateField;
  label: string;
  date: Date;
  range: DateRange;
  activeField: DateField | null;
  onOpenChange: (field: DateField | null) => void;
  onSelect: (field: DateField, date: Date) => void;
  direction: "rtl" | "ltr";
  locale: string;
}) {
  const open = activeField === field;
  const dateButtonFormatter = useMemo(
    () => createDateButtonFormatter(locale),
    [locale],
  );

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        aria-label={label}
        aria-expanded={open}
        className={cn(
          "h-10 w-[186px] justify-between bg-background text-start font-normal text-foreground",
          open && "border-primary text-primary ring-1 ring-primary/20",
        )}
        onClick={() => onOpenChange(open ? null : field)}
      >
        <span className="truncate">{dateButtonFormatter.format(date)}</span>
        <Calendar className="size-4 shrink-0 text-muted-foreground" />
      </Button>
      {open ? (
        <DatePickerPopover
          field={field}
          selectedDate={date}
          range={range}
          onSelect={onSelect}
          direction={direction}
          locale={locale}
        />
      ) : null}
    </div>
  );
}

function DatePickerPopover({
  field,
  selectedDate,
  range,
  onSelect,
  direction,
  locale,
}: {
  field: DateField;
  selectedDate: Date;
  range: DateRange;
  onSelect: (field: DateField, date: Date) => void;
  direction: "rtl" | "ltr";
  locale: string;
}) {
  const { t } = useDashboardI18n();
  const [viewDate, setViewDate] = useState(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  );
  const cells = useMemo(() => getCalendarCells(viewDate), [viewDate]);
  const monthFormatter = useMemo(() => createMonthFormatter(locale), [locale]);
  const weekdayLabels = useMemo(() => createWeekdayLabels(locale), [locale]);

  function moveMonth(offset: number) {
    setViewDate((currentDate) => {
      return new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + offset,
        1,
      );
    });
  }

  return (
    <div
      className={cn(
        "absolute top-[calc(100%+8px)] z-40 w-[308px] rounded-lg border bg-background p-3 text-foreground shadow-xl",
        direction === "rtl" ? "right-0" : "left-0",
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          aria-label={t("common.previousMonth")}
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          onClick={() => moveMonth(-1)}
        >
          <ChevronRight className="size-4" />
        </button>
        <div className="text-sm font-semibold">
          {monthFormatter.format(viewDate)}
        </div>
        <button
          type="button"
          aria-label={t("common.nextMonth")}
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          onClick={() => moveMonth(1)}
        >
          <ChevronLeft className="size-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {weekdayLabels.map((day) => (
          <div key={day} className="flex h-8 items-center justify-center">
            {day}
          </div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map(({ date, currentMonth }) => {
          const selected = sameDate(date, selectedDate);
          const rangeEdge = sameDate(date, range.from) || sameDate(date, range.to);
          const insideRange = isInRange(date, range);

          return (
            <button
              type="button"
              key={date.toISOString()}
              className={cn(
                "flex h-9 items-center justify-center rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                !currentMonth && "text-muted-foreground/45",
                insideRange && "bg-primary/10 text-primary",
                rangeEdge && "font-semibold",
                selected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
              )}
              onClick={() => onSelect(field, date)}
            >
              {date.getDate().toLocaleString(locale)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function OverviewPage() {
  const { direction, numberLocale, t } = useDashboardI18n();
  const currencyPrefix = t("common.egpPrefix");
  const currencySuffix = t("common.egpSuffix");
  const MoreArrow = direction === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <div className="px-6 py-6">
      <PageTitle
        title={t("overview.title")}
        description={t("overview.description")}
        actions={<OverviewDateActions />}
      />

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <AnimatedCircularStatCard
          title={t("overview.totalRevenue.title")}
          subtitle={
            <UpdateCadenceLabel cadence={t("overview.period.monthly")}>
              {t("overview.totalRevenue.subtitle")}
            </UpdateCadenceLabel>
          }
          value={46745.94}
          maxValue={46745.94}
          percentage={100}
          label={t("overview.totalRevenue.label")}
          color="var(--chart-1)"
          decimals={2}
          locale={numberLocale}
          prefix={currencyPrefix}
          suffix={currencySuffix}
          tooltip={
            <MetricTooltip
              title={t("overview.totalRevenue.label")}
              value={formatMoney(
                46745.94,
                numberLocale,
                currencyPrefix,
                currencySuffix,
              )}
              detail={t("overview.totalRevenue.note")}
            />
          }
          footer={
            <>
              <HoverTooltip
                content={
                  <MetricTooltip
                    title={t("overview.totalRevenue.label")}
                    value={formatMoney(
                      46745.94,
                      numberLocale,
                      currencyPrefix,
                      currencySuffix,
                    )}
                    detail="100%"
                  />
                }
              >
                <div className="flex items-center justify-center gap-1 font-medium leading-none">
                  {t("overview.totalRevenue.label")}{" "}
                  <AnimatedNumber
                    value={46745.94}
                    decimals={2}
                    locale={numberLocale}
                    prefix={currencyPrefix}
                    suffix={currencySuffix}
                  />{" "}
                  (
                  <AnimatedNumber value={100} suffix="%" locale={numberLocale} />
                  )
                  <TrendingUp className="size-4" />
                </div>
              </HoverTooltip>
              <div className="text-xs leading-none text-muted-foreground">
                {t("overview.totalRevenue.note")}
              </div>
            </>
          }
        />
        <OrdersKpiCard />
        <AnimatedCircularStatCard
          title={t("overview.customerAnalysis.title")}
          subtitle={
            <UpdateCadenceLabel cadence={t("overview.period.monthly")}>
              {t("overview.customerAnalysis.subtitle")}
            </UpdateCadenceLabel>
          }
          value={0}
          percentage={0}
          label={t("overview.customerAnalysis.returnRateLabel")}
          color="var(--chart-1)"
          radius={85}
          strokeWidth={20}
          trackRadius={85}
          trackStrokeWidth={20}
          decimals={1}
          locale={numberLocale}
          suffix="%"
          delay={200}
          footerClassName="gap-2"
          tooltip={
            <MetricTooltip
              title={t("overview.customerAnalysis.returnRateLabel")}
              value="0.0%"
              detail={`${t("overview.customerAnalysis.newCustomers")} ${(129).toLocaleString(numberLocale)} / ${t("overview.customerAnalysis.returningCustomers")} ${(0).toLocaleString(numberLocale)}`}
            />
          }
          footer={
            <>
              <HoverTooltip
                content={
                  <MetricTooltip
                    title={t("overview.customerAnalysis.returnRate")}
                    value="0.0%"
                    detail={`${t("overview.customerAnalysis.returningCustomers")} ${(0).toLocaleString(numberLocale)}`}
                  />
                }
              >
                <div className="flex items-center justify-center gap-1 font-medium leading-none">
                  {t("overview.customerAnalysis.returnRate")}{" "}
                  <AnimatedNumber
                    value={0}
                    decimals={1}
                    suffix="%"
                    delay={200}
                    locale={numberLocale}
                  />
                  <TrendingUp className="size-4" />
                </div>
              </HoverTooltip>
              <div className="text-xs leading-none text-muted-foreground">
                {t("overview.customerAnalysis.newCustomers")}{" "}
                <AnimatedNumber value={129} delay={200} locale={numberLocale} />{" "}
                · {t("overview.customerAnalysis.returningCustomers")}{" "}
                <AnimatedNumber value={0} delay={200} locale={numberLocale} />
              </div>
            </>
          }
        />
      </div>

      <div className="mt-6 flex flex-col gap-4 xl:flex-row">
        <div className="min-w-0 xl:w-3/4">
          <Card className="group h-[509px]">
            <CardHeader
              title={t("overview.revenuePerformance.title")}
              description={t("overview.revenuePerformance.description")}
              className="min-h-[65px] border-b"
            />
            <div className="h-[442px] px-6 pb-4 pt-6">
              <RevenuePerformanceChart />
            </div>
          </Card>
        </div>

        <div className="shrink-0 xl:w-1/4">
          <Card className="flex h-[509px] flex-col shadow">
            <CardHeader
              title={t("overview.activeOrders.title")}
              description={t("overview.activeOrders.description")}
              className="min-h-[65px]"
            />
            <div className="no-scrollbar flex-1 overflow-y-auto px-3 py-2">
              <div className="space-y-2 pt-1">
                {[
                  ["#ORD-20260521-0F65T3", "overview.customer.donia", "379"],
                  ["#ORD-20260517-3L65XO", "overview.customer.umMohamed", "100"],
                  ["#ORD-20260516-AUD0P6", "overview.customer.ahmedMorsy", "97"],
                  ["#ORD-20260513-BIWPBM", "overview.customer.salma", "40"],
                  ["#ORD-20260513-U97BRV", "overview.customer.ahmedKhaled", "230"],
                ].map(([id, nameKey, total], index) => (
                  <Link
                    key={id}
                    href="/orders"
                    className="flex min-h-[67px] items-center gap-3 rounded-lg border bg-muted/20 px-3 py-2.5 text-start transition-colors hover:border-primary hover:bg-primary/5"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Bike className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold leading-5">
                        {id}
                      </span>
                      <span className="block truncate text-xs leading-4 text-muted-foreground">
                        {t(nameKey)}
                      </span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-sm font-semibold leading-5">
                        <AnimatedNumber
                          value={Number(total)}
                          locale={numberLocale}
                          prefix={currencyPrefix}
                          suffix={currencySuffix}
                          delay={120 + index * 60}
                        />
                      </span>
                      <span className="rounded border border-amber-200 bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium leading-[15px] text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/15 dark:text-amber-200">
                        {t("overview.activeOrders.pending")}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex justify-center px-3 pb-6">
              <Link
                href="/orders"
                className="inline-flex h-8 w-full items-center justify-center gap-2 rounded-md px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {t("common.viewMore")} <MoreArrow className="size-4" />
              </Link>
            </div>
          </Card>
        </div>
      </div>

      <TopCategoriesCard />
    </div>
  );
}
