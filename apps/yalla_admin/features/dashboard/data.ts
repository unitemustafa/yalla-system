import {
  LayoutDashboard,
  MessageCircle,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Truck,
  Users,
} from "lucide-react";

import type { BreadcrumbItem, NavGroup, PageKey } from "./types";

export const logoSrc =
  "https://bucket.ammenu.com/twins-cafe/tenantsthumbnails/1775081472381-tz4tlty8cn.webp";

export const navGroups: NavGroup[] = [
  {
    label: "القائمة",
    items: [
      {
        label: "لوحة التحكم",
        icon: LayoutDashboard,
        href: "/dashboard",
        page: "overview",
      },
      {
        label: "المنتجات",
        icon: ShoppingBag,
        children: [
          { label: "كل المنتجات", href: "/items", page: "items" },
          { label: "إضافة منتج", href: "/items/create", page: "create-item" },
          { label: "المحلات", href: "/items/shops", page: "shops" },
          {
            label: "الفئات والتصنيفات",
            href: "/items/categories",
            page: "categories",
          },
          { label: "الإضافات", href: "/items/addons", page: "addons" },
        ],
      },
      {
        label: "الطلبات",
        icon: ShoppingCart,
        children: [
          { label: "كل الطلبات", href: "/orders", page: "orders" },
          { label: "إنشاء طلب", href: "/orders/create", page: "create-order" },
        ],
      },
      {
        label: "العروض",
        icon: Tag,
        children: [
          { label: "كل العروض", href: "/offers", page: "offers" },
          { label: "إنشاء عرض", href: "/offers/create", page: "create-offer" },
        ],
      },
    ],
  },
  {
    label: "الإدارة",
    items: [
      {
        label: "التوصيل",
        icon: Truck,
        children: [
          {
            label: "مناطق التوصيل",
            href: "/delivery-zone",
            page: "delivery-zone",
          },
          { label: "المندوبين", href: "/delivery/couriers", page: "couriers" },
        ],
      },
      { label: "المستخدمين", icon: Users, href: "/customers", page: "customers" },
      {
        label: "الشات",
        icon: MessageCircle,
        soon: true,
      },
    ],
  },
];

const dashboardCrumb: BreadcrumbItem = { label: "لوحة التحكم", href: "/dashboard" };

export const breadcrumbByPage: Record<PageKey, BreadcrumbItem[]> = {
  overview: [{ label: "لوحة التحكم" }],
  items: [dashboardCrumb, { label: "المنتجات" }],
  "create-item": [
    dashboardCrumb,
    { label: "المنتجات", href: "/items" },
    { label: "إضافة منتج" },
  ],
  shops: [
    dashboardCrumb,
    { label: "المنتجات", href: "/items" },
    { label: "المحلات" },
  ],
  categories: [
    dashboardCrumb,
    { label: "المنتجات", href: "/items" },
    { label: "الفئات والتصنيفات" },
  ],
  addons: [
    dashboardCrumb,
    { label: "المنتجات", href: "/items" },
    { label: "الإضافات" },
  ],
  orders: [dashboardCrumb, { label: "الطلبات" }],
  "create-order": [
    dashboardCrumb,
    { label: "الطلبات", href: "/orders" },
    { label: "إنشاء طلب" },
  ],
  "order-detail": [
    dashboardCrumb,
    { label: "الطلبات", href: "/orders" },
    { label: "ORD-20260518-QYT6Y0" },
  ],
  offers: [dashboardCrumb, { label: "العروض" }],
  "create-offer": [
    dashboardCrumb,
    { label: "العروض", href: "/offers" },
    { label: "إنشاء عرض" },
  ],
  "delivery-zone": [
    dashboardCrumb,
    { label: "مناطق التوصيل" },
  ],
  couriers: [dashboardCrumb, { label: "التوصيل" }, { label: "المندوبين" }],
  customers: [dashboardCrumb, { label: "المستخدمين" }],
  account: [dashboardCrumb, { label: "Account" }],
  settings: [dashboardCrumb, { label: "الإعدادات" }],
  notifications: [dashboardCrumb, { label: "Notifications" }],
};

