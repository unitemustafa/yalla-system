"use client";

import { useState } from "react";
import { MapPin, Plus, Store } from "lucide-react";

import {
  Badge,
  Button,
  Card,
  DataTable,
  PageTitle,
  Pagination,
  Switch,
} from "../primitives";

type ShopRow = {
  id: string;
  name: string;
  category: string;
  branch: string;
  products: string;
  active: boolean;
};

const shopRows: ShopRow[] = [
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

export function ShopsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(shopRows.length / shopsPageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStartIndex = (safeCurrentPage - 1) * shopsPageSize;
  const pagedShops = shopRows.slice(pageStartIndex, pageStartIndex + shopsPageSize);

  return (
    <div className="px-6 py-6">
      <PageTitle
        title="المحلات"
        description="إدارة المحلات التي تظهر داخل تطبيق العملاء وربطها بالمنتجات والفئات."
        actions={
          <Button size="sm">
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
              <p className="mt-1 text-xl font-bold">{shopRows.length}</p>
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
                {shopRows.filter((shop) => shop.active).length}
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
            text={`عرض ${pagedShops.length} من ${shopRows.length} نتيجة`}
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
    </div>
  );
}
