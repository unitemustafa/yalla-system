"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { ChangeEvent, ComponentType, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BadgeCheck,
  Carrot,
  Check,
  ChefHat,
  ChevronDown,
  FileText,
  ImagePlus,
  Layers3,
  MapPin,
  PackageCheck,
  Palette,
  Plus,
  Power,
  Save,
  Shirt,
  SlidersHorizontal,
  Sparkles,
  Store,
  Utensils,
  X,
} from "lucide-react";

import {
  addonRows,
  categoryRows,
  type AddonRow,
  type CategoryRow,
  type ItemRow,
} from "../data";
import { AppSelect, Button, Input, Switch } from "../primitives";
import { deliveryCityOptions, deliveryZones } from "../reference-data";
import { dashboardFetch } from "@/lib/client-api";
import { cn } from "@/lib/utils";

type Language = "ar" | "en";
type Direction = "rtl" | "ltr";
type CategoryKey = "clothing" | "vegetables" | "restaurants" | "other";
type ProductLocationMode = "general" | "shop";
type ProductVisibilityMode = "general" | "regions";
type ChoiceInput = "swatch" | "chips" | "radio" | "checkbox" | "select";
type CustomVariantInput = "chips" | "radio";
type LocalizedText = Record<Language, string>;

type ProductForm = {
  name: string;
  description: string;
  category: CategoryKey;
  subcategory: string;
  price: string;
  discount: string;
  stock: string;
  available: boolean;
  featured: boolean;
};

type VariantOption = {
  value: string;
  label: LocalizedText;
  color?: string;
  disabled?: boolean;
};

type VariantValueDetail = {
  price: string;
  discount: string;
  stock: string;
  available: boolean;
};

type VariantDetails = Record<string, VariantValueDetail>;

type VariantCombination = {
  key: string;
  label: string;
};

type ProductCategory = {
  id: CategoryKey;
  label: LocalizedText;
  description: LocalizedText;
  icon: ComponentType<{ className?: string }>;
  subcategories: VariantOption[];
};

type VariantField = {
  id: string;
  label: LocalizedText;
  description: LocalizedText;
  input: ChoiceInput;
  multiple?: boolean;
  options: VariantOption[];
};

type ProductImage = {
  id: string;
  name: string;
  url: string;
  file?: File;
};

type ProductAddonSelection = {
  enabled: boolean;
  category: string;
  selectedIds: string[];
};

const popularColorOptions: VariantOption[] = [
  { value: "black", label: { ar: "أسود", en: "Black" }, color: "#020617" },
  { value: "white", label: { ar: "أبيض", en: "White" }, color: "#ffffff" },
  { value: "red", label: { ar: "أحمر", en: "Red" }, color: "#ef4444" },
  { value: "emerald", label: { ar: "أخضر", en: "Emerald" }, color: "#10b981" },
  { value: "blue", label: { ar: "أزرق", en: "Blue" }, color: "#2563eb" },
  { value: "yellow", label: { ar: "أصفر", en: "Yellow" }, color: "#facc15" },
  { value: "pink", label: { ar: "وردي", en: "Pink" }, color: "#ec4899" },
  { value: "purple", label: { ar: "بنفسجي", en: "Purple" }, color: "#8b5cf6" },
  { value: "gray", label: { ar: "رمادي", en: "Gray" }, color: "#64748b" },
  { value: "cream", label: { ar: "كريمي", en: "Cream" }, color: "#f8ead2" },
];

const copy = {
  ar: {
    title: "إضافة منتج ذكي",
    subtitle: "لوحة تحكم ديناميكية تضبط المتغيرات حسب صنف المنتج.",
    back: "إلغاء",
    save: "حفظ المنتج",
    saving: "Saving...",
    saveError: "Could not save the product. Please try again.",
    productCode: "كود المنتج",
    basicInfo: "البيانات الأساسية",
    variants: "المتغيرات",
    attributes: "الخصائص",
    livePreview: "معاينة مباشرة",
    confirmation: "تأكيد بيانات المنتج",
    close: "إغلاق",
    done: "تم",
    productName: "اسم المنتج",
    productNamePlaceholder: "مثال: سلة خضار طازجة",
    description: "وصف المنتج",
    descriptionPlaceholder: "اكتب وصفًا مختصرًا يظهر للعميل",
    image: "صورة المنتج",
    uploadImage: "اختيار صور",
    imageAlt: "معاينة صورة المنتج",
    region: "مكان المنتج",
    allRegions: "كل المناطق",
    allShops: "كل المحلات",
    chooseProductLocation: "اختيار مكان المنتج",
    generalProduct: "منتج عام",
    shopProduct: "محل",
    locationAreas: "المناطق",
    locationShops: "المحلات",
    addArea: "إضافة منطقة",
    addShop: "إضافة محل",
    category: "الثيمات",
    subcategory: "الفئة",
    chooseCategory: "اختيار الثيم",
    chooseSubcategory: "اختيار الفئة",
    categorySubgroups: "الفئات",
    visibleCategorySubgroups:
      "فلتر الفئات حسب التصنيفات واختار الفئة المناسبة للمنتج",
    allClassifications: "كل التصنيفات",
    filterByClassification: "فلترة بالتصنيف",
    addons: "الإضافات",
    addonCategory: "تصنيف الإضافات",
    allAddonCategories: "كل التصنيفات",
    openAddons: "اختيار الإضافات",
    selectedAddons: "الإضافات المختارة",
    addonsEnabled: "تفعيل الإضافات للعميل",
    addonsDisabled: "الإضافات غير مفعلة للعميل",
    noAddonsSelected: "لم يتم اختيار إضافات",
    visibleAddons: "الإضافات التي ستظهر للعميل",
    selectAll: "اختيار الكل",
    clearAll: "إلغاء الكل",
    apply: "تم",
    categorySignal: "الحقول تتغير تلقائيًا",
    addNewValue: "إضافة قيمة جديدة",
    addNewVariant: "إضافة متغير",
    addVariantTitle: "إضافة متغير جديد",
    deleteVariant: "حذف المتغير",
    variantName: "اسم المتغير",
    variantOptions: "خيارات المتغير",
    variantOptionsPlaceholder: "اكتب كل اختيار في سطر منفصل",
    variantInputType: "طريقة عرض الخيارات",
    chipsInput: "أكتر من اختيار",
    radioInput: "اختيار واحد فقط",
    checkboxInput: "مربعات اختيار",
    selectInput: "قائمة اختيار",
    newValuePlaceholder: "اكتب قيمة جديدة",
    addValueTitle: "إضافة قيمة",
    popularColors: "الألوان المشهورة",
    colorName: "اسم اللون",
    colorValue: "قيمة اللون",
    colorValuePlaceholder: "مثال: #10b981",
    add: "إضافة",
    customFields: "حقول مخصصة",
    fieldName: "اسم الحقل",
    fieldValue: "أول قيمة",
    fieldNamePlaceholder: "مثال: الخامة",
    fieldValuePlaceholder: "مثال: قطن",
    price: "السعر",
    stock: "المخزون",
    availableQuantity: "الكمية المتاحة",
    variantPrice: "سعر التركيبة",
    variantStock: "مخزون التركيبة",
    colorStock: "مخزون اللون",
    variantAvailable: "متاحة",
    selectedVariantDetails: "أسعار ومخزون التركيبات",
    colorStockDetails: "مخزون الألوان",
    deleteValue: "حذف القيمة",
    disableValue: "تعطيل القيمة",
    enableValue: "تفعيل القيمة",
    inventoryDetails: "مخزون الحالات",
    priceDetails: "أسعار الحالات",
    stockCombination: "حالة المخزون",
    priceCombination: "حالة السعر",
    addStockRow: "إضافة حالة مخزون",
    addPriceRow: "إضافة حالة سعر",
    variantDiscount: "الخصم",
    autoColors: "الألوان المحددة تطبق تلقائيًا على كل سعر",
    missingCases: "حالات ناقصة",
    removeRow: "حذف الحالة",
    available: "متاح للبيع",
    featured: "منتج مميز",
    selectedData: "البيانات المختارة",
    empty: "غير محدد",
    productFallback: "منتج جديد",
    previewCategory: "ثيم",
    previewStock: "المخزون",
    previewPrice: "السعر",
    noCustomFields: "أضف حقولًا مخصصة لهذا الصنف.",
    modalNote: "تم عرض البيانات فقط بدون إرسالها لأي باك.",
  },
  en: {
    title: "Smart Product Creator",
    subtitle: "A dynamic dashboard that adapts variants to the product type.",
    back: "Cancel",
    save: "Save product",
    saving: "Saving...",
    saveError: "تعذر حفظ المنتج. حاول مرة أخرى.",
    basicInfo: "Basic Info",
    variants: "Product Variants",
    attributes: "Options / Attributes",
    livePreview: "Live preview",
    confirmation: "Confirm product data",
    close: "Close",
    done: "Done",
    productName: "Product name",
    productNamePlaceholder: "Example: Fresh vegetable basket",
    description: "Product description",
    descriptionPlaceholder: "Write a short customer-facing description",
    image: "Product image",
    uploadImage: "Choose images",
    imageAlt: "Product image preview",
    region: "Product location",
    allRegions: "All regions",
    allShops: "All shops",
    chooseProductLocation: "Choose product location",
    generalProduct: "General product",
    shopProduct: "Shop",
    locationAreas: "Areas",
    locationShops: "Shops",
    addArea: "Add area",
    addShop: "Add shop",
    category: "Themes",
    subcategory: "Category",
    chooseCategory: "Choose theme",
    chooseSubcategory: "Choose category",
    categorySubgroups: "Categories",
    visibleCategorySubgroups:
      "Filter categories by classification and choose the product category.",
    allClassifications: "All classifications",
    filterByClassification: "Filter by classification",
    addons: "Add-ons",
    addonCategory: "Add-on group",
    allAddonCategories: "All groups",
    openAddons: "Choose add-ons",
    selectedAddons: "Selected add-ons",
    addonsEnabled: "Enable add-ons for customers",
    addonsDisabled: "Add-ons are disabled for customers",
    noAddonsSelected: "No add-ons selected",
    visibleAddons: "Add-ons visible to customers",
    selectAll: "Select all",
    clearAll: "Clear all",
    apply: "Done",
    categorySignal: "Fields update automatically",
    addNewValue: "Add a new value",
    addNewVariant: "Add variant",
    addVariantTitle: "Add new variant",
    deleteVariant: "Delete variant",
    variantName: "Variant name",
    variantOptions: "Variant options",
    variantOptionsPlaceholder: "Write each option on a separate line",
    variantInputType: "Option display",
    chipsInput: "More than one choice",
    radioInput: "One choice only",
    checkboxInput: "Checkboxes",
    selectInput: "Select menu",
    newValuePlaceholder: "Type a new value",
    addValueTitle: "Add value",
    popularColors: "Popular colors",
    colorName: "Color name",
    colorValue: "Color value",
    colorValuePlaceholder: "Example: #10b981",
    add: "Add",
    customFields: "Custom fields",
    fieldName: "Field name",
    fieldValue: "First value",
    fieldNamePlaceholder: "Example: Material",
    fieldValuePlaceholder: "Example: Cotton",
    price: "Price",
    stock: "Stock",
    availableQuantity: "Available quantity",
    variantPrice: "Combination price",
    variantStock: "Combination stock",
    colorStock: "Color stock",
    variantAvailable: "Available",
    selectedVariantDetails: "Combination prices and stock",
    colorStockDetails: "Color stock",
    deleteValue: "Delete value",
    disableValue: "Disable value",
    enableValue: "Enable value",
    inventoryDetails: "Inventory cases",
    priceDetails: "Price cases",
    stockCombination: "Inventory case",
    priceCombination: "Price case",
    addStockRow: "Add inventory case",
    addPriceRow: "Add price case",
    variantDiscount: "Discount",
    autoColors: "Selected colors apply automatically to every price",
    missingCases: "Missing cases",
    removeRow: "Remove case",
    available: "Available",
    featured: "Featured product",
    selectedData: "Selected data",
    empty: "Not set",
    productFallback: "New product",
    previewCategory: "Theme",
    previewStock: "Stock",
    previewPrice: "Price",
    noCustomFields: "Add custom fields for this category.",
    modalNote: "Product saved. The code was generated automatically.",
    productCode: "Product code",
  },
} satisfies Record<Language, Record<string, string>>;

const textAreaClass =
  "min-h-[124px] w-full resize-none rounded-md border border-border bg-input px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15";
const compactTextAreaClass =
  "min-h-[92px] w-full resize-none rounded-md border border-border bg-input px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15";

const productCategories: ProductCategory[] = [
  {
    id: "clothing",
    label: { ar: "ملابس", en: "Clothing" },
    description: {
      ar: "ألوان، مقاسات، ونوع القطعة",
      en: "Colors, sizes, and fit type",
    },
    icon: Shirt,
    subcategories: [
      { value: "shirts", label: { ar: "تيشيرتات", en: "T-shirts" } },
      { value: "dresses", label: { ar: "فساتين", en: "Dresses" } },
      { value: "shoes", label: { ar: "أحذية", en: "Shoes" } },
      { value: "accessories", label: { ar: "إكسسوارات", en: "Accessories" } },
    ],
  },
  {
    id: "vegetables",
    label: { ar: "استهلاكي", en: "Consumer" },
    description: {
      ar: "وزن، حالة التخزين، وطريقة الزراعة",
      en: "Weight, storage state, and farming type",
    },
    icon: Carrot,
    subcategories: [
      { value: "baskets", label: { ar: "سلال خضار", en: "Vegetable baskets" } },
      { value: "leafy", label: { ar: "ورقيات", en: "Leafy greens" } },
      { value: "roots", label: { ar: "جذور", en: "Root vegetables" } },
      { value: "frozen", label: { ar: "مجمدات", en: "Frozen produce" } },
    ],
  },
  {
    id: "restaurants",
    label: { ar: "محلات", en: "Shops" },
    description: {
      ar: "حجم الوجبة، الصنف، والإضافات",
      en: "Meal size, cuisine, and add-ons",
    },
    icon: Utensils,
    subcategories: [
      { value: "meals", label: { ar: "وجبات", en: "Meals" } },
      { value: "sandwiches", label: { ar: "ساندويتشات", en: "Sandwiches" } },
      { value: "desserts", label: { ar: "حلويات", en: "Desserts" } },
      { value: "drinks", label: { ar: "مشروبات", en: "Drinks" } },
    ],
  },
];

const visibleProductCategories = productCategories.filter(
  (category) => category.id !== "restaurants",
);

const productLocationShops = [
  {
    id: "shop-fish-market",
    name: "أسماك الطازج",
    category: "الطازج",
    region: "شرم الشيخ",
  },
  {
    id: "shop-green-basket",
    name: "سلة الخضار",
    category: "الطازج",
    region: "القاهرة",
  },
  {
    id: "shop-family-market",
    name: "ماركت العائلة",
    category: "التسوق",
    region: "المنصورة",
  },
  {
    id: "shop-bakery",
    name: "مخبوزات الصباح",
    category: "الأكل",
    region: "التل الكبير",
  },
];

