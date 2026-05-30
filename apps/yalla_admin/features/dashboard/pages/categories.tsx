"use client";

import { useState } from "react";
import {
  ChevronDown,
  Pencil,
  ImageIcon,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { categoryRows } from "../data";
import { DashboardImage } from "../dashboard-image";
import {
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

function CategoryDrawer({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  return (
    <aside
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-category-title"
      className="fixed inset-y-0 right-0 z-40 flex w-full max-w-sm flex-col border-l bg-background shadow-xl"
    >
      <button
        onClick={onClose}
        className="absolute left-4 top-4"
        aria-label="إغلاق"
      >
        <X className="size-4" />
      </button>
      <div className="px-6 pt-6">
        <h2 id="add-category-title" className="text-lg font-semibold">
          إضافة فئة جديدة
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          أنشئ فئة جديدة لتنظيم المنتجات.
        </p>
      </div>
      <div className="flex flex-col gap-4 overflow-y-auto p-6">
        <div className="flex min-h-[192px] flex-col">
          <div className="text-sm font-medium leading-5">صورة الفئة</div>
          <button className="mx-auto mt-[22px] flex h-[140px] w-[231px] flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed bg-muted/30 text-center hover:bg-muted/50">
            <ImageIcon className="size-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              انقر لتحميل صورة أو اسحب وأفلت
            </span>
            <span className="text-xs text-muted-foreground">
              PNG, JPG, WEBP حتى 10MB
            </span>
          </button>
        </div>

        <label className="flex h-[76px] flex-col gap-3 text-sm font-medium">
          <span className="leading-5">اسم الفئة</span>
          <Input
            className="h-11"
            placeholder="مثلاً: مشروبات، حلويات، مقبلات..."
          />
        </label>
        <div className="flex h-[100px] items-center justify-between rounded-lg border p-4">
          <div>
            <div className="text-base font-medium">فئة مميزة</div>
            <p className="mt-2 text-sm text-muted-foreground">
              إظهار الفئة بشكل أوضح في تطبيق العملاء
            </p>
          </div>
          <Switch checked={false} />
        </div>
        <Button className="mt-2 h-11 w-full" onClick={onCreated}>
          <Plus className="size-4" />
          إنشاء
        </Button>
      </div>
    </aside>
  );
}

function CategoryActionsMenu({
  name,
  open,
  onToggle,
  onClose,
  onDelete,
}: {
  name: string;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="relative flex justify-center"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex h-8 w-[58px] items-center justify-center rounded-md border bg-background text-sm font-bold hover:bg-accent"
        aria-label={`إجراءات ${name}`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <MoreHorizontal className="size-4" />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute left-1/2 top-10 z-20 w-36 -translate-x-1/2 rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
        >
          <button
            type="button"
            role="menuitem"
            onClick={onClose}
            className="flex h-9 w-full items-center justify-between rounded-sm px-3 text-sm hover:bg-accent"
          >
            <span>تعديل</span>
            <Pencil className="size-3.5" />
          </button>
          <div className="-mx-1 my-1 border-t" />
          <button
            type="button"
            role="menuitem"
            onClick={onDelete}
            className="flex h-9 w-full items-center justify-between rounded-sm px-3 text-sm text-destructive hover:bg-accent"
          >
            <span>حذف</span>
            <Trash2 className="size-3.5" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function CategoriesPage() {
  const { showSnackbar } = useSnackbar();
  const categoryDrawer = useDisclosure(false);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  const visibleRows = categoryRows.filter((row) => {
    const matchesSearch = row.name
      .toLocaleLowerCase("ar-EG")
      .includes(searchTerm.trim().toLocaleLowerCase("ar-EG"));
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" ? row.active : !row.active);

    return matchesSearch && matchesStatus;
  });
  const totalPages = Math.max(1, Math.ceil(visibleRows.length / 20));

  return (
    <div className="px-6 py-6">
      <div className="flex min-h-[57px] items-start">
        <div>
          <h1 className="text-2xl font-semibold leading-8">الفئات</h1>
          <p className="mt-1 text-sm leading-[21px] text-muted-foreground">
            إدارة فئات المنتجات وإنشاء فئات جديدة وتنظيم المنتجات بسهولة.
          </p>
        </div>
      </div>

      <Card className="mt-8">
        <div className="flex min-h-[76px] items-center justify-between border-b px-6">
          <div>
            <div className="text-base font-semibold">كل الفئات</div>
            <div className="mt-1 text-xs text-muted-foreground">
              أنشئ فئة جديدة لتنظيم المنتجات.
            </div>
          </div>
          <Button size="sm" onClick={categoryDrawer.open}>
            <Plus className="size-4" />
            إضافة فئة جديدة
          </Button>
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
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="ابحث في الفئات..."
                />
              </div>
            </label>
            <label className="flex flex-col gap-2 md:w-[150px]">
              <span className="text-sm leading-5">الحالة</span>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(
                      event.target.value as "all" | "active" | "inactive",
                    );
                    setOpenActionMenu(null);
                  }}
                  className="flex h-9 w-full appearance-none rounded-md border border-border bg-background px-3 py-2 pe-9 text-sm text-muted-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="all">كل الحالات</option>
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                </select>
                <ChevronDown className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground opacity-50" />
              </div>
            </label>
          </div>
          <div className="mt-4 overflow-x-auto rounded-md border">
            <DataTable
              minWidth={1120}
              rowHeight="tall"
              columnWidths={[60, 120, 430, 160, 210, 140]}
              headers={[
                "#",
                <span key="image" className="block text-center">
                  الصورة
                </span>,
                "الاسم",
                <span key="status" className="block text-center">
                  الحالة
                </span>,
                <span key="featured" className="block text-center">
                  فئة مميزة
                </span>,
                <span key="actions" className="block text-center">
                  إجراءات
                </span>,
              ]}
              rows={visibleRows.map((row) => [
                <span key={`index-${row.index}`} className="block px-2">
                  {row.index}
                </span>,
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
                <div key={`status-${row.index}`} className="flex justify-center">
                  <Switch
                    checked={row.active}
                    onCheckedChange={(checked) =>
                      showSnackbar({
                        message: checked ? "تم تفعيل الفئة." : "تم إيقاف الفئة.",
                      })
                    }
                  />
                </div>,
                <div key={`featured-${row.index}`} className="flex justify-center">
                  <Badge>{row.featured}</Badge>
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
                  onClose={() => setOpenActionMenu(null)}
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
            text={`عرض ${visibleRows.length} من ${categoryRows.length} نتيجة`}
            pages={`1 / ${totalPages}`}
            showPerPage={false}
          />
        </div>
      </Card>
      {categoryDrawer.isOpen ? (
        <CategoryDrawer
          onClose={categoryDrawer.close}
          onCreated={() => {
            categoryDrawer.close();
            showSnackbar({ message: "تم إنشاء الفئة بنجاح." });
          }}
        />
      ) : null}
    </div>
  );
}
