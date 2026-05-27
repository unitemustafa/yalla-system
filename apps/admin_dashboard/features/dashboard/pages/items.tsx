"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Check,
  CheckCircle,
  Copy,
  Edit,
  Minus,
  Package,
  Plus,
  Star,
  Trash2,
  UploadCloud,
  XCircle,
} from "lucide-react";

import type { ItemRow } from "../data";
import { DashboardImage } from "../dashboard-image";
import { Badge, Button, Card, DataTable, PageTitle, Pagination, Switch } from "../primitives";
import { useItemTableState } from "../hooks";
import { useSnackbar } from "../snackbar";
import { cn } from "@/lib/utils";

type ItemFilters = {
  search: string;
  category: string;
  subcategory: string;
  status: "all" | "active" | "inactive";
};

const defaultFilters: ItemFilters = {
  search: "",
  category: "all",
  subcategory: "all",
  status: "all",
};

const checkboxClass =
  "peer inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-border text-transparent transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground";

function uniqueValues(rows: ItemRow[], key: "category" | "subcategory") {
  return Array.from(new Set(rows.map((row) => row[key]).filter(Boolean)));
}

function matchesFilters(row: ItemRow, filters: ItemFilters) {
  const search = filters.search.trim().toLowerCase();
  const matchesSearch =
    !search ||
    [row.name, row.description, row.category, row.subcategory, row.price]
      .join(" ")
      .toLowerCase()
      .includes(search);
  const matchesCategory =
    filters.category === "all" || row.category === filters.category;
  const matchesSubcategory =
    filters.subcategory === "all" || row.subcategory === filters.subcategory;
  const matchesStatus =
    filters.status === "all" ||
    (filters.status === "active" ? row.active : !row.active);

  return matchesSearch && matchesCategory && matchesSubcategory && matchesStatus;
}