export function breadcrumbsFromPathname(
  pathname: string,
  activePage: PageKey,
): BreadcrumbItem[] {
  return breadcrumbByPage[activePage];
}

export function pageFromPathname(pathname: string): PageKey {
  if (pathname === "/" || pathname === "/dashboard" || pathname === "/overview") {
    return "overview";
  }
  if (pathname === "/items") return "items";
  if (pathname === "/items/create") return "create-item";
  if (pathname === "/items/shops") return "shops";
  if (pathname === "/items/categories") return "categories";
  if (pathname === "/items/addons") return "addons";
  if (pathname.startsWith("/items/edit")) return "items";
  if (pathname === "/orders") return "orders";
  if (pathname === "/orders/create") return "create-order";
  if (pathname.startsWith("/orders/view")) return "order-detail";
  if (pathname === "/offers") return "offers";
  if (pathname === "/offers/create") return "create-offer";
  if (pathname === "/delivery-zone") return "delivery-zone";
  if (pathname === "/delivery/couriers") return "couriers";
  if (pathname === "/customers" || pathname.startsWith("/customers/")) return "customers";
  if (pathname === "/account") return "account";
  if (pathname === "/settings" || pathname.startsWith("/settings/")) return "settings";
  if (pathname === "/notifications") return "notifications";
  return "overview";
}

export type ItemRow = {
  index: string;
  id: string;
  code?: string;
  image: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  calories: string;
  price: string;
  variantDetails?: string;
  featured: string;
  active: boolean;
};

export type AddonRow = {
  index: string;
  id: string;
  image: string;
  name: string;
  nameAr: string;
  price: string;
  category: string;
};

export const addonRows: AddonRow[] = [
  {
    index: "1",
    id: "addon-extra-cheese",
    image:
      "https://bucket.ammenu.com/yalla-market/items/1778576027822-i19a0pn483.webp",
    name: "Extra Cheese",
    nameAr: "جبنة زيادة",
    price: "15 EGP",
    category: "جبن",
  },
  {
    index: "2",
    id: "addon-mix-sauce",
    image:
      "https://bucket.ammenu.com/yalla-market/items/1778575947135-br72ie6ml76.webp",
    name: "Sauce Mix",
    nameAr: "مكس صوصات",
    price: "8 EGP",
    category: "صوصات",
  },
  {
    index: "3",
    id: "addon-cola-can",
    image:
      "https://bucket.ammenu.com/yalla-market/categoriesthumbnails/1775090694513-5coutf286d4.webp",
    name: "Cola Can",
    nameAr: "كانز كولا",
    price: "25 EGP",
    category: "مشروبات",
  },
  {
    index: "4",
    id: "addon-seafood-rice",
    image:
      "https://bucket.ammenu.com/yalla-market/items/1778543523226-l45rdot2sp.webp",
    name: "Seafood Rice",
    nameAr: "طبق أرز سي فود",
    price: "30 EGP",
    category: "أطباق جانبية",
  },
  {
    index: "5",
    id: "addon-tahini-salad",
    image:
      "https://bucket.ammenu.com/yalla-market/items/1778543836496-todyjtnpxyd.webp",
    name: "Tahini & Salad",
    nameAr: "طحينة وسلطة",
    price: "12 EGP",
    category: "سلطات وصوصات",
  },
  {
    index: "6",
    id: "addon-extra-bread",
    image:
      "https://bucket.ammenu.com/yalla-market/categoriesthumbnails/1775090828091-y6lokne97v.webp",
    name: "Extra Bread",
    nameAr: "عيش زيادة",
    price: "5 EGP",
    category: "مخبوزات",
  },
  {
    index: "7",
    id: "addon-grilling",
    image:
      "https://bucket.ammenu.com/yalla-market/items/1778544524971-c0nqlzwbv1m.webp",
    name: "Grilling",
    nameAr: "شوي",
    price: "20 EGP",
    category: "طريقة التحضير",
  },
  {
    index: "8",
    id: "addon-family-packaging",
    image:
      "https://bucket.ammenu.com/yalla-market/categoriesthumbnails/1775094922280-7qvy2avjibh.webp",
    name: "Family Packaging",
    nameAr: "تغليف عائلي",
    price: "10 EGP",
    category: "تغليف",
  },
];

