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
import type {
  ActiveDotProps,
  DotItemDotProps,
  TooltipContentProps,
} from "recharts";
import {
  Area,
  AreaChart,
  CartesianGrid,
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
  useAnimatedValue,
} from "../animations";
import { AnimatedCircularStatCard } from "../animated-circular-stat-card";
import { Button, Card, CardHeader, PageTitle } from "../primitives";
import { useDashboardI18n } from "../i18n";
import { cn } from "@/lib/utils";

const chartSize = 250;
const center = chartSize / 2;

function formatMoney(value: number, locale: string, prefix: string, suffix: string) {
  return `${prefix}${value.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}${suffix}`;
}

function donutSegmentPath({
  start,
  end,
  outer,
  inner,
}: {
  start: number;
  end: number;
  outer: number;
  inner: number;
}) {
  const round = (value: number) => Number(value.toFixed(6));
  const toPoint = (radius: number, angle: number) => ({
    x: round(center + radius * Math.cos((angle * Math.PI) / 180)),
    y: round(center + radius * Math.sin((angle * Math.PI) / 180)),
  });
  const outerStart = toPoint(outer, start);
  const outerEnd = toPoint(outer, end);
  const innerStart = toPoint(inner, start);
  const innerEnd = toPoint(inner, end);
  const largeArc = Math.abs(end - start) > 180 ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outer} ${outer} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${inner} ${inner} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

function DonutBreakdown() {
  const orangeEnd = (165 / 3050) * 360;
  const animatedEnd = useAnimatedValue(360, { duration: 2200, delay: 220 });
  const orangeSweep = Math.min(animatedEnd, orangeEnd);
  const deliverySweep = Math.max(animatedEnd, orangeEnd);

  return (
    <svg
      width={chartSize}
      height={chartSize}
      viewBox={`0 0 ${chartSize} ${chartSize}`}
      className="block size-[250px]"
    >
      {deliverySweep > orangeEnd ? (
        <path
          d={donutSegmentPath({
            start: orangeEnd,
            end: deliverySweep,
            outer: 95,
            inner: 75,
          })}
          fill="var(--chart-1)"
          stroke="var(--background)"
          strokeWidth={4}
        />
      ) : null}
      {orangeSweep > 0 ? (
        <path
          d={donutSegmentPath({
            start: 0,
            end: orangeSweep,
            outer: 95,
            inner: 75,
          })}
          fill="var(--chart-3)"
          stroke="var(--background)"
          strokeWidth={4}
        />
      ) : null}
    </svg>
  );
}

