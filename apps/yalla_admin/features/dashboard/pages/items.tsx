"use client";

import Link from "next/link";
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
import { deliveryCityOptions } from "../reference-data";
import { useItemTableState } from "../hooks";
import { useSnackbar } from "../snackbar";
import { cn } from "@/lib/utils";

type ItemFilters = {
  search: string;
  category: string;
  status: "all" | "active" | "inactive";
};

const defaultFilters: ItemFilters = {
  search: "",
  category: "all",
  status: "all",
};

const itemsPageSize = 10;

const checkboxClass =
  "peer inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-border text-transparent transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground";

const itemSortCollator = new Intl.Collator("ar", {
  numeric: true,
  sensitivity: "base",
});

function uniqueValues(rows: ItemRow[], key: "category") {
  return Array.from(new Set(rows.map((row) => row[key]).filter(Boolean)));
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
  return { ...row, code: row.code ?? row.id, price: formatItemPrice(row.price) };
}

function matchesFilters(row: ItemRow, filters: ItemFilters) {
  const search = filters.search.trim().toLowerCase();
  const matchesSearch =
    !search ||
    [row.code, row.id, row.name, row.description, row.category, formatItemPrice(row.price)]
      .join(" ")
      .toLowerCase()
      .includes(search);
  const matchesCategory =
    filters.category === "all" || row.category === filters.category;
  const matchesStatus =
    filters.status === "all" ||
    (filters.status === "active" ? row.active : !row.active);

  return matchesSearch && matchesCategory && matchesStatus;
}

function MetricCards({ rows }: { rows: ItemRow[] }) {
  const activeCount = rows.filter((row) => row.active).length;
  const inactiveCount = rows.length - activeCount;
  const cards = [
    ["إجمالي المنتجات", String(rows.length), Package, "text-primary"],
    ["نشط", String(activeCount), CheckCircle, "text-green-500"],
    ["غير نشط", String(inactiveCount), XCircle, "text-destructive"],
  ] as const;

  return (
    <div className="mt-6 grid gap-3 md:grid-cols-3">
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
  filters,
  onChange,
  onReset,
}: {
  categories: string[];
  filters: ItemFilters;
  onChange: (filters: ItemFilters) => void;
  onReset: () => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-[minmax(300px,1fr)_220px_180px_120px] md:items-end">
      <label className="grid gap-2 text-sm">
        بحث
        <input
          value={filters.search}
          onChange={(event) => onChange({ ...filters, search: event.target.value })}
          placeholder="ابحث بالاسم أو الوصف..."
          className="h-10 rounded-md border border-border bg-input px-3 text-sm shadow-sm outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
        />
      </label>
      <label className="grid gap-2 text-sm">
        التصنيف
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
          ariaLabel="التصنيف"
          className="h-10 rounded-md border border-border bg-input px-3 text-sm shadow-sm outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
        />
      </label>
      <label className="grid gap-2 text-sm">
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
      <Button type="button" variant="outline" className="h-10 w-full" onClick={onReset}>
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
                  <p className="mt-0.5 text-xs font-medium text-primary">
                    {row.code ?? row.id}
                  </p>
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
  const [selectedRegion, setSelectedRegion] = useState("كل المناطق");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(() => new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const visibleRows = useMemo(
    () => rows.filter((row) => matchesFilters(row, filters)).sort(compareItems),
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
    <div className="px-4 py-6">
      <PageTitle
        title="المنتجات"
        description="إدارة منتجات المنيو في كل الفروع"
        size="compact"
        actions={
          <>
            <AppSelect
              value={selectedRegion}
              onValueChange={setSelectedRegion}
              options={[
                { value: "كل المناطق", label: "كل المناطق" },
                ...deliveryCityOptions.map((region) => ({
                  value: region,
                  label: region,
                })),
              ]}
              ariaLabel="اختيار المنطقة"
              icon={<MapPin className="size-4" />}
              className="w-full sm:w-[178px]"
            />
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
          onChange={(nextFilters) => {
            setFilters(nextFilters);
            setCurrentPage(1);
          }}
          onReset={() => {
            setFilters(defaultFilters);
            setSelectedRows(new Set());
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
            minWidth={1070}
            columnWidths={[
              48, 40, 64, 286, 116, 276, 88, 90, 62, 70,
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
              "Code",
              "الوصف",
              "التصنيف",
              "السعر",
              "نشط",
              "",
            ]}
            rows={(loading ? [] : pagedRows).map((row, rowPosition) => [
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
              pageStartIndex + rowPosition + 1,
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
              <div key={`code-${row.index}`} className="flex min-w-0 items-center justify-start gap-2">
                <span className="truncate font-medium text-primary">
                  {row.code ?? row.id}
                </span>
              </div>,
              <div key={`description-${row.index}`} className="flex flex-col gap-0.5">
                <p>{row.description}</p>
              </div>,
              <div key={`category-${row.index}`} className="flex flex-col gap-0.5">
                <span>{row.category}</span>
              </div>,
              <div key={`price-${row.index}`} className="flex gap-1">
                <span>{formatItemPrice(row.price).split(" ")[0]}</span>
                <span>{formatItemPrice(row.price).split(" ")[1]}</span>
              </div>,
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
