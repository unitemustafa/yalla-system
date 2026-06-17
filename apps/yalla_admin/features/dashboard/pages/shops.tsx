"use client";

import { useEffect, useState } from "react";
import { MapPin, Plus, Store, X } from "lucide-react";

import {
  AppSelect,
  Badge,
  Button,
  Card,
  DataTable,
  Input,
  PageTitle,
  Pagination,
  Switch,
} from "../primitives";
import { categoryRows } from "../data";
import { deliveryZones } from "../reference-data";

type ShopRow = {
  id: string;
  name: string;
  category: string;
  branch: string;
  products: string;
  active: boolean;
};

const initialShopRows: ShopRow[] = [
  {
    id: "shop-fish-market",
    name: "أسماك الطازج",
    category: "مطاعم",
    branch: "التل الكبير",
    products: "18",
    active: true,
  },
  {
    id: "shop-green-basket",
    name: "سلة الخضار",
    category: "الطازج",
    branch: "التل الكبير",
    products: "24",
    active: true,
  },
  {
    id: "shop-family-market",
    name: "ماركت العائلة",
    category: "التسوق",
    branch: "كل الفروع",
    products: "42",
    active: true,
  },
  {
    id: "shop-bakery",
    name: "مخبوزات الصباح",
    category: "الأكل",
    branch: "التل الكبير",
    products: "11",
    active: false,
  },
];

const shopsPageSize = 10;

function AddShopDrawer({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (shop: ShopRow) => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [branch, setBranch] = useState("");
  const canSave = name.trim() && category.trim() && branch.trim();

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

  function submitShop(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSave) {
      return;
    }

    onSave({
      id: `shop-${Date.now()}`,
      name: name.trim(),
      category: category.trim(),
      branch: branch.trim(),
      products: "0",
      active: true,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-foreground/60 px-4 py-6 backdrop-blur-sm sm:px-6">
      <section
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-shop-title"
        className="relative w-full max-w-2xl overflow-hidden rounded-xl border bg-background shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute left-4 top-4 z-10 inline-flex size-8 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-accent"
          aria-label="إغلاق"
        >
          <X className="size-4" />
        </button>

        <div className="border-b bg-muted/20 px-6 py-5 pe-14">
          <h2 id="add-shop-title" className="text-xl font-semibold leading-7">
            إضافة محل
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            أضف بيانات المحل التي ستظهر في قائمة المحلات وربط المنتجات.
          </p>
        </div>

        <form onSubmit={submitShop}>
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium sm:col-span-2">
              اسم المحل *
              <Input
                autoFocus
                dir="rtl"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="مثلا: خضار البلد"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              التصنيف *
              <AppSelect
                dir="rtl"
                value={category}
                onValueChange={setCategory}
                placeholder="اختر التصنيف"
                ariaLabel="اختيار التصنيف"
                side="top"
                contentClassName="max-h-44"
                options={categoryRows.map((row) => ({
                  value: row.name,
                  label: row.name,
                }))}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              الفرع / المنطقة *
              <AppSelect
                dir="rtl"
                value={branch}
                onValueChange={setBranch}
                placeholder="اختر المنطقة"
                ariaLabel="اختيار المنطقة"
                side="top"
                contentClassName="max-h-44"
                options={deliveryZones.map((zone) => ({
                  value: zone.name,
                  label: zone.name,
                }))}
              />
            </label>
          </div>

          <div className="flex justify-end gap-2 border-t border-border/70 px-6 py-4">
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit" disabled={!canSave}>
              <Plus className="size-4" />
              حفظ المحل
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

export function ShopsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [shops, setShops] = useState(initialShopRows);
  const [addShopOpen, setAddShopOpen] = useState(false);
  const totalPages = Math.max(1, Math.ceil(shops.length / shopsPageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStartIndex = (safeCurrentPage - 1) * shopsPageSize;
  const pagedShops = shops.slice(pageStartIndex, pageStartIndex + shopsPageSize);

  return (
    <div className="px-6 py-6">
      <PageTitle
        title="المحلات"
        description="إدارة المحلات التي تظهر داخل تطبيق العملاء وربطها بالمنتجات والفئات."
        actions={
          <Button size="sm" onClick={() => setAddShopOpen(true)}>
            <Plus className="size-4" />
            إضافة محل
          </Button>
        }
      />

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3 p-4">
            <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Store className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">إجمالي المحلات</p>
              <p className="mt-1 text-xl font-bold">{shops.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3 p-4">
            <span className="flex size-10 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500">
              <Store className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">محلات نشطة</p>
              <p className="mt-1 text-xl font-bold">
                {shops.filter((shop) => shop.active).length}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3 p-4">
            <span className="flex size-10 items-center justify-center rounded-md bg-amber-500/10 text-amber-500">
              <MapPin className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">الفروع المغطاة</p>
              <p className="mt-1 text-xl font-bold">2</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <div className="border-b px-6 py-4">
          <h2 className="text-base font-semibold">كل المحلات</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            راجع حالة كل محل وعدد المنتجات المرتبطة به.
          </p>
        </div>
        <div className="p-6">
          <DataTable
            minWidth={760}
            columnWidths={[240, 160, 170, 120, 90]}
            headers={[
              "اسم المحل",
              "التصنيف",
              "الفرع",
              "المنتجات",
              <span key="status" className="block text-center">
                الحالة
              </span>,
            ]}
            rows={pagedShops.map((shop) => [
              <div key={`name-${shop.id}`} className="font-semibold">
                {shop.name}
              </div>,
              <Badge key={`category-${shop.id}`}>{shop.category}</Badge>,
              <span key={`branch-${shop.id}`} className="text-muted-foreground">
                {shop.branch}
              </span>,
              <span key={`products-${shop.id}`}>{shop.products}</span>,
              <div key={`active-${shop.id}`} className="flex justify-center">
                <Switch checked={shop.active} />
              </div>,
            ])}
          />
          <Pagination
            text={`عرض ${pagedShops.length} من ${shops.length} نتيجة`}
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
      </Card>

      {addShopOpen ? (
        <AddShopDrawer
          onClose={() => setAddShopOpen(false)}
          onSave={(shop) => {
            setShops((current) => [shop, ...current]);
            setCurrentPage(1);
            setAddShopOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
