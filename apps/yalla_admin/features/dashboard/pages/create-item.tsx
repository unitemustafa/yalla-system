"use client";

import Link from "next/link";
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
  Trash2,
  Utensils,
  X,
} from "lucide-react";

import { Button, Input, Switch } from "../primitives";
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

type CustomField = {
  id: string;
  name: string;
  values: string[];
  selected: string[];
};

type ProductImage = {
  id: string;
  name: string;
  url: string;
};

const copy = {
  ar: {
    title: "إضافة منتج ذكي",
    subtitle: "لوحة تحكم ديناميكية تضبط المتغيرات حسب صنف المنتج.",
    back: "إلغاء",
    save: "حفظ المنتج",
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
    category: "تصنيف المنتج",
    subcategory: "التصنيف الفرعي",
    categorySignal: "الحقول تتغير تلقائيًا",
    addNewValue: "إضافة قيمة جديدة",
    newValuePlaceholder: "اكتب قيمة جديدة",
    add: "إضافة",
    customFields: "حقول مخصصة",
    fieldName: "اسم الحقل",
    fieldValue: "أول قيمة",
    fieldNamePlaceholder: "مثال: الخامة",
    fieldValuePlaceholder: "مثال: قطن",
    price: "السعر",
    stock: "المخزون",
    available: "متاح للبيع",
    featured: "منتج مميز",
    selectedData: "البيانات المختارة",
    empty: "غير محدد",
    productFallback: "منتج جديد",
    previewCategory: "صنف",
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
    category: "Product category",
    subcategory: "Subcategory",
    categorySignal: "Fields update automatically",
    addNewValue: "Add a new value",
    newValuePlaceholder: "Type a new value",
    add: "Add",
    customFields: "Custom fields",
    fieldName: "Field name",
    fieldValue: "First value",
    fieldNamePlaceholder: "Example: Material",
    fieldValuePlaceholder: "Example: Cotton",
    price: "Price",
    stock: "Stock",
    available: "Available",
    featured: "Featured product",
    selectedData: "Selected data",
    empty: "Not set",
    productFallback: "New product",
    previewCategory: "Category",
    previewStock: "Stock",
    previewPrice: "Price",
    noCustomFields: "Add custom fields for this category.",
    modalNote: "Data is previewed only and is not sent to any backend.",
  },
} satisfies Record<Language, Record<string, string>>;

const inputClass =
  "h-10 w-full rounded-md border border-border bg-input px-3 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

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
        { value: "unisex", label: { ar: "يونيسكس", en: "Unisex" } },
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
    fit: ["unisex"],
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

