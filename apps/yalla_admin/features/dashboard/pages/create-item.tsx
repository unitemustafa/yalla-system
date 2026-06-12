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
  Package,
  PackageCheck,
  Palette,
  Plus,
  Save,
  Shirt,
  SlidersHorizontal,
  Sparkles,
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
import { deliveryCityOptions } from "../reference-data";
import { cn } from "@/lib/utils";

type Language = "ar" | "en";
type Direction = "rtl" | "ltr";
type CategoryKey = "clothing" | "vegetables" | "restaurants" | "other";
type ChoiceInput = "swatch" | "chips" | "radio" | "checkbox" | "select";
type LocalizedText = Record<Language, string>;

type ProductForm = {
  name: string;
  description: string;
  category: CategoryKey;
  subcategory: string;
  price: string;
  stock: string;
  available: boolean;
  featured: boolean;
};

type VariantOption = {
  value: string;
  label: LocalizedText;
  color?: string;
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
    productCode: "Product code",
    basicInfo: "Basic Info",
    variants: "Product Variants",
    attributes: "Options / Attributes",
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
    region: "المنطقة",
    allRegions: "كل المناطق",
    category: "فئة",
    subcategory: "فئة ثانوية",
    chooseCategory: "اختيار الفئة",
    chooseSubcategory: "اختيار الفئة الثانوية",
    categorySubgroups: "الفئات الثانوية",
    visibleCategorySubgroups: "اختار الفئة الثانوية من الفئات الموجودة في صفحة الفئات",
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
    stock: "خصم +",
    available: "متاح للبيع",
    featured: "منتج مميز",
    selectedData: "البيانات المختارة",
    empty: "غير محدد",
    productFallback: "منتج جديد",
    previewCategory: "صنف",
    previewStock: "خصم",
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
    saveError: "Could not save the product. Please try again.",
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
    region: "Region",
    allRegions: "All regions",
    category: "Category",
    subcategory: "Secondary category",
    chooseCategory: "Choose category",
    chooseSubcategory: "Choose secondary category",
    categorySubgroups: "Secondary categories",
    visibleCategorySubgroups: "Choose a secondary category from the categories page",
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
    stock: "Discount +",
    available: "Available",
    featured: "Featured product",
    selectedData: "Selected data",
    empty: "Not set",
    productFallback: "New product",
    previewCategory: "Category",
    previewStock: "Discount",
    previewPrice: "Price",
    noCustomFields: "Add custom fields for this category.",
    modalNote: "Product saved. The code was generated automatically.",
    productCode: "Product code",
  },
} satisfies Record<Language, Record<string, string>>;

const textAreaClass =
  "min-h-[124px] w-full resize-none rounded-md border border-border bg-input px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15";

const productCategories: ProductCategory[] = [
  {
    id: "clothing",
    label: { ar: "ملابس", en: "Clothing" },
    description: { ar: "ألوان، مقاسات، ونوع القطعة", en: "Colors, sizes, and fit type" },
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
    label: { ar: "خضروات", en: "Vegetables" },
    description: { ar: "وزن، حالة التخزين، وطريقة الزراعة", en: "Weight, storage state, and farming type" },
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
    label: { ar: "مطاعم", en: "Restaurants" },
    description: { ar: "حجم الوجبة، الصنف، والإضافات", en: "Meal size, cuisine, and add-ons" },
    icon: Utensils,
    subcategories: [
      { value: "meals", label: { ar: "وجبات", en: "Meals" } },
      { value: "sandwiches", label: { ar: "ساندويتشات", en: "Sandwiches" } },
      { value: "desserts", label: { ar: "حلويات", en: "Desserts" } },
      { value: "drinks", label: { ar: "مشروبات", en: "Drinks" } },
    ],
  },
  {
    id: "other",
    label: { ar: "صنف آخر", en: "Other" },
    description: { ar: "حقول مخصصة حسب المنتج", en: "Custom fields for any product" },
    icon: Package,
    subcategories: [
      { value: "general", label: { ar: "عام", en: "General" } },
      { value: "digital", label: { ar: "رقمي", en: "Digital" } },
      { value: "home", label: { ar: "منزلي", en: "Home" } },
    ],
  },
];

