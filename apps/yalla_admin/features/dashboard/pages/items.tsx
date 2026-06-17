"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Check,
  CheckCircle,
  Copy,
  Edit,
  MapPin,
  Minus,
  Package,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Trash2,
  XCircle,
} from "lucide-react";

import type { ItemRow } from "../data";
import { DashboardImage } from "../dashboard-image";
import {
  ActionMenu,
  AppSelect,
  Button,
  Card,
  DataTable,
  PageTitle,
  Pagination,
  Switch,
} from "../primitives";
import { deliveryZones } from "../reference-data";
import { useItemTableState } from "../hooks";
import { useSnackbar } from "../snackbar";
import { cn } from "@/lib/utils";

type ItemFilters = {
  search: string;
  category: string;
  shop: string;
  region: string;
  status: "all" | "active" | "inactive";
};

const defaultFilters: ItemFilters = {
  search: "",
  category: "all",
  shop: "all",
  region: "all",
  status: "all",
};

const itemsPageSize = 10;

const checkboxClass =
  "peer inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-border text-transparent transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground";

function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) {
      return;
    }

    const scrollY = window.scrollY;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyPosition = document.body.style.position;
    const previousBodyTop = document.body.style.top;
    const previousBodyWidth = document.body.style.width;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.position = previousBodyPosition;
      document.body.style.top = previousBodyTop;
      document.body.style.width = previousBodyWidth;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.scrollTo(0, scrollY);
    };
  }, [locked]);
}

const itemSortCollator = new Intl.Collator("ar", {
  numeric: true,
  sensitivity: "base",
});

function uniqueValues(rows: ItemRow[], key: "category" | "shopName") {
  return Array.from(
    new Set(
      rows
        .map((row) => (row[key] ?? "").trim())
        .filter(Boolean),
    ),
  );
}

function compareText(firstValue: string, secondValue: string) {
  return itemSortCollator.compare(firstValue.trim(), secondValue.trim());
}

function compareItems(firstRow: ItemRow, secondRow: ItemRow) {
  const categoryComparison = compareText(firstRow.category, secondRow.category);

  if (categoryComparison !== 0) {
    return categoryComparison;
  }

  return compareText(firstRow.name, secondRow.name);
}

function formatItemPrice(price: string) {
  return price.replace(/\s*\u062c\u0646\u064a\u0647/g, " EGP");
}

function normalizeItemRow(row: ItemRow): ItemRow {
  return {
    ...row,
    code: row.code ?? row.id,
    shopName: row.shopName ?? "",
    price: formatItemPrice(row.price),
    visibilityMode: row.visibilityMode ?? "general",
    regionSlugs: row.regionSlugs ?? [],
    regionNames: row.regionNames ?? [],
  };
}

function itemVisibilityLabel(row: ItemRow) {
  if (row.visibilityMode !== "regions") return "عام";
  const names = row.regionNames?.length ? row.regionNames : row.regionSlugs;
  return names?.length ? names.join("، ") : "مناطق محددة";
}

function itemShopLabel(row: ItemRow) {
  return row.shopName?.trim() || "-";
}

function splitItemPrice(price: string) {
  const normalizedPrice = formatItemPrice(price).trim();
  const [amount = normalizedPrice, currency = ""] = normalizedPrice.split(/\s+/);

  return { amount, currency };
}

function matchesRegion(row: ItemRow, selectedRegion: string) {
  if (selectedRegion === "all") return true;
  if (selectedRegion === "general") return row.visibilityMode !== "regions";
  return row.visibilityMode !== "regions" || (row.regionSlugs ?? []).includes(selectedRegion);
}

function matchesFilters(row: ItemRow, filters: ItemFilters) {
  const search = filters.search.trim().toLowerCase();
  const matchesSearch =
    !search ||
    [
      row.code,
      row.id,
      row.name,
      row.description,
      row.category,
      row.shopName,
      formatItemPrice(row.price),
    ]
      .join(" ")
      .toLowerCase()
      .includes(search);
  const matchesCategory =
    filters.category === "all" || row.category === filters.category;
  const matchesShop =
    filters.shop === "all" ||
    (filters.shop === "none"
      ? !row.shopName?.trim()
      : row.shopName === filters.shop);
  const matchesStatus =
    filters.status === "all" ||
    (filters.status === "active" ? row.active : !row.active);

  return (
    matchesSearch &&
    matchesCategory &&
    matchesShop &&
    matchesStatus &&
    matchesRegion(row, filters.region)
  );
}