function OrdersGauge() {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const half = circumference / 2;
  const greenLength = half * 0.615;
  const gap = 8;
  const orangeLength = half - greenLength - gap;
  const animatedProgress = useAnimatedValue(1, { duration: 2200, delay: 220 });
  const animatedGreenLength = greenLength * animatedProgress;
  const animatedOrangeLength = orangeLength * animatedProgress;

  return (
    <svg
      width={chartSize}
      height={chartSize}
      viewBox={`0 0 ${chartSize} ${chartSize}`}
      className="block size-[250px]"
    >
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="var(--chart-2)"
        strokeLinecap="round"
        strokeWidth={12}
        strokeDasharray={`${animatedGreenLength} ${circumference - animatedGreenLength}`}
        transform={`rotate(180 ${center} ${center})`}
      />
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="var(--chart-3)"
        strokeLinecap="round"
        strokeWidth={12}
        strokeDasharray={`${animatedOrangeLength} ${circumference - animatedOrangeLength}`}
        strokeDashoffset={-(animatedGreenLength + gap)}
        transform={`rotate(180 ${center} ${center})`}
      />
    </svg>
  );
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

const topCategoryItems = [
  {
    rank: 1,
    nameKey: "overview.product.potatoes",
    orders: 30,
    average: 2.37,
    sold: 71,
  },
  {
    rank: 2,
    nameKey: "overview.product.tomatoes",
    orders: 36,
    average: 1.61,
    sold: 58,
  },
  {
    rank: 3,
    nameKey: "overview.product.onions",
    orders: 20,
    average: 2.2,
    sold: 44,
  },
  {
    rank: 4,
    nameKey: "overview.product.bananas",
    orders: 25,
    average: 1.52,
    sold: 38,
  },
  {
    rank: 5,
    nameKey: "overview.product.finoBread",
    orders: 18,
    average: 1.78,
    sold: 32,
  },
];

function TopCategoriesCard() {
  const [activeTab, setActiveTab] = useState<"quantity" | "revenue">("quantity");
  const { direction, language, numberLocale, t } = useDashboardI18n();
  const isRevenueTab = activeTab === "revenue";
  const totalSold = topCategoryItems.reduce((total, item) => total + item.sold, 0);
  const totalRevenue = topItems.reduce((total, item) => total + item.revenue, 0);
  const currencyPrefix = t("common.egpPrefix");
  const currencySuffix = t("common.egpSuffix");
  const progressColorClass = isRevenueTab ? "bg-cyan-500" : "bg-[#22c55e]";
  const rankBadgeClass = isRevenueTab
    ? "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-200"
    : "bg-[#dcfce7] text-[#16a34a]";
  const displayItems = isRevenueTab
    ? topItems.map((item, index) => ({
        rank: index + 1,
        name: t(revenueProductKeys[index]),
        meta:
          language === "ar"
            ? `${item.sold.toLocaleString(numberLocale)} ${t("overview.topItems.sold")} · ${item.orders.toLocaleString(numberLocale)} ${t("common.order")}`
            : `${item.sold.toLocaleString(numberLocale)} ${t("overview.topItems.sold")} · ${item.orders.toLocaleString(numberLocale)} ${t("common.orders")}`,
        value: item.revenue,
      }))
    : topCategoryItems.map((item) => ({
        rank: item.rank,
        name: t(item.nameKey),
        meta:
          language === "ar"
            ? `${item.orders.toLocaleString(numberLocale)} ${t("common.orders")} · ${t("overview.topItems.average")} ${item.average.toLocaleString(numberLocale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/${t("common.order")}`
            : `${item.orders.toLocaleString(numberLocale)} ${t("common.orders")} · ${t("overview.topItems.average")} ${item.average.toLocaleString(numberLocale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/${t("common.order")}`,
        value: item.sold,
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
            {t("overview.topItems.description")}
          </div>
        </div>
        <div
          className="inline-flex w-fit rounded-xl bg-muted p-1 shadow-[0_1px_6px_rgba(0,0,0,0.08)]"
          dir="ltr"
        >
          <button
            type="button"
            className={cn(
              "h-8 rounded-lg px-3.5 text-sm font-medium leading-5 transition-colors",
              !isRevenueTab
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
            dir={direction}
            aria-pressed={!isRevenueTab}
            onClick={() => setActiveTab("quantity")}
          >
            {t("overview.topItems.quantityTab")}
          </button>
          <button
            type="button"
            className={cn(
              "h-8 rounded-lg px-3.5 text-sm font-medium leading-5 transition-colors",
              isRevenueTab
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
            dir={direction}
            aria-pressed={isRevenueTab}
            onClick={() => setActiveTab("revenue")}
          >
            {t("overview.topItems.revenueTab")}
          </button>
        </div>
      </div>

      <div className="px-5 pb-5 pt-6" dir={direction}>
        <div className="text-start">
          <div className="text-sm leading-5 text-muted-foreground">
            {isRevenueTab
              ? t("overview.topItems.totalRevenue")
              : t("overview.topItems.totalSales")}
          </div>
          <div className="mt-1 text-3xl font-bold leading-9 text-card-foreground">
            {isRevenueTab ? (
              <AnimatedNumber
                value={totalRevenue}
                decimals={2}
                locale={numberLocale}
                prefix={currencyPrefix}
                suffix={currencySuffix}
              />
            ) : (
              <AnimatedNumber value={totalSold} locale={numberLocale} />
            )}
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
                      <div className="truncate text-base font-semibold leading-5 text-card-foreground">
                        {item.name}
                      </div>
                      <div className="mt-0.5 truncate text-xs leading-4 text-muted-foreground">
                        {item.meta}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 pb-1 text-left text-sm font-bold leading-5 text-card-foreground">
                    {isRevenueTab ? (
                      <AnimatedNumber
                        value={item.value}
                        decimals={2}
                        locale={numberLocale}
                        prefix={currencyPrefix}
                        suffix={currencySuffix}
                        delay={delay}
                      />
                    ) : (
                      <>
                        <AnimatedNumber
                          value={item.value}
                          delay={delay}
                          locale={numberLocale}
                        />{" "}
                        {t("overview.topItems.saleCount")}
                      </>
                    )}
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

function RevenueDot({ cx, cy, index }: DotItemDotProps) {
  if (typeof cx !== "number" || typeof cy !== "number") {
    return null;
  }

  const color = revenueDotColors[index % revenueDotColors.length];

  return (
    <circle cx={cx} cy={cy} r={4} fill={color} stroke={color} strokeWidth={1} />
  );
}

function RevenueActiveDot({ cx, cy, index }: ActiveDotProps) {
  if (typeof cx !== "number" || typeof cy !== "number") {
    return null;
  }

  return (
    <circle
      cx={cx}
      cy={cy}
      r={6}
      fill={revenueDotColors[index % revenueDotColors.length]}
      stroke="var(--background)"
      strokeWidth={2}
    />
  );
}

function RevenueTooltip({ active, label, payload }: TooltipContentProps) {
  const { numberLocale, t } = useDashboardI18n();

  if (!active || !payload?.length) {
    return null;
  }

  const value = Number(payload[0]?.value ?? 0);
  const currencyPrefix = t("common.egpPrefix");
  const currencySuffix = t("common.egpSuffix");

  return (
    <div className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
      <div className="font-medium">{label}</div>
      <div className="grid gap-1.5">
        <div className="flex w-full flex-wrap items-center gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground">
          {formatMoney(
            value,
            numberLocale,
            currencyPrefix,
            currencySuffix,
          ).replace(" ", "\u00A0")}
        </div>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  value,
  label,
  chart,
  footer,
  centerOverlay = true,
  height = "h-[388px]",
  bodyClassName,
  footerClassName,
}: {
  title: string;
  subtitle: string;
  value?: React.ReactNode;
  label?: string;
  chart: React.ReactNode;
  footer: React.ReactNode;
  centerOverlay?: boolean;
  height?: string;
  bodyClassName?: string;
  footerClassName?: string;
}) {
  return (
    <Card className={`flex flex-col shadow ${height}`}>
      <CardHeader title={title} description={subtitle} />
      <div className={cn("flex-1 p-6 py-4 pb-0", bodyClassName)}>
        <div className="relative mx-auto aspect-square size-[250px] max-h-[250px]">
          {chart}
          {centerOverlay ? (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="text-lg font-bold leading-none">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ) : null}
        </div>
      </div>
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-1 p-6 pt-0 text-center text-sm",
          footerClassName,
        )}
      >
        {footer}
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
      className="flex h-full w-full justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none"
    >
      <style>
        {`[data-chart=chart-revenue-performance] {
  --color-revenue: var(--chart-1);
}

.dark [data-chart=chart-revenue-performance] {
  --color-revenue: var(--chart-1);
}

@keyframes revenue-line-draw {
  from {
    stroke-dashoffset: 2000;
  }

  to {
    stroke-dashoffset: 0;
  }
}

@keyframes revenue-area-reveal {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

[data-chart=chart-revenue-performance] .recharts-area-curve {
  stroke-dasharray: 2000;
  stroke-dashoffset: 2000;
  animation: revenue-line-draw 2200ms cubic-bezier(0.16, 1, 0.3, 1) 220ms forwards;
}

[data-chart=chart-revenue-performance] .recharts-area-area {
  animation: revenue-area-reveal 1200ms ease-out 750ms both;
  transform-box: fill-box;
  transform-origin: center bottom;
}

@media (prefers-reduced-motion: reduce) {
  [data-chart=chart-revenue-performance] .recharts-area-curve,
  [data-chart=chart-revenue-performance] .recharts-area-area {
    animation: none;
    opacity: 1;
    stroke-dashoffset: 0;
  }
}`}
      </style>
      <AnimatedChartWrapper className="h-full w-full">
        {() => (
          <ResponsiveContainer minWidth={0}>
            <AreaChart
              data={revenueChartData}
              margin={{ top: 12, right: 12, bottom: 0, left: 12 }}
            >
              <defs>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-revenue)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-revenue)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="chartName"
                axisLine={false}
                height={30}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickMargin={8}
                tickLine={false}
              />
              <YAxis hide domain={[0, "auto"]} tickCount={5} />
              <Tooltip
                content={(props) => <RevenueTooltip {...props} />}
                cursor={false}
              />
              <Area
                dataKey="revenue"
                type="natural"
                fill="url(#fillRevenue)"
                fillOpacity={0.6}
                stroke="var(--color-revenue)"
                strokeWidth={2}
                isAnimationActive={false}
                animationBegin={220}
                animationDuration={2200}
                animationEasing="ease-out"
                dot={RevenueDot}
                activeDot={RevenueActiveDot}
              />
            </AreaChart>
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
    function handlePointerDown(event: PointerEvent) {
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
          subtitle={t("overview.totalRevenue.subtitle")}
          value={46745.94}
          maxValue={46745.94}
          percentage={100}
          label={t("overview.totalRevenue.label")}
          color="var(--chart-1)"
          decimals={2}
          locale={numberLocale}
          prefix={currencyPrefix}
          suffix={currencySuffix}
          footer={
            <>
              <div className="flex items-center justify-center gap-1 font-medium leading-none">
                {t("overview.totalRevenue.footer")}{" "}
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
              <div className="text-xs leading-none text-muted-foreground">
                {t("overview.totalRevenue.note")}
              </div>
            </>
          }
        />
        <AnimatedCircularStatCard
          title={t("overview.averageOrder.title")}
          subtitle={t("overview.averageOrder.subtitle")}
          value={278.25}
          percentage={61.5}
          label={t("overview.averageOrder.label")}
          color="var(--chart-2)"
          decimals={2}
          locale={numberLocale}
          prefix={currencyPrefix}
          suffix={currencySuffix}
          delay={80}
          footer={
            <>
              <div className="flex items-center justify-center gap-1 font-medium leading-none">
                <AnimatedNumber value={168} delay={80} locale={numberLocale} />{" "}
                {t("overview.averageOrder.footer")}{" "}
                <AnimatedNumber value={273} delay={80} locale={numberLocale} />{" "}
                {t("common.order")} (
                <AnimatedNumber
                  value={61.5}
                  decimals={1}
                  suffix="%"
                  delay={80}
                  locale={numberLocale}
                />
                )
                <TrendingUp className="size-4" />
              </div>
              <div className="text-xs leading-none text-muted-foreground">
                {t("overview.averageOrder.note")}
              </div>
            </>
          }
        />
        <ChartCard
          title={t("overview.revenueBreakdown.title")}
          subtitle={t("overview.revenueBreakdown.subtitle")}
          value={
            <AnimatedNumber
              value={3050}
              decimals={2}
              locale={numberLocale}
              prefix={currencyPrefix}
              suffix={currencySuffix}
              delay={160}
            />
          }
          label={t("overview.revenueBreakdown.label")}
          chart={<DonutBreakdown />}
          footer={
            <div className="flex w-full items-center justify-center gap-3 text-xs">
              <div className="flex shrink-0 items-center gap-1 whitespace-nowrap">
                <span className="size-2.5 shrink-0 rounded-full bg-[var(--chart-1)]" />
                <span className="w-9 truncate text-muted-foreground">
                  {t("overview.revenueBreakdown.delivery")}
                </span>
                <span className="font-medium whitespace-nowrap">
                  <AnimatedNumber
                    value={2885}
                    decimals={2}
                    locale={numberLocale}
                    prefix={currencyPrefix}
                    suffix={currencySuffix}
                    delay={160}
                  />
                </span>
                <span className="text-muted-foreground">
                  (
                  <AnimatedNumber
                    value={95}
                    suffix="%"
                    delay={160}
                    locale={numberLocale}
                  />
                  )
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-1 whitespace-nowrap">
                <span className="size-2.5 shrink-0 rounded-full bg-[var(--chart-3)]" />
                <span className="w-9 truncate text-muted-foreground">
                  {t("overview.revenueBreakdown.discounts")}
                </span>
                <span className="font-medium whitespace-nowrap">
                  <AnimatedNumber
                    value={165}
                    decimals={2}
                    locale={numberLocale}
                    prefix={currencyPrefix}
                    suffix={currencySuffix}
                    delay={160}
                  />
                </span>
                <span className="text-muted-foreground">
                  (
                  <AnimatedNumber
                    value={5}
                    suffix="%"
                    delay={160}
                    locale={numberLocale}
                  />
                  )
                </span>
              </div>
            </div>
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

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <ChartCard
          title={t("overview.ordersSummary.title")}
          subtitle={t("overview.ordersSummary.subtitle")}
          value={<AnimatedNumber value={273} delay={120} locale={numberLocale} />}
          label={t("overview.ordersSummary.label")}
          height="h-[410px]"
          bodyClassName="flex items-center"
          footerClassName="gap-2"
          chart={<OrdersGauge />}
          footer={
            <>
              <div className="flex items-center justify-center gap-1 font-medium leading-none">
                {t("overview.ordersSummary.completionRate")}{" "}
                <AnimatedNumber
                  value={61.5}
                  decimals={1}
                  suffix="%"
                  delay={120}
                  locale={numberLocale}
                />
                <TrendingUp className="size-4" />
              </div>
              <div className="text-xs leading-none text-muted-foreground">
                {t("common.completed")}:{" "}
                <AnimatedNumber value={168} delay={120} locale={numberLocale} /> ·{" "}
                {t("common.incomplete")}:{" "}
                <AnimatedNumber value={105} delay={120} locale={numberLocale} />
              </div>
            </>
          }
        />
        <AnimatedCircularStatCard
          title={t("overview.customerAnalysis.title")}
          subtitle={t("overview.customerAnalysis.subtitle")}
          value={129}
          percentage={100}
          label={t("overview.customerAnalysis.label")}
          color="var(--chart-1)"
          height="h-[410px]"
          radius={85}
          strokeWidth={20}
          trackRadius={85}
          trackStrokeWidth={20}
          locale={numberLocale}
          delay={200}
          footerClassName="gap-2"
          footer={
            <>
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
              <div className="text-xs leading-none text-muted-foreground">
                {t("overview.customerAnalysis.newCustomers")}{" "}
                <AnimatedNumber value={129} delay={200} locale={numberLocale} /> ·{" "}
                {t("overview.customerAnalysis.returningCustomers")}{" "}
                <AnimatedNumber value={0} delay={200} locale={numberLocale} />
              </div>
            </>
          }
        />
        <AnimatedCircularStatCard
          title={t("overview.paymentMethods.title")}
          subtitle={t("overview.paymentMethods.subtitle")}
          value={46745.94}
          percentage={100}
          label={t("overview.paymentMethods.label")}
          color="var(--chart-1)"
          height="h-[410px]"
          radius={85}
          strokeWidth={20}
          trackRadius={85}
          trackStrokeWidth={20}
          decimals={2}
          locale={numberLocale}
          prefix={currencyPrefix}
          suffix={currencySuffix}
          delay={280}
          footerClassName="gap-2"
          footer={
            <>
              <div className="flex items-center justify-center gap-1 font-medium leading-none">
                {t("common.cash")}:{" "}
                <AnimatedNumber
                  value={100}
                  suffix="%"
                  delay={280}
                  locale={numberLocale}
                />{" "}
                · {t("common.electronicPayment")}:{" "}
                <AnimatedNumber
                  value={0}
                  suffix="%"
                  delay={280}
                  locale={numberLocale}
                />
                <TrendingUp className="size-4" />
              </div>
              <div className="text-xs leading-none text-muted-foreground">
                {t("common.cash")}:{" "}
                <AnimatedNumber
                  value={100}
                  suffix="%"
                  delay={280}
                  locale={numberLocale}
                />
              </div>
            </>
          }
        />
      </div>

      <TopCategoriesCard />
    </div>
  );
}