const variantDefinitions: Record<CategoryKey, VariantField[]> = {
  clothing: [
    {
      id: "color",
      label: { ar: "اللون", en: "Color" },
      description: {
        ar: "اختيار لون أو أكثر",
        en: "Choose one or more colors",
      },
      input: "swatch",
      multiple: true,
      options: [
        {
          value: "emerald",
          label: { ar: "أخضر", en: "Emerald" },
          color: "#10b981",
        },
        {
          value: "black",
          label: { ar: "أسود", en: "Black" },
          color: "#020617",
        },
        { value: "red", label: { ar: "أحمر", en: "Red" }, color: "#ef4444" },
        {
          value: "cream",
          label: { ar: "كريمي", en: "Cream" },
          color: "#f8ead2",
        },
      ],
    },
    {
      id: "size",
      label: { ar: "المقاس", en: "Size" },
      description: {
        ar: "يمكن تحديد عدة مقاسات",
        en: "Multiple sizes can be selected",
      },
      input: "chips",
      multiple: true,
      options: [
        { value: "s", label: { ar: "صغير", en: "Small" } },
        { value: "m", label: { ar: "متوسط", en: "Medium" } },
        { value: "l", label: { ar: "كبير", en: "Large" } },
        { value: "xl", label: { ar: "كبير جدًا", en: "X-Large" } },
      ],
    },
    {
      id: "fit",
      label: { ar: "النوع", en: "Type" },
      description: {
        ar: "طريقة عرض المنتج للعميل",
        en: "How this item is grouped for customers",
      },
      input: "chips",
      multiple: true,
      options: [
        { value: "men", label: { ar: "رجالي", en: "Men" } },
        { value: "women", label: { ar: "حريمي", en: "Women" } },
        { value: "kids", label: { ar: "أطفال", en: "Kids" } },
      ],
    },
  ],
  vegetables: [
    {
      id: "weight",
      label: { ar: "الوزن", en: "Weight" },
      description: {
        ar: "الوحدة التي تظهر في التطبيق",
        en: "The unit shown in the customer app",
      },
      input: "select",
      options: [
        { value: "500g", label: { ar: "500 جم", en: "500 g" } },
        { value: "1kg", label: { ar: "1 كجم", en: "1 kg" } },
        { value: "2kg", label: { ar: "2 كجم", en: "2 kg" } },
        { value: "basket", label: { ar: "سلة", en: "Basket" } },
      ],
    },
    {
      id: "storage",
      label: { ar: "الحالة", en: "State" },
      description: { ar: "طازج أو مجمد", en: "Fresh or frozen" },
      input: "radio",
      options: [
        { value: "fresh", label: { ar: "طازج", en: "Fresh" } },
        { value: "frozen", label: { ar: "مجمد", en: "Frozen" } },
      ],
    },
    {
      id: "farming",
      label: { ar: "طريقة الزراعة", en: "Farming" },
      description: { ar: "عضوي أو عادي", en: "Organic or regular" },
      input: "radio",
      options: [
        { value: "organic", label: { ar: "عضوي", en: "Organic" } },
        { value: "regular", label: { ar: "عادي", en: "Regular" } },
      ],
    },
  ],
  restaurants: [
    {
      id: "mealSize",
      label: { ar: "حجم الوجبة", en: "Meal size" },
      description: { ar: "الحجم الافتراضي للطلب", en: "Default order size" },
      input: "radio",
      options: [
        { value: "small", label: { ar: "صغير", en: "Small" } },
        { value: "medium", label: { ar: "وسط", en: "Medium" } },
        { value: "large", label: { ar: "كبير", en: "Large" } },
        { value: "family", label: { ar: "عائلي", en: "Family" } },
      ],
    },
    {
      id: "cuisine",
      label: { ar: "الصنف", en: "Cuisine" },
      description: { ar: "نوع الوجبة أو المطبخ", en: "Meal or cuisine type" },
      input: "select",
      options: [
        { value: "grill", label: { ar: "مشويات", en: "Grill" } },
        { value: "pizza", label: { ar: "بيتزا", en: "Pizza" } },
        { value: "seafood", label: { ar: "مأكولات بحرية", en: "Seafood" } },
        { value: "dessert", label: { ar: "حلويات", en: "Dessert" } },
      ],
    },
    {
      id: "extras",
      label: { ar: "خيارات إضافية", en: "Extra options" },
      description: {
        ar: "إضافات اختيارية للعميل",
        en: "Optional add-ons for customers",
      },
      input: "checkbox",
      multiple: true,
      options: [
        { value: "cheese", label: { ar: "جبنة إضافية", en: "Extra cheese" } },
        { value: "sauce", label: { ar: "صوص", en: "Sauce" } },
        { value: "spicy", label: { ar: "حار", en: "Spicy" } },
        { value: "noOnion", label: { ar: "بدون بصل", en: "No onion" } },
      ],
    },
  ],
  other: [],
};

const defaultSelections: Record<CategoryKey, Record<string, string[]>> = {
  clothing: {
    color: ["emerald"],
    size: ["m"],
    fit: ["men"],
  },
  vegetables: {
    weight: ["basket"],
    storage: ["fresh"],
    farming: ["organic"],
  },
  restaurants: {
    mealSize: ["medium"],
    cuisine: ["grill"],
    extras: ["sauce"],
  },
  other: {},
};

const defaultDisabledVariantOptions: Record<string, string[]> = {
  [variantKey("clothing", "size")]: ["xl"],
};

const customVariantFieldsStorageKey = "__customVariantFields";

const initialCategory: CategoryKey = "vegetables";
const initialSecondaryCategory =
  categoryRows.find((row) => row.name === "خضار")?.name ??
  categoryRows[0]?.name ??
  "general";

const initialForm: ProductForm = {
  name: "",
  description: "",
  category: initialCategory,
  subcategory: initialSecondaryCategory,
  price: "120",
  discount: "",
  stock: "8",
  available: true,
  featured: false,
};

function cloneSelections(category: CategoryKey) {
  const selections = defaultSelections[category];
  return Object.fromEntries(
    Object.entries(selections).map(([key, value]) => [key, [...value]]),
  );
}

function categoryConfig(category: CategoryKey) {
  return (
    productCategories.find((item) => item.id === category) ??
    productCategories[0]
  );
}

function categoryKeyFromItem(item: ItemRow): CategoryKey {
  const normalizedCategory = item.category.trim().toLocaleLowerCase("ar-EG");
  const matchedCategory = productCategories.find((category) =>
    [category.id, category.label.ar, category.label.en].some(
      (value) => value.trim().toLocaleLowerCase("ar-EG") === normalizedCategory,
    ),
  );

  return matchedCategory?.id ?? initialCategory;
}

function priceInputValue(price: string) {
  return (
    price
      .replace(/\s*EGP\s*$/i, "")
      .replace(/\s*\u062c\u0646\u064a\u0647\s*$/i, "")
      .trim() || "0"
  );
}

function stockInputValue(calories: string) {
  return calories.match(/\d+/)?.[0] ?? "0";
}

function parseVariantDetails(value?: string): VariantDetails {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value) as Record<
      string,
      Partial<VariantValueDetail>
    >;

    return Object.fromEntries(
      Object.entries(parsed)
        .filter(([key]) => key !== customVariantFieldsStorageKey)
        .map(([key, detail]) => [
          key,
          {
            price: typeof detail.price === "string" ? detail.price : "",
            discount:
              typeof detail.discount === "string" ? detail.discount : "",
            stock: typeof detail.stock === "string" ? detail.stock : "0",
            available:
              typeof detail.available === "boolean" ? detail.available : true,
          },
        ]),
    );
  } catch {
    return {};
  }
}

function parseCustomVariantFields(value?: string): VariantField[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    const customVariantData = parsed[customVariantFieldsStorageKey];
    const fields =
      Array.isArray(customVariantData)
        ? customVariantData
        : customVariantData &&
            typeof customVariantData === "object" &&
            Array.isArray(
              (customVariantData as { fields?: unknown }).fields,
            )
          ? (customVariantData as { fields: unknown[] }).fields
          : [];

    if (!fields.length) {
      return [];
    }

    return fields.filter((field): field is VariantField => {
      if (!field || typeof field !== "object") {
        return false;
      }

      const candidate = field as Partial<VariantField>;

      return (
        typeof candidate.id === "string" &&
        Boolean(candidate.label?.ar) &&
        Boolean(candidate.label?.en) &&
        typeof candidate.input === "string" &&
        Array.isArray(candidate.options)
      );
    });
  } catch {
    return [];
  }
}

function parseRemovedVariantFields(value?: string): string[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    const customVariantData = parsed[customVariantFieldsStorageKey];

    if (!customVariantData || typeof customVariantData !== "object") {
      return [];
    }

    const removedFieldIds = (customVariantData as {
      removedFieldIds?: unknown;
    }).removedFieldIds;

    return Array.isArray(removedFieldIds)
      ? removedFieldIds.filter((fieldId): fieldId is string =>
          typeof fieldId === "string",
        )
      : [];
  } catch {
    return [];
  }
}

function productFormFromItem(item: ItemRow): ProductForm {
  return {
    name: item.name,
    description: item.description,
    category: categoryKeyFromItem(item),
    subcategory: item.subcategory || initialSecondaryCategory,
    price: priceInputValue(item.price),
    discount: "",
    stock: stockInputValue(item.calories),
    available: item.active,
    featured: item.featured !== "\u0644\u0627",
  };
}

function locationModeFromItem(item: ItemRow): ProductLocationMode {
  return item.shopName?.trim() ? "shop" : "general";
}

function optionLabel(
  options: VariantOption[],
  value: string,
  language: Language,
) {
  return (
    options.find((option) => option.value === value)?.label[language] ?? value
  );
}

function bidiIsolate(value: string) {
  return `\u2068${value}\u2069`;
}

function variantKey(category: CategoryKey, fieldId: string) {
  return `${category}.${fieldId}`;
}

function isPricedVariantField(field: VariantField) {
  return field.input !== "swatch";
}

function variantDetailFor(
  variantDetails: VariantDetails,
  key: string,
  form: ProductForm,
) {
  return (
    variantDetails[key] ?? {
      price: form.price,
      discount: form.discount,
      stock: form.stock || "0",
      available: form.available,
    }
  );
}

function isStockAvailable(stock: string) {
  return Number(stock || "0") > 0;
}

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

function numberFromText(value: string) {
  const numericValue = value.replace(/[^\d.]/g, "");

  return Number(numericValue);
}

function discountInputValue(value: string) {
  const numericValue = value.replace(/[^\d.]/g, "");
  const [amount = "", ...decimalParts] = numericValue.split(".");

  return decimalParts.length ? `${amount}.${decimalParts.join("")}` : amount;
}

function formatPriceAmount(value: number) {
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(2).replace(/\.?0+$/, "");
}

function discountPercent(value: string) {
  const percent = numberFromText(value);

  return Number.isFinite(percent) && percent > 0 && percent < 100 ? percent : 0;
}

function oldPriceFromDiscount(price: string, discount: string) {
  const currentPrice = numberFromText(price);
  const percent = discountPercent(discount);

  if (!currentPrice || !percent) {
    return "";
  }

  return formatPriceAmount(currentPrice / (1 - percent / 100));
}

function discountLabel(discount: string) {
  const percent = discountPercent(discount);

  return percent ? `${formatPriceAmount(percent)}%` : "";
}

function selectedVariantDetail(
  fields: VariantField[],
  selectedVariants: Record<string, string[]>,
  variantDetails: VariantDetails,
  form: ProductForm,
) {
  const priceCombination = variantCombinations(
    fields,
    selectedVariants,
    "ar",
  )[0];
  const stockCombination = stockCombinations(fields, selectedVariants, "ar")[0];
  const priceDetail = priceCombination
    ? variantDetailFor(variantDetails, priceCombination.key, form)
    : {
        price: form.price,
        discount: form.discount,
        stock: "",
        available: form.available,
      };
  const stockDetail = stockCombination
    ? variantDetailFor(variantDetails, stockCombination.key, form)
    : {
        price: "",
        discount: "",
        stock: form.stock || "0",
        available: form.available,
      };

  return {
    ...priceDetail,
    stock: stockDetail.stock || form.stock || "0",
    available: isStockAvailable(stockDetail.stock || form.stock || "0"),
  };
}

function previewVariantSelection(
  fields: VariantField[],
  availableVariants: Record<string, string[]>,
  currentSelection: Record<string, string[]>,
) {
  return Object.fromEntries(
    fields
      .map((field) => {
        const availableValues = availableVariants[field.id] ?? [];
        const enabledValues = availableValues.filter(
          (value) =>
            !field.options.find((option) => option.value === value)?.disabled,
        );
        const currentValue = currentSelection[field.id]?.[0];
        const nextValue =
          currentValue && availableValues.includes(currentValue)
            ? currentValue
            : (enabledValues[0] ?? availableValues[0]);

        return nextValue ? [field.id, [nextValue]] : null;
      })
      .filter((entry): entry is [string, string[]] => Boolean(entry)),
  );
}

function combinationEntries(
  fields: VariantField[],
  selectedVariants: Record<string, string[]>,
  language: Language,
  shouldIncludeField: (field: VariantField) => boolean,
  detailType: "price" | "stock",
): VariantCombination[] {
  const includedFields = fields
    .filter(shouldIncludeField)
    .map((field) => {
      const enabledValues = new Set(
        field.options
          .filter((option) => !option.disabled)
          .map((option) => option.value),
      );

      return {
        field,
        values: (selectedVariants[field.id] ?? []).filter((value) =>
          enabledValues.has(value),
        ),
      };
    })
    .filter((item) => item.values.length > 0);

  if (!includedFields.length) {
    return [];
  }

  return includedFields
    .reduce<VariantCombination[]>(
      (combinations, { field, values }) =>
        combinations.flatMap((combination) =>
          values.map((value) => {
            const valueLabel = optionLabel(field.options, value, language);
            const partKey = `${field.id}:${value}`;
            const partLabel = `${bidiIsolate(field.label[language])}: ${bidiIsolate(valueLabel)}`;

            return {
              key: combination.key ? `${combination.key}|${partKey}` : partKey,
              label: combination.label
                ? `${combination.label} + ${partLabel}`
                : partLabel,
            };
          }),
        ),
      [{ key: "", label: "" }],
    )
    .map((combination) => ({
      ...combination,
      key: `${detailType}|${combination.key}`,
    }));
}

function variantCombinations(
  fields: VariantField[],
  selectedVariants: Record<string, string[]>,
  language: Language,
): VariantCombination[] {
  return combinationEntries(
    fields,
    selectedVariants,
    language,
    isPricedVariantField,
    "price",
  );
}

function stockCombinations(
  fields: VariantField[],
  selectedVariants: Record<string, string[]>,
  language: Language,
): VariantCombination[] {
  return combinationEntries(
    fields,
    selectedVariants,
    language,
    () => true,
    "stock",
  );
}