function MetricCards({ rows }: { rows: ItemRow[] }) {
  const activeCount = rows.filter((row) => row.active).length;
  const inactiveCount = rows.length - activeCount;
  const cards = [
    {
      label: "إجمالي المنتجات",
      value: String(rows.length),
      detail: "حسب الفلاتر الحالية",
      icon: Package,
      tone: "bg-primary/10 text-primary",
      marker: "bg-primary",
    },
    {
      label: "نشط",
      value: String(activeCount),
      detail: "ظاهر للعملاء",
      icon: CheckCircle,
      tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      marker: "bg-emerald-500",
    },
    {
      label: "غير نشط",
      value: String(inactiveCount),
      detail: "متوقف مؤقتًا",
      icon: XCircle,
      tone: "bg-red-500/10 text-red-700 dark:text-red-300",
      marker: "bg-destructive",
    },
  ] as const;

  return (
    <div className="mt-4 grid gap-3 md:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card key={card.label} className="relative min-h-[92px] overflow-hidden">
            <span className={cn("absolute inset-y-4 end-0 w-1 rounded-s-full", card.marker)} />
            <div className="flex h-full items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-muted-foreground">
                  {card.label}
                </p>
                <p className="mt-1 text-2xl font-black leading-tight">
                  {card.value}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {card.detail}
                </p>
              </div>
              <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-md", card.tone)}>
                <Icon className="size-5" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function ItemsFilters({
  categories,
  filters,
  hasFilters,
  onChange,
  onReset,
  shops,
}: {
  categories: string[];
  filters: ItemFilters;
  hasFilters: boolean;
  onChange: (filters: ItemFilters) => void;
  onReset: () => void;
  shops: string[];
}) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm font-black">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <SlidersHorizontal className="size-4" />
          </span>
          بحث وتصفية
        </div>
        <Button
          className="h-8 self-start px-3 text-xs sm:self-auto"
          disabled={!hasFilters}
          onClick={onReset}
          type="button"
          variant="outline"
        >
          <RotateCcw className="size-3.5" />
          إعادة ضبط
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 md:items-end xl:grid-cols-[minmax(280px,1fr)_170px_170px_190px_160px]">
        <label className="grid gap-2 text-sm font-medium">
          بحث
          <span className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={filters.search}
              onChange={(event) => onChange({ ...filters, search: event.target.value })}
              placeholder="ابحث بالاسم أو الوصف..."
              className="h-10 w-full rounded-md border border-border bg-input px-3 ps-9 text-sm shadow-sm outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
            />
          </span>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          الفئة
          <AppSelect
            value={filters.category}
            onValueChange={(category) => onChange({ ...filters, category })}
            options={[
              { value: "all", label: "الكل" },
              ...categories.map((category) => ({
                value: category,
                label: category,
              })),
            ]}
            ariaLabel="الفئة"
            className="h-10 rounded-md border border-border bg-input px-3 text-sm shadow-sm outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          المحل
          <AppSelect
            value={filters.shop}
            onValueChange={(shop) => onChange({ ...filters, shop })}
            options={[
              { value: "all", label: "الكل" },
              { value: "none", label: "بدون محل" },
              ...shops.map((shop) => ({
                value: shop,
                label: shop,
              })),
            ]}
            ariaLabel="المحل"
            className="h-10 rounded-md border border-border bg-input px-3 text-sm shadow-sm outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          المنطقة
          <AppSelect
            value={filters.region}
            onValueChange={(region) => onChange({ ...filters, region })}
            options={[
              { value: "all", label: "كل المناطق" },
              { value: "general", label: "عام" },
              ...deliveryZones.map((region) => ({
                value: region.id,
                label: region.name,
              })),
            ]}
            ariaLabel="المنطقة"
            icon={<MapPin className="size-4" />}
            className="h-10 rounded-md border border-border bg-input px-3 text-sm shadow-sm outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          الحالة
          <AppSelect
            value={filters.status}
            onValueChange={(status) =>
              onChange({ ...filters, status: status as ItemFilters["status"] })
            }
            options={[
              { value: "all", label: "الكل" },
              { value: "active", label: "نشط" },
              { value: "inactive", label: "غير نشط" },
            ]}
            ariaLabel="الحالة"
            className="h-10 rounded-md border border-border bg-input px-3 text-sm shadow-sm outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
          />
        </label>
      </div>
    </div>
  );
}