export const itemRows: ItemRow[] = [
  {
    index: "1",
    id: "6a044780d55a9b9a223f2bd5",
    image:
      "https://bucket.ammenu.com/yalla-market/items/1778665345772-57vkq73ly.webp",
    name: "BASIC PACKAGE",
    description: "كتابه المحتوي 4 فيديوهات 7 تصاميم ...",
    category: "دعايا واعلان",
    subcategory: "الهدايا الدعائية",
    calories: "",
    price: "4000 EGP",
    featured: "لا",
    active: true,
  },
  {
    index: "2",
    id: "6a02ea9acfbdd03a8051fe02",
    image:
      "https://bucket.ammenu.com/yalla-market/items/1778576027822-i19a0pn483.webp",
    name: "مكس جبن",
    description: "موتزريلا+رومي",
    category: "مطاعم",
    subcategory: "سندوتشات",
    calories: "",
    price: "0 EGP",
    featured: "لا",
    active: true,
  },
  {
    index: "3",
    id: "6a02ea49cfbdd03a8051fd6c",
    image:
      "https://bucket.ammenu.com/yalla-market/items/1778575947135-br72ie6ml76.webp",
    name: "سنداوتش مكس",
    description: "لانشون+رومي+شيبسي+كاتشب",
    category: "مطاعم",
    subcategory: "سندوتشات",
    calories: "",
    price: "10 EGP",
    featured: "لا",
    active: true,
  },
  {
    index: "4",
    id: "6a026ff9cfbdd03a8051ce25",
    image:
      "https://bucket.ammenu.com/yalla-market/items/1778544634562-e47zuvmo7jt.webp",
    name: "جمبري بدون شوي",
    description: "جمبري بدون شوي",
    category: "اسماك",
    subcategory: "اسماك",
    calories: "",
    price: "700 EGP",
    featured: "لا",
    active: true,
  },
  {
    index: "5",
    id: "6a026f8ccfbdd03a8051cd72",
    image:
      "https://bucket.ammenu.com/yalla-market/items/1778544524971-c0nqlzwbv1m.webp",
    name: "جمبري جمبو مشوي",
    description: "جمبري جمبو مشوي",
    category: "اسماك",
    subcategory: "اسماك",
    calories: "",
    price: "800 EGP",
    featured: "لا",
    active: true,
  },
  {
    index: "6",
    id: "6a026ed8cfbdd03a8051cc62",
    image:
      "https://bucket.ammenu.com/yalla-market/items/1778544345677-qfjf80ih81.webp",
    name: "جمبري مقلي جامبو",
    description: "جمبري مقلي جامبو",
    category: "اسماك",
    subcategory: "اسماك",
    calories: "",
    price: "700 EGP",
    featured: "لا",
    active: true,
  },
  {
    index: "7",
    id: "6a026e85cfbdd03a8051cb6c",
    image:
      "https://bucket.ammenu.com/yalla-market/items/1778544262639-gcn7m5xgjyb.webp",
    name: "جمبري مقلي وسط",
    description: "جمبري مقلي وسط",
    category: "اسماك",
    subcategory: "اسماك",
    calories: "",
    price: "500 EGP",
    featured: "لا",
    active: true,
  },
  {
    index: "8",
    id: "6a026e05cfbdd03a8051ca47",
    image:
      "https://bucket.ammenu.com/yalla-market/items/1778544134164-vrv0krjxbv8.webp",
    name: "بطارخ بلطي",
    description: "بطارخ بلطي",
    category: "اسماك",
    subcategory: "اسماك",
    calories: "",
    price: "200 EGP",
    featured: "لا",
    active: false,
  },
  {
    index: "9",
    id: "6a026da6cfbdd03a8051c914",
    image:
      "https://bucket.ammenu.com/yalla-market/items/1778544039042-lj3p707zntn.webp",
    name: "بطارخ بوري",
    description: "بطارخ بوري",
    category: "اسماك",
    subcategory: "اسماك",
    calories: "",
    price: "500 EGP",
    featured: "لا",
    active: true,
  },
  {
    index: "10",
    id: "6a026cdbcfbdd03a8051c85a",
    image:
      "https://bucket.ammenu.com/yalla-market/items/1778543836496-todyjtnpxyd.webp",
    name: "وجبه ارز جمبري+قطعه بوري كبيره+سلطه+عيش+1شربه",
    description: "سي فود+سلطه+طحينه وجبه السعاده",
    category: "اسماك",
    subcategory: "اسماك",
    calories: "",
    price: "170 EGP",
    featured: "لا",
    active: true,
  },
  {
    index: "11",
    id: "6a026c7fcfbdd03a8051c7e4",
    image:
      "https://bucket.ammenu.com/yalla-market/items/1778543744912-upyd9cpf2is.webp",
    name: "وجبه ارز +قطعه بوري سنجاري+سلطه+طحينه",
    description: "وجبه ارز +قطعه بوري سنجاري+سلطه+طحي...",
    category: "اسماك",
    subcategory: "اسماك",
    calories: "",
    price: "100 EGP",
    featured: "لا",
    active: true,
  },
  {
    index: "12",
    id: "6a026c4dcfbdd03a8051c767",
    image:
      "https://bucket.ammenu.com/yalla-market/items/1778543695912-9d0tx5rduk.webp",
    name: "ماكريل",
    description: "ماكريل",
    category: "اسماك",
    subcategory: "اسماك",
    calories: "",
    price: "250 EGP",
    featured: "لا",
    active: true,
  },
  {
    index: "13",
    id: "6a026c2bcfbdd03a8051c6f0",
    image:
      "https://bucket.ammenu.com/yalla-market/items/1778543660881-u7niq0van9.webp",
    name: "وجبه بلطي",
    description: "ارز+سلطه+طحينه(فردين)",
    category: "اسماك",
    subcategory: "اسماك",
    calories: "",
    price: "110 EGP",
    featured: "لا",
    active: true,
  },
  {
    index: "14",
    id: "6a026bf7cfbdd03a8051c667",
    image:
      "https://bucket.ammenu.com/yalla-market/items/1778543608564-qcf2mlas4l.webp",
    name: "ماكريل مشوي",
    description: "ماكريل مشوي",
    category: "اسماك",
    subcategory: "اسماك",
    calories: "",
    price: "270 EGP",
    featured: "لا",
    active: true,
  },
  {
    index: "15",
    id: "6a026beacfbdd03a8051c5f6",
    image:
      "https://bucket.ammenu.com/yalla-market/items/1778543596477-s2upi4v40le.webp",
    name: "وجبه بلطي",
    description: "ارز+سلطه+طحينه(فرد)",
    category: "اسماك",
    subcategory: "اسماك",
    calories: "",
    price: "70 EGP",
    featured: "لا",
    active: true,
  },
  {
    index: "16",
    id: "6a026ba1cfbdd03a8051c56e",
    image:
      "https://bucket.ammenu.com/yalla-market/items/1778543523226-l45rdot2sp.webp",
    name: "طبق ارز جمبري",
    description: "فردين",
    category: "اسماك",
    subcategory: "اسماك",
    calories: "",
    price: "80 EGP",
    featured: "لا",
    active: true,
  },
  {
    index: "17",
    id: "6a026b7ccfbdd03a8051c4fd",
    image:
      "https://bucket.ammenu.com/yalla-market/items/1778543485249-39ra83s086.webp",
    name: "طبق ارز جمبري",
    description: "فرد",
    category: "اسماك",
    subcategory: "اسماك",
    calories: "",
    price: "60 EGP",
    featured: "لا",
    active: true,
  },
  {
    index: "18",
    id: "6a026b6dcfbdd03a8051c48c",
    image:
      "https://bucket.ammenu.com/yalla-market/items/1778543471468-ekn3ojyk3bj.webp",
    name: "سفرديا",
    description: "سفرديا",
    category: "اسماك",
    subcategory: "اسماك",
    calories: "",
    price: "140 EGP",
    featured: "لا",
    active: true,
  },
  {
    index: "19",
    id: "6a026b5acfbdd03a8051c3be",
    image:
      "https://bucket.ammenu.com/yalla-market/items/1778543451433-5mjl363p1o5.webp",
    name: "طبق ارز",
    description: "طبق ارز",
    category: "اسماك",
    subcategory: "اسماك",
    calories: "",
    price: "30 EGP",
    featured: "لا",
    active: true,
  },
  {
    index: "20",
    id: "6a026abacfbdd03a8051c326",
    image:
      "https://bucket.ammenu.com/yalla-market/items/1778543291287-9fuviulg2mu.webp",
    name: "سفرديا مشوي",
    description: "سفرديا مشوي",
    category: "اسماك",
    subcategory: "اسماك",
    calories: "",
    price: "160 EGP",
    featured: "لا",
    active: true,
  },
];