function serializeVariantDetails({
  customFields,
  fields,
  form,
  removedFieldIds,
  selectedVariants,
  variantDetails,
}: {
  customFields: VariantField[];
  fields: VariantField[];
  form: ProductForm;
  removedFieldIds: string[];
  selectedVariants: Record<string, string[]>;
  variantDetails: VariantDetails;
}) {
  const priceEntries = variantCombinations(fields, selectedVariants, "ar");
  const stockEntries = stockCombinations(fields, selectedVariants, "ar");

  return JSON.stringify(
    {
      ...Object.fromEntries(
        [...priceEntries, ...stockEntries].map(({ key }) => {
          const detail = variantDetailFor(variantDetails, key, form);
          const isStockEntry = key.startsWith("stock|");

          return [
            key,
            {
              price: isStockEntry ? "" : detail.price.trim(),
              discount: isStockEntry ? "" : detail.discount.trim(),
              stock: isStockEntry ? detail.stock.trim() : "",
              available: isStockEntry
                ? isStockAvailable(detail.stock)
                : detail.available,
            },
          ];
        }),
      ),
      [customVariantFieldsStorageKey]: {
        fields: customFields,
        removedFieldIds,
      },
    },
  );
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 10000)}`;
}

function uniqueAddonCategories(rows: AddonRow[]) {
  return Array.from(
    new Set(rows.map((addon) => addon.category).filter(Boolean)),
  );
}

function addonDisplayName(addon: AddonRow, language: Language) {
  return language === "ar" ? addon.nameAr : addon.name;
}

function categoryRowDisplayName(row: CategoryRow) {
  return row.nameAr && row.nameAr !== "—" ? row.nameAr : row.name;
}

function categoryRowSections(row?: CategoryRow) {
  return row?.sections.length ? row.sections.join(", ") : "";
}

function categoryThemeTone(categoryId: CategoryKey) {
  const tones: Partial<
    Record<
      CategoryKey,
      {
        card: string;
        icon: string;
        marker: string;
        selected: string;
      }
    >
  > = {
    clothing: {
      card: "border-sky-400/30 bg-sky-500/10 hover:border-sky-400/70 hover:bg-sky-500/15",
      icon: "bg-sky-500 text-white shadow-sky-500/25",
      marker: "bg-sky-400",
      selected: "border-sky-400 bg-sky-500/15 text-sky-100 ring-sky-400/25",
    },
    vegetables: {
      card: "border-emerald-400/30 bg-emerald-500/10 hover:border-emerald-400/70 hover:bg-emerald-500/15",
      icon: "bg-emerald-500 text-white shadow-emerald-500/25",
      marker: "bg-emerald-400",
      selected:
        "border-emerald-400 bg-emerald-500/15 text-emerald-100 ring-emerald-400/25",
    },
    restaurants: {
      card: "border-amber-400/30 bg-amber-500/10 hover:border-amber-400/70 hover:bg-amber-500/15",
      icon: "bg-amber-500 text-black shadow-amber-500/25",
      marker: "bg-amber-400",
      selected:
        "border-amber-400 bg-amber-500/15 text-amber-100 ring-amber-400/25",
    },
  };

  return (
    tones[categoryId] ?? {
      card: "border-primary/30 bg-primary/10 hover:border-primary/70",
      icon: "bg-primary text-primary-foreground shadow-primary/25",
      marker: "bg-primary",
      selected: "border-primary bg-primary/10 text-primary ring-primary/20",
    }
  );
}

function addonSelectionSummary({
  enabled,
  selectedAddons,
  t,
  language,
}: {
  enabled: boolean;
  selectedAddons: AddonRow[];
  t: (typeof copy)[Language];
  language: Language;
}) {
  if (!enabled) {
    return t.addonsDisabled;
  }

  if (!selectedAddons.length) {
    return t.noAddonsSelected;
  }

  return selectedAddons
    .map((addon) => addonDisplayName(addon, language))
    .join(", ");
}

export function CreateItemPage() {
  const language: Language = "ar";
  const direction: Direction = "rtl";
  const params = useParams<{ itemId?: string | string[] }>();
  const rawItemId = params?.itemId;
  const editItemId = Array.isArray(rawItemId) ? rawItemId[0] : rawItemId;
  const isEditing = Boolean(editItemId);
  const t = copy[language];
  const pageTitle = isEditing
    ? "\u062a\u0639\u062f\u064a\u0644 \u0645\u0646\u062a\u062c"
    : t.title;
  const pageSubtitle = isEditing
    ? "\u0639\u062f\u0651\u0644 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0645\u0646\u062a\u062c \u0648\u0627\u0644\u0633\u0639\u0631 \u0648\u0627\u0644\u062a\u0635\u0646\u064a\u0641."
    : t.subtitle;
  const [selectedLocationMode, setSelectedLocationMode] =
    useState<ProductLocationMode>("general");
  const [selectedRegion, setSelectedRegion] = useState(t.allRegions);
  const [selectedShop, setSelectedShop] = useState(t.allShops);
  const [visibilityMode, setVisibilityMode] =
    useState<ProductVisibilityMode>("general");
  const [visibleRegionSlugs, setVisibleRegionSlugs] = useState<string[]>([]);
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string[]>
  >(() => cloneSelections(initialCategory));
  const [variantDetails, setVariantDetails] = useState<VariantDetails>({});
  const [activeStockDetailKeys, setActiveStockDetailKeys] = useState<string[]>(
    [],
  );
  const [activePriceDetailKeys, setActivePriceDetailKeys] = useState<string[]>(
    [],
  );
  const [customVariantOptions, setCustomVariantOptions] = useState<
    Record<string, VariantOption[]>
  >({});
  const [customVariantFields, setCustomVariantFields] = useState<
    Partial<Record<CategoryKey, VariantField[]>>
  >({});
  const [removedVariantOptions, setRemovedVariantOptions] = useState<
    Record<string, string[]>
  >({});
  const [removedVariantFields, setRemovedVariantFields] = useState<
    Partial<Record<CategoryKey, string[]>>
  >({});
  const [disabledVariantOptions, setDisabledVariantOptions] = useState<
    Record<string, string[]>
  >(() => defaultDisabledVariantOptions);
  const [variantValueField, setVariantValueField] =
    useState<VariantField | null>(null);
  const [variantValueName, setVariantValueName] = useState("");
  const [variantColorValue, setVariantColorValue] = useState("#10b981");
  const [variantFieldDialogOpen, setVariantFieldDialogOpen] = useState(false);
  const [variantFieldName, setVariantFieldName] = useState("");
  const [variantFieldOptionsText, setVariantFieldOptionsText] = useState("");
  const [variantFieldInput, setVariantFieldInput] =
    useState<CustomVariantInput>("chips");
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const productImagesRef = useRef<ProductImage[]>([]);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [createdCode, setCreatedCode] = useState("");
  const [saveError, setSaveError] = useState("");
  const [editProductCode, setEditProductCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [addonsDialogOpen, setAddonsDialogOpen] = useState(false);
  const [productAddons, setProductAddons] = useState<ProductAddonSelection>({
    enabled: true,
    category: "all",
    selectedIds: [],
  });
  const dialogOpen =
    confirmationOpen ||
    locationDialogOpen ||
    categoryDialogOpen ||
    addonsDialogOpen ||
    variantFieldDialogOpen ||
    Boolean(variantValueField);

  useBodyScrollLock(dialogOpen);

  useEffect(() => {
    if (!editItemId) {
      return;
    }

    let alive = true;

    async function loadEditableItem() {
      setSaveError("");

      try {
        const response = await dashboardFetch("items");

        if (!response.ok) {
          throw new Error("Failed to load product");
        }

        const data = (await response.json()) as { items: ItemRow[] };
        const item = data.items.find(
          (currentItem) => currentItem.id === editItemId,
        );

        if (!alive) {
          return;
        }

        if (!item) {
          setSaveError(
            "\u062a\u0639\u0630\u0631 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u0645\u0646\u062a\u062c.",
          );
          return;
        }

        const nextForm = productFormFromItem(item);
        setForm(nextForm);
        setSelectedLocationMode(locationModeFromItem(item));
        setSelectedShop(item.shopName?.trim() || t.allShops);
        setSelectedVariants(cloneSelections(nextForm.category));
        setVariantDetails(parseVariantDetails(item.variantDetails));
        setVisibilityMode(item.visibilityMode === "regions" ? "regions" : "general");
        setVisibleRegionSlugs(item.regionSlugs ?? []);
        setCustomVariantFields({
          [nextForm.category]: parseCustomVariantFields(item.variantDetails),
        });
        setRemovedVariantFields({
          [nextForm.category]: parseRemovedVariantFields(item.variantDetails),
        });
        setEditProductCode(item.code ?? item.id);
        setProductImages(
          item.image
            ? [
                {
                  id: `existing-${item.id}`,
                  name: "\u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u062d\u0627\u0644\u064a\u0629",
                  url: item.image,
                },
              ]
            : [],
        );
        setSelectedImageIndex(0);
      } catch {
        if (alive) {
          setSaveError(
            "\u062a\u0639\u0630\u0631 \u062a\u062d\u0645\u064a\u0644 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0645\u0646\u062a\u062c.",
          );
        }
      }
    }

    loadEditableItem();

    return () => {
      alive = false;
    };
  }, [editItemId, t.allShops]);

  const activeCategory = categoryConfig(form.category);
  const addonCategoryOptions = useMemo(
    () => uniqueAddonCategories(addonRows),
    [],
  );
  const selectedAddonRows = useMemo(
    () =>
      addonRows.filter((addon) => productAddons.selectedIds.includes(addon.id)),
    [productAddons.selectedIds],
  );
  const selectedAddonSummary = addonSelectionSummary({
    enabled: productAddons.enabled,
    selectedAddons: selectedAddonRows,
    t,
    language,
  });
  const selectedSecondaryCategory =
    categoryRows.find((row) => row.name === form.subcategory) ??
    categoryRows[0];
  const selectedSecondaryCategoryName = selectedSecondaryCategory
    ? categoryRowDisplayName(selectedSecondaryCategory)
    : form.subcategory || t.empty;
  const selectedSecondaryCategorySections =
    categoryRowSections(selectedSecondaryCategory) || t.empty;
  const activeFields = useMemo(
    () =>
      [
        ...variantDefinitions[form.category],
        ...(customVariantFields[form.category] ?? []),
      ]
        .filter(
          (field) =>
            !(removedVariantFields[form.category] ?? []).includes(field.id),
        )
        .map((field) => {
        const key = variantKey(form.category, field.id);
        const removedValues = new Set(removedVariantOptions[key] ?? []);
        const disabledValues = new Set(disabledVariantOptions[key] ?? []);

        return {
          ...field,
          options: [
            ...field.options,
            ...(customVariantOptions[key] ?? []),
          ]
            .filter((option) => !removedValues.has(option.value))
            .map((option) => ({
              ...option,
              disabled: disabledValues.has(option.value),
            })),
        };
      }),
    [
      customVariantFields,
      customVariantOptions,
      disabledVariantOptions,
      form.category,
      removedVariantFields,
      removedVariantOptions,
    ],
  );

  const variantSummary = useMemo(
    () =>
      activeFields.flatMap((field) => {
        const selectedValues = selectedVariants[field.id] ?? [];
        const value = selectedValues
          .map((item) => optionLabel(field.options, item, language))
          .filter(Boolean)
          .join(", ");

        return value ? [{ label: field.label[language], value }] : [];
      }),
    [activeFields, language, selectedVariants],
  );
  const activeVariantCombinations = useMemo(
    () => variantCombinations(activeFields, selectedVariants, language),
    [activeFields, language, selectedVariants],
  );
  const activeStockCombinations = useMemo(
    () => stockCombinations(activeFields, selectedVariants, language),
    [activeFields, language, selectedVariants],
  );
  const visibleStockDetailKeys = useMemo(() => {
    const stockKeys = new Set(
      activeStockCombinations.map((combination) => combination.key),
    );

    return activeStockDetailKeys.filter((key) => stockKeys.has(key));
  }, [activeStockCombinations, activeStockDetailKeys]);
  const visiblePriceDetailKeys = useMemo(() => {
    const priceKeys = new Set(
      activeVariantCombinations.map((combination) => combination.key),
    );

    return activePriceDetailKeys.filter((key) => priceKeys.has(key));
  }, [activeVariantCombinations, activePriceDetailKeys]);
  const missingStockCount = activeStockCombinations.filter(
    (combination) =>
      !visibleStockDetailKeys.includes(combination.key) ||
      !variantDetailFor(variantDetails, combination.key, form).stock.trim(),
  ).length;
  const missingPriceCount = activeVariantCombinations.filter(
    (combination) =>
      !visiblePriceDetailKeys.includes(combination.key) ||
      !variantDetailFor(variantDetails, combination.key, form).price.trim(),
  ).length;

  const visibleRegionNames = deliveryZones
    .filter((zone) => visibleRegionSlugs.includes(zone.id))
    .map((zone) => zone.name);
  const visibilitySummary =
    visibilityMode === "general"
      ? "عام"
      : visibleRegionNames.length
        ? visibleRegionNames.join("، ")
        : "مناطق محددة";
  const selectedData = [
    {
      label: t.subcategory,
      value: selectedSecondaryCategoryName,
    },
    { label: "مناطق الظهور", value: visibilitySummary },
    { label: t.addons, value: selectedAddonSummary },
    ...variantSummary,
  ];
  const selectedProductLocation =
    selectedLocationMode === "shop"
      ? `${selectedRegion} / ${selectedShop}`
      : selectedRegion;
  const activeCustomVariantFields = (
    customVariantFields[form.category] ?? []
  ).filter(
    (field) => !(removedVariantFields[form.category] ?? []).includes(field.id),
  );
  const productName = form.name.trim() || t.productFallback;
  const productDescription =
    form.description.trim() || t.descriptionPlaceholder;
  const selectedProductImage = productImages[selectedImageIndex];

  useEffect(() => {
    productImagesRef.current = productImages;
  }, [productImages]);

  useEffect(
    () => () => {
      productImagesRef.current.forEach((image) =>
        URL.revokeObjectURL(image.url),
      );
    },
    [],
  );

  function updateForm<Key extends keyof ProductForm>(
    key: Key,
    value: ProductForm[Key],
  ) {
    setForm((currentForm) => ({ ...currentForm, [key]: value }));
  }

  function updateVariantDetail(
    key: string,
    detail: Partial<VariantValueDetail>,
  ) {
    setVariantDetails((currentDetails) => ({
      ...currentDetails,
      [key]: {
        price: currentDetails[key]?.price ?? form.price,
        discount: currentDetails[key]?.discount ?? form.discount,
        stock: currentDetails[key]?.stock ?? form.stock ?? "0",
        available: currentDetails[key]?.available ?? form.available,
        ...detail,
      },
    }));
  }

  function addStockDetailRow(key: string) {
    setActiveStockDetailKeys((currentKeys) =>
      currentKeys.includes(key) ? currentKeys : [...currentKeys, key],
    );
    updateVariantDetail(key, {
      price: "",
      stock: variantDetails[key]?.stock ?? "0",
      available: isStockAvailable(variantDetails[key]?.stock ?? "0"),
    });
  }

  function addPriceDetailRow(key: string) {
    setActivePriceDetailKeys((currentKeys) =>
      currentKeys.includes(key) ? currentKeys : [...currentKeys, key],
    );
    updateVariantDetail(key, {
      price: variantDetails[key]?.price ?? form.price,
      discount: variantDetails[key]?.discount ?? form.discount,
      stock: "",
    });
  }

  function replaceDetailRow(
    kind: "stock" | "price",
    currentKey: string,
    nextKey: string,
  ) {
    const setKeys =
      kind === "stock" ? setActiveStockDetailKeys : setActivePriceDetailKeys;

    setKeys((currentKeys) =>
      currentKeys.map((key) => (key === currentKey ? nextKey : key)),
    );
    setVariantDetails((currentDetails) => {
      const nextDetails = { ...currentDetails };
      nextDetails[nextKey] = currentDetails[nextKey] ??
        currentDetails[currentKey] ?? {
          price: kind === "price" ? form.price : "",
          discount: kind === "price" ? form.discount : "",
          stock: kind === "stock" ? form.stock || "0" : "",
          available: form.available,
        };
      delete nextDetails[currentKey];

      return nextDetails;
    });
  }

  function removeDetailRow(kind: "stock" | "price", keyToRemove: string) {
    const setKeys =
      kind === "stock" ? setActiveStockDetailKeys : setActivePriceDetailKeys;

    setKeys((currentKeys) => currentKeys.filter((key) => key !== keyToRemove));
    setVariantDetails((currentDetails) => {
      const nextDetails = { ...currentDetails };
      delete nextDetails[keyToRemove];

      return nextDetails;
    });
  }

  function changeCategory(category: CategoryKey) {
    setForm((currentForm) => ({
      ...currentForm,
      category,
    }));
    setSelectedVariants((currentSelections) =>
      form.category === category
        ? currentSelections
        : cloneSelections(category),
    );
  }

  function changeSecondaryCategory(subcategory: string) {
    updateForm("subcategory", subcategory);
  }

  function changeLocationMode(mode: ProductLocationMode) {
    setSelectedLocationMode(mode);

    if (mode === "general") {
      setSelectedShop(t.allShops);
    }
  }

  function changeProductRegion(region: string) {
    setSelectedRegion(region);
    setSelectedShop(t.allShops);
  }

  function updateProductAddons(nextSelection: ProductAddonSelection) {
    setProductAddons(nextSelection);
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) {
      return;
    }

    const nextImages = files.map((file) => ({
      id: createId("product-image"),
      file,
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    setProductImages((currentImages) => {
      setSelectedImageIndex(currentImages.length);

      return [...currentImages, ...nextImages];
    });
    event.target.value = "";
  }

  async function uploadProductImage(image: ProductImage) {
    if (!image.file) {
      return image.url;
    }

    const formData = new FormData();
    formData.append("file", image.file);

    const response = await dashboardFetch("uploads", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload product image");
    }

    const data = (await response.json()) as { url?: unknown };

    if (typeof data.url !== "string") {
      throw new Error("Upload response did not include an image URL");
    }

    return data.url;
  }

  function removeProductImage(index: number) {
    setProductImages((currentImages) => {
      const imageToRemove = currentImages[index];

      if (!imageToRemove) {
        return currentImages;
      }

      URL.revokeObjectURL(imageToRemove.url);
      const nextImages = currentImages.filter(
        (_, imageIndex) => imageIndex !== index,
      );

      setSelectedImageIndex((currentIndex) => {
        if (!nextImages.length) {
          return 0;
        }

        if (currentIndex === index) {
          return Math.min(index, nextImages.length - 1);
        }

        if (currentIndex > index) {
          return currentIndex - 1;
        }

        return currentIndex;
      });

      return nextImages;
    });
  }

  function toggleVariant(field: VariantField, value: string) {
    setSelectedVariants((currentSelections) => {
      const currentValues = currentSelections[field.id] ?? [];
      const nextValues =
        field.multiple || field.input === "checkbox" || field.input === "swatch"
          ? currentValues.includes(value)
            ? currentValues.filter((item) => item !== value)
            : [...currentValues, value]
          : [value];

      return { ...currentSelections, [field.id]: nextValues };
    });
  }

  function selectVariant(field: VariantField, value: string) {
    setSelectedVariants((currentSelections) => ({
      ...currentSelections,
      [field.id]: [value],
    }));
  }

  function removeVariantOption(field: VariantField, value: string) {
    const key = variantKey(form.category, field.id);

    setRemovedVariantOptions((currentOptions) => ({
      ...currentOptions,
      [key]: Array.from(new Set([...(currentOptions[key] ?? []), value])),
    }));
    setSelectedVariants((currentSelections) => ({
      ...currentSelections,
      [field.id]: (currentSelections[field.id] ?? []).filter(
        (item) => item !== value,
      ),
    }));
    setVariantDetails((currentDetails) => {
      const nextDetails = { ...currentDetails };
      const directKey = `${field.id}:${value}`;

      Object.keys(nextDetails).forEach((detailKey) => {
        if (
          detailKey === directKey ||
          detailKey.split("|").includes(directKey)
        ) {
          delete nextDetails[detailKey];
        }
      });

      return nextDetails;
    });
    setActiveStockDetailKeys((currentKeys) =>
      currentKeys.filter((detailKey) => {
        const directKey = `${field.id}:${value}`;

        return !detailKey.split("|").includes(directKey);
      }),
    );
    setActivePriceDetailKeys((currentKeys) =>
      currentKeys.filter((detailKey) => {
        const directKey = `${field.id}:${value}`;

        return !detailKey.split("|").includes(directKey);
      }),
    );
    setDisabledVariantOptions((currentOptions) => ({
      ...currentOptions,
      [key]: (currentOptions[key] ?? []).filter((item) => item !== value),
    }));
  }

  function removeVariantField(field: VariantField) {
    setRemovedVariantFields((currentFields) => ({
      ...currentFields,
      [form.category]: [
        ...(currentFields[form.category] ?? []).filter(
          (fieldId) => fieldId !== field.id,
        ),
        field.id,
      ],
    }));
    setSelectedVariants((currentSelections) => {
      const nextSelections = { ...currentSelections };
      delete nextSelections[field.id];

      return nextSelections;
    });
    setActiveStockDetailKeys((currentKeys) =>
      currentKeys.filter((detailKey) => !detailKey.includes(`${field.id}:`)),
    );
    setActivePriceDetailKeys((currentKeys) =>
      currentKeys.filter((detailKey) => !detailKey.includes(`${field.id}:`)),
    );
    setCustomVariantOptions((currentOptions) => {
      const nextOptions = { ...currentOptions };
      delete nextOptions[variantKey(form.category, field.id)];

      return nextOptions;
    });
  }

  function toggleVariantOptionAvailability(field: VariantField, value: string) {
    const key = variantKey(form.category, field.id);

    setDisabledVariantOptions((currentOptions) => {
      const currentValues = currentOptions[key] ?? [];
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];

      return { ...currentOptions, [key]: nextValues };
    });
  }

  function openVariantValueDialog(field: VariantField) {
    setVariantValueField(field);
    setVariantValueName("");
    setVariantColorValue(
      field.input === "swatch"
        ? (field.options.find((option) => option.color)?.color ?? "#10b981")
        : "",
    );
  }

  function closeVariantValueDialog() {
    setVariantValueField(null);
    setVariantValueName("");
    setVariantColorValue("#10b981");
  }

  function openVariantFieldDialog() {
    setVariantFieldDialogOpen(true);
    setVariantFieldName("");
    setVariantFieldOptionsText("");
    setVariantFieldInput("chips");
  }

  function closeVariantFieldDialog() {
    setVariantFieldDialogOpen(false);
    setVariantFieldName("");
    setVariantFieldOptionsText("");
    setVariantFieldInput("chips");
  }

  function addVariantField() {
    const fieldName = variantFieldName.trim();
    const optionLabels = Array.from(
      new Set(
        variantFieldOptionsText
          .split(/\r?\n|،|,/)
          .map((option) => option.trim())
          .filter(Boolean),
      ),
    );

    if (!fieldName || !optionLabels.length) {
      return;
    }

    const fieldId = createId("custom-field");
    const options = optionLabels.map((label) => ({
      value: createId("custom-option"),
      label: { ar: label, en: label },
    }));
    const field: VariantField = {
      id: fieldId,
      label: { ar: fieldName, en: fieldName },
      description: {
        ar: optionLabels.join("، "),
        en: optionLabels.join(", "),
      },
      input: variantFieldInput,
      multiple: variantFieldInput === "chips",
      options,
    };

    setCustomVariantFields((currentFields) => ({
      ...currentFields,
      [form.category]: [...(currentFields[form.category] ?? []), field],
    }));
    setSelectedVariants((currentSelections) => ({
      ...currentSelections,
      [fieldId]: [options[0].value],
    }));
    closeVariantFieldDialog();
  }

  function addVariantValue(field: VariantField, label: string, color?: string) {
    const key = variantKey(form.category, field.id);
    const rawValue = label.trim();
    const rawColor = color?.trim();

    if (!rawValue) {
      return;
    }

    const option: VariantOption = {
      value: createId("custom-option"),
      label: { ar: rawValue, en: rawValue },
      color: field.input === "swatch" && rawColor ? rawColor : undefined,
    };

    setCustomVariantOptions((currentOptions) => ({
      ...currentOptions,
      [key]: [...(currentOptions[key] ?? []), option],
    }));
    setSelectedVariants((currentSelections) => ({
      ...currentSelections,
      [field.id]:
        field.multiple || field.input === "checkbox" || field.input === "swatch"
          ? [...(currentSelections[field.id] ?? []), option.value]
          : [option.value],
    }));
    closeVariantValueDialog();
  }

  async function openConfirmation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) {
      return;
    }

    if (missingStockCount > 0 || missingPriceCount > 0) {
      setSaveError(
        `${t.missingCases}: ${t.inventoryDetails} ${missingStockCount} / ${t.priceDetails} ${missingPriceCount}`,
      );
      return;
    }

    if (visibilityMode === "regions" && visibleRegionSlugs.length === 0) {
      setSaveError("اختر منطقة واحدة على الأقل أو اجعل المنتج عامًا.");
      return;
    }

    setSaving(true);
    setSaveError("");

    try {
      const imageUrl = selectedProductImage
        ? await uploadProductImage(selectedProductImage)
        : undefined;
      const endpoint = editItemId
        ? `items/${encodeURIComponent(editItemId)}`
        : "items";
      const response = await dashboardFetch(endpoint, {
        method: editItemId ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          image: imageUrl,
          name: productName,
          description: productDescription,
          category: activeCategory.label[language],
          subcategory: selectedSecondaryCategoryName,
          shopName:
            selectedLocationMode === "shop" && selectedShop !== t.allShops
              ? selectedShop
              : "",
          calories: form.stock ? `Stock: ${form.stock}` : "",
          price: form.price,
          variantDetails: serializeVariantDetails({
            customFields: activeCustomVariantFields,
            fields: activeFields,
            form,
            removedFieldIds: removedVariantFields[form.category] ?? [],
            selectedVariants,
            variantDetails,
          }),
          visibilityMode,
          regionSlugs: visibilityMode === "regions" ? visibleRegionSlugs : [],
          regionNames: visibilityMode === "regions" ? visibleRegionNames : [],
          featured: form.featured,
          active: form.available,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save product");
      }

      const data = (await response.json()) as {
        item: { code?: string; id: string };
      };

      setCreatedCode(data.item.code ?? data.item.id);
      setConfirmationOpen(true);
    } catch {
      setSaveError(t.saveError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      className="min-h-screen bg-muted/20 px-4 py-6 sm:px-6 lg:px-8"
      dir={direction}
      onSubmit={openConfirmation}
    >
      <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-sm font-bold text-primary">
              <Sparkles className="size-4" />
              <span>{t.categorySignal}</span>
            </div>
            <h1 className="mt-3 text-2xl font-semibold leading-8 md:text-3xl md:leading-9">
              {pageTitle}
            </h1>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
              {pageSubtitle}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:justify-end">
          <button
            aria-label={t.chooseProductLocation}
            className="inline-flex h-10 w-full items-center justify-between gap-3 rounded-md border border-primary/35 bg-input px-3 text-sm font-medium text-foreground shadow-sm transition hover:border-primary/60 hover:bg-accent/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 sm:w-[300px]"
            onClick={() => setLocationDialogOpen(true)}
            type="button"
          >
            <span className="inline-flex min-w-0 items-center gap-2">
              <MapPin className="size-4 shrink-0 text-primary" />
              <span className="min-w-0">
                <span className="block truncate text-start font-semibold">
                  {t.region}
                </span>
                <span className="block truncate text-start text-xs text-muted-foreground">
                  {selectedProductLocation}
                </span>
              </span>
            </span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          </button>
          <Link
            href="/items"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-accent hover:text-accent-foreground"
          >
            <X className="size-4" />
            {t.back}
          </Link>
          <Button type="submit" className="h-10" disabled={saving}>
            <Save className="size-4" />
            {saving
              ? t.saving
              : isEditing
                ? "\u062d\u0641\u0638 \u0627\u0644\u062a\u0639\u062f\u064a\u0644"
                : t.save}
          </Button>
          </div>
        </div>

        {saveError ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200">
            {saveError}
          </div>
        ) : null}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_376px]">
        <div className="grid min-w-0 gap-5">
          <Section
            icon={<PackageCheck className="size-4" />}
            title={t.basicInfo}
            right={
              <StatusPill>
                <BadgeCheck className="size-3.5" />
                {activeCategory.label[language]}
              </StatusPill>
            }
          >
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
              <div className="grid gap-4">
                <LabelText label={t.productName}>
                  <Input
                    className="h-10"
                    onChange={(event) => updateForm("name", event.target.value)}
                    placeholder={t.productNamePlaceholder}
                    value={form.name}
                  />
                </LabelText>

                <LabelText label={t.description}>
                  <textarea
                    className={compactTextAreaClass}
                    onChange={(event) =>
                      updateForm("description", event.target.value)
                    }
                    placeholder={t.descriptionPlaceholder}
                    value={form.description}
                  />
                </LabelText>
              </div>

              <div className="grid gap-3">
                <div className="text-sm font-medium">{t.image}</div>
                <label className="group relative flex min-h-[164px] cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/30 text-center transition hover:border-primary/50 hover:bg-accent/50">
                  <input
                    accept="image/*"
                    className="sr-only"
                    multiple
                    onChange={handleImageChange}
                    type="file"
                  />
                  {selectedProductImage ? (
                    // eslint-disable-next-line @next/next/no-img-element -- Local object URLs are browser-only previews.
                    <img
                      alt={t.imageAlt}
                      className="h-full max-h-[190px] w-full object-cover"
                      src={selectedProductImage.url}
                    />
                  ) : (
                    <span className="flex flex-col items-center gap-3 px-6 text-sm text-muted-foreground">
                      <span className="flex size-12 items-center justify-center rounded-lg bg-background shadow-sm">
                        <ImagePlus className="size-6 text-primary" />
                      </span>
                      <span className="font-medium text-foreground">
                        {t.uploadImage}
                      </span>
                    </span>
                  )}
                </label>
                {productImages.length ? (
                  <div className="grid grid-cols-4 gap-2">
                    {productImages.map((image, index) => (
                      <button
                        key={image.id}
                        aria-label={`صورة ${index + 1}`}
                        className={cn(
                          "relative h-16 overflow-hidden rounded-md border bg-muted/30 p-1 transition",
                          selectedImageIndex === index
                            ? "border-primary ring-2 ring-primary/15"
                            : "border-border hover:border-primary/50",
                        )}
                        onClick={() => setSelectedImageIndex(index)}
                        type="button"
                      >
                        <span
                          role="button"
                          tabIndex={0}
                          aria-label={`حذف صورة ${index + 1}`}
                          className="absolute start-1 top-1 z-20 flex size-5 items-center justify-center rounded bg-destructive text-white shadow-sm transition hover:bg-destructive/90"
                          onClick={(event) => {
                            event.stopPropagation();
                            removeProductImage(index);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              event.stopPropagation();
                              removeProductImage(index);
                            }
                          }}
                        >
                          <X className="size-3" />
                        </span>
                        <span className="absolute end-1 top-1 z-10 flex size-5 items-center justify-center rounded bg-primary text-[11px] font-bold text-primary-foreground">
                          {index + 1}
                        </span>
                        {/* eslint-disable-next-line @next/next/no-img-element -- Local object URLs are browser-only previews. */}
                        <img
                          alt=""
                          className="h-full w-full rounded object-cover"
                          src={image.url}
                        />
                      </button>
                    ))}
                    <label className="flex h-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border bg-muted/30 text-xs font-medium text-muted-foreground transition hover:border-primary/50 hover:bg-accent/50 hover:text-foreground">
                      <input
                        accept="image/*"
                        className="sr-only"
                        multiple
                        onChange={handleImageChange}
                        type="file"
                      />
                      <Plus className="size-4" />
                      إضافة
                    </label>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4">
              <LabelText label={t.category}>
                <div
                  aria-label={t.category}
                  className="grid grid-cols-1 gap-3 md:grid-cols-2"
                  role="radiogroup"
                >
                  {visibleProductCategories.map((category) => {
                    const CategoryIcon = category.icon;
                    const selected = form.category === category.id;
                    const tone = categoryThemeTone(category.id);

                    return (
                      <button
                        key={category.id}
                        aria-checked={selected}
                        className={cn(
                          "relative flex min-h-[118px] min-w-0 items-center gap-4 overflow-hidden rounded-lg border p-4 text-start text-sm shadow-sm shadow-black/5 outline-none ring-1 ring-transparent transition hover:-translate-y-0.5 hover:shadow-lg focus:ring-2 dark:shadow-none",
                          tone.card,
                          selected && `ring-2 shadow-lg ${tone.selected}`,
                        )}
                        onClick={() => changeCategory(category.id)}
                        role="radio"
                        type="button"
                      >
                        <span
                          className={cn(
                            "absolute inset-y-4 end-0 w-1.5 rounded-s-full",
                            tone.marker,
                          )}
                        />
                        <span
                          className={cn(
                            "flex size-14 shrink-0 items-center justify-center rounded-lg shadow-lg transition",
                            tone.icon,
                          )}
                        >
                          <CategoryIcon className="size-6" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xl font-black leading-7 text-foreground">
                            {category.label[language]}
                          </span>
                          <span className="mt-1 block line-clamp-2 text-sm font-medium leading-5 text-muted-foreground">
                            {category.description[language]}
                          </span>
                        </span>
                        {selected ? (
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check className="size-4" />
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </LabelText>

              <div className="grid gap-4 md:grid-cols-2">
                <LabelText label={t.subcategory}>
                  <button
                    type="button"
                    onClick={() => setCategoryDialogOpen(true)}
                    className="flex min-h-10 w-full items-center justify-between gap-3 rounded-md border border-border bg-input px-3 py-2 text-start text-sm shadow-sm outline-none transition hover:border-primary/40 hover:bg-accent/50 focus:border-primary focus:ring-2 focus:ring-primary/15"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-foreground">
                        {selectedSecondaryCategoryName}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {selectedSecondaryCategorySections}
                      </span>
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                      <Layers3 className="size-3.5" />
                      {t.chooseSubcategory}
                    </span>
                  </button>
                </LabelText>

                <LabelText label={t.addons}>
                  <button
                    type="button"
                    onClick={() => setAddonsDialogOpen(true)}
                    className="flex min-h-10 w-full items-center justify-between gap-3 rounded-md border border-border bg-input px-3 py-2 text-start text-sm shadow-sm outline-none transition hover:border-primary/40 hover:bg-accent/50 focus:border-primary focus:ring-2 focus:ring-primary/15"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-foreground">
                        {productAddons.enabled
                          ? selectedAddonRows.length
                            ? `${selectedAddonRows.length} ${t.selectedAddons}`
                            : t.noAddonsSelected
                          : t.addonsDisabled}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {selectedAddonRows.length
                          ? selectedAddonSummary
                          : t.visibleAddons}
                      </span>
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                      <Plus className="size-3.5" />
                      {t.openAddons}
                    </span>
                  </button>
                </LabelText>
              </div>
            </div>
          </Section>

          <Section
            icon={<Layers3 className="size-4" />}
            title={t.variants}
            right={
              <StatusPill>
                <activeCategory.icon className="size-3.5" />
                {activeCategory.description[language]}
              </StatusPill>
            }
          >
            <div className="grid gap-4">
              <div className="flex justify-start">
                <Button
                  className="h-10"
                  onClick={openVariantFieldDialog}
                  type="button"
                  variant="outline"
                >
                  <Plus className="size-4" />
                  {t.addNewVariant}
                </Button>
              </div>
              {activeFields.length ? (
                <>
                {activeFields.map((field) => (
                  <VariantFieldEditor
                    key={field.id}
                    field={field}
                    language={language}
                    onOpenAddValue={() => openVariantValueDialog(field)}
                    onToggleOptionAvailability={
                      toggleVariantOptionAvailability
                    }
                    onRemoveField={removeVariantField}
                    onRemoveOption={removeVariantOption}
                    onSelect={selectVariant}
                    onToggle={toggleVariant}
                    selectedValues={selectedVariants[field.id] ?? []}
                    t={t}
                  />
                ))}
                <StockCombinationEditor
                  activeKeys={visibleStockDetailKeys}
                  combinations={activeStockCombinations}
                  form={form}
                  missingCount={missingStockCount}
                  onAddRow={addStockDetailRow}
                  onRemoveRow={(key) => removeDetailRow("stock", key)}
                  onReplaceRow={(currentKey, nextKey) =>
                    replaceDetailRow("stock", currentKey, nextKey)
                  }
                  onUpdateDetail={updateVariantDetail}
                  t={t}
                  variantDetails={variantDetails}
                />
                <PriceCombinationEditor
                  activeKeys={visiblePriceDetailKeys}
                  combinations={activeVariantCombinations}
                  form={form}
                  missingCount={missingPriceCount}
                  onAddRow={addPriceDetailRow}
                  onRemoveRow={(key) => removeDetailRow("price", key)}
                  onReplaceRow={(currentKey, nextKey) =>
                    replaceDetailRow("price", currentKey, nextKey)
                  }
                  onUpdateDetail={updateVariantDetail}
                  t={t}
                  variantDetails={variantDetails}
                />
                </>
              ) : (
                <div className="rounded-lg border border-dashed bg-muted/20 p-5 text-sm text-muted-foreground">
                  {t.noCustomFields}
                </div>
              )}
            </div>
          </Section>

          <Section
            icon={<SlidersHorizontal className="size-4" />}
            title={t.attributes}
          >
            <div className="grid gap-4">
              <LabelText label={t.variantDiscount}>
                <div className="relative" dir="ltr">
                  <Input
                    className="h-10 pe-10 text-left"
                    inputMode="decimal"
                    onChange={(event) =>
                      updateForm("discount", discountInputValue(event.target.value))
                    }
                    placeholder="0"
                    value={form.discount}
                  />
                  <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-sm font-black text-muted-foreground">
                    %
                  </span>
                </div>
              </LabelText>
            </div>
          </Section>
        </div>

        <aside className="min-w-0">
          <LivePreview
            activeCategory={activeCategory}
            activeFields={activeFields}
            description={productDescription}
            form={form}
            language={language}
            onRemoveImage={removeProductImage}
            onSelectImage={setSelectedImageIndex}
            productImages={productImages}
            selectedData={selectedData}
            selectedImageIndex={selectedImageIndex}
            selectedRegion={selectedProductLocation}
            selectedVariants={selectedVariants}
            variantDetails={variantDetails}
            title={productName}
            t={t}
          />
        </aside>
      </div>

      {confirmationOpen ? (
        <ConfirmationDialog
          activeCategory={activeCategory}
          createdCode={createdCode || editProductCode}
          form={form}
          imageNames={productImages.map(
            (image, index) => `${index + 1}. ${image.name}`,
          )}
          language={language}
          onClose={() => setConfirmationOpen(false)}
          selectedSecondaryCategoryName={selectedSecondaryCategoryName}
          selectedRegion={selectedProductLocation}
          visibilitySummary={visibilitySummary}
          selectedAddonSummary={selectedAddonSummary}
          t={t}
          priceKeys={visiblePriceDetailKeys}
          stockCombinations={activeStockCombinations}
          stockKeys={visibleStockDetailKeys}
          variantCombinations={activeVariantCombinations}
          variantDetails={variantDetails}
          variantSummary={variantSummary}
        />
      ) : null}
      {locationDialogOpen ? (
        <ProductLocationDialog
          locationMode={selectedLocationMode}
          onChangeLocationMode={changeLocationMode}
          onChangeRegion={changeProductRegion}
          onChangeShop={setSelectedShop}
          onClose={() => setLocationDialogOpen(false)}
          selectedRegion={selectedRegion}
          selectedShop={selectedShop}
          t={t}
        />
      ) : null}
      {categoryDialogOpen ? (
        <SecondaryCategoryPickerDialog
          categories={categoryRows}
          onChange={changeSecondaryCategory}
          onClose={() => setCategoryDialogOpen(false)}
          selectedSubcategory={form.subcategory}
          t={t}
        />
      ) : null}
      {variantFieldDialogOpen ? (
        <VariantFieldDialog
          inputType={variantFieldInput}
          name={variantFieldName}
          onClose={closeVariantFieldDialog}
          onInputTypeChange={setVariantFieldInput}
          onNameChange={setVariantFieldName}
          onOptionsTextChange={setVariantFieldOptionsText}
          onSubmit={addVariantField}
          optionsText={variantFieldOptionsText}
          t={t}
        />
      ) : null}
      {variantValueField ? (
        <VariantValueDialog
          colorValue={variantColorValue}
          field={variantValueField}
          language={language}
          name={variantValueName}
          onClose={closeVariantValueDialog}
          onColorChange={setVariantColorValue}
          onNameChange={setVariantValueName}
          onSubmit={() =>
            addVariantValue(
              variantValueField,
              variantValueName,
              variantColorValue,
            )
          }
          onUsePopularColor={(option) => {
            setVariantValueName(option.label[language]);
            setVariantColorValue(option.color ?? "#10b981");
          }}
          t={t}
        />
      ) : null}
      {addonsDialogOpen ? (
        <AddonsPickerDialog
          addonCategoryOptions={addonCategoryOptions}
          addons={addonRows}
          language={language}
          onChange={updateProductAddons}
          onClose={() => setAddonsDialogOpen(false)}
          selection={productAddons}
          t={t}
        />
      ) : null}
    </form>
  );
}

function ProductLocationDialog({
  locationMode,
  onChangeLocationMode,
  onChangeRegion,
  onChangeShop,
  onClose,
  selectedRegion,
  selectedShop,
  t,
}: {
  locationMode: ProductLocationMode;
  onChangeLocationMode: (mode: ProductLocationMode) => void;
  onChangeRegion: (region: string) => void;
  onChangeShop: (shop: string) => void;
  onClose: () => void;
  selectedRegion: string;
  selectedShop: string;
  t: (typeof copy)[Language];
}) {
  const regionOptions = [t.allRegions, ...deliveryCityOptions];
  const filteredLocationShops =
    selectedRegion === t.allRegions
      ? productLocationShops
      : productLocationShops.filter((shop) => shop.region === selectedRegion);
  const shopOptions = [
    { id: "all", name: t.allShops, category: t.locationShops },
    ...filteredLocationShops,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden overscroll-none bg-foreground/45 p-4 backdrop-blur-sm">
      <div
        aria-labelledby="product-location-title"
        aria-modal="true"
        className="flex max-h-[86vh] w-full max-w-[760px] flex-col overflow-hidden rounded-lg border bg-background text-foreground shadow-2xl"
        dir="rtl"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div className="min-w-0">
            <h2 id="product-location-title" className="text-lg font-black">
              {t.region}
            </h2>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              {t.chooseProductLocation}
            </p>
          </div>
          <button
            aria-label={t.close}
            className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
            onClick={onClose}
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="grid gap-3 border-b bg-muted/20 px-5 py-3">
          <div className="grid grid-cols-2 gap-2 rounded-lg border bg-background p-1">
            {[
              { value: "general" as const, label: t.generalProduct },
              { value: "shop" as const, label: t.shopProduct },
            ].map((option) => {
              const selected = locationMode === option.value;

              return (
                <button
                  key={option.value}
                  aria-pressed={selected}
                  className={cn(
                    "inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-black transition",
                    selected
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                  onClick={() => onChangeLocationMode(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 text-sm font-black text-primary transition hover:bg-primary/15"
              href="/delivery-zone"
            >
              <Plus className="size-4" />
              {t.addArea}
            </Link>
            <Link
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 text-sm font-black text-primary transition hover:bg-primary/15"
              href="/items/shops"
            >
              <Plus className="size-4" />
              {t.addShop}
            </Link>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
          <div
            className={cn(
              "grid gap-4",
              locationMode === "shop" && "md:grid-cols-2",
            )}
          >
            <div className="rounded-lg border bg-card p-3">
              <div className="mb-3 flex items-center gap-2 text-sm font-black">
                <MapPin className="size-4 text-primary" />
                {t.locationAreas}
              </div>
              <div className="grid gap-2">
                {regionOptions.map((region) => {
                  const selected = selectedRegion === region;

                  return (
                    <button
                      key={region}
                      aria-pressed={selected}
                      className={cn(
                        "flex min-h-11 items-center justify-between gap-3 rounded-md border bg-background px-3 py-2 text-start text-sm font-bold transition hover:border-primary/50 hover:bg-accent/50",
                        selected &&
                          "border-primary bg-primary/10 text-primary ring-1 ring-primary/20",
                      )}
                      onClick={() => onChangeRegion(region)}
                      type="button"
                    >
                      <span className="truncate">{region}</span>
                      {selected ? <Check className="size-4 shrink-0" /> : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {locationMode === "shop" ? (
            <div className="rounded-lg border bg-card p-3">
              <div className="mb-3 flex items-center gap-2 text-sm font-black">
                <Store className="size-4 text-primary" />
                {t.locationShops}
              </div>
              <div className="grid gap-2">
                {shopOptions.map((shop) => {
                  const selected = selectedShop === shop.name;

                  return (
                    <button
                      key={shop.id}
                      aria-pressed={selected}
                      className={cn(
                        "flex min-h-12 items-center justify-between gap-3 rounded-md border bg-background px-3 py-2 text-start text-sm transition hover:border-primary/50 hover:bg-accent/50",
                        selected &&
                          "border-primary bg-primary/10 text-primary ring-1 ring-primary/20",
                      )}
                      onClick={() => onChangeShop(shop.name)}
                      type="button"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-black">
                          {shop.name}
                        </span>
                        <span className="mt-0.5 block truncate text-xs font-bold text-muted-foreground">
                          {shop.category}
                        </span>
                      </span>
                      {selected ? <Check className="size-4 shrink-0" /> : null}
                    </button>
                  );
                })}
              </div>
            </div>
            ) : null}
          </div>
        </div>

        <div className="flex justify-start border-t bg-background px-4 py-3 shadow-[0_-12px_24px_rgba(0,0,0,0.08)]" dir="ltr">
          <Button className="min-w-24" onClick={onClose} type="button">
            <Check className="size-4" />
            {t.apply}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Section({
  children,
  icon,
  right,
  title,
}: {
  children: ReactNode;
  icon: ReactNode;
  right?: ReactNode;
  title: string;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm">
      <div className="flex min-h-14 flex-col gap-3 border-b bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            {icon}
          </span>
          {title}
        </div>
        {right}
      </div>
      <div className="grid gap-5 p-4">{children}</div>
    </section>
  );
}

function StatusPill({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex max-w-full items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground">
      {children}
    </div>
  );
}

function LabelText({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      <span>{label}</span>
      {children}
    </label>
  );
}

function SecondaryCategoryPickerDialog({
  categories,
  onChange,
  onClose,
  selectedSubcategory,
  t,
}: {
  categories: CategoryRow[];
  onChange: (subcategory: string) => void;
  onClose: () => void;
  selectedSubcategory: string;
  t: (typeof copy)[Language];
}) {
  const [selectedClassification, setSelectedClassification] = useState("all");
  const categoryClassifications = useMemo(
    () =>
      Array.from(
        new Set(categories.flatMap((category) => category.sections)),
      ).filter(Boolean),
    [categories],
  );
  const visibleCategories = useMemo(
    () =>
      selectedClassification === "all"
        ? categories
        : categories.filter((category) =>
            category.sections.includes(selectedClassification),
          ),
    [categories, selectedClassification],
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden overscroll-none bg-foreground/45 p-4 backdrop-blur-sm">
      <div
        aria-labelledby="product-category-title"
        aria-modal="true"
        className="flex max-h-[82vh] w-full max-w-[920px] flex-col overflow-hidden rounded-lg border bg-background text-foreground shadow-2xl"
        dir="rtl"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div className="flex-1 text-right">
            <h2 id="product-category-title" className="text-lg font-black leading-7">
              {t.categorySubgroups}
            </h2>
            <p className="mt-0.5 text-sm font-semibold leading-5 text-muted-foreground">
              {t.visibleCategorySubgroups}
            </p>
          </div>
          <button
            aria-label={t.close}
            className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
            onClick={onClose}
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="border-b bg-background px-4 py-3">
          <div className="rounded-lg border bg-card px-3 py-3">
            <div className="mb-2 text-right text-sm font-black">
              {t.filterByClassification}
            </div>
            <div className="flex flex-wrap justify-start gap-2">
              <button
                className={cn(
                  "inline-flex h-9 items-center rounded-md border px-3 text-sm font-black transition hover:border-primary/50 hover:bg-accent",
                  selectedClassification === "all"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground",
                )}
                onClick={() => setSelectedClassification("all")}
                type="button"
              >
                {t.allClassifications}
              </button>
              {categoryClassifications.map((classification) => (
                <button
                  key={classification}
                  className={cn(
                    "inline-flex h-9 items-center rounded-md border px-3 text-sm font-black transition hover:border-primary/50 hover:bg-accent",
                    selectedClassification === classification
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground",
                  )}
                  onClick={() => setSelectedClassification(classification)}
                  type="button"
                >
                  {classification}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
          <div className="grid gap-2 md:grid-cols-2">
            {visibleCategories.map((category) => {
              const selected = selectedSubcategory === category.name;
              const categoryName = categoryRowDisplayName(category);
              const sections = categoryRowSections(category);

              return (
                <button
                  key={category.index}
                  aria-pressed={selected}
                  className={cn(
                    "flex min-h-[64px] w-full items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2 text-start shadow-sm transition hover:border-primary/50 hover:bg-accent/40",
                    selected &&
                      "border-primary bg-primary/10 ring-1 ring-primary/20",
                  )}
                  onClick={() => onChange(category.name)}
                  type="button"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="size-11 shrink-0 overflow-hidden rounded-md border bg-white p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element -- Dashboard seed data uses remote category thumbnails. */}
                      <img
                        alt=""
                        className="h-full w-full rounded-sm object-cover"
                        src={category.image}
                      />
                    </span>
                    <span className="min-w-0 text-right leading-none">
                      <span className="block truncate text-base font-black leading-5">
                        {categoryName}
                      </span>
                      {sections ? (
                        <span className="mt-0.5 flex flex-wrap justify-start gap-1">
                          {category.sections.map((section) => (
                            <span
                              key={`${category.index}-${section}`}
                              className="rounded-md bg-muted px-2 py-0.5 text-xs font-bold leading-4 text-muted-foreground"
                            >
                              {section}
                            </span>
                          ))}
                        </span>
                      ) : null}
                    </span>
                  </span>
                  {selected ? (
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-4" />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-start border-t bg-background px-4 py-3 shadow-[0_-12px_24px_rgba(0,0,0,0.08)]" dir="ltr">
          <Button className="min-w-24" onClick={onClose} type="button">
            <Check className="size-4" />
            {t.apply}
          </Button>
        </div>
      </div>
    </div>
  );
}

function VariantFieldDialog({
  inputType,
  name,
  onClose,
  onInputTypeChange,
  onNameChange,
  onOptionsTextChange,
  onSubmit,
  optionsText,
  t,
}: {
  inputType: CustomVariantInput;
  name: string;
  onClose: () => void;
  onInputTypeChange: (input: CustomVariantInput) => void;
  onNameChange: (value: string) => void;
  onOptionsTextChange: (value: string) => void;
  onSubmit: () => void;
  optionsText: string;
  t: (typeof copy)[Language];
}) {
  const optionCount = optionsText
    .split(/\r?\n|،|,/)
    .map((option) => option.trim())
    .filter(Boolean).length;
  const canSubmit = name.trim().length > 0 && optionCount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden overscroll-none bg-foreground/45 px-4 py-6 backdrop-blur-sm">
      <div
        aria-labelledby="variant-field-title"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-lg border bg-background text-foreground shadow-2xl"
        dir="rtl"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div>
            <h2 id="variant-field-title" className="text-lg font-black">
              {t.addVariantTitle}
            </h2>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              {t.variants}
            </p>
          </div>
          <button
            aria-label={t.close}
            className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
            onClick={onClose}
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="grid gap-4 p-5">
          <LabelText label={t.variantName}>
            <Input
              autoFocus
              className="h-10"
              onChange={(event) => onNameChange(event.target.value)}
              placeholder={t.variantName}
              value={name}
            />
          </LabelText>

          <LabelText label={t.variantInputType}>
            <div className="grid grid-cols-2 gap-2 rounded-lg border bg-card p-1">
              {[
                { value: "chips" as const, label: t.chipsInput },
                { value: "radio" as const, label: t.radioInput },
              ].map((option) => {
                const selected = inputType === option.value;

                return (
                  <button
                    key={option.value}
                    aria-pressed={selected}
                    className={cn(
                      "h-10 rounded-md px-3 text-sm font-black transition",
                      selected
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                    onClick={() => onInputTypeChange(option.value)}
                    type="button"
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </LabelText>

          <LabelText label={t.variantOptions}>
            <textarea
              className={textAreaClass}
              onChange={(event) => onOptionsTextChange(event.target.value)}
              placeholder={t.variantOptionsPlaceholder}
              value={optionsText}
            />
          </LabelText>
        </div>

        <div className="flex items-center justify-end gap-2 border-t px-5 py-4">
          <Button onClick={onClose} type="button" variant="outline">
            {t.close}
          </Button>
          <Button disabled={!canSubmit} onClick={onSubmit} type="button">
            <Plus className="size-4" />
            {t.add}
          </Button>
        </div>
      </div>
    </div>
  );
}

function VariantValueDialog({
  colorValue,
  field,
  language,
  name,
  onClose,
  onColorChange,
  onNameChange,
  onSubmit,
  onUsePopularColor,
  t,
}: {
  colorValue: string;
  field: VariantField;
  language: Language;
  name: string;
  onClose: () => void;
  onColorChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onSubmit: () => void;
  onUsePopularColor: (option: VariantOption) => void;
  t: (typeof copy)[Language];
}) {
  const isColorField = field.input === "swatch";
  const canSubmit = name.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden overscroll-none bg-foreground/45 px-4 py-6 backdrop-blur-sm">
      <div
        aria-labelledby="variant-value-title"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-lg border bg-background text-foreground shadow-2xl"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div>
            <h2 id="variant-value-title" className="text-lg font-semibold">
              {t.addValueTitle}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {field.label[language]}
            </p>
          </div>
          <button
            aria-label={t.close}
            className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
            onClick={onClose}
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="grid gap-5 p-5">
          {isColorField ? (
            <div>
              <div className="mb-3 text-sm font-semibold">
                {t.popularColors}
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {popularColorOptions.map((option) => (
                  <button
                    key={option.value}
                    className="flex min-h-11 items-center justify-between gap-3 rounded-md border bg-card px-3 py-2 text-start transition hover:border-primary/50 hover:bg-accent/50"
                    onClick={() => onUsePopularColor(option)}
                    type="button"
                  >
                    <span className="font-semibold">
                      {option.label[language]}
                    </span>
                    <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <span dir="ltr">{option.color}</span>
                      <span
                        className="size-6 rounded-full border border-border"
                        style={{ backgroundColor: option.color }}
                      />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className={cn("grid gap-4", isColorField && "sm:grid-cols-2")}>
            <LabelText label={isColorField ? t.colorName : t.addNewValue}>
              <Input
                autoFocus
                className="h-10"
                onChange={(event) => onNameChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && canSubmit && !isColorField) {
                    event.preventDefault();
                    onSubmit();
                  }
                }}
                placeholder={t.newValuePlaceholder}
                value={name}
              />
            </LabelText>

            {isColorField ? (
              <LabelText label={t.colorValue}>
                <div className="grid grid-cols-[minmax(0,1fr)_44px] gap-2">
                  <Input
                    className="h-10"
                    dir="ltr"
                    onChange={(event) => onColorChange(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && canSubmit) {
                        event.preventDefault();
                        onSubmit();
                      }
                    }}
                    placeholder={t.colorValuePlaceholder}
                    value={colorValue}
                  />
                  <span
                    className="h-10 rounded-md border border-border"
                    style={{ backgroundColor: colorValue || "#e2e8f0" }}
                  />
                </div>
              </LabelText>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t px-5 py-4">
          <Button onClick={onClose} type="button" variant="outline">
            {t.close}
          </Button>
          <Button disabled={!canSubmit} onClick={onSubmit} type="button">
            <Plus className="size-4" />
            {t.add}
          </Button>
        </div>
      </div>
    </div>
  );
}

function VariantFieldEditor({
  field,
  language,
  onOpenAddValue,
  onRemoveField,
  onRemoveOption,
  onSelect,
  onToggle,
  onToggleOptionAvailability,
  selectedValues,
  t,
}: {
  field: VariantField;
  language: Language;
  onOpenAddValue: () => void;
  onRemoveField: (field: VariantField) => void;
  onRemoveOption: (field: VariantField, value: string) => void;
  onSelect: (field: VariantField, value: string) => void;
  onToggle: (field: VariantField, value: string) => void;
  onToggleOptionAvailability: (field: VariantField, value: string) => void;
  selectedValues: string[];
  t: (typeof copy)[Language];
}) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 font-semibold">
            {field.input === "swatch" ? (
              <Palette className="size-4 text-primary" />
            ) : field.input === "select" ? (
              <ChevronDown className="size-4 text-primary" />
            ) : field.input === "checkbox" ? (
              <FileText className="size-4 text-primary" />
            ) : (
              <Layers3 className="size-4 text-primary" />
            )}
            {field.label[language]}
          </div>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {field.description[language]}
          </p>
        </div>
        <button
          aria-label={`${t.deleteVariant}: ${field.label[language]}`}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 text-xs font-black text-destructive transition hover:bg-destructive hover:text-white"
          onClick={() => onRemoveField(field)}
          type="button"
        >
          <X className="size-4" />
          {t.deleteVariant}
        </button>
      </div>

      <div className="mt-4">
        {field.input === "swatch" ? (
          <div className="flex flex-wrap gap-3">
            {field.options.map((option) => {
              const disabled = Boolean(option.disabled);
              const selected = selectedValues.includes(option.value);

              return (
                <div key={option.value} className="relative">
                  <button
                    aria-label={option.label[language]}
                    aria-pressed={selected}
                    className={cn(
                      "flex h-10 w-16 items-center justify-center rounded-lg border-2 bg-background p-1 transition",
                      disabled
                        ? "border-border opacity-45 grayscale"
                        : selected
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border",
                    )}
                    onClick={() => onToggle(field, option.value)}
                    type="button"
                  >
                    <span
                      className="flex h-7 w-12 items-center justify-center rounded-md border border-black/10"
                      style={{ backgroundColor: option.color ?? "#e2e8f0" }}
                    >
                      {selected ? (
                        <Check className="size-4 text-white drop-shadow" />
                      ) : null}
                    </span>
                  </button>
                  <OptionAvailabilityButton
                    disabled={disabled}
                    label={option.label[language]}
                    onClick={() =>
                      onToggleOptionAvailability(field, option.value)
                    }
                    t={t}
                  />
                  <OptionDeleteButton
                    label={option.label[language]}
                    onClick={() => onRemoveOption(field, option.value)}
                    t={t}
                  />
                </div>
              );
            })}
          </div>
        ) : field.input === "select" ? (
          <div className="grid gap-3">
            <AppSelect
              ariaLabel={field.label[language]}
              className="h-10 bg-input text-foreground"
              contentClassName="z-[60]"
              onValueChange={(value) => onSelect(field, value)}
              options={field.options.map((option) => ({
                value: option.value,
                label: option.label[language],
              }))}
              value={selectedValues[0]}
            />
            <DeletableOptionChips
              field={field}
              language={language}
              onToggleOptionAvailability={onToggleOptionAvailability}
              onRemoveOption={onRemoveOption}
              t={t}
            />
          </div>
        ) : field.input === "radio" ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {field.options.map((option) => {
              const disabled = Boolean(option.disabled);
              const selected = selectedValues.includes(option.value);

              return (
                <div key={option.value} className="relative">
                  <label
                    className={cn(
                      "flex min-h-10 cursor-pointer items-center gap-2 rounded-md border bg-card py-2 pe-9 ps-9 text-sm transition hover:bg-accent/60",
                      selected && "border-primary bg-primary/10 text-primary",
                      disabled &&
                        "border-border bg-muted/50 text-muted-foreground opacity-55",
                    )}
                  >
                    <input
                      checked={selected}
                      className="size-4 accent-[var(--primary)]"
                      name={field.id}
                      onChange={() => onSelect(field, option.value)}
                      type="radio"
                    />
                    <span>{option.label[language]}</span>
                  </label>
                  <OptionAvailabilityButton
                    disabled={disabled}
                    label={option.label[language]}
                    onClick={() =>
                      onToggleOptionAvailability(field, option.value)
                    }
                    t={t}
                  />
                  <OptionDeleteButton
                    label={option.label[language]}
                    onClick={() => onRemoveOption(field, option.value)}
                    t={t}
                  />
                </div>
              );
            })}
          </div>
        ) : field.input === "checkbox" ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {field.options.map((option) => {
              const disabled = Boolean(option.disabled);
              const selected = selectedValues.includes(option.value);

              return (
                <div key={option.value} className="relative">
                  <label
                    className={cn(
                      "flex min-h-10 cursor-pointer items-center gap-2 rounded-md border bg-card py-2 pe-9 ps-9 text-sm transition hover:bg-accent/60",
                      selected && "border-primary bg-primary/10 text-primary",
                      disabled &&
                        "border-border bg-muted/50 text-muted-foreground opacity-55",
                    )}
                  >
                    <input
                      checked={selected}
                      className="size-4 rounded accent-[var(--primary)]"
                      onChange={() => onToggle(field, option.value)}
                      type="checkbox"
                    />
                    <span>{option.label[language]}</span>
                  </label>
                  <OptionAvailabilityButton
                    disabled={disabled}
                    label={option.label[language]}
                    onClick={() =>
                      onToggleOptionAvailability(field, option.value)
                    }
                    t={t}
                  />
                  <OptionDeleteButton
                    label={option.label[language]}
                    onClick={() => onRemoveOption(field, option.value)}
                    t={t}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {field.options.map((option) => {
              const disabled = Boolean(option.disabled);
              const selected = selectedValues.includes(option.value);

              return (
                <div key={option.value} className="relative">
                  <button
                    aria-pressed={selected}
                    className={cn(
                      "inline-flex h-10 items-center justify-center gap-2 rounded-md border pe-9 ps-9 text-sm font-medium transition",
                      disabled
                        ? "border-border bg-muted/50 text-muted-foreground opacity-55"
                        : selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                    onClick={() => onToggle(field, option.value)}
                    type="button"
                  >
                    {selected ? <Check className="size-4" /> : null}
                    {option.label[language]}
                  </button>
                  <OptionAvailabilityButton
                    disabled={disabled}
                    label={option.label[language]}
                    onClick={() =>
                      onToggleOptionAvailability(field, option.value)
                    }
                    t={t}
                  />
                  <OptionDeleteButton
                    label={option.label[language]}
                    onClick={() => onRemoveOption(field, option.value)}
                    t={t}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4">
        <Button
          className="h-10"
          onClick={onOpenAddValue}
          type="button"
          variant="outline"
        >
          <Plus className="size-4" />
          {t.addNewValue}
        </Button>
      </div>
    </div>
  );
}

function OptionDeleteButton({
  label,
  onClick,
  t,
}: {
  label: string;
  onClick: () => void;
  t: (typeof copy)[Language];
}) {
  return (
    <button
      aria-label={`${t.deleteValue}: ${label}`}
      className="absolute end-1 top-1 z-10 flex size-5 items-center justify-center rounded-full bg-destructive text-white shadow-sm transition hover:bg-destructive/90"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }}
      type="button"
    >
      <X className="size-3" />
    </button>
  );
}

function OptionAvailabilityButton({
  disabled,
  label,
  onClick,
  t,
}: {
  disabled: boolean;
  label: string;
  onClick: () => void;
  t: (typeof copy)[Language];
}) {
  return (
    <button
      aria-label={`${disabled ? t.enableValue : t.disableValue}: ${label}`}
      className={cn(
        "absolute start-1 top-1 z-10 flex size-5 items-center justify-center rounded-full shadow-sm transition",
        disabled
          ? "bg-muted-foreground text-background hover:bg-foreground"
          : "bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground",
      )}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }}
      type="button"
    >
      <Power className="size-3" />
    </button>
  );
}

function DeletableOptionChips({
  field,
  language,
  onToggleOptionAvailability,
  onRemoveOption,
  t,
}: {
  field: VariantField;
  language: Language;
  onToggleOptionAvailability: (field: VariantField, value: string) => void;
  onRemoveOption: (field: VariantField, value: string) => void;
  t: (typeof copy)[Language];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {field.options.map((option) => {
        const disabled = Boolean(option.disabled);

        return (
          <div key={option.value} className="relative">
            <span
              className={cn(
                "inline-flex h-9 items-center rounded-md border bg-card pe-9 ps-9 text-sm font-medium text-muted-foreground",
                disabled && "bg-muted/50 opacity-55",
              )}
            >
              {option.label[language]}
            </span>
            <OptionAvailabilityButton
              disabled={disabled}
              label={option.label[language]}
              onClick={() => onToggleOptionAvailability(field, option.value)}
              t={t}
            />
            <OptionDeleteButton
              label={option.label[language]}
              onClick={() => onRemoveOption(field, option.value)}
              t={t}
            />
          </div>
        );
      })}
    </div>
  );
}

function combinationSelectOptions(
  combinations: VariantCombination[],
  activeKeys: string[],
  currentKey?: string,
) {
  const activeKeySet = new Set(activeKeys.filter((key) => key !== currentKey));

  return combinations
    .filter((combination) => !activeKeySet.has(combination.key))
    .map((combination) => ({
      value: combination.key,
      label: combination.label,
    }));
}

function StockCombinationEditor({
  activeKeys,
  combinations,
  form,
  missingCount,
  onAddRow,
  onRemoveRow,
  onReplaceRow,
  onUpdateDetail,
  t,
  variantDetails,
}: {
  activeKeys: string[];
  combinations: VariantCombination[];
  form: ProductForm;
  missingCount: number;
  onAddRow: (key: string) => void;
  onRemoveRow: (key: string) => void;
  onReplaceRow: (currentKey: string, nextKey: string) => void;
  onUpdateDetail: (key: string, detail: Partial<VariantValueDetail>) => void;
  t: (typeof copy)[Language];
  variantDetails: VariantDetails;
}) {
  const visibleCombinations = activeKeys
    .map((key) => combinations.find((combination) => combination.key === key))
    .filter((combination): combination is VariantCombination =>
      Boolean(combination),
    );
  const nextCombination = combinations.find(
    (combination) => !activeKeys.includes(combination.key),
  );

  if (!combinations.length) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <div className="flex items-center justify-between gap-3 border-b bg-muted/25 px-4 py-3">
        <span className="font-semibold">{t.inventoryDetails}</span>
        <span className="text-xs font-medium text-muted-foreground">
          {activeKeys.length}/{combinations.length}
        </span>
      </div>
      <div className="grid gap-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-dashed bg-muted/20 p-3">
          <span className="text-sm font-medium text-muted-foreground">
            {t.missingCases}: {missingCount}
          </span>
          <Button
            disabled={!nextCombination}
            onClick={() => nextCombination && onAddRow(nextCombination.key)}
            type="button"
            variant="outline"
          >
            <Plus className="size-4" />
            {t.addStockRow}
          </Button>
        </div>

        {visibleCombinations.map((entry) => {
          const detail = variantDetailFor(variantDetails, entry.key, form);
          const available = isStockAvailable(detail.stock);

          return (
            <div
              key={entry.key}
              className="grid gap-3 rounded-md border bg-card p-3 md:grid-cols-[minmax(220px,1fr)_140px_120px_auto] md:items-end"
            >
              <LabelText label={t.stockCombination}>
                <AppSelect
                  ariaLabel={t.stockCombination}
                  className="h-10 bg-input text-foreground"
                  contentClassName="z-[60]"
                  dir="rtl"
                  onValueChange={(nextKey) => onReplaceRow(entry.key, nextKey)}
                  options={combinationSelectOptions(
                    combinations,
                    activeKeys,
                    entry.key,
                  )}
                  value={entry.key}
                />
              </LabelText>
              <LabelText label={t.variantStock}>
                <Input
                  className="h-10"
                  inputMode="numeric"
                  onChange={(event) =>
                    onUpdateDetail(entry.key, {
                      price: "",
                      stock: event.target.value,
                      available: isStockAvailable(event.target.value),
                    })
                  }
                  value={detail.stock}
                />
              </LabelText>
              <div className="flex h-10 items-center justify-center rounded-md border bg-input px-3 text-sm font-semibold">
                {available ? t.available : t.empty}
              </div>
              <Button
                aria-label={`${t.removeRow}: ${entry.label}`}
                className="h-10"
                onClick={() => onRemoveRow(entry.key)}
                type="button"
                variant="outline"
              >
                <X className="size-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PriceCombinationEditor({
  activeKeys,
  combinations,
  form,
  missingCount,
  onAddRow,
  onRemoveRow,
  onReplaceRow,
  onUpdateDetail,
  t,
  variantDetails,
}: {
  activeKeys: string[];
  combinations: VariantCombination[];
  form: ProductForm;
  missingCount: number;
  onAddRow: (key: string) => void;
  onRemoveRow: (key: string) => void;
  onReplaceRow: (currentKey: string, nextKey: string) => void;
  onUpdateDetail: (key: string, detail: Partial<VariantValueDetail>) => void;
  t: (typeof copy)[Language];
  variantDetails: VariantDetails;
}) {
  const visibleCombinations = activeKeys
    .map((key) => combinations.find((combination) => combination.key === key))
    .filter((combination): combination is VariantCombination =>
      Boolean(combination),
    );
  const nextCombination = combinations.find(
    (combination) => !activeKeys.includes(combination.key),
  );

  if (!combinations.length) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <div className="flex items-center justify-between gap-3 border-b bg-muted/25 px-4 py-3">
        <div>
          <div className="font-semibold">{t.priceDetails}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {t.autoColors}
          </div>
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {activeKeys.length}/{combinations.length}
        </span>
      </div>
      <div className="grid gap-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-dashed bg-muted/20 p-3">
          <span className="text-sm font-medium text-muted-foreground">
            {t.missingCases}: {missingCount}
          </span>
          <Button
            disabled={!nextCombination}
            onClick={() => nextCombination && onAddRow(nextCombination.key)}
            type="button"
            variant="outline"
          >
            <Plus className="size-4" />
            {t.addPriceRow}
          </Button>
        </div>

        {visibleCombinations.map((combination) => {
          const detail = variantDetailFor(
            variantDetails,
            combination.key,
            form,
          );

          return (
            <div
              key={combination.key}
              className="grid gap-3 rounded-md border bg-card p-3 md:grid-cols-[minmax(220px,1fr)_120px_120px_auto] md:items-end"
            >
              <LabelText label={t.priceCombination}>
                <AppSelect
                  ariaLabel={t.priceCombination}
                  className="h-10 bg-input text-foreground"
                  contentClassName="z-[60]"
                  dir="rtl"
                  onValueChange={(nextKey) =>
                    onReplaceRow(combination.key, nextKey)
                  }
                  options={combinationSelectOptions(
                    combinations,
                    activeKeys,
                    combination.key,
                  )}
                  value={combination.key}
                />
              </LabelText>
              <LabelText label={t.variantPrice}>
                <Input
                  className="h-10"
                  inputMode="decimal"
                  onChange={(event) =>
                    onUpdateDetail(combination.key, {
                      price: event.target.value,
                    })
                  }
                  value={detail.price}
                />
              </LabelText>
              <LabelText label={t.variantDiscount}>
                <div className="relative" dir="ltr">
                  <Input
                    className="h-10 pe-10 text-left"
                    inputMode="decimal"
                    onChange={(event) =>
                      onUpdateDetail(combination.key, {
                        discount: discountInputValue(event.target.value),
                      })
                    }
                    value={detail.discount}
                  />
                  <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-sm font-black text-muted-foreground">
                    %
                  </span>
                </div>
              </LabelText>
              <Button
                aria-label={`${t.removeRow}: ${combination.label}`}
                className="h-10"
                onClick={() => onRemoveRow(combination.key)}
                type="button"
                variant="outline"
              >
                <X className="size-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AddonsPickerDialog({
  addonCategoryOptions,
  addons,
  language,
  onChange,
  onClose,
  selection,
  t,
}: {
  addonCategoryOptions: string[];
  addons: AddonRow[];
  language: Language;
  onChange: (selection: ProductAddonSelection) => void;
  onClose: () => void;
  selection: ProductAddonSelection;
  t: (typeof copy)[Language];
}) {
  const visibleAddons = addons.filter(
    (addon) =>
      selection.category === "all" || addon.category === selection.category,
  );
  const selectedIds = new Set(selection.selectedIds);
  const selectedCount = selection.selectedIds.length;

  function updateSelection(nextSelection: Partial<ProductAddonSelection>) {
    onChange({ ...selection, ...nextSelection });
  }

  function toggleAddon(addonId: string) {
    const nextIds = new Set(selection.selectedIds);

    if (nextIds.has(addonId)) {
      nextIds.delete(addonId);
    } else {
      nextIds.add(addonId);
    }

    updateSelection({ selectedIds: Array.from(nextIds) });
  }

  function selectVisibleAddons() {
    updateSelection({
      selectedIds: Array.from(
        new Set([
          ...selection.selectedIds,
          ...visibleAddons.map((addon) => addon.id),
        ]),
      ),
    });
  }

  function clearSelectedAddons() {
    updateSelection({ selectedIds: [] });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden overscroll-none bg-foreground/45 px-4 py-6 backdrop-blur-sm">
      <div
        aria-labelledby="product-addons-title"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-lg border bg-background text-foreground shadow-2xl"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div>
            <h2 id="product-addons-title" className="text-lg font-semibold">
              {t.addons}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t.visibleAddons}
            </p>
          </div>
          <button
            aria-label={t.close}
            className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
            onClick={onClose}
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-[66vh] overflow-y-auto p-5">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <LabelText label={t.addonCategory}>
              <AppSelect
                ariaLabel={t.addonCategory}
                className="h-10 bg-input text-foreground"
                contentClassName="z-[70]"
                onValueChange={(category) => updateSelection({ category })}
                options={[
                  { value: "all", label: t.allAddonCategories },
                  ...addonCategoryOptions.map((category) => ({
                    value: category,
                    label: category,
                  })),
                ]}
                value={selection.category}
              />
            </LabelText>

            <div className="flex h-10 items-center justify-between gap-3 rounded-md border bg-card px-3">
              <span className="text-sm font-semibold">{t.addonsEnabled}</span>
              <Switch
                checked={selection.enabled}
                onCheckedChange={(enabled) => updateSelection({ enabled })}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-semibold text-muted-foreground">
              {selectedCount
                ? `${selectedCount} ${t.selectedAddons}`
                : t.noAddonsSelected}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                disabled={!selection.enabled || visibleAddons.length === 0}
                onClick={selectVisibleAddons}
                type="button"
                variant="outline"
              >
                <Check className="size-4" />
                {t.selectAll}
              </Button>
              <Button
                disabled={!selection.enabled || selectedCount === 0}
                onClick={clearSelectedAddons}
                type="button"
                variant="outline"
              >
                <X className="size-4" />
                {t.clearAll}
              </Button>
            </div>
          </div>

          <div
            className={cn(
              "mt-4 grid gap-3",
              !selection.enabled && "pointer-events-none opacity-55",
            )}
          >
            {visibleAddons.map((addon) => {
              const selected = selectedIds.has(addon.id);

              return (
                <button
                  key={addon.id}
                  aria-pressed={selected}
                  className={cn(
                    "flex min-h-[76px] items-center gap-3 rounded-md border bg-card p-3 text-start transition hover:border-primary/50 hover:bg-accent/45",
                    selected &&
                      "border-primary bg-primary/10 ring-2 ring-primary/10",
                  )}
                  onClick={() => toggleAddon(addon.id)}
                  type="button"
                >
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-md border",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background",
                    )}
                  >
                    {selected ? <Check className="size-4" /> : null}
                  </span>
                  <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element -- Dashboard add-on rows use remote demo image URLs. */}
                    <img
                      alt=""
                      className="size-full object-contain"
                      src={addon.image}
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">
                      {addonDisplayName(addon, language)}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
                      <span className="rounded-md bg-muted px-2 py-1">
                        {addon.category}
                      </span>
                      <span dir="ltr">{addon.price}</span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t px-5 py-4">
          <div className="truncate text-sm text-muted-foreground">
            {selection.enabled ? t.visibleAddons : t.addonsDisabled}
          </div>
          <Button onClick={onClose} type="button">
            <Check className="size-4" />
            {t.apply}
          </Button>
        </div>
      </div>
    </div>
  );
}

function LivePreview({
  activeCategory,
  activeFields,
  description,
  form,
  language,
  onRemoveImage,
  onSelectImage,
  productImages,
  selectedData,
  selectedImageIndex,
  selectedRegion,
  selectedVariants,
  t,
  title,
  variantDetails,
}: {
  activeCategory: ProductCategory;
  activeFields: VariantField[];
  description: string;
  form: ProductForm;
  language: Language;
  onRemoveImage: (index: number) => void;
  onSelectImage: (index: number) => void;
  productImages: ProductImage[];
  selectedData: Array<{ label: string; value: string }>;
  selectedImageIndex: number;
  selectedRegion: string;
  selectedVariants: Record<string, string[]>;
  t: (typeof copy)[Language];
  title: string;
  variantDetails: VariantDetails;
}) {
  const Icon = activeCategory.icon;
  const [previewVariants, setPreviewVariants] = useState<
    Record<string, string[]>
  >({});
  const previewSelectedVariants = useMemo(
    () => previewVariantSelection(activeFields, selectedVariants, previewVariants),
    [activeFields, previewVariants, selectedVariants],
  );

  const activeVariantDetail = selectedVariantDetail(
    activeFields,
    previewSelectedVariants,
    variantDetails,
    form,
  );
  const currentPrice = activeVariantDetail.price || form.price || "";
  const currentDiscount = activeVariantDetail.discount || "";
  const priceText = `EGP ${currentPrice || t.empty}`;
  const oldPriceText = oldPriceFromDiscount(currentPrice, currentDiscount);
  const currentDiscountLabel = discountLabel(currentDiscount);
  const stockText = activeVariantDetail.stock || form.stock || "0";
  const stockCount = Number.parseInt(stockText, 10);
  const hasStock =
    Number.isFinite(stockCount) && stockCount > 0 && activeVariantDetail.available;
  const isLowStock = hasStock && stockCount <= 3;
  const statusText = hasStock
    ? language === "ar"
      ? "متوفر"
      : "Available"
    : language === "ar"
      ? "غير متوفر"
      : "Out of Stock";
  const statusToneClass = hasStock ? "text-[#22C55E]" : "text-[#EF4444]";
  const statusPillClass = hasStock
    ? "bg-emerald-500/15 text-emerald-400"
    : "bg-[#EF4444]/15 text-[#EF4444]";
  const quantityToneClass =
    !hasStock ? "text-[#EF4444]" : isLowStock ? "text-[#F59E0B]" : "text-[#22C55E]";
  const stockDescription = hasStock
    ? isLowStock
      ? language === "ar"
        ? `متبقي ${stockCount} فقط.`
        : `Only ${stockCount} left in stock.`
      : language === "ar"
        ? `متوفر حاليًا بعدد ${stockCount} قطعة.`
        : `Available now: ${stockCount} in stock.`
    : language === "ar"
      ? "الاختيار ده غير متوفر حاليًا."
      : "This variation is currently unavailable.";
  const stockDescriptionClass = !hasStock
    ? "text-[#EF4444]"
    : isLowStock
      ? "text-[#F59E0B] font-extrabold"
      : "text-white/55";
  const selectedImage = productImages[selectedImageIndex];
  const thumbnailSlots = productImages.length
    ? productImages
    : [null, null, null, null];

  return (
    <div className="h-full rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <ChefHat className="size-4" />
          </span>
          {t.livePreview}
        </div>
        <StatusPill>
          <Icon className="size-3.5" />
          {activeCategory.label[language]}
        </StatusPill>
      </div>

      <div className="mt-4 overflow-hidden rounded-[28px] border border-white/10 bg-[#1A1A1A] p-2 text-white shadow-xl">
        <div className="overflow-hidden rounded-[22px] border border-white/10 bg-[#1A1A1A]">
          <div className="rounded-b-lg bg-[#2A2A2A] px-4 pb-4 pt-4">
            <div className="flex h-[226px] items-center justify-center">
              {selectedImage ? (
                // eslint-disable-next-line @next/next/no-img-element -- Local object URLs are browser-only previews.
                <img
                  alt={title}
                  className="h-full w-full object-contain"
                  src={selectedImage.url}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-lg bg-white/5">
                  <ImagePlus className="size-10 text-white/45" />
                </div>
              )}
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {thumbnailSlots.slice(0, 8).map((image, index) => (
                <button
                  key={image?.id ?? `empty-${index}`}
                  className={cn(
                    "relative flex h-14 items-center justify-center rounded-lg border bg-[#1A1A1A] p-1",
                    selectedImageIndex === index && image
                      ? "border-[#0B6B4F]"
                      : "border-transparent",
                  )}
                  disabled={!image}
                  onClick={() => onSelectImage(index)}
                  type="button"
                >
                  {image ? (
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={`حذف صورة ${index + 1}`}
                      className="absolute start-1 top-1 z-20 flex size-5 items-center justify-center rounded bg-red-500 text-white shadow-sm transition hover:bg-red-600"
                      onClick={(event) => {
                        event.stopPropagation();
                        onRemoveImage(index);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          event.stopPropagation();
                          onRemoveImage(index);
                        }
                      }}
                    >
                      <X className="size-3" />
                    </span>
                  ) : null}
                  <span className="absolute end-1 top-1 z-10 flex size-5 items-center justify-center rounded bg-[#0B6B4F] text-[10px] font-black text-white">
                    {index + 1}
                  </span>
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element -- Local object URLs are browser-only previews.
                    <img
                      alt=""
                      className="h-full w-full object-contain"
                      src={image.url}
                    />
                  ) : (
                    <ImagePlus className="size-5 text-white/35" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4">
            <AppPreviewPriceHeader
              discount={currentDiscountLabel}
              oldPrice={oldPriceText ? `EGP ${oldPriceText}` : ""}
              price={priceText}
            />

            <h2 className="mt-4 min-w-0 text-right text-[23px] font-black leading-tight">
              {title}
            </h2>
            <div className="mt-3 flex items-center justify-start gap-2">
              <span
                className={cn(
                  "rounded-lg px-2.5 py-2 text-xs font-black",
                  statusPillClass,
                )}
              >
                {statusText}
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-[#2A2A2A] px-2.5 py-2 text-xs font-black">
                {activeCategory.label[language]}
                <BadgeCheck className="size-3.5 text-[#0B6B4F]" />
              </span>
            </div>

            <div className="mt-5 rounded-lg border border-white/10 bg-[#2A2A2A] p-3">
              <h3 className="text-right text-[22px] font-black leading-7">
                الاختيار المحدد
              </h3>
              <div className="mt-3 grid gap-2.5 text-sm">
                <div
                  className="grid grid-cols-[1fr_auto] items-center gap-3"
                  dir="ltr"
                >
                  <span className="flex min-w-0 items-center gap-2 text-left">
                    <span className="font-black text-[#0B6B4F]">
                      {priceText}
                    </span>
                    {oldPriceText ? (
                      <span className="truncate text-xs font-bold text-white/45 line-through">
                        EGP {oldPriceText}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-right font-bold text-white/55">السعر</span>
                </div>
                <div
                  className="grid grid-cols-[1fr_auto] items-center gap-3"
                  dir="ltr"
                >
                  <span className={cn("text-left font-black", statusToneClass)}>
                    {statusText}
                  </span>
                  <span className="text-right font-bold text-white/55">
                    {t.stock}
                  </span>
                </div>
                <div
                  className="grid grid-cols-[1fr_auto] items-center gap-3"
                  dir="ltr"
                >
                  <span className={cn("text-left font-black", quantityToneClass)}>
                    {stockText}
                  </span>
                  <span className="text-right font-bold text-white/55">
                    {t.availableQuantity}
                  </span>
                </div>
                <p className={cn("pt-0.5 text-right text-xs font-semibold leading-5", stockDescriptionClass)}>
                  {stockDescription}
                </p>
              </div>
            </div>

            <AppPreviewVariants
              availableVariants={selectedVariants}
              fields={activeFields}
              language={language}
              onSelect={(field, value) =>
                setPreviewVariants((currentVariants) => ({
                  ...currentVariants,
                  [field.id]: [value],
                }))
              }
              selectedVariants={previewSelectedVariants}
            />

            <div className="mt-5 rounded-lg border border-white/10 bg-[#2A2A2A] p-3">
              <h3 className="text-right text-base font-black">الوصف</h3>
              <p className="mt-2 text-right text-sm font-semibold leading-6 text-white/55">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg border bg-background p-3">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <FileText className="size-4 text-primary" />
          {t.selectedData}
        </div>
        <div className="grid gap-2 text-sm">
          <SummaryRow
            label={t.category}
            value={activeCategory.label[language]}
          />
          <SummaryRow label={t.region} value={selectedRegion} />
          {selectedData.map((item) => (
            <SummaryRow key={`${item.label}-${item.value}`} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}

function AppPreviewPriceHeader({
  discount,
  oldPrice,
  price,
}: {
  discount: string;
  oldPrice: string;
  price: string;
}) {
  const priceParts = price.split(/\s+/);
  const currency = priceParts[0] ?? "";
  const amount = priceParts.slice(1).join(" ") || price;

  return (
    <div className="w-full rounded-lg border border-white/10 bg-[#2A2A2A] p-2 shadow-sm">
      <div className="flex items-center gap-2">
        {discount ? (
          <span className="flex h-11 shrink-0 items-center justify-center rounded-lg bg-[#FFA000] px-3 text-xs font-black text-black shadow-[0_6px_12px_rgba(255,160,0,0.22)]">
            {discount}
          </span>
        ) : null}
        <div className="flex min-h-11 flex-1 items-center justify-start gap-2 rounded-lg bg-[#0B6B4F]/20 px-3 py-2">
          <span className="min-w-0 truncate text-xl font-black">
            <span className="text-[#0B6B4F]">{currency}</span>{" "}
            <span className="text-white">{amount}</span>
          </span>
          {oldPrice ? (
            <span className="min-w-0 truncate text-sm font-bold text-white/45 line-through">
              {oldPrice}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function AppPreviewVariants({
  availableVariants,
  fields,
  language,
  onSelect,
  selectedVariants,
}: {
  availableVariants: Record<string, string[]>;
  fields: VariantField[];
  language: Language;
  onSelect: (field: VariantField, value: string) => void;
  selectedVariants: Record<string, string[]>;
}) {
  if (!fields.length) {
    return null;
  }

  const visibleFields = fields
    .map((field) => {
      const availableValues = availableVariants[field.id] ?? [];
      const selectedValues = selectedVariants[field.id] ?? [];

      return { availableValues, field, selectedValues };
    })
    .filter((item) => item.availableValues.length > 0);

  if (!visibleFields.length) {
    return null;
  }

  return (
    <div className="mt-5 grid gap-5">
      {visibleFields.slice(0, 3).map(({ availableValues, field, selectedValues }) => {
        const visibleOptions = field.options.filter((option) =>
          availableValues.includes(option.value),
        );

        return (
          <div key={field.id}>
            <div className="mb-2 text-right text-xl font-black leading-6 text-white">
              {field.label[language]}
            </div>
            {field.input === "swatch" ? (
              <div className="flex flex-wrap justify-start gap-3">
                {visibleOptions.map((option) => {
                  const disabled = Boolean(option.disabled);
                  const selected = selectedValues.includes(option.value);

                  return (
                    <button
                      key={option.value}
                      aria-label={option.label[language]}
                      aria-pressed={selected}
                      className={cn(
                        "flex h-10 w-14 items-center justify-center rounded-lg border-2 p-1 transition",
                        disabled
                          ? "border-white/10 opacity-35 grayscale"
                          : selected
                          ? "border-[#0B6B4F] ring-2 ring-[#0B6B4F]/25"
                          : "border-white/10 hover:border-white/30",
                      )}
                      disabled={disabled}
                      onClick={() => onSelect(field, option.value)}
                      type="button"
                    >
                      <span
                        className="flex h-7 w-10 items-center justify-center rounded-md"
                        style={{ backgroundColor: option.color ?? "#e2e8f0" }}
                      >
                        {selected ? (
                          <Check className="size-4 text-white drop-shadow" />
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div
                className={cn(
                  "grid gap-2",
                  visibleOptions.length <= 2
                    ? "grid-cols-2"
                    : visibleOptions.length === 3
                      ? "grid-cols-3"
                      : "grid-cols-4",
                )}
              >
                {visibleOptions.map((option) => {
                  const disabled = Boolean(option.disabled);
                  const selected = selectedValues.includes(option.value);

                  return (
                    <button
                      key={option.value}
                      aria-pressed={selected}
                      className={cn(
                        "flex h-10 min-w-0 items-center justify-center gap-1 rounded-lg border px-1.5 text-xs font-black transition",
                        disabled
                          ? "border-white/10 bg-[#2A2A2A] text-white/35"
                          : selected
                          ? "border-[#0B6B4F] bg-[#0B6B4F] text-white"
                          : "border-white/10 bg-[#2A2A2A] text-white/85 hover:border-white/30 hover:bg-white/10",
                      )}
                      disabled={disabled}
                      onClick={() => onSelect(field, option.value)}
                      type="button"
                    >
                      <span className="min-w-0 truncate">
                        {option.label[language]}
                      </span>
                      {selected ? <Check className="size-3.5 shrink-0" /> : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-md bg-muted/40 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[58%] text-start font-medium">{value}</span>
    </div>
  );
}

function ConfirmationDialog({
  activeCategory,
  createdCode,
  form,
  imageNames,
  language,
  onClose,
  selectedSecondaryCategoryName,
  selectedAddonSummary,
  selectedRegion,
  visibilitySummary,
  t,
  priceKeys,
  stockCombinations,
  stockKeys,
  variantCombinations,
  variantDetails,
  variantSummary,
}: {
  activeCategory: ProductCategory;
  createdCode: string;
  form: ProductForm;
  imageNames: string[];
  language: Language;
  onClose: () => void;
  selectedSecondaryCategoryName: string;
  selectedAddonSummary: string;
  selectedRegion: string;
  visibilitySummary: string;
  t: (typeof copy)[Language];
  priceKeys: string[];
  stockCombinations: VariantCombination[];
  stockKeys: string[];
  variantCombinations: VariantCombination[];
  variantDetails: VariantDetails;
  variantSummary: Array<{ label: string; value: string }>;
}) {
  const stockRows = stockKeys.flatMap((key) => {
    const entry = stockCombinations.find(
      (combination) => combination.key === key,
    );

    if (!entry) {
      return [];
    }

    const detail = variantDetailFor(variantDetails, entry.key, form);

    return [
      {
        label: entry.label,
        value: `${t.stock}: ${detail.stock || t.empty} / ${
          isStockAvailable(detail.stock) ? t.available : t.empty
        }`,
      },
    ];
  });
  const variantDetailRows = priceKeys.flatMap((key) => {
    const combination = variantCombinations.find((entry) => entry.key === key);

    if (!combination) {
      return [];
    }

    const detail = variantDetailFor(variantDetails, combination.key, form);

    return [
      {
        label: combination.label,
        value: `${t.price}: ${detail.price || t.empty} / ${t.variantDiscount}: ${
          detail.discount || t.empty
        }`,
      },
    ];
  });
  const rows = [
    ...(createdCode ? [{ label: t.productCode, value: createdCode }] : []),
    { label: t.productName, value: form.name.trim() || t.empty },
    { label: t.description, value: form.description.trim() || t.empty },
    { label: t.image, value: imageNames.join(", ") || t.empty },
    { label: t.region, value: selectedRegion },
    { label: "مناطق الظهور", value: visibilitySummary },
    { label: t.category, value: activeCategory.label[language] },
    { label: t.subcategory, value: selectedSecondaryCategoryName },
    { label: t.addons, value: selectedAddonSummary },
    { label: t.price, value: form.price || t.empty },
    { label: t.stock, value: form.stock || t.empty },
    ...variantSummary,
    ...stockRows,
    ...variantDetailRows,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden overscroll-none bg-foreground/45 px-4 py-6 backdrop-blur-sm">
      <div
        aria-labelledby="confirm-product-title"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-lg border bg-background text-foreground shadow-2xl"
        role="dialog"
      >
        <div className="flex items-center justify-between gap-4 border-b px-5 py-4">
          <div>
            <h2 id="confirm-product-title" className="text-lg font-semibold">
              {t.confirmation}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {createdCode
                ? "Product saved. The code was generated automatically."
                : t.modalNote}
            </p>
          </div>
          <button
            aria-label={t.close}
            className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
            onClick={onClose}
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="max-h-[62vh] overflow-y-auto p-5">
          <div className="grid gap-2">
            {rows.map((row) => (
              <SummaryRow key={`${row.label}-${row.value}`} {...row} />
            ))}
          </div>
        </div>
        <div className="flex justify-end border-t px-5 py-4">
          <Button onClick={onClose} type="button">
            <Check className="size-4" />
            {t.done}
          </Button>
        </div>
      </div>
    </div>
  );
}