function RowActions({
  row,
  open,
  onOpen,
  onDuplicate,
  onDelete,
}: {
  row: ItemRow;
  open: boolean;
  onOpen: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  return (
    <ActionMenu
      open={open}
      onToggle={onOpen}
      label={`\u0625\u062c\u0631\u0627\u0621\u0627\u062a ${row.name}`}
      title={"\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0645\u0646\u062a\u062c"}
      triggerClassName="h-8 w-12"
      menuClassName="w-56"
      items={[
        {
          label: "\u062a\u0639\u062f\u064a\u0644",
          icon: Edit,
          href: `/items/edit/${row.id}?returnTo=%2Fitems%3F`,
        },
        {
          label: "\u0646\u0633\u062e",
          icon: Copy,
          onClick: () => {
            onDuplicate();
            onOpen();
          },
        },
        {
          label: "\u062d\u0630\u0641",
          icon: Trash2,
          onClick: () => {
            onDelete();
            onOpen();
          },
          tone: "danger",
        },
      ]}
    />
  );
}

function ProductIdentity({ row, compact = false }: { row: ItemRow; compact?: boolean }) {
  const imageSize = compact ? 48 : 52;

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <DashboardImage
        alt={row.name}
        src={row.image}
        width={imageSize}
        height={imageSize}
        sizes={`${imageSize}px`}
        className={cn(
          "shrink-0 rounded-md border bg-muted/35 shadow-sm",
          compact ? "size-12" : "size-[52px]",
        )}
        imageClassName="object-contain p-1"
      />
      <div className="min-w-0">
        <h3 className="truncate text-[13px] font-black leading-5">{row.name}</h3>
        <div className="mt-1 flex min-w-0 flex-wrap items-center gap-1.5">
          <span className="max-w-full truncate rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-primary">
            {row.code ?? row.id}
          </span>
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-[11px] font-bold",
              row.active
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "bg-red-500/10 text-red-700 dark:text-red-300",
            )}
          >
            {row.active ? "نشط" : "متوقف"}
          </span>
        </div>
      </div>
    </div>
  );
}

function InfoPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex max-w-full items-center rounded-md border border-border/70 bg-muted/40 px-2 py-0.5 text-xs font-semibold text-foreground">
      <span className="truncate">{children}</span>
    </span>
  );
}

function PriceCell({ price }: { price: string }) {
  const { amount, currency } = splitItemPrice(price);

  return (
    <div className="inline-flex min-w-[78px] items-baseline justify-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-primary">
      <span className="text-sm font-black leading-none">{amount}</span>
      {currency ? <span className="text-[11px] font-bold">{currency}</span> : null}
    </div>
  );
}

function ActiveToggleButton({
  active,
  onToggle,
}: {
  active: boolean;
  onToggle: (active: boolean) => void;
}) {
  return (
    <Switch
      checked={active}
      aria-label={active ? "إلغاء تنشيط المنتج" : "تنشيط المنتج"}
      onCheckedChange={onToggle}
    />
  );
}

function DeleteDialog({
  itemName,
  onClose,
  onConfirm,
}: {
  itemName: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  useBodyScrollLock(true);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center overflow-hidden overscroll-none bg-foreground/40 px-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-item-title"
        className="w-full max-w-[512px] rounded-lg border bg-background p-6 shadow-lg"
      >
        <h2 id="delete-item-title" className="text-lg font-semibold">
          حذف المنتج
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          متأكد إنك عايز تحذف <span className="font-semibold">{itemName}</span>؟
          الإجراء ده هيشيله من الجدول الحالي.
        </p>
        <div className="mt-4 flex justify-end gap-4">
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            تأكيد الحذف
          </Button>
        </div>
      </div>
    </div>
  );
}