function MetricCards({ rows }: { rows: ItemRow[] }) {
  const activeCount = rows.filter((row) => row.active).length;
  const inactiveCount = rows.length - activeCount;
  const featuredCount = rows.filter((row) => row.featured !== "لا").length;
  const cards = [
    ["إجمالي المنتجات", String(rows.length), Package, "text-primary"],
    ["نشط", String(activeCount), CheckCircle, "text-green-500"],
    ["غير نشط", String(inactiveCount), XCircle, "text-destructive"],
    ["مميز", String(featuredCount), Star, "text-amber-500"],
  ] as const;

  return (
    <div className="mt-6 grid gap-3 md:grid-cols-4">
      {cards.map(([label, value, Icon, tone]) => (
        <Card key={label} className="h-[75px]">
          <div className="flex items-center gap-3 p-4">
            <div className={cn("rounded-full bg-muted/50 p-2", tone)}>
              <Icon className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">{label}</p>
              <p className="text-xl font-semibold leading-tight">{value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function ItemsFilters({
  categories,
  subcategories,
  filters,
  onChange,
  onReset,
}: {
  categories: string[];
  subcategories: string[];
  filters: ItemFilters;
  onChange: (filters: ItemFilters) => void;
  onReset: () => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,288px)_176px_176px_160px_auto] md:items-end">
      <label className="grid gap-2 text-sm">
        بحث
        <input
          value={filters.search}
          onChange={(event) => onChange({ ...filters, search: event.target.value })}
          placeholder="ابحث بالاسم أو الوصف..."
          className="h-9 rounded-md border border-border bg-input px-3 text-sm shadow-sm outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
        />
      </label>
      <label className="grid gap-2 text-sm">
        التصنيف
        <select
          value={filters.category}
          onChange={(event) =>
            onChange({ ...filters, category: event.target.value, subcategory: "all" })
          }
          className="h-9 rounded-md border border-border bg-input px-3 text-sm shadow-sm outline-none"
        >
          <option value="all">الكل</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm">
        التصنيف الفرعي
        <select
          value={filters.subcategory}
          onChange={(event) => onChange({ ...filters, subcategory: event.target.value })}
          className="h-9 rounded-md border border-border bg-input px-3 text-sm shadow-sm outline-none"
        >
          <option value="all">الكل</option>
          {subcategories.map((subcategory) => (
            <option key={subcategory} value={subcategory}>
              {subcategory}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm">
        الحالة
        <select
          value={filters.status}
          onChange={(event) =>
            onChange({ ...filters, status: event.target.value as ItemFilters["status"] })
          }
          className="h-9 rounded-md border border-border bg-input px-3 text-sm shadow-sm outline-none"
        >
          <option value="all">الكل</option>
          <option value="active">نشط</option>
          <option value="inactive">غير نشط</option>
        </select>
      </label>
      <Button type="button" variant="outline" size="sm" onClick={onReset}>
        إعادة ضبط
      </Button>
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
    <div className="relative flex justify-end">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onOpen();
        }}
        className="rounded-md border px-4 py-1 font-bold hover:bg-muted"
        aria-label={`إجراءات ${row.name}`}
      >
        ...
      </button>
      {open ? (
        <div className="absolute left-0 top-[34px] z-20 w-56 rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          <div className="px-2 py-2 text-sm font-semibold">بيانات المنتج</div>
          <div className="-mx-1 border-t" />
          <Link
            href={`/items/edit/${row.id}?returnTo=%2Fitems%3F`}
            className="mt-1 flex h-10 items-center justify-between rounded-sm px-3 text-sm hover:bg-accent"
          >
            <span>تعديل</span>
            <Edit className="size-3" />
          </Link>
          <div className="-mx-1 border-t" />
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDuplicate();
            }}
            className="flex h-10 w-full items-center justify-between rounded-sm px-3 text-sm hover:bg-accent"
          >
            <span>نسخ</span>
            <Copy className="size-3" />
          </button>
          <div className="-mx-1 border-t" />
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            className="flex h-10 w-full items-center justify-between rounded-sm px-3 text-sm text-destructive hover:bg-accent"
          >
            <span>حذف</span>
            <Trash2 className="size-3" />
          </button>
        </div>
      ) : null}
    </div>
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
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-foreground/40 px-4">
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
            <DashboardImage
              alt={row.name}
              src={row.image}
              width={48}
              height={48}
              sizes="48px"
              className="size-12 rounded-sm"
              imageClassName="object-contain"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold">{row.name}</h3>
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
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md bg-muted/40 p-2">
                  <div className="text-muted-foreground">التصنيف</div>
                  <div className="mt-1 truncate font-medium">{row.category}</div>
                </div>
                <div className="rounded-md bg-muted/40 p-2">
                  <div className="text-muted-foreground">السعر</div>
                  <div className="mt-1 truncate font-medium">{row.price}</div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 border-t pt-3">
                <Badge>{row.featured}</Badge>
                <label className="flex items-center gap-2 text-xs font-medium">
                  نشط
                  <Switch
                    checked={row.active}
                    onCheckedChange={(active) => onToggleActive(row, active)}
                  />
                </label>
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
  const visibleRows = useMemo(
    () => rows.filter((row) => matchesFilters(row, filters)),
    [filters, rows],
  );
  const categories = useMemo(() => uniqueValues(rows, "category"), [rows]);
  const subcategories = useMemo(() => {
    const scopedRows =
      filters.category === "all"
        ? rows
        : rows.filter((row) => row.category === filters.category);

    return uniqueValues(scopedRows, "subcategory");
  }, [filters.category, rows]);
  const selectedState = useMemo(() => {
    if (
      visibleRows.length > 0 &&
      visibleRows.every((row) => selectedRows.has(row.index))
    ) {
      return "checked";
    }

    if (selectedRows.size > 0) {
      return "indeterminate";
    }

    return "unchecked";
  }, [selectedRows, visibleRows]);
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
          setRows(data.items);
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
      visibleRows.every((row) => currentRows.has(row.index))
        ? new Set()
        : new Set(visibleRows.map((row) => row.index)),
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

      setRows((currentRows) =>
        currentRows.map((currentRow) =>
          currentRow.id === data.item.id ? data.item : currentRow,
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
      setRows((currentRows) => [data.item, ...currentRows]);
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
    <div className="px-4 py-6">
      <PageTitle
        title="المنتجات"
        description="إدارة منتجات المنيو في كل الفروع"
        size="compact"
        actions={
          <>
            <Button variant="outline" className="ms-2">
              <UploadCloud className="ms-2 size-4" />
              استيراد / تصدير
            </Button>
            <Link
              href="/items/create"
              className="inline-flex h-9 w-[122px] items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
            >
              <Plus className="ms-2 size-4" />
              منتج جديد
            </Link>
          </>
        }
      />

      <MetricCards rows={rows} />

      <div className="mt-6">
        {error ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        ) : null}
        <ItemsFilters
          categories={categories}
          subcategories={subcategories}
          filters={filters}
          onChange={setFilters}
          onReset={() => {
            setFilters(defaultFilters);
            setSelectedRows(new Set());
          }}
        />
        {loading ? (
          <div className="mt-4 flex h-24 items-center justify-center rounded-md border text-sm text-muted-foreground lg:hidden">
            جاري تحميل المنتجات...
          </div>
        ) : visibleRows.length ? (
          <ItemsMobileCards
            rows={visibleRows}
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
            minWidth={1135}
            columnWidths={[
              48, 40, 64, 252, 16, 233.71875, 71.25, 89.34375, 56.96875,
              73.875, 73.609375, 52, 63.828125,
            ]}
            rowHeight="tall"
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
              "",
              "الاسم",
              <div key="id" className="hidden">
                ID
              </div>,
              "الوصف",
              "التصنيف",
              "التصنيف الفرعي",
              "السعرات",
              "السعر",
              "منتج مميز",
              "نشط",
              "",
            ]}
            rows={(loading ? [] : visibleRows).map((row) => [
              <div key={`check-wrap-${row.index}`} className="flex items-center ps-4 py-3.5">
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
              row.index,
              <div key={`img-wrap-${row.index}`} className="flex w-12 items-center justify-center">
                <DashboardImage
                  alt={row.name}
                  src={row.image}
                  width={40}
                  height={40}
                  sizes="40px"
                  className="size-10 rounded-sm"
                  imageClassName="object-contain"
                />
              </div>,
              <div key={`name-${row.index}`} className="flex flex-col gap-0.5">
                <span>{row.name}</span>
              </div>,
              <div key={`id-${row.index}`} className="hidden items-center justify-start gap-2">
                <span>{row.id}</span>
              </div>,
              <div key={`description-${row.index}`} className="flex flex-col gap-0.5">
                <p>{row.description}</p>
              </div>,
              <div key={`category-${row.index}`} className="flex flex-col gap-0.5">
                <span>{row.category}</span>
              </div>,
              <p key={`subcategory-${row.index}`}>{row.subcategory}</p>,
              row.calories || (
                <div key={`calories-${row.index}`} className="h-2 w-8 rounded-full bg-accent" />
              ),
              <div key={`price-${row.index}`} className="flex gap-1">
                <span>{row.price.split(" ")[0]}</span>
                <span>{row.price.split(" ")[1]}</span>
              </div>,
              <Badge key={`featured-${row.index}`}>{row.featured}</Badge>,
              <div key={`active-wrap-${row.index}`} className="flex items-center">
                <Switch
                  key={`active-${row.index}`}
                  checked={row.active}
                  onCheckedChange={(active) => toggleActive(row, active)}
                />
              </div>,
              <RowActions
                key={`actions-${row.index}`}
                row={row}
                open={openRow === row.index}
                onOpen={() => toggleRow(row.index)}
                onDuplicate={() => duplicateRow(row)}
                onDelete={() => setDeleteId(row.id)}
              />,
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
          text={`عرض ${visibleRows.length} من ${rows.length} نتيجة`}
          pages="1 / 1"
          nextDisabled
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