const variantDefinitions: Record<CategoryKey, VariantField[]> = {
  clothing: [
    {
      id: "color",
      label: { ar: "اللون", en: "Color" },
      description: { ar: "اختيار لون أو أكثر", en: "Choose one or more colors" },
      input: "swatch",
      multiple: true,
      options: [
        { value: "emerald", label: { ar: "أخضر", en: "Emerald" }, color: "#10b981" },
        { value: "black", label: { ar: "أسود", en: "Black" }, color: "#020617" },
        { value: "red", label: { ar: "أحمر", en: "Red" }, color: "#ef4444" },
        { value: "cream", label: { ar: "كريمي", en: "Cream" }, color: "#f8ead2" },
      ],
    },
    {
      id: "size",
      label: { ar: "المقاس", en: "Size" },
      description: { ar: "يمكن تحديد عدة مقاسات", en: "Multiple sizes can be selected" },
      input: "chips",
      multiple: true,
      options: [
        { value: "s", label: { ar: "Small", en: "Small" } },
        { value: "m", label: { ar: "Medium", en: "Medium" } },
        { value: "l", label: { ar: "Large", en: "Large" } },
        { value: "xl", label: { ar: "X-Large", en: "X-Large" } },
      ],
    },
    {
      id: "fit",
      label: { ar: "النوع", en: "Type" },
      description: { ar: "طريقة عرض المنتج للعميل", en: "How this item is grouped for customers" },
      input: "radio",
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
      description: { ar: "الوحدة التي تظهر في التطبيق", en: "The unit shown in the customer app" },
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
      description: { ar: "إضافات اختيارية للعميل", en: "Optional add-ons for customers" },
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
  stock: "0",
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
  return productCategories.find((item) => item.id === category) ?? productCategories[0];
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
  return price
    .replace(/\s*EGP\s*$/i, "")
    .replace(/\s*\u062c\u0646\u064a\u0647\s*$/i, "")
    .trim() || "0";
}

function stockInputValue(calories: string) {
  return calories.match(/\d+/)?.[0] ?? "0";
}

function productFormFromItem(item: ItemRow): ProductForm {
  return {
    name: item.name,
    description: item.description,
    category: categoryKeyFromItem(item),
    subcategory: item.subcategory || initialSecondaryCategory,
    price: priceInputValue(item.price),
    stock: stockInputValue(item.calories),
    available: item.active,
    featured: item.featured !== "\u0644\u0627",
  };
}

function optionLabel(
  options: VariantOption[],
  value: string,
  language: Language,
) {
  return options.find((option) => option.value === value)?.label[language] ?? value;
}

function variantKey(category: CategoryKey, fieldId: string) {
  return `${category}.${fieldId}`;
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 10000)}`;
}

function uniqueAddonCategories(rows: AddonRow[]) {
  return Array.from(new Set(rows.map((addon) => addon.category).filter(Boolean)));
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

function addonSelectionSummary({
  enabled,
  selectedAddons,
  t,
  language,
}: {
  enabled: boolean;
  selectedAddons: AddonRow[];
  t: typeof copy[Language];
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
  const pageTitle = isEditing ? "\u062a\u0639\u062f\u064a\u0644 \u0645\u0646\u062a\u062c" : t.title;
  const pageSubtitle = isEditing
    ? "\u0639\u062f\u0651\u0644 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0645\u0646\u062a\u062c \u0648\u0627\u0644\u0633\u0639\u0631 \u0648\u0627\u0644\u062a\u0635\u0646\u064a\u0641."
    : t.subtitle;
  const [selectedRegion, setSelectedRegion] = useState(t.allRegions);
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string[]>>(
    () => cloneSelections(initialCategory),
  );
  const [customVariantOptions, setCustomVariantOptions] = useState<
    Record<string, VariantOption[]>
  >({});
  const [variantValueField, setVariantValueField] = useState<VariantField | null>(
    null,
  );
  const [variantValueName, setVariantValueName] = useState("");
  const [variantColorValue, setVariantColorValue] = useState("#10b981");
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const productImagesRef = useRef<ProductImage[]>([]);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [createdCode, setCreatedCode] = useState("");
  const [saveError, setSaveError] = useState("");
  const [editProductCode, setEditProductCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [addonsDialogOpen, setAddonsDialogOpen] = useState(false);
  const [productAddons, setProductAddons] = useState<ProductAddonSelection>({
    enabled: true,
    category: "all",
    selectedIds: [],
  });

  useEffect(() => {
    if (!editItemId) {
      return;
    }

    let alive = true;

    async function loadEditableItem() {
      setSaveError("");

      try {
        const response = await fetch("/api/dashboard/items");

        if (!response.ok) {
          throw new Error("Failed to load product");
        }

        const data = (await response.json()) as { items: ItemRow[] };
        const item = data.items.find((currentItem) => currentItem.id === editItemId);

        if (!alive) {
          return;
        }

        if (!item) {
          setSaveError("\u062a\u0639\u0630\u0631 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u0645\u0646\u062a\u062c.");
          return;
        }

        const nextForm = productFormFromItem(item);
        setForm(nextForm);
        setSelectedVariants(cloneSelections(nextForm.category));
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
          setSaveError("\u062a\u0639\u0630\u0631 \u062a\u062d\u0645\u064a\u0644 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0645\u0646\u062a\u062c.");
        }
      }
    }

    loadEditableItem();

    return () => {
      alive = false;
    };
  }, [editItemId]);

  const activeCategory = categoryConfig(form.category);
  const addonCategoryOptions = useMemo(() => uniqueAddonCategories(addonRows), []);
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
    categoryRows.find((row) => row.name === form.subcategory) ?? categoryRows[0];
  const selectedSecondaryCategoryName = selectedSecondaryCategory
    ? categoryRowDisplayName(selectedSecondaryCategory)
    : form.subcategory || t.empty;
  const selectedSecondaryCategorySections =
    categoryRowSections(selectedSecondaryCategory) || t.empty;
  const activeFields = useMemo(
    () =>
      variantDefinitions[form.category].map((field) => ({
        ...field,
        options: [
          ...field.options,
          ...(customVariantOptions[variantKey(form.category, field.id)] ?? []),
        ],
      })),
    [customVariantOptions, form.category],
  );

  const variantSummary = useMemo(
    () =>
      activeFields.map((field) => {
        const selectedValues = selectedVariants[field.id] ?? [];

        return {
          label: field.label[language],
          value:
            selectedValues
              .map((value) => optionLabel(field.options, value, language))
              .filter(Boolean)
              .join(", ") || t.empty,
        };
      }),
    [activeFields, language, selectedVariants, t.empty],
  );

  const selectedData = [
    {
      label: t.subcategory,
      value: selectedSecondaryCategoryName,
    },
    { label: t.addons, value: selectedAddonSummary },
    ...variantSummary,
  ];
  const productName = form.name.trim() || t.productFallback;
  const productDescription = form.description.trim() || t.descriptionPlaceholder;
  const selectedProductImage = productImages[selectedImageIndex];

  useEffect(
    () => {
      productImagesRef.current = productImages;
    },
    [productImages],
  );

  useEffect(
    () => () => {
      productImagesRef.current.forEach((image) => URL.revokeObjectURL(image.url));
    },
    [],
  );

  function updateForm<Key extends keyof ProductForm>(key: Key, value: ProductForm[Key]) {
    setForm((currentForm) => ({ ...currentForm, [key]: value }));
  }

  function changeCategory(category: CategoryKey) {
    setForm((currentForm) => ({
      ...currentForm,
      category,
    }));
    setSelectedVariants((currentSelections) =>
      form.category === category ? currentSelections : cloneSelections(category),
    );
  }

  function changeSecondaryCategory(subcategory: string) {
    updateForm("subcategory", subcategory);
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
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    setProductImages((currentImages) => {
      if (!currentImages.length) {
        setSelectedImageIndex(0);
      }

      return [...currentImages, ...nextImages];
    });
    event.target.value = "";
  }

  function removeProductImage(index: number) {
    setProductImages((currentImages) => {
      const imageToRemove = currentImages[index];

      if (!imageToRemove) {
        return currentImages;
      }

      URL.revokeObjectURL(imageToRemove.url);
      const nextImages = currentImages.filter((_, imageIndex) => imageIndex !== index);

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

  function openVariantValueDialog(field: VariantField) {
    setVariantValueField(field);
    setVariantValueName("");
    setVariantColorValue(
      field.input === "swatch"
        ? field.options.find((option) => option.color)?.color ?? "#10b981"
        : "",
    );
  }

  function closeVariantValueDialog() {
    setVariantValueField(null);
    setVariantValueName("");
    setVariantColorValue("#10b981");
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

    setSaving(true);
    setSaveError("");

    try {
      const endpoint = editItemId
        ? `/api/dashboard/items/${encodeURIComponent(editItemId)}`
        : "/api/dashboard/items";
      const response = await fetch(endpoint, {
        method: editItemId ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          image: selectedProductImage?.url.startsWith("http")
            ? selectedProductImage.url
            : undefined,
          name: productName,
          description: productDescription,
          category: activeCategory.label[language],
          subcategory: selectedSecondaryCategoryName,
          calories: form.stock ? `Discount: ${form.stock}%` : "",
          price: form.price,
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
      className="px-4 py-6 sm:px-6 lg:px-8"
      dir={direction}
      onSubmit={openConfirmation}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <Sparkles className="size-4" />
            <span>{t.categorySignal}</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold leading-8 md:text-3xl md:leading-9">
            {pageTitle}
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            {pageSubtitle}
          </p>
        </div>

        {saveError ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200">
            {saveError}
          </div>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <RegionSelect
            label={t.region}
            onChange={setSelectedRegion}
            value={selectedRegion}
          />
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

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_376px]">
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
                    className={textAreaClass}
                    onChange={(event) => updateForm("description", event.target.value)}
                    placeholder={t.descriptionPlaceholder}
                    value={form.description}
                  />
                </LabelText>
              </div>

              <div className="grid gap-3">
                <div className="text-sm font-medium">{t.image}</div>
                <label className="group relative flex min-h-[220px] cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/30 text-center transition hover:border-primary/50 hover:bg-accent/50">
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
                      className="h-full max-h-[260px] w-full object-cover"
                      src={selectedProductImage.url}
                    />
                  ) : (
                    <span className="flex flex-col items-center gap-3 px-6 text-sm text-muted-foreground">
                      <span className="flex size-12 items-center justify-center rounded-lg bg-background shadow-sm">
                        <ImagePlus className="size-6 text-primary" />
                      </span>
                      <span className="font-medium text-foreground">{t.uploadImage}</span>
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

            <div className="grid gap-4 md:grid-cols-2">
              <LabelText label={t.category}>
                <div
                  aria-label={t.category}
                  className="grid grid-cols-2 gap-3"
                  role="radiogroup"
                >
                  {productCategories.map((category) => {
                    const CategoryIcon = category.icon;
                    const selected = form.category === category.id;

                    return (
                      <button
                        key={category.id}
                        aria-checked={selected}
                        className={cn(
                          "flex min-h-20 min-w-0 items-center gap-3 rounded-lg border bg-card p-3 text-start text-sm shadow-sm shadow-black/5 outline-none ring-1 ring-transparent transition hover:-translate-y-0.5 hover:border-primary/35 hover:bg-accent/45 hover:shadow-md focus:border-primary focus:ring-2 focus:ring-primary/15 dark:shadow-none",
                          selected &&
                            "border-primary bg-primary/10 text-primary ring-2 ring-primary/20 shadow-primary/10",
                        )}
                        onClick={() => changeCategory(category.id)}
                        role="radio"
                        type="button"
                      >
                        <span
                          className={cn(
                            "flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition",
                            selected && "bg-primary text-primary-foreground",
                          )}
                        >
                          <CategoryIcon className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold text-foreground">
                            {category.label[language]}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                            {category.description[language]}
                          </span>
                        </span>
                        {selected ? (
                          <Check className="size-4 shrink-0 text-primary" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </LabelText>

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
            {activeFields.length ? (
              <div className="grid gap-4">
                {activeFields.map((field) => (
                  <VariantFieldEditor
                    key={field.id}
                    field={field}
                    language={language}
                    onOpenAddValue={() => openVariantValueDialog(field)}
                    onSelect={selectVariant}
                    onToggle={toggleVariant}
                    selectedValues={selectedVariants[field.id] ?? []}
                    t={t}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed bg-muted/20 p-5 text-sm text-muted-foreground">
                {t.noCustomFields}
              </div>
            )}
          </Section>

          <Section
            icon={<SlidersHorizontal className="size-4" />}
            title={t.attributes}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <LabelText label={t.price}>
                <Input
                  className="h-10"
                  inputMode="decimal"
                  onChange={(event) => updateForm("price", event.target.value)}
                  value={form.price}
                />
              </LabelText>
              <LabelText label={t.stock}>
                <Input
                  className="h-10"
                  inputMode="decimal"
                  onChange={(event) => updateForm("stock", event.target.value)}
                  value={form.stock}
                />
              </LabelText>
            </div>

          </Section>
        </div>

        <aside className="min-w-0 xl:sticky xl:top-20 xl:self-start">
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
            selectedRegion={selectedRegion}
            selectedVariants={selectedVariants}
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
          imageNames={productImages.map((image, index) => `${index + 1}. ${image.name}`)}
          language={language}
          onClose={() => setConfirmationOpen(false)}
          selectedSecondaryCategoryName={selectedSecondaryCategoryName}
          selectedRegion={selectedRegion}
          selectedAddonSummary={selectedAddonSummary}
          t={t}
          variantSummary={variantSummary}
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

function RegionSelect({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (region: string) => void;
  value: string;
}) {
  return (
    <label className="relative inline-flex h-10 w-full min-w-0 sm:w-[190px]">
      <span className="sr-only">{label}</span>
      <MapPin className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <select
        aria-label={label}
        className="h-10 w-full appearance-none rounded-md border border-border bg-background pe-9 ps-9 text-sm font-medium text-muted-foreground shadow-sm outline-none transition hover:bg-accent hover:text-accent-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value={copy.ar.allRegions}>{copy.ar.allRegions}</option>
        {deliveryCityOptions.map((region) => (
          <option key={region} value={region}>
            {region}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </label>
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

function LabelText({ children, label }: { children: ReactNode; label: string }) {
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
  t: typeof copy[Language];
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-foreground/45 px-4 py-6 backdrop-blur-sm">
      <div
        aria-labelledby="product-category-title"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg border bg-background text-foreground shadow-2xl"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div>
            <h2 id="product-category-title" className="text-lg font-semibold">
              {t.categorySubgroups}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
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

        <div className="max-h-[66vh] overflow-y-auto p-5">
          <div className="grid gap-3 md:grid-cols-2">
            {categories.map((category) => {
              const selected = selectedSubcategory === category.name;
              const categoryName = categoryRowDisplayName(category);
              const sections = categoryRowSections(category);

              return (
                <button
                  key={category.index}
                  aria-pressed={selected}
                  className={cn(
                    "flex w-full items-start justify-between gap-3 rounded-lg border bg-card p-3 text-start shadow-sm transition hover:border-primary/50 hover:bg-accent/40",
                    selected && "border-primary bg-primary/10 ring-2 ring-primary/10",
                  )}
                  onClick={() => onChange(category.name)}
                  type="button"
                >
                  <span className="flex min-w-0 items-start gap-3">
                    <span className="size-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element -- Dashboard seed data uses remote category thumbnails. */}
                      <img
                        alt=""
                        className="h-full w-full object-cover"
                        src={category.image}
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">
                        {categoryName}
                      </span>
                      {sections ? (
                        <span className="mt-2 flex flex-wrap gap-1.5">
                          {category.sections.map((section) => (
                            <span
                              key={`${category.index}-${section}`}
                              className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"
                            >
                              {section}
                            </span>
                          ))}
                        </span>
                      ) : null}
                    </span>
                  </span>
                  {selected ? (
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-3.5" />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end border-t px-5 py-4">
          <Button onClick={onClose} type="button">
            <Check className="size-4" />
            {t.apply}
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
  t: typeof copy[Language];
}) {
  const isColorField = field.input === "swatch";
  const canSubmit = name.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-foreground/45 px-4 py-6 backdrop-blur-sm">
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
              <div className="mb-3 text-sm font-semibold">{t.popularColors}</div>
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
  onSelect,
  onToggle,
  selectedValues,
  t,
}: {
  field: VariantField;
  language: Language;
  onOpenAddValue: () => void;
  onSelect: (field: VariantField, value: string) => void;
  onToggle: (field: VariantField, value: string) => void;
  selectedValues: string[];
  t: typeof copy[Language];
}) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
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
      </div>

      <div className="mt-4">
        {field.input === "swatch" ? (
          <div className="flex flex-wrap gap-3">
            {field.options.map((option) => {
              const selected = selectedValues.includes(option.value);

              return (
                <button
                  key={option.value}
                  aria-label={option.label[language]}
                  aria-pressed={selected}
                  className={cn(
                    "flex h-11 min-w-11 items-center justify-center rounded-full border-2 bg-background p-1 transition",
                    selected ? "border-primary ring-2 ring-primary/20" : "border-border",
                  )}
                  onClick={() => onToggle(field, option.value)}
                  type="button"
                >
                  <span
                    className="flex size-8 items-center justify-center rounded-full border border-black/10"
                    style={{ backgroundColor: option.color ?? "#e2e8f0" }}
                  >
                    {selected ? <Check className="size-4 text-white drop-shadow" /> : null}
                  </span>
                </button>
              );
            })}
          </div>
        ) : field.input === "select" ? (
          <AppSelect
            ariaLabel={field.label[language]}
            className="h-10 bg-input text-foreground"
            contentClassName="z-[60]"
            onValueChange={(value) => onSelect(field, value)}
            options={field.options.map((option) => ({
              value: option.value,
              label: option.label[language],
            }))}
            value={selectedValues[0] ?? field.options[0]?.value}
          />
        ) : field.input === "radio" ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {field.options.map((option) => (
              <label
                key={option.value}
                className={cn(
                  "flex min-h-10 cursor-pointer items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm transition hover:bg-accent/60",
                  selectedValues.includes(option.value) &&
                    "border-primary bg-primary/10 text-primary",
                )}
              >
                <input
                  checked={selectedValues.includes(option.value)}
                  className="size-4 accent-[var(--primary)]"
                  name={field.id}
                  onChange={() => onSelect(field, option.value)}
                  type="radio"
                />
                <span>{option.label[language]}</span>
              </label>
            ))}
          </div>
        ) : field.input === "checkbox" ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {field.options.map((option) => (
              <label
                key={option.value}
                className={cn(
                  "flex min-h-10 cursor-pointer items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm transition hover:bg-accent/60",
                  selectedValues.includes(option.value) &&
                    "border-primary bg-primary/10 text-primary",
                )}
              >
                <input
                  checked={selectedValues.includes(option.value)}
                  className="size-4 rounded accent-[var(--primary)]"
                  onChange={() => onToggle(field, option.value)}
                  type="checkbox"
                />
                <span>{option.label[language]}</span>
              </label>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {field.options.map((option) => {
              const selected = selectedValues.includes(option.value);

              return (
                <button
                  key={option.value}
                  aria-pressed={selected}
                  className={cn(
                    "inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-medium transition",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                  onClick={() => onToggle(field, option.value)}
                  type="button"
                >
                  {selected ? <Check className="size-4" /> : null}
                  {option.label[language]}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4">
        <Button className="h-10" onClick={onOpenAddValue} type="button" variant="outline">
          <Plus className="size-4" />
          {t.addNewValue}
        </Button>
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
  t: typeof copy[Language];
}) {
  const visibleAddons = addons.filter(
    (addon) => selection.category === "all" || addon.category === selection.category,
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
        new Set([...selection.selectedIds, ...visibleAddons.map((addon) => addon.id)]),
      ),
    });
  }

  function clearSelectedAddons() {
    updateSelection({ selectedIds: [] });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-foreground/45 px-4 py-6 backdrop-blur-sm">
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
              {selectedCount ? `${selectedCount} ${t.selectedAddons}` : t.noAddonsSelected}
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
                    selected && "border-primary bg-primary/10 ring-2 ring-primary/10",
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
  t: typeof copy[Language];
  title: string;
}) {
  const Icon = activeCategory.icon;
  const priceText = `EGP ${form.price || t.empty}`;
  const discountText = form.stock ? `${form.stock}%` : "0%";
  const statusText = form.available ? "متوفر" : t.empty;
  const selectedImage = productImages[selectedImageIndex];
  const thumbnailSlots = productImages.length ? productImages : [null, null, null, null];

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
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
                      ? "border-primary"
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
                  <span className="absolute end-1 top-1 z-10 flex size-5 items-center justify-center rounded bg-primary text-[10px] font-black text-white">
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
            <div className="rounded-lg border border-white/10 bg-[#2A2A2A] p-2">
              <div className="flex items-center gap-2">
                {form.featured ? (
                  <span className="flex h-11 items-center rounded-lg bg-amber-500 px-3 text-xs font-black text-black">
                    مميز
                  </span>
                ) : null}
                <div className="flex min-h-11 flex-1 items-center justify-between rounded-lg bg-primary/15 px-3 py-2">
                  <span className="text-xl font-black text-white">{priceText}</span>
                </div>
              </div>
            </div>

            <h2 className="mt-4 min-w-0 text-end text-[23px] font-black leading-tight">
              {title}
            </h2>
            <div className="mt-3 flex items-center justify-end gap-2">
              <span className="rounded-lg bg-emerald-500/15 px-2.5 py-2 text-xs font-black text-emerald-400">
                {statusText}
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-[#2A2A2A] px-2.5 py-2 text-xs font-black">
                {activeCategory.label[language]}
                <BadgeCheck className="size-3.5 text-primary" />
              </span>
            </div>

            <div className="mt-5 rounded-lg border border-white/10 bg-[#2A2A2A] p-3">
              <h3 className="text-end text-base font-black">الاختيار المحدد</h3>
              <div className="mt-3 grid gap-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-black text-primary">{priceText}</span>
                  <span className="font-bold text-white/55">السعر</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-black text-emerald-400">{statusText}</span>
                  <span className="font-bold text-white/55">الحالة</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-black text-primary">{discountText}</span>
                  <span className="font-bold text-white/55">خصم +</span>
                </div>
              </div>
            </div>

            <AppPreviewVariants
              fields={activeFields}
              language={language}
              selectedVariants={selectedVariants}
            />

            <div className="mt-5 rounded-lg border border-white/10 bg-[#2A2A2A] p-3">
              <h3 className="text-end text-base font-black">الوصف</h3>
              <p className="mt-2 text-end text-sm font-semibold leading-6 text-white/55">
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
          <SummaryRow label={t.category} value={activeCategory.label[language]} />
          <SummaryRow label={t.region} value={selectedRegion} />
          {selectedData.map((item) => (
            <SummaryRow key={`${item.label}-${item.value}`} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}

function AppPreviewVariants({
  fields,
  language,
  selectedVariants,
}: {
  fields: VariantField[];
  language: Language;
  selectedVariants: Record<string, string[]>;
}) {
  if (!fields.length) {
    return null;
  }

  const visibleFields = fields.filter((field) => field.id !== "fit");

  return (
    <div className="mt-5 grid gap-5">
      {visibleFields.slice(0, 3).map((field) => {
        const selectedValues = selectedVariants[field.id] ?? [];

        return (
          <div key={field.id}>
            <div className="mb-2 text-end text-xl font-black leading-6 text-white">
              {field.label[language]}
            </div>
            {field.input === "swatch" ? (
              <div className="flex flex-wrap justify-end gap-3">
                {field.options.map((option) => {
                  const selected = selectedValues.includes(option.value);

                  return (
                    <span
                      key={option.value}
                      className={cn(
                        "flex size-[42px] items-center justify-center rounded-full border-2 p-1 transition",
                        selected
                          ? "border-primary ring-2 ring-primary/25"
                          : "border-white/10",
                      )}
                    >
                      <span
                        className="flex size-8 items-center justify-center rounded-full"
                        style={{ backgroundColor: option.color ?? "#e2e8f0" }}
                      >
                        {selected ? <Check className="size-4 text-white drop-shadow" /> : null}
                      </span>
                    </span>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {field.options.map((option) => {
                  const selected = selectedValues.includes(option.value);

                  return (
                    <span
                      key={option.value}
                      className={cn(
                        "flex h-10 min-w-0 items-center justify-center gap-1 rounded-lg border px-2 text-xs font-black",
                        selected
                          ? "border-primary bg-primary text-white"
                          : "border-white/10 bg-[#2A2A2A] text-white/60",
                      )}
                    >
                      <span className="min-w-0 truncate">{option.label[language]}</span>
                      {selected ? <Check className="size-3.5 shrink-0" /> : null}
                    </span>
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
  t,
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
  t: typeof copy[Language];
  variantSummary: Array<{ label: string; value: string }>;
}) {
  const rows = [
    ...(createdCode ? [{ label: t.productCode, value: createdCode }] : []),
    { label: t.productName, value: form.name.trim() || t.empty },
    { label: t.description, value: form.description.trim() || t.empty },
    { label: t.image, value: imageNames.join(", ") || t.empty },
    { label: t.region, value: selectedRegion },
    { label: t.category, value: activeCategory.label[language] },
    { label: t.subcategory, value: selectedSecondaryCategoryName },
    { label: t.addons, value: selectedAddonSummary },
    { label: t.price, value: form.price || t.empty },
    { label: t.stock, value: form.stock ? `${form.stock}%` : t.empty },
    ...variantSummary,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 px-4 py-6 backdrop-blur-sm">
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