function ItemsMobileCards({
  rows,
  selectedRows,
  openRow,
  onToggleRow,
  onToggleSelected,
  onToggleActive,
  onDuplicate,
  onDelete,
}: {
  rows: ItemRow[];
  selectedRows: Set<string>;
  openRow: string | null;
  onToggleRow: (rowIndex: string) => void;
  onToggleSelected: (rowIndex: string) => void;
  onToggleActive: (row: ItemRow, active: boolean) => void;
  onDuplicate: (row: ItemRow) => void;
  onDelete: (rowId: string) => void;
}) {
  return (
    <div className="mt-4 grid min-w-0 gap-3 lg:hidden">
      {rows.map((row) => (
        <article
          key={row.id}
          className="min-w-0 overflow-hidden rounded-md border bg-card p-3 text-card-foreground shadow-sm"
        >
          <div className="flex items-start gap-3">
            <button
              type="button"
              role="checkbox"
              aria-checked={selectedRows.has(row.index)}
              data-state={selectedRows.has(row.index) ? "checked" : "unchecked"}
              value="on"
              aria-label="تحديد الصف"
              className={cn(checkboxClass, "mt-3")}
              onClick={() => onToggleSelected(row.index)}
            >
              {selectedRows.has(row.index) ? <Check className="size-3" /> : null}
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <ProductIdentity row={row} compact />
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                    {row.description}
                  </p>
                </div>
                <RowActions
                  row={row}
                  open={openRow === row.index}
                  onOpen={() => onToggleRow(row.index)}
                  onDuplicate={() => onDuplicate(row)}
                  onDelete={() => onDelete(row.id)}
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                <div className="rounded-md bg-muted/40 p-2">
                  <div className="text-muted-foreground">الفئة</div>
                  <div className="mt-1 truncate font-medium">{row.category}</div>
                </div>
                <div className="rounded-md bg-muted/40 p-2">
                  <div className="text-muted-foreground">المحل</div>
                  <div className="mt-1 truncate font-medium">{itemShopLabel(row)}</div>
                </div>
                <div className="rounded-md bg-muted/40 p-2">
                  <div className="text-muted-foreground">السعر</div>
                  <div className="mt-1">
                    <PriceCell price={row.price} />
                  </div>
                </div>
                <div className="rounded-md bg-muted/40 p-2">
                  <div className="text-muted-foreground">الظهور</div>
                  <div className="mt-1 line-clamp-1 font-medium">
                    {itemVisibilityLabel(row)}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 border-t pt-3">
                <ActiveToggleButton
                  active={row.active}
                  onToggle={(active) => onToggleActive(row, active)}
                />
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export function ItemsPage() {
  const { openRow, toggleRow } = useItemTableState();
  const { showSnackbar } = useSnackbar();
  const [rows, setRows] = useState<ItemRow[]>([]);
  const [filters, setFilters] = useState<ItemFilters>(defaultFilters);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(() => new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const visibleRows = useMemo(
    () =>
      rows
        .filter((row) => matchesFilters(row, filters))
        .sort(compareItems),
    [filters, rows],
  );
  const totalPages = Math.max(1, Math.ceil(visibleRows.length / itemsPageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStartIndex = (safeCurrentPage - 1) * itemsPageSize;
  const pagedRows = visibleRows.slice(pageStartIndex, pageStartIndex + itemsPageSize);
  const categories = useMemo(
    () => uniqueValues(rows, "category").sort(compareText),
    [rows],
  );
  const shops = useMemo(
    () => uniqueValues(rows, "shopName").sort(compareText),
    [rows],
  );
  const hasFilters =
    filters.search.trim().length > 0 ||
    filters.category !== defaultFilters.category ||
    filters.shop !== defaultFilters.shop ||
    filters.region !== defaultFilters.region ||
    filters.status !== defaultFilters.status;
  const selectedState = useMemo(() => {
    if (
      pagedRows.length > 0 &&
      pagedRows.every((row) => selectedRows.has(row.index))
    ) {
      return "checked";
    }

    if (selectedRows.size > 0) {
      return "indeterminate";
    }

    return "unchecked";
  }, [pagedRows, selectedRows]);
  const deleteRow = rows.find((row) => row.id === deleteId);

  useEffect(() => {
    let alive = true;

    async function loadItems() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/dashboard/items");

        if (!response.ok) {
          throw new Error("Failed to load items");
        }

        const data = (await response.json()) as { items: ItemRow[] };

        if (alive) {
          setRows(data.items.map(normalizeItemRow));
        }
      } catch {
        if (alive) {
          setError("تعذر تحميل المنتجات. حاول تحديث الصفحة.");
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    loadItems();

    return () => {
      alive = false;
    };
  }, []);

  function toggleAllRows() {
    setSelectedRows((currentRows) =>
      pagedRows.every((row) => currentRows.has(row.index))
        ? new Set([...currentRows].filter(
            (rowIndex) => !pagedRows.some((row) => row.index === rowIndex),
          ))
        : new Set([...currentRows, ...pagedRows.map((row) => row.index)]),
    );
  }

  function toggleSelectedRow(rowIndex: string) {
    setSelectedRows((currentRows) => {
      const nextRows = new Set(currentRows);

      if (nextRows.has(rowIndex)) {
        nextRows.delete(rowIndex);
      } else {
        nextRows.add(rowIndex);
      }

      return nextRows;
    });
  }

  async function toggleActive(row: ItemRow, active: boolean) {
    const previousRows = rows;

    setRows((currentRows) =>
      currentRows.map((currentRow) =>
        currentRow.id === row.id ? { ...currentRow, active } : currentRow,
      ),
    );
    setError("");

    try {
      const response = await fetch(
        `/api/dashboard/items/${encodeURIComponent(row.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update item");
      }

      const data = (await response.json()) as { item: ItemRow };
      const updatedItem = normalizeItemRow(data.item);

      setRows((currentRows) =>
        currentRows.map((currentRow) =>
          currentRow.id === updatedItem.id ? updatedItem : currentRow,
        ),
      );
      showSnackbar({
        message: active ? "تم تفعيل المنتج." : "تم إيقاف المنتج.",
      });
    } catch {
      setRows(previousRows);
      setError("تعذر تحديث حالة المنتج.");
      showSnackbar({
        message: "تعذر تحديث حالة المنتج.",
        tone: "danger",
      });
    }
  }

  async function duplicateRow(row: ItemRow) {
    setError("");

    try {
      const response = await fetch(
        `/api/dashboard/items/${encodeURIComponent(row.id)}/duplicate`,
        { method: "POST" },
      );

      if (!response.ok) {
        throw new Error("Failed to duplicate item");
      }

      const data = (await response.json()) as { item: ItemRow };
      setRows((currentRows) => [normalizeItemRow(data.item), ...currentRows]);
      showSnackbar({ message: "تم نسخ المنتج بنجاح." });
    } catch {
      setError("تعذر نسخ المنتج.");
      showSnackbar({
        message: "تعذر نسخ المنتج.",
        tone: "danger",
      });
    }
  }

  async function confirmDelete() {
    if (!deleteRow) {
      return;
    }

    const previousRows = rows;
    const deletedItemName = deleteRow.name;

    setRows((currentRows) => currentRows.filter((row) => row.id !== deleteRow.id));
    setSelectedRows((currentRows) => {
      const nextRows = new Set(currentRows);
      nextRows.delete(deleteRow.index);
      return nextRows;
    });
    setDeleteId(null);
    setError("");

    try {
      const response = await fetch(
        `/api/dashboard/items/${encodeURIComponent(deleteRow.id)}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }
      showSnackbar({
        message: `تم حذف ${deletedItemName}.`,
        tone: "danger",
      });
    } catch {
      setRows(previousRows);
      setError("تعذر حذف المنتج.");
      showSnackbar({
        message: "تعذر حذف المنتج.",
        tone: "danger",
      });
    }
  }

  return (
    <div className="min-h-screen bg-muted/20 px-4 py-6 sm:px-6 lg:px-8">
      <PageTitle
        title="المنتجات"
        description="إدارة منتجات المنيو في كل الفروع"
        size="compact"
        className="rounded-lg border bg-card p-4 shadow-sm"
        actions={
          <Link
            href="/items/create"
            className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition hover:bg-primary/90 sm:w-[132px]"
          >
            <Plus className="size-4" />
            منتج جديد
          </Link>
        }
      />

      <MetricCards rows={visibleRows} />

      <div className="mt-6">
        {error ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        ) : null}
        <ItemsFilters
          categories={categories}
          filters={filters}
          hasFilters={hasFilters}
          shops={shops}
          onChange={(nextFilters) => {
            setFilters(nextFilters);
            setCurrentPage(1);
          }}
          onReset={() => {
            setFilters(defaultFilters);
            setCurrentPage(1);
          }}
        />
        {loading ? (
          <div className="mt-4 flex h-24 items-center justify-center rounded-md border text-sm text-muted-foreground lg:hidden">
            جاري تحميل المنتجات...
          </div>
        ) : visibleRows.length ? (
          <ItemsMobileCards
            rows={pagedRows}
            selectedRows={selectedRows}
            openRow={openRow}
            onToggleRow={toggleRow}
            onToggleSelected={toggleSelectedRow}
            onToggleActive={toggleActive}
            onDuplicate={duplicateRow}
            onDelete={setDeleteId}
          />
        ) : (
          <div className="mt-4 flex h-24 items-center justify-center rounded-md border text-sm text-muted-foreground lg:hidden">
            لا توجد نتائج مطابقة.
          </div>
        )}
        <div className="mt-4 hidden overflow-hidden rounded-md border transition-opacity duration-200 lg:block">
          <DataTable
            minWidth={1180}
            columnWidths={[
              48, 48, 300, 210, 110, 120, 130, 112, 70,
            ]}
            rowHeight="normal"
            headers={[
              <div key="select-all" className="ps-4">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={
                    selectedState === "indeterminate"
                      ? "mixed"
                      : selectedState === "checked"
                  }
                  data-state={selectedState}
                  value="on"
                  aria-label="تحديد الكل"
                  className={checkboxClass}
                  onClick={toggleAllRows}
                >
                  {selectedState === "checked" ? (
                    <Check className="size-3" />
                  ) : selectedState === "indeterminate" ? (
                    <Minus className="size-3" />
                  ) : null}
                </button>
              </div>,
              "#",
              "المنتج",
              "الوصف",
              "الفئة",
              "المحل",
              "الظهور",
              "السعر",
              "نشط",
              "",
            ]}
            rows={(loading ? [] : pagedRows).map((row, rowPosition) => [
              <div key={`check-wrap-${row.index}`} className="flex items-center ps-4 py-2">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={selectedRows.has(row.index)}
                  data-state={selectedRows.has(row.index) ? "checked" : "unchecked"}
                  value="on"
                  aria-label="تحديد الصف"
                  className={checkboxClass}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleSelectedRow(row.index);
                  }}
                >
                  {selectedRows.has(row.index) ? <Check className="size-3" /> : null}
                </button>
              </div>,
              <span key={`index-${row.index}`} className="text-sm font-bold text-muted-foreground">
                {pageStartIndex + rowPosition + 1}
              </span>,
              <div
                key={`product-${row.index}`}
                className="min-w-0 py-1.5"
              >
                <ProductIdentity row={row} />
              </div>,
              <div key={`description-${row.index}`} className="min-w-0 py-1.5">
                <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                  {row.description}
                </p>
              </div>,
              <div key={`category-${row.index}`} className="min-w-0">
                <InfoPill>{row.category}</InfoPill>
              </div>,
              <div key={`shop-${row.index}`} className="min-w-0">
                <InfoPill>{itemShopLabel(row)}</InfoPill>
              </div>,
              <div key={`visibility-${row.index}`} className="min-w-0">
                <InfoPill>{itemVisibilityLabel(row)}</InfoPill>
              </div>,
              <div key={`price-${row.index}`} className="flex justify-start">
                <PriceCell price={row.price} />
              </div>,
              <div key={`active-wrap-${row.index}`} className="flex items-center gap-3">
                <ActiveToggleButton
                  active={row.active}
                  onToggle={(active) => toggleActive(row, active)}
                />
              </div>,
              <div key={`actions-${row.index}`} className="flex items-center justify-center">
                <RowActions
                  row={row}
                  open={openRow === row.index}
                  onOpen={() => toggleRow(row.index)}
                  onDuplicate={() => duplicateRow(row)}
                  onDelete={() => setDeleteId(row.id)}
                />
              </div>,
            ])}
          />
          {loading ? (
            <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
              جاري تحميل المنتجات...
            </div>
          ) : !visibleRows.length ? (
            <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
              لا توجد نتائج مطابقة.
            </div>
          ) : null}
        </div>
        <Pagination
          text={`عرض ${pagedRows.length} من ${visibleRows.length} نتيجة`}
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
      </div>

      {deleteRow ? (
        <DeleteDialog
          itemName={deleteRow.name}
          onClose={() => setDeleteId(null)}
          onConfirm={confirmDelete}
        />
      ) : null}
    </div>
  );
}
