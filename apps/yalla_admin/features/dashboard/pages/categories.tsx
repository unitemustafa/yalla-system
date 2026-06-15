"use client";

import { useEffect, useRef, useState } from "react";
import {
  Edit,
  GripVertical,
  Pencil,
  ImagePlus,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { categoryRows, type CategoryRow } from "../data";
import { DashboardImage } from "../dashboard-image";
import {
  ActionMenu,
  AppSelect,
  Badge,
  Button,
  Card,
  DataTable,
  Input,
  Pagination,
  Switch,
} from "../primitives";
import { useDisclosure } from "../hooks";
import { useSnackbar } from "../snackbar";

type CategoryStatusFilter = "all" | "active" | "inactive";
type CategoryTypeFilter = "all" | "popular" | "featured";
type CategorySectionFilter = string;

const popularCategoryMinTotal = 20;
const initialCategorySectionOptions: CategorySectionFilter[] = [
  "all",
  "الطازج",
  "الأكل",
  "التسوق",
  "البيت",
  "الموضة",
  "الخدمات",
];

const categoryTypeOptions = [
  { value: "popular", label: "فئات شائعة" },
  { value: "featured", label: "فئات مميزة" },
];
const categoriesPageSize = 10;

function CategoryDrawer({
  category,
  sectionOptions,
  onClose,
  onSubmit,
}: {
  category?: CategoryRow | null;
  sectionOptions: CategorySectionFilter[];
  onClose: () => void;
  onSubmit: () => void;
}) {
  const isEditing = Boolean(category);
  const selectedSection = category?.sections[0] ?? "الطازج";
  const selectedType = category?.featured === "نعم" ? "featured" : "popular";
  const categoryImageObjectUrlRef = useRef<string | null>(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState(category?.image ?? "");
  const [categoryImageName, setCategoryImageName] = useState("");

  function revokeCategoryImageObjectUrl() {
    if (categoryImageObjectUrlRef.current) {
      URL.revokeObjectURL(categoryImageObjectUrlRef.current);
      categoryImageObjectUrlRef.current = null;
    }
  }

  function handleCategoryImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    revokeCategoryImageObjectUrl();
    const nextPreview = URL.createObjectURL(file);
    categoryImageObjectUrlRef.current = nextPreview;
    setCategoryImagePreview(nextPreview);
    setCategoryImageName(file.name);
    event.target.value = "";
  }

  function resetCategoryImage() {
    revokeCategoryImageObjectUrl();
    setCategoryImagePreview(category?.image ?? "");
    setCategoryImageName("");
  }

  useEffect(() => {
    const objectUrlRef = categoryImageObjectUrlRef;

    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-category-title"
      className="fixed inset-0 z-40 flex items-center justify-center overflow-hidden bg-foreground/30 p-4 backdrop-blur-[1px]"
    >
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-[980px] flex-col rounded-lg border bg-background p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="add-category-title" className="text-lg font-semibold">
              {isEditing ? "تعديل الفئة" : "إضافة فئة جديدة"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isEditing
                ? "عدّل بيانات الفئة والتصنيف والنوع الخاص بها."
                : "أنشئ فئة جديدة تظهر داخل القسم المناسب في تطبيق العملاء."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border p-2 hover:bg-accent"
            aria-label="إغلاق"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-5 grid min-h-0 flex-1 gap-5 overflow-y-auto pr-1 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
          <div className="grid gap-3 text-sm font-medium lg:sticky lg:top-0">
            <div className="text-sm font-medium leading-5">صورة الفئة</div>
            <div className="grid gap-3 rounded-lg border border-border/70 bg-muted/15 p-3">
              <label className="group relative flex aspect-[16/10] min-h-[190px] cursor-pointer items-center justify-center overflow-hidden rounded-md border border-dashed border-border bg-background text-center transition hover:border-primary/50 hover:bg-accent/40">
                <input
                  accept="image/*"
                  className="sr-only"
                  onChange={handleCategoryImageChange}
                  type="file"
                />
                {categoryImagePreview ? (
                  <>
                    <DashboardImage
                      src={categoryImagePreview}
                      alt="معاينة صورة الفئة"
                      width={300}
                      height={300}
                      sizes="150px"
                      className="absolute inset-0 size-full"
                      imageClassName="object-cover"
                    />
                    <span className="absolute inset-0 z-20 bg-black/0 transition group-hover:bg-black/35" />
                    <span className="relative z-30 rounded-md bg-background/95 px-3 py-2 text-sm font-semibold opacity-0 shadow-sm transition group-hover:opacity-100">
                      تغيير الصورة
                    </span>
                  </>
                ) : (
                  <span className="flex flex-col items-center gap-2 px-4 text-sm text-muted-foreground">
                    <span className="flex size-10 items-center justify-center rounded-md bg-muted/50">
                      <ImagePlus className="size-5 text-primary" />
                    </span>
                    <span className="font-semibold text-foreground">اختيار صورة</span>
                  </span>
                )}
              </label>
              <div className="flex min-w-0 flex-col gap-3">
                <p className="text-xs leading-5 text-muted-foreground">
                  استخدم صورة مربعة وواضحة. الصيغ المدعومة PNG, JPG, WEBP.
                </p>
                <div className="flex min-h-10 items-center justify-between gap-3 rounded-md border bg-background px-3 py-2 text-xs text-muted-foreground">
                  <span className="min-w-0 truncate">
                    {categoryImageName ||
                      (category?.image ? "الصورة الحالية مستخدمة" : "لم يتم اختيار صورة")}
                  </span>
                  {categoryImagePreview && categoryImageName ? (
                    <button
                      type="button"
                      onClick={resetCategoryImage}
                      className="inline-flex shrink-0 items-center gap-1 font-semibold text-destructive transition hover:text-destructive/80"
                    >
                      <X className="size-3.5" />
                      حذف
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex h-[76px] flex-col gap-3 text-sm font-medium sm:col-span-2">
              <span className="leading-5">اسم الفئة</span>
              <Input
                className="h-11"
                defaultValue={category?.name}
                placeholder="مثلاً: طيور، أسماك، لحوم فريش..."
              />
            </label>
            <label className="flex h-[76px] flex-col gap-3 text-sm font-medium">
              <span className="leading-5">تصنيف</span>
              <AppSelect
                defaultValue={selectedSection}
                options={sectionOptions
                  .filter((section) => section !== "all")
                  .map((section) => ({
                    value: section,
                    label: section,
                  }))}
                ariaLabel="تصنيف"
                className="h-11"
              />
            </label>
            <label className="flex h-[76px] flex-col gap-3 text-sm font-medium">
              <span className="leading-5">النوع</span>
              <AppSelect
                defaultValue={selectedType}
                options={categoryTypeOptions}
                ariaLabel="النوع"
                className="h-11"
              />
            </label>
            <label className="flex min-h-[124px] flex-col gap-3 text-sm font-medium sm:col-span-2">
              <span className="leading-5">وصف الفئة</span>
              <textarea
                className="min-h-24 resize-none rounded-md border border-border bg-input px-3 py-2 text-sm font-normal leading-6 text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
                placeholder="اكتب وصف مختصر للفئة..."
              />
            </label>
          </div>
        </div>
        <div className="mt-4 flex shrink-0 justify-end gap-2 border-t border-border/70 pt-4">
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button onClick={onSubmit}>
            {isEditing ? (
              <Pencil className="size-4" />
            ) : (
              <Plus className="size-4" />
            )}
            {isEditing ? "حفظ التعديلات" : "إنشاء"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function CategorySectionDrawer({
  existingSections,
  onClose,
  onSubmit,
}: {
  existingSections: CategorySectionFilter[];
  onClose: () => void;
  onSubmit: (sectionName: string) => void;
}) {
  const [sectionName, setSectionName] = useState("");
  const trimmedName = sectionName.trim();
  const sectionExists = existingSections.some(
    (section) =>
      section !== "all" &&
      section.toLocaleLowerCase("ar-EG") ===
        trimmedName.toLocaleLowerCase("ar-EG"),
  );
  const visibleSections = existingSections.filter((section) => section !== "all");
  const canSubmit = trimmedName.length > 0 && !sectionExists;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-category-section-title"
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="relative flex w-full max-w-[420px] flex-col rounded-xl border bg-background shadow-2xl">
        <button
          onClick={onClose}
          className="absolute left-4 top-4 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          aria-label="إغلاق"
        >
          <X className="size-4" />
        </button>
        <div className="px-6 pt-6">
          <h2 id="add-category-section-title" className="text-lg font-semibold">
            إضافة تصنيف جديد
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            أضف تصنيف يظهر في قائمة التصنيفات عند إنشاء أو تعديل الفئات.
          </p>
        </div>
        <div className="flex flex-col gap-4 p-6">
          <label className="flex flex-col gap-3 text-sm font-medium">
            <span className="leading-5">اسم التصنيف</span>
            <Input
              autoFocus
              className="h-11"
              value={sectionName}
              onChange={(event) => setSectionName(event.target.value)}
              placeholder="مثلاً: العروض، الأطفال، المستلزمات..."
            />
          </label>
          {sectionExists ? (
            <p className="text-xs font-medium text-destructive">
              التصنيف موجود بالفعل.
            </p>
          ) : null}
          <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-sm font-medium">التصنيفات الموجودة</span>
              <span className="text-xs text-muted-foreground">
                {visibleSections.length} تصنيفات
              </span>
            </div>
            <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto pr-0.5">
              {visibleSections.map((section) => (
                <Badge key={section} tone="secondary">
                  {section}
                </Badge>
              ))}
            </div>
          </div>
          <Button
            className="mt-2 h-11 w-full"
            disabled={!canSubmit}
            onClick={() => {
              if (!canSubmit) return;
              onSubmit(trimmedName);
            }}
          >
            <Plus className="size-4" />
            إنشاء التصنيف
          </Button>
        </div>
      </div>
    </div>
  );
}

function CategoryActionsMenu({
  name,
  open,
  onToggle,
  onEdit,
  onDelete,
}: {
  name: string;
  open: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex justify-center">
      <ActionMenu
        open={open}
        onToggle={onToggle}
        align="center"
        label={`إجراءات ${name}`}
        title="بيانات الفئة"
        triggerClassName="h-8 w-12"
        menuClassName="w-40"
        items={[
          { label: "تعديل", icon: Edit, onClick: onEdit },
          { label: "حذف", icon: Trash2, onClick: onDelete, tone: "danger" },
        ]}
      />
    </div>
  );
}

export function CategoriesPage() {
  const { showSnackbar } = useSnackbar();
  const categoryDrawer = useDisclosure(false);
  const categorySectionDrawer = useDisclosure(false);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const [orderedRows, setOrderedRows] = useState(() => categoryRows);
  const [categorySectionOptions, setCategorySectionOptions] = useState(
    () => initialCategorySectionOptions,
  );
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(
    null,
  );
  const [draggingRowIndex, setDraggingRowIndex] = useState<string | null>(null);
  const [dragOverRowIndex, setDragOverRowIndex] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<CategoryStatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<CategoryTypeFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const visibleRows = orderedRows.filter((row) => {
    const matchesSearch = row.name
      .toLocaleLowerCase("ar-EG")
      .includes(searchTerm.trim().toLocaleLowerCase("ar-EG"));
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" ? row.active : !row.active);
    const categoryTotal = Number.parseInt(row.total, 10);
    const matchesType =
      typeFilter === "all" ||
      (typeFilter === "featured"
        ? row.featured === "نعم"
        : Number.isFinite(categoryTotal) &&
          categoryTotal >= popularCategoryMinTotal);

    return matchesSearch && matchesStatus && matchesType;
  });
  const totalPages = Math.max(
    1,
    Math.ceil(visibleRows.length / categoriesPageSize),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStartIndex = (safeCurrentPage - 1) * categoriesPageSize;
  const pagedRows = visibleRows.slice(
    pageStartIndex,
    pageStartIndex + categoriesPageSize,
  );

  function moveCategoryTo(rowIndex: string, targetRowIndex: string) {
    if (rowIndex === targetRowIndex) return;

    const sourceVisibleIndex = visibleRows.findIndex(
      (row) => row.index === rowIndex,
    );
    const targetVisibleIndex = visibleRows.findIndex(
      (row) => row.index === targetRowIndex,
    );

    if (sourceVisibleIndex === -1 || targetVisibleIndex === -1) return;

    setOrderedRows((currentRows) => {
      const sourceIndex = currentRows.findIndex((row) => row.index === rowIndex);
      const targetIndex = currentRows.findIndex(
        (row) => row.index === targetRowIndex,
      );

      if (sourceIndex === -1 || targetIndex === -1) return currentRows;

      const [sourceRow] = currentRows.slice(sourceIndex, sourceIndex + 1);
      const rowsWithoutSource = currentRows.filter(
        (row) => row.index !== rowIndex,
      );
      const targetIndexAfterRemoval = rowsWithoutSource.findIndex(
        (row) => row.index === targetRowIndex,
      );
      const insertIndex =
        sourceVisibleIndex < targetVisibleIndex
          ? targetIndexAfterRemoval + 1
          : targetIndexAfterRemoval;

      return [
        ...rowsWithoutSource.slice(0, insertIndex),
        sourceRow,
        ...rowsWithoutSource.slice(insertIndex),
      ];
    });
    setOpenActionMenu(null);
    showSnackbar({ message: "تم تحديث ترتيب الفئات." });
  }

  function resetToFirstPage() {
    setCurrentPage(1);
  }

  function openCreateDrawer() {
    setEditingCategory(null);
    categoryDrawer.open();
  }

  function openEditDrawer(category: CategoryRow) {
    setEditingCategory(category);
    setOpenActionMenu(null);
    categoryDrawer.open();
  }

  function closeCategoryDrawer() {
    categoryDrawer.close();
    setEditingCategory(null);
  }

  function toggleCategoryStatus(rowIndex: string, checked: boolean) {
    setOrderedRows((currentRows) =>
      currentRows.map((row) =>
        row.index === rowIndex ? { ...row, active: checked } : row,
      ),
    );
    showSnackbar({
      message: checked ? "تم تفعيل الفئة." : "تم إيقاف الفئة.",
    });
  }

  return (
    <div className="px-6 py-6">
      <div className="flex min-h-[57px] items-start">
        <div>
          <h1 className="text-2xl font-semibold leading-8">
            الفئات والتصنيفات
          </h1>
          <p className="mt-1 text-sm leading-[21px] text-muted-foreground">
            إدارة فئات المنتجات وتصنيفاتها حسب أقسام تطبيق العملاء مثل الطازج والأكل والتسوق.
          </p>
        </div>
      </div>

      <Card className="mt-8">
        <div className="flex min-h-[76px] flex-col items-start justify-between gap-4 border-b px-6 py-4 sm:flex-row sm:items-center">
          <div>
            <div className="text-base font-semibold">كل الفئات والتصنيفات</div>
            <div className="mt-1 text-xs text-muted-foreground">
              أنشئ فئة جديدة لتنظيم المنتجات.
            </div>
          </div>
          <div className="flex w-full flex-wrap items-center justify-start gap-2 sm:w-auto sm:justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={categorySectionDrawer.open}
            >
              <Plus className="size-4" />
              إضافة تصنيف جديد
            </Button>
            <Button size="sm" onClick={openCreateDrawer}>
              <Plus className="size-4" />
              إضافة فئة جديدة
            </Button>
          </div>
        </div>
        <div className="p-6 pt-4">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <label className="flex flex-col gap-2 md:flex-1">
              <span className="text-sm leading-5">بحث</span>
              <div className="relative">
                <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="ps-9"
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    resetToFirstPage();
                  }}
                  placeholder="ابحث في الفئات..."
                />
              </div>
            </label>
            <label className="flex flex-col gap-2 md:w-[150px]">
              <span className="text-sm leading-5">الحالة</span>
              <AppSelect
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value as CategoryStatusFilter);
                  setOpenActionMenu(null);
                  resetToFirstPage();
                }}
                options={[
                  { value: "all", label: "كل الحالات" },
                  { value: "active", label: "نشط" },
                  { value: "inactive", label: "غير نشط" },
                ]}
                className="h-9"
                contentClassName="rounded-xl border-border/80 bg-popover p-1.5 shadow-2xl"
                ariaLabel="الحالة"
              />
            </label>
            <label className="flex flex-col gap-2 md:w-[170px]">
              <span className="text-sm leading-5">النوع</span>
              <AppSelect
                value={typeFilter}
                onValueChange={(value) => {
                  setTypeFilter(value as CategoryTypeFilter);
                  setOpenActionMenu(null);
                  resetToFirstPage();
                }}
                options={[
                  { value: "all", label: "كل الفئات" },
                  { value: "popular", label: "فئات شائعة" },
                  { value: "featured", label: "فئات مميزة" },
                ]}
                className="h-9"
                contentClassName="rounded-xl border-border/80 bg-popover p-1.5 shadow-2xl"
                ariaLabel="النوع"
              />
            </label>
          </div>
          <div className="mt-4 overflow-x-auto rounded-md border">
            <DataTable
              minWidth={1120}
              rowHeight="tall"
              columnWidths={[110, 120, 330, 220, 150, 140]}
              headers={[
                <span key="order" className="block text-center">
                  الترتيب
                </span>,
                <span key="image" className="block text-center">
                  الصورة
                </span>,
                "الاسم",
                "التصنيف",
                <span key="status" className="block text-center">
                  الحالة
                </span>,
                <span key="actions" className="block text-center">
                  إجراءات
                </span>,
              ]}
              getRowProps={(rowIndex) => {
                const row = pagedRows[rowIndex];

                return {
                  draggable: true,
                  onDragStart: (event) => {
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", row.index);
                    setDraggingRowIndex(row.index);
                    setDragOverRowIndex(null);
                  },
                  onDragOver: (event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                    setDragOverRowIndex(row.index);
                  },
                  onDragLeave: () => {
                    setDragOverRowIndex((current) =>
                      current === row.index ? null : current,
                    );
                  },
                  onDrop: (event) => {
                    event.preventDefault();
                    const sourceRowIndex =
                      event.dataTransfer.getData("text/plain") ??
                      draggingRowIndex;
                    if (sourceRowIndex) {
                      moveCategoryTo(sourceRowIndex, row.index);
                    }
                    setDraggingRowIndex(null);
                    setDragOverRowIndex(null);
                  },
                  onDragEnd: () => {
                    setDraggingRowIndex(null);
                    setDragOverRowIndex(null);
                  },
                  className:
                    dragOverRowIndex === row.index &&
                    draggingRowIndex !== row.index
                      ? "bg-accent/60"
                      : draggingRowIndex === row.index
                        ? "opacity-60"
                        : undefined,
                };
              }}
              rows={pagedRows.map((row, visibleIndex) => [
                <div
                  key={`order-${row.index}`}
                  className="flex items-center justify-center gap-2 px-2"
                >
                  <span className="min-w-5 text-center font-medium">
                    {pageStartIndex + visibleIndex + 1}
                  </span>
                  <span
                    className="inline-flex size-8 cursor-grab items-center justify-center rounded-md border bg-background text-muted-foreground active:cursor-grabbing"
                    aria-label={`تحريك ${row.name}`}
                    title="اسحب لتغيير الترتيب"
                  >
                    <GripVertical className="size-4" />
                  </span>
                </div>,
                <div key={`image-${row.index}`} className="flex justify-center">
                  <DashboardImage
                    alt={row.name}
                    src={row.image}
                    width={40}
                    height={40}
                    sizes="40px"
                    className="size-10 rounded-sm"
                  />
                </div>,
                row.name,
                <span key={`sections-${row.index}`} className="text-muted-foreground">
                  {row.sections.join("، ")}
                </span>,
                <div key={`status-${row.index}`} className="flex justify-center">
                  <Switch
                    checked={row.active}
                    onCheckedChange={(checked) =>
                      toggleCategoryStatus(row.index, checked)
                    }
                  />
                </div>,
                <CategoryActionsMenu
                  key={`actions-${row.index}`}
                  name={row.name}
                  open={openActionMenu === row.index}
                  onToggle={() =>
                    setOpenActionMenu((current) =>
                      current === row.index ? null : row.index,
                    )
                  }
                  onEdit={() => openEditDrawer(row)}
                  onDelete={() => {
                    setOpenActionMenu(null);
                    showSnackbar({
                      message: `تم حذف ${row.name}.`,
                      tone: "danger",
                    });
                  }}
                />,
              ])}
            />
          </div>
          <Pagination
            text={`عرض ${pagedRows.length} من ${visibleRows.length} نتيجة`}
            pages={`${safeCurrentPage} / ${totalPages}`}
            showPerPage={false}
            previousDisabled={safeCurrentPage === 1}
            nextDisabled={safeCurrentPage === totalPages}
            onPrevious={() =>
              setCurrentPage((page) =>
                Math.max(1, Math.min(page, totalPages) - 1),
              )
            }
            onNext={() =>
              setCurrentPage((page) =>
                Math.min(totalPages, Math.min(page, totalPages) + 1),
              )
            }
          />
        </div>
      </Card>
      {categoryDrawer.isOpen ? (
        <CategoryDrawer
          category={editingCategory}
          sectionOptions={categorySectionOptions}
          onClose={closeCategoryDrawer}
          onSubmit={() => {
            closeCategoryDrawer();
            showSnackbar({
              message: editingCategory
                ? "تم حفظ تعديلات الفئة بنجاح."
                : "تم إنشاء الفئة بنجاح.",
            });
          }}
        />
      ) : null}
      {categorySectionDrawer.isOpen ? (
        <CategorySectionDrawer
          existingSections={categorySectionOptions}
          onClose={categorySectionDrawer.close}
          onSubmit={(sectionName) => {
            setCategorySectionOptions((currentSections) => [
              ...currentSections,
              sectionName,
            ]);
            categorySectionDrawer.close();
            showSnackbar({ message: "تم إنشاء التصنيف بنجاح." });
          }}
        />
      ) : null}
    </div>
  );
}