export type CategoryRow = {
  index: string;
  image: string;
  name: string;
  nameAr: string;
  sections: string[];
  active: boolean;
  featured: "نعم" | "لا";
  total: string;
};

export const categoryRows: CategoryRow[] = [
  {
    index: "1",
    image:
      "https://bucket.ammenu.com/yalla-market/categoriesthumbnails/1775094922280-7qvy2avjibh.webp",
    name: "مطاعم",
    nameAr: "—",
    sections: ["الأكل"],
    active: true,
    featured: "لا",
    total: "192",
  },
  {
    index: "2",
    image:
      "https://bucket.ammenu.com/yalla-market/categoriesthumbnails/1776772285429-yad13vx614f.webp",
    name: "خضار",
    nameAr: "",
    sections: ["الأكل", "الطازج"],
    active: true,
    featured: "نعم",
    total: "16",
  },
  {
    index: "3",
    image:
      "https://bucket.ammenu.com/yalla-market/categoriesthumbnails/1776777321164-qaj9r6n4xei.webp",
    name: "فواكه",
    nameAr: "—",
    sections: ["الأكل", "الطازج"],
    active: true,
    featured: "لا",
    total: "17",
  },
  {
    index: "4",
    image:
      "https://bucket.ammenu.com/yalla-market/categoriesthumbnails/1775094278644-qcaasa5xn2o.webp",
    name: "لحوم فريش",
    nameAr: "—",
    sections: ["الطازج"],
    active: true,
    featured: "لا",
    total: "3",
  },
  {
    index: "5",
    image:
      "https://bucket.ammenu.com/yalla-market/categoriesthumbnails/1775090694513-5coutf286d4.webp",
    name: "سوبر ماركت",
    nameAr: "—",
    sections: ["الأكل"],
    active: true,
    featured: "لا",
    total: "182",
  },
  {
    index: "6",
    image:
      "https://bucket.ammenu.com/yalla-market/categoriesthumbnails/1776960858133-9yui4jx620c.webp",
    name: "طيور",
    nameAr: "",
    sections: ["الطازج"],
    active: true,
    featured: "لا",
    total: "20",
  },
  {
    index: "7",
    image:
      "https://bucket.ammenu.com/yalla-market/categoriesthumbnails/1778580221710-ct7ky32ujwg.webp",
    name: "اسماك",
    nameAr: "—",
    sections: ["الطازج"],
    active: true,
    featured: "لا",
    total: "0",
  },
  {
    index: "8",
    image:
      "https://bucket.ammenu.com/yalla-market/categoriesthumbnails/1775094141955-m2oj8uvk2hp.webp",
    name: "منتجات البان",
    nameAr: "—",
    sections: ["الأكل", "الطازج"],
    active: true,
    featured: "لا",
    total: "15",
  },
  {
    index: "9",
    image:
      "https://bucket.ammenu.com/yalla-market/categoriesthumbnails/1775090828091-y6lokne97v.webp",
    name: "مخبوزات",
    nameAr: "",
    sections: ["الأكل"],
    active: true,
    featured: "نعم",
    total: "25",
  },
  {
    index: "10",
    image:
      "https://bucket.ammenu.com/yalla-market/categoriesthumbnails/1775089514892-h8fxr5qphut.webp",
    name: "كافيه",
    nameAr: "",
    sections: ["الأكل"],
    active: true,
    featured: "نعم",
    total: "85",
  },
  {
    index: "11",
    image:
      "https://bucket.ammenu.com/yalla-market/categoriesthumbnails/1775096463284-um77ytblyrp.webp",
    name: "مسليات",
    nameAr: "",
    sections: ["الأكل"],
    active: true,
    featured: "نعم",
    total: "12",
  },
  {
    index: "12",
    image:
      "https://bucket.ammenu.com/yalla-market/categoriesthumbnails/1775095204171-2ghwtrpze2y.webp",
    name: "حلويات",
    nameAr: "—",
    sections: ["الأكل"],
    active: true,
    featured: "لا",
    total: "71",
  },
  {
    index: "13",
    image:
      "https://bucket.ammenu.com/yalla-market/categoriesthumbnails/1777053824199-hc9zr2r06c5.webp",
    name: "الديكورات",
    nameAr: "",
    sections: ["البيت"],
    active: true,
    featured: "لا",
    total: "18",
  },
  {
    index: "14",
    image:
      "https://bucket.ammenu.com/yalla-market/categoriesthumbnails/1775090504690-p2cz2a1ugz9.webp",
    name: "صيدليه",
    nameAr: "",
    sections: ["التسوق"],
    active: true,
    featured: "نعم",
    total: "32",
  },
  {
    index: "15",
    image:
      "https://bucket.ammenu.com/yalla-market/categoriesthumbnails/1775096533350-k0ksl11flm.webp",
    name: "النظافه والعنايه الشخصيه",
    nameAr: "",
    sections: ["التسوق"],
    active: true,
    featured: "نعم",
    total: "223",
  },
  {
    index: "16",
    image:
      "https://bucket.ammenu.com/yalla-market/categoriesthumbnails/1775094334940-w8f7zcf44m.webp",
    name: "ادوات مكتبيه",
    nameAr: "—",
    sections: ["التسوق", "الخدمات"],
    active: true,
    featured: "لا",
    total: "4",
  },
  {
    index: "17",
    image:
      "https://bucket.ammenu.com/yalla-market/categoriesthumbnails/1775056644283-y5x1zh1chq8.webp",
    name: "دعايا واعلان",
    nameAr: "—",
    sections: ["الخدمات"],
    active: true,
    featured: "لا",
    total: "2",
  },
  {
    index: "18",
    image:
      "https://bucket.ammenu.com/yalla-market/categoriesthumbnails/1775096390822-dwqrynjwein.webp",
    name: "ملابس",
    nameAr: "—",
    sections: ["الموضة"],
    active: true,
    featured: "لا",
    total: "5",
  },
  {
    index: "19",
    image:
      "https://bucket.ammenu.com/yalla-market/categoriesthumbnails/1775090950985-a6tqfd1tzzj.webp",
    name: "ملابس رياضيه",
    nameAr: "—",
    sections: ["الموضة"],
    active: true,
    featured: "لا",
    total: "27",
  },
  {
    index: "20",
    image:
      "https://bucket.ammenu.com/yalla-market/categoriesthumbnails/1775056696552-1lbttlmwnoh.webp",
    name: "احذيه",
    nameAr: "",
    sections: ["الموضة"],
    active: true,
    featured: "نعم",
    total: "46",
  },
];

export const topItems = [
  { name: "وش فخدة", revenue: 1700, sold: 4, orders: 4 },
  { name: "طماطم", revenue: 1600, sold: 48, orders: 30 },
  { name: "فراخ الامهات البيضه", revenue: 1600, sold: 16, orders: 3 },
  { name: "موز", revenue: 1280, sold: 34, orders: 23 },
  { name: "فراخ الامهات الحمرا", revenue: 1280, sold: 8, orders: 3 },
];