const initialForm: ProductForm = {
  name: "",
  description: "",
  category: initialCategory,
  subcategory: "baskets",
  price: "120",
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
  return productCategories.find((item) => item.id === category) ?? productCategories[0];
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

export function CreateItemPage() {
  const language: Language = "ar";
  const direction: Direction = "rtl";
  const t = copy[language];
  const [selectedRegion, setSelectedRegion] = useState(t.allRegions);
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string[]>>(
    () => cloneSelections(initialCategory),
  );
  const [customVariantOptions, setCustomVariantOptions] = useState<
    Record<string, VariantOption[]>
  >({});
  const [variantDrafts, setVariantDrafts] = useState<Record<string, string>>({});
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [customFieldDraft, setCustomFieldDraft] = useState({ name: "", value: "" });
  const [customValueDrafts, setCustomValueDrafts] = useState<Record<string, string>>({});
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const productImagesRef = useRef<ProductImage[]>([]);
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  const activeCategory = categoryConfig(form.category);
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

  const customFieldSummary = customFields.map((field) => ({
    label: field.name,
    value: field.selected.join(", ") || t.empty,
  }));

  const selectedData = [...variantSummary, ...customFieldSummary];
  const productName = form.name.trim() || t.productFallback;
  const productDescription = form.description.trim() || t.descriptionPlaceholder;
  const selectedSubcategory = optionLabel(
    activeCategory.subcategories,
    form.subcategory,
    language,
  );
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
    const nextCategory = categoryConfig(category);

    setForm((currentForm) => ({
      ...currentForm,
      category,
      subcategory: nextCategory.subcategories[0]?.value ?? "general",
    }));
    setSelectedVariants(cloneSelections(category));
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

  function addVariantValue(field: VariantField) {
    const key = variantKey(form.category, field.id);
    const rawValue = (variantDrafts[key] ?? "").trim();

    if (!rawValue) {
      return;
    }

    const option: VariantOption = {
      value: createId("custom-option"),
      label: { ar: rawValue, en: rawValue },
    };

    setCustomVariantOptions((currentOptions) => ({
      ...currentOptions,
      [key]: [...(currentOptions[key] ?? []), option],
    }));
    setVariantDrafts((currentDrafts) => ({ ...currentDrafts, [key]: "" }));
    setSelectedVariants((currentSelections) => ({
      ...currentSelections,
      [field.id]:
        field.multiple || field.input === "checkbox" || field.input === "swatch"
          ? [...(currentSelections[field.id] ?? []), option.value]
          : [option.value],
    }));
  }

  function addCustomField() {
    const name = customFieldDraft.name.trim();
    const value = customFieldDraft.value.trim();

    if (!name || !value) {
      return;
    }

    setCustomFields((currentFields) => [
      ...currentFields,
      {
        id: createId("custom-field"),
        name,
        values: [value],
        selected: [value],
      },
    ]);
    setCustomFieldDraft({ name: "", value: "" });
  }

  function toggleCustomFieldValue(fieldId: string, value: string) {
    setCustomFields((currentFields) =>
      currentFields.map((field) => {
        if (field.id !== fieldId) {
          return field;
        }

        const selected = field.selected.includes(value)
          ? field.selected.filter((item) => item !== value)
          : [...field.selected, value];

        return { ...field, selected };
      }),
    );
  }

  function addCustomFieldValue(fieldId: string) {
    const value = (customValueDrafts[fieldId] ?? "").trim();

    if (!value) {
      return;
    }

    setCustomFields((currentFields) =>
      currentFields.map((field) =>
        field.id === fieldId
          ? {
              ...field,
              values: field.values.includes(value) ? field.values : [...field.values, value],
              selected: field.selected.includes(value)
                ? field.selected
                : [...field.selected, value],
            }
          : field,
      ),
    );
    setCustomValueDrafts((currentDrafts) => ({ ...currentDrafts, [fieldId]: "" }));
  }

  function removeCustomField(fieldId: string) {
    setCustomFields((currentFields) =>
      currentFields.filter((field) => field.id !== fieldId),
    );
  }

  function openConfirmation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setConfirmationOpen(true);
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
            {t.title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            {t.subtitle}
          </p>
        </div>

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
          <Button type="submit" className="h-10">
            <Save className="size-4" />
            {t.save}
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
                <SelectShell>
                  <select
                    className={cn(inputClass, "appearance-none pe-9")}
                    onChange={(event) =>
                      changeCategory(event.target.value as CategoryKey)
                    }
                    value={form.category}
                  >
                    {productCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label[language]}
                      </option>
                    ))}
                  </select>
                </SelectShell>
              </LabelText>

              <LabelText label={t.subcategory}>
                <SelectShell>
                  <select
                    className={cn(inputClass, "appearance-none pe-9")}
                    onChange={(event) => updateForm("subcategory", event.target.value)}
                    value={form.subcategory}
                  >
                    {activeCategory.subcategories.map((subcategory) => (
                      <option key={subcategory.value} value={subcategory.value}>
                        {subcategory.label[language]}
                      </option>
                    ))}
                  </select>
                </SelectShell>
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
            <CategorySelector
              categories={productCategories}
              language={language}
              selectedCategory={form.category}
              onChange={changeCategory}
            />

            {activeFields.length ? (
              <div className="grid gap-4">
                {activeFields.map((field) => (
                  <VariantFieldEditor
                    key={field.id}
                    field={field}
                    language={language}
                    onAddValue={() => addVariantValue(field)}
                    onDraftChange={(value) =>
                      setVariantDrafts((currentDrafts) => ({
                        ...currentDrafts,
                        [variantKey(form.category, field.id)]: value,
                      }))
                    }
                    onSelect={selectVariant}
                    onToggle={toggleVariant}
                    selectedValues={selectedVariants[field.id] ?? []}
                    t={t}
                    valueDraft={variantDrafts[variantKey(form.category, field.id)] ?? ""}
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
                  inputMode="numeric"
                  onChange={(event) => updateForm("stock", event.target.value)}
                  value={form.stock}
                />
              </LabelText>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <ToggleRow
                checked={form.available}
                icon={<PackageCheck className="size-4 text-primary" />}
                label={t.available}
                onChange={(checked) => updateForm("available", checked)}
              />
              <ToggleRow
                checked={form.featured}
                icon={<Sparkles className="size-4 text-amber-500" />}
                label={t.featured}
                onChange={(checked) => updateForm("featured", checked)}
              />
            </div>

            <CustomFieldsEditor
              customFieldDraft={customFieldDraft}
              customFields={customFields}
              customValueDrafts={customValueDrafts}
              onAddCustomField={addCustomField}
              onAddCustomFieldValue={addCustomFieldValue}
              onCustomDraftChange={setCustomFieldDraft}
              onCustomValueDraftChange={(fieldId, value) =>
                setCustomValueDrafts((currentDrafts) => ({
                  ...currentDrafts,
                  [fieldId]: value,
                }))
              }
              onRemoveCustomField={removeCustomField}
              onToggleCustomValue={toggleCustomFieldValue}
              t={t}
            />
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
            selectedSubcategory={selectedSubcategory}
            title={productName}
            t={t}
          />
        </aside>
      </div>

      {confirmationOpen ? (
        <ConfirmationDialog
          activeCategory={activeCategory}
          customFields={customFieldSummary}
          form={form}
          imageNames={productImages.map((image, index) => `${index + 1}. ${image.name}`)}
          language={language}
          onClose={() => setConfirmationOpen(false)}
          selectedRegion={selectedRegion}
          selectedSubcategory={selectedSubcategory}
          t={t}
          variantSummary={variantSummary}
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

function SelectShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

function CategorySelector({
  categories,
  language,
  onChange,
  selectedCategory,
}: {
  categories: ProductCategory[];
  language: Language;
  onChange: (category: CategoryKey) => void;
  selectedCategory: CategoryKey;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {categories.map((category) => {
        const Icon = category.icon;
        const selected = selectedCategory === category.id;

        return (
          <button
            key={category.id}
            aria-pressed={selected}
            className={cn(
              "min-h-[96px] rounded-lg border bg-background p-3 text-start shadow-sm transition hover:border-primary/50 hover:bg-accent/50",
              selected && "border-primary bg-primary/10 ring-2 ring-primary/10",
            )}
            onClick={() => onChange(category.id)}
            type="button"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="flex size-9 items-center justify-center rounded-md bg-muted text-primary">
                <Icon className="size-5" />
              </span>
              {selected ? (
                <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-3.5" />
                </span>
              ) : null}
            </div>
            <div className="mt-3 font-semibold">{category.label[language]}</div>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
              {category.description[language]}
            </p>
          </button>
        );
      })}
    </div>
  );
}

function VariantFieldEditor({
  field,
  language,
  onAddValue,
  onDraftChange,
  onSelect,
  onToggle,
  selectedValues,
  t,
  valueDraft,
}: {
  field: VariantField;
  language: Language;
  onAddValue: () => void;
  onDraftChange: (value: string) => void;
  onSelect: (field: VariantField, value: string) => void;
  onToggle: (field: VariantField, value: string) => void;
  selectedValues: string[];
  t: typeof copy[Language];
  valueDraft: string;
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
          <SelectShell>
            <select
              className={cn(inputClass, "appearance-none pe-9")}
              onChange={(event) => onSelect(field, event.target.value)}
              value={selectedValues[0] ?? ""}
            >
              {field.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label[language]}
                </option>
              ))}
            </select>
          </SelectShell>
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

      <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <Input
          className="h-10"
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onAddValue();
            }
          }}
          placeholder={t.newValuePlaceholder}
          value={valueDraft}
        />
        <Button className="h-10" onClick={onAddValue} type="button" variant="outline">
          <Plus className="size-4" />
          {t.add}
        </Button>
      </div>
    </div>
  );
}

function ToggleRow({
  checked,
  icon,
  label,
  onChange,
}: {
  checked: boolean;
  icon: ReactNode;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-3 rounded-lg border bg-background px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-md bg-muted">
          {icon}
        </span>
        <span className="font-medium">{label}</span>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function CustomFieldsEditor({
  customFieldDraft,
  customFields,
  customValueDrafts,
  onAddCustomField,
  onAddCustomFieldValue,
  onCustomDraftChange,
  onCustomValueDraftChange,
  onRemoveCustomField,
  onToggleCustomValue,
  t,
}: {
  customFieldDraft: { name: string; value: string };
  customFields: CustomField[];
  customValueDrafts: Record<string, string>;
  onAddCustomField: () => void;
  onAddCustomFieldValue: (fieldId: string) => void;
  onCustomDraftChange: (draft: { name: string; value: string }) => void;
  onCustomValueDraftChange: (fieldId: string, value: string) => void;
  onRemoveCustomField: (fieldId: string) => void;
  onToggleCustomValue: (fieldId: string, value: string) => void;
  t: typeof copy[Language];
}) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="flex items-center gap-2 font-semibold">
        <Plus className="size-4 text-primary" />
        {t.customFields}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
        <LabelText label={t.fieldName}>
          <Input
            className="h-10"
            onChange={(event) =>
              onCustomDraftChange({ ...customFieldDraft, name: event.target.value })
            }
            placeholder={t.fieldNamePlaceholder}
            value={customFieldDraft.name}
          />
        </LabelText>
        <LabelText label={t.fieldValue}>
          <Input
            className="h-10"
            onChange={(event) =>
              onCustomDraftChange({ ...customFieldDraft, value: event.target.value })
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onAddCustomField();
              }
            }}
            placeholder={t.fieldValuePlaceholder}
            value={customFieldDraft.value}
          />
        </LabelText>
        <Button className="mt-7 h-10" onClick={onAddCustomField} type="button">
          <Plus className="size-4" />
          {t.add}
        </Button>
      </div>

      {customFields.length ? (
        <div className="mt-4 grid gap-3">
          {customFields.map((field) => (
            <div key={field.id} className="rounded-lg border bg-card p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold">{field.name}</div>
                <button
                  aria-label={t.close}
                  className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-destructive"
                  onClick={() => onRemoveCustomField(field.id)}
                  type="button"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {field.values.map((value) => {
                  const selected = field.selected.includes(value);

                  return (
                    <button
                      key={value}
                      aria-pressed={selected}
                      className={cn(
                        "inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm transition",
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "bg-background text-muted-foreground hover:bg-accent",
                      )}
                      onClick={() => onToggleCustomValue(field.id, value)}
                      type="button"
                    >
                      {selected ? <Check className="size-4" /> : null}
                      {value}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                <Input
                  className="h-9"
                  onChange={(event) =>
                    onCustomValueDraftChange(field.id, event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      onAddCustomFieldValue(field.id);
                    }
                  }}
                  placeholder={t.newValuePlaceholder}
                  value={customValueDrafts[field.id] ?? ""}
                />
                <Button
                  className="h-9"
                  onClick={() => onAddCustomFieldValue(field.id)}
                  type="button"
                  variant="outline"
                >
                  <Plus className="size-4" />
                  {t.add}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
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
  selectedSubcategory,
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
  selectedSubcategory: string;
  t: typeof copy[Language];
  title: string;
}) {
  const Icon = activeCategory.icon;
  const priceText = `EGP ${form.price || t.empty}`;
  const stockText = form.stock || "0";
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
                  <span className="font-bold text-white/55">المخزون</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-black text-emerald-400">{stockText}</span>
                  <span className="font-bold text-white/55">الكمية المتاحة</span>
                </div>
                <p className="text-end text-xs font-semibold leading-5 text-white/45">
                  متوفر حاليًا بعدد {stockText} قطعة.
                </p>
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
          <SummaryRow label={t.subcategory} value={selectedSubcategory} />
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
  customFields,
  form,
  imageNames,
  language,
  onClose,
  selectedRegion,
  selectedSubcategory,
  t,
  variantSummary,
}: {
  activeCategory: ProductCategory;
  customFields: Array<{ label: string; value: string }>;
  form: ProductForm;
  imageNames: string[];
  language: Language;
  onClose: () => void;
  selectedRegion: string;
  selectedSubcategory: string;
  t: typeof copy[Language];
  variantSummary: Array<{ label: string; value: string }>;
}) {
  const rows = [
    { label: t.productName, value: form.name.trim() || t.empty },
    { label: t.description, value: form.description.trim() || t.empty },
    { label: t.image, value: imageNames.join(", ") || t.empty },
    { label: t.region, value: selectedRegion },
    { label: t.category, value: activeCategory.label[language] },
    { label: t.subcategory, value: selectedSubcategory },
    { label: t.price, value: form.price || t.empty },
    { label: t.stock, value: form.stock || t.empty },
    ...variantSummary,
    ...customFields,
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
            <p className="mt-1 text-sm text-muted-foreground">{t.modalNote}</p>
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
