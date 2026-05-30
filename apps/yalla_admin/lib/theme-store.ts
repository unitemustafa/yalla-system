import type {
  ActiveThemeSetting,
  Prisma,
  Theme,
  ThemeAsset,
  ThemeTarget,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { ensureThemeSchema } from "@/lib/theme-schema";

export const themeTargets = ["delivery", "market", "dashboard"] as const;
export const themeOccasions = [
  "default",
  "ramadan",
  "eid-al-fitr",
  "eid-al-adha",
  "national-day",
  "custom",
] as const;
export const themeStatuses = ["active", "inactive"] as const;
export const themeAssetTypes = [
  "banner",
  "splash",
  "logo",
  "decorative",
] as const;

export type ThemeTargetKey = (typeof themeTargets)[number];
export type ThemeOccasion = (typeof themeOccasions)[number];
export type ThemeStatus = (typeof themeStatuses)[number];
export type ThemeAssetType = (typeof themeAssetTypes)[number];

type ThemeWithRelations = Theme & {
  assets: ThemeAsset[];
  targets: ThemeTarget[];
};

type ActiveThemeSettingWithTheme = ActiveThemeSetting & {
  theme: ThemeWithRelations | null;
};

type ThemeColors = {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  button: string;
  headerNavigation: string;
};

type ThemePayload = {
  name?: unknown;
  slug?: unknown;
  description?: unknown;
  occasion?: unknown;
  status?: unknown;
  colors?: unknown;
  darkColors?: unknown;
  welcomeMessage?: unknown;
  autoActivate?: unknown;
  revertToDefault?: unknown;
  startAt?: unknown;
  endAt?: unknown;
  targets?: unknown;
  applyToAll?: unknown;
  assets?: unknown;
};

type ThemeWriteData = {
  name?: string;
  slug?: string;
  description?: string;
  occasion?: ThemeOccasion;
  status?: ThemeStatus;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonColor?: string;
  headerNavigationColor?: string;
  darkPrimaryColor?: string | null;
  darkSecondaryColor?: string | null;
  darkBackgroundColor?: string | null;
  darkTextColor?: string | null;
  darkButtonColor?: string | null;
  darkHeaderNavColor?: string | null;
  welcomeMessage?: string | null;
  autoActivate?: boolean;
  revertToDefault?: boolean;
  startAt?: Date | null;
  endAt?: Date | null;
};

export type AssetCreate = {
  type: ThemeAssetType;
  url: string;
  alt?: string;
  sortOrder: number;
};

type AssetUpdates = {
  replaceTypes: ThemeAssetType[];
  create: AssetCreate[];
};

type NormalizedThemePayload = {
  data: ThemeWriteData;
  targets?: ThemeTargetKey[];
  assetUpdates?: AssetUpdates;
  errors: string[];
  warnings: string[];
};

const themeInclude = {
  assets: {
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  },
  targets: {
    orderBy: { target: "asc" },
  },
} satisfies Prisma.ThemeInclude;

const defaultPalette: ThemeColors = {
  primary: "#155e75",
  secondary: "#0f766e",
  background: "#ffffff",
  text: "#111827",
  button: "#155e75",
  headerNavigation: "#ffffff",
};

const defaultDarkPalette: ThemeColors = {
  primary: "#22d3ee",
  secondary: "#2dd4bf",
  background: "#1b2229",
  text: "#f8fafc",
  button: "#22d3ee",
  headerNavigation: "#1b2229",
};

const defaultLogo =
  "https://bucket.ammenu.com/twins-cafe/tenantsthumbnails/1775081472381-tz4tlty8cn.webp";

const seedThemes = [
  {
    name: "Default Theme",
    slug: "default",
    description: "Production fallback theme for all apps.",
    occasion: "default" as const,
    status: "active" as const,
    colors: defaultPalette,
    darkColors: defaultDarkPalette,
    welcomeMessage: "Welcome to Yalla",
    autoActivate: false,
    revertToDefault: true,
    targets: [...themeTargets],
    assets: [{ type: "logo" as const, url: defaultLogo, alt: "Yalla logo" }],
  },
  {
    name: "Ramadan Theme",
    slug: "ramadan",
    description: "Seasonal Ramadan colors, greeting, banners, and light decorative assets.",
    occasion: "ramadan" as const,
    status: "inactive" as const,
    colors: {
      primary: "#0f766e",
      secondary: "#f59e0b",
      background: "#fff7ed",
      text: "#1f2937",
      button: "#0f766e",
      headerNavigation: "#064e3b",
    },
    darkColors: {
      primary: "#5eead4",
      secondary: "#fbbf24",
      background: "#10231f",
      text: "#f8fafc",
      button: "#14b8a6",
      headerNavigation: "#06251f",
    },
    welcomeMessage: "Ramadan Kareem",
    autoActivate: false,
    revertToDefault: true,
    targets: ["delivery", "market", "dashboard"] as ThemeTargetKey[],
    assets: [] as AssetCreate[],
  },
  {
    name: "Eid Al-Fitr Theme",
    slug: "eid-al-fitr",
    description: "Bright Eid theme for celebratory banners and app branding.",
    occasion: "eid-al-fitr" as const,
    status: "inactive" as const,
    colors: {
      primary: "#7c3aed",
      secondary: "#f59e0b",
      background: "#fdf2f8",
      text: "#111827",
      button: "#7c3aed",
      headerNavigation: "#581c87",
    },
    darkColors: {
      primary: "#c4b5fd",
      secondary: "#fcd34d",
      background: "#1f1733",
      text: "#f8fafc",
      button: "#8b5cf6",
      headerNavigation: "#271344",
    },
    welcomeMessage: "Eid Mubarak",
    autoActivate: false,
    revertToDefault: true,
    targets: ["market", "dashboard"] as ThemeTargetKey[],
    assets: [] as AssetCreate[],
  },
];

let seedPromise: Promise<void> | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asOptionalString(value: unknown) {
  const stringValue = asString(value);
  return stringValue ? stringValue : null;
}

function asBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

function isHexColor(value: string) {
  return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
}

function normalizeHex(value: string) {
  if (!isHexColor(value)) {
    return null;
  }

  if (value.length === 4) {
    const [, r, g, b] = value;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }

  return value.toLowerCase();
}

function parseDateInput(value: unknown) {
  if (value === null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function parseTarget(value: unknown) {
  return themeTargets.find((target) => target === value) ?? null;
}

function parseTargets(payload: ThemePayload, fallback?: ThemeTargetKey[]) {
  if (payload.applyToAll === true) {
    return [...themeTargets];
  }

  if (payload.targets === undefined) {
    return fallback;
  }

  if (!Array.isArray(payload.targets)) {
    return null;
  }

  const targets = Array.from(
    new Set(payload.targets.map(parseTarget).filter(Boolean)),
  ) as ThemeTargetKey[];

  return targets.length > 0 ? targets : null;
}

function parseOccasion(value: unknown, fallback: ThemeOccasion) {
  return themeOccasions.find((occasion) => occasion === value) ?? fallback;
}

function parseStatus(value: unknown, fallback: ThemeStatus) {
  return themeStatuses.find((status) => status === value) ?? fallback;
}

function hexToRgb(hex: string) {
  const normalized = normalizeHex(hex);

  if (!normalized) {
    return null;
  }

  const value = normalized.slice(1);
  return {
    r: Number.parseInt(value.slice(0, 2), 16) / 255,
    g: Number.parseInt(value.slice(2, 4), 16) / 255,
    b: Number.parseInt(value.slice(4, 6), 16) / 255,
  };
}

function luminance(channel: number) {
  return channel <= 0.03928
    ? channel / 12.92
    : Math.pow((channel + 0.055) / 1.055, 2.4);
}

function contrastRatio(foreground: string, background: string) {
  const foregroundRgb = hexToRgb(foreground);
  const backgroundRgb = hexToRgb(background);

  if (!foregroundRgb || !backgroundRgb) {
    return 0;
  }

  const foregroundLuminance =
    luminance(foregroundRgb.r) * 0.2126 +
    luminance(foregroundRgb.g) * 0.7152 +
    luminance(foregroundRgb.b) * 0.0722;
  const backgroundLuminance =
    luminance(backgroundRgb.r) * 0.2126 +
    luminance(backgroundRgb.g) * 0.7152 +
    luminance(backgroundRgb.b) * 0.0722;
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

function accessibilityWarnings(colors: ThemeColors) {
  const warnings: string[] = [];

  if (contrastRatio(colors.text, colors.background) < 4.5) {
    warnings.push("Text and background contrast should be at least 4.5:1.");
  }

  if (contrastRatio(colors.button, colors.background) < 3) {
    warnings.push("Button color is too close to the background color.");
  }

  return warnings;
}

function readColors(
  payloadColors: unknown,
  existing: Theme | null,
  errors: string[],
  createMode: boolean,
) {
  const record = isRecord(payloadColors) ? payloadColors : {};
  const data: Pick<
    ThemeWriteData,
    | "primaryColor"
    | "secondaryColor"
    | "backgroundColor"
    | "textColor"
    | "buttonColor"
    | "headerNavigationColor"
  > = {};
  const colorFields = [
    ["primary", "primaryColor", defaultPalette.primary, "primary color"],
    ["secondary", "secondaryColor", defaultPalette.secondary, "secondary color"],
    ["background", "backgroundColor", defaultPalette.background, "background color"],
    ["text", "textColor", defaultPalette.text, "text color"],
    ["button", "buttonColor", defaultPalette.button, "button color"],
    [
      "headerNavigation",
      "headerNavigationColor",
      defaultPalette.headerNavigation,
      "header/navigation color",
    ],
  ] as const;

  for (const [payloadKey, dataKey, defaultValue, label] of colorFields) {
    const rawValue = record[payloadKey];

    if (!createMode && rawValue === undefined) {
      continue;
    }

    const fallback = existing?.[dataKey] ?? defaultValue;
    const normalized = normalizeHex(asString(rawValue) || fallback);

    if (!normalized) {
      errors.push(`Invalid ${label}. Use a hex color like #155e75.`);
      continue;
    }

    data[dataKey] = normalized;
  }

  return data;
}

function readDarkColors(payloadColors: unknown, errors: string[]) {
  if (payloadColors === undefined) {
    return {};
  }

  if (!isRecord(payloadColors)) {
    errors.push("darkColors must be an object when provided.");
    return {};
  }

  const data: Pick<
    ThemeWriteData,
    | "darkPrimaryColor"
    | "darkSecondaryColor"
    | "darkBackgroundColor"
    | "darkTextColor"
    | "darkButtonColor"
    | "darkHeaderNavColor"
  > = {};
  const colorFields = [
    ["primary", "darkPrimaryColor", "dark primary color"],
    ["secondary", "darkSecondaryColor", "dark secondary color"],
    ["background", "darkBackgroundColor", "dark background color"],
    ["text", "darkTextColor", "dark text color"],
    ["button", "darkButtonColor", "dark button color"],
    ["headerNavigation", "darkHeaderNavColor", "dark header/navigation color"],
  ] as const;

  for (const [payloadKey, dataKey, label] of colorFields) {
    if (!(payloadKey in payloadColors)) {
      continue;
    }

    const rawValue = payloadColors[payloadKey];

    if (rawValue === null || rawValue === "") {
      data[dataKey] = null;
      continue;
    }

    const normalized = normalizeHex(asString(rawValue));

    if (!normalized) {
      errors.push(`Invalid ${label}. Use a hex color like #22d3ee.`);
      continue;
    }

    data[dataKey] = normalized;
  }

  return data;
}

function isAllowedAssetUrl(value: string) {
  return (
    value.startsWith("/") ||
    value.startsWith("data:image/") ||
    /^https?:\/\//i.test(value)
  );
}

function normalizeAssetUrl(value: unknown, errors: string[], label: string) {
  const url = asString(value);

  if (!url) {
    return null;
  }

  if (!isAllowedAssetUrl(url)) {
    errors.push(`${label} must be an absolute URL, a public path, or a data:image URL.`);
    return null;
  }

  return url;
}

function readAssetUpdates(payloadAssets: unknown) {
  const errors: string[] = [];
  const replaceTypes = new Set<ThemeAssetType>();
  const create: AssetCreate[] = [];

  if (payloadAssets === undefined) {
    return { errors, updates: undefined };
  }

  if (!isRecord(payloadAssets)) {
    errors.push("assets must be an object when provided.");
    return { errors, updates: undefined };
  }

  const singleAssetFields = [
    ["bannerUrl", "banner", "banner image"],
    ["splashScreenUrl", "splash", "splash screen image"],
    ["logoUrl", "logo", "seasonal logo"],
  ] as const;

  for (const [payloadKey, type, label] of singleAssetFields) {
    if (!(payloadKey in payloadAssets)) {
      continue;
    }

    replaceTypes.add(type);
    const url = normalizeAssetUrl(payloadAssets[payloadKey], errors, label);

    if (url) {
      create.push({ type, url, sortOrder: 0 });
    }
  }

  if ("decorativeAssets" in payloadAssets) {
    replaceTypes.add("decorative");
    const decorativeAssets = payloadAssets.decorativeAssets;

    if (!Array.isArray(decorativeAssets)) {
      errors.push("decorativeAssets must be an array.");
    } else if (decorativeAssets.length > 8) {
      errors.push("Use 8 decorative assets or fewer to keep the UI lightweight.");
    } else {
      decorativeAssets.forEach((asset, index) => {
        const url = isRecord(asset)
          ? normalizeAssetUrl(asset.url, errors, "decorative asset")
          : normalizeAssetUrl(asset, errors, "decorative asset");

        if (url) {
          create.push({
            type: "decorative",
            url,
            alt: isRecord(asset) ? asOptionalString(asset.alt) ?? undefined : undefined,
            sortOrder: index,
          });
        }
      });
    }
  }

  return {
    errors,
    updates: {
      replaceTypes: [...replaceTypes],
      create,
    },
  };
}

function themeColorsFromData(data: ThemeWriteData, existing?: Theme | null) {
  return {
    primary: data.primaryColor ?? existing?.primaryColor ?? defaultPalette.primary,
    secondary:
      data.secondaryColor ?? existing?.secondaryColor ?? defaultPalette.secondary,
    background:
      data.backgroundColor ?? existing?.backgroundColor ?? defaultPalette.background,
    text: data.textColor ?? existing?.textColor ?? defaultPalette.text,
    button: data.buttonColor ?? existing?.buttonColor ?? defaultPalette.button,
    headerNavigation:
      data.headerNavigationColor ??
      existing?.headerNavigationColor ??
      defaultPalette.headerNavigation,
  };
}

function normalizeThemePayload(
  input: unknown,
  existing: ThemeWithRelations | null = null,
  createMode = false,
): NormalizedThemePayload {
  const payload = isRecord(input) ? (input as ThemePayload) : {};
  const errors: string[] = [];
  const data: ThemeWriteData = {};

  if (createMode || payload.name !== undefined) {
    const name = asString(payload.name);

    if (!name) {
      errors.push("Theme name is required.");
    } else {
      data.name = name.slice(0, 120);
    }
  }

  if (createMode || payload.slug !== undefined || payload.name !== undefined) {
    const slugSource =
      asString(payload.slug) || data.name || existing?.slug || "custom-theme";
    const slug = slugify(slugSource);

    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      errors.push("Theme slug must contain lowercase letters, numbers, and dashes only.");
    } else {
      data.slug = slug;
    }
  }

  if (createMode || payload.description !== undefined) {
    data.description = asString(payload.description).slice(0, 240);
  }

  if (createMode || payload.occasion !== undefined) {
    data.occasion = parseOccasion(
      payload.occasion,
      parseOccasion(existing?.occasion, "custom"),
    );
  }

  if (createMode || payload.status !== undefined) {
    data.status = parseStatus(
      payload.status,
      parseStatus(existing?.status, "inactive"),
    );
  }

  Object.assign(data, readColors(payload.colors, existing, errors, createMode));
  Object.assign(data, readDarkColors(payload.darkColors, errors));

  if (createMode || payload.welcomeMessage !== undefined) {
    data.welcomeMessage = asOptionalString(payload.welcomeMessage);
  }

  if (createMode || payload.autoActivate !== undefined) {
    data.autoActivate = asBoolean(payload.autoActivate, existing?.autoActivate ?? false);
  }

  if (createMode || payload.revertToDefault !== undefined) {
    data.revertToDefault = asBoolean(
      payload.revertToDefault,
      existing?.revertToDefault ?? true,
    );
  }

  if (createMode || payload.startAt !== undefined) {
    const startAt = parseDateInput(payload.startAt);
    if (startAt === undefined && payload.startAt !== undefined) {
      errors.push("startAt must be a valid ISO date or null.");
    } else {
      data.startAt = startAt ?? null;
    }
  }

  if (createMode || payload.endAt !== undefined) {
    const endAt = parseDateInput(payload.endAt);
    if (endAt === undefined && payload.endAt !== undefined) {
      errors.push("endAt must be a valid ISO date or null.");
    } else {
      data.endAt = endAt ?? null;
    }
  }

  const startAt = data.startAt !== undefined ? data.startAt : existing?.startAt ?? null;
  const endAt = data.endAt !== undefined ? data.endAt : existing?.endAt ?? null;

  if (startAt && endAt && startAt >= endAt) {
    errors.push("Theme end date must be after the start date.");
  }

  const targets = parseTargets(
    payload,
    createMode
      ? [...themeTargets]
      : existing?.targets
          .filter((target) => target.enabled)
          .map((target) => target.target as ThemeTargetKey),
  );

  if (targets === null) {
    errors.push("Choose at least one valid target: delivery, market, or dashboard.");
  }

  const assetResult = readAssetUpdates(payload.assets);
  errors.push(...assetResult.errors);

  const warnings = accessibilityWarnings(themeColorsFromData(data, existing));

  return {
    data,
    targets: targets ?? undefined,
    assetUpdates: assetResult.updates,
    errors,
    warnings,
  };
}

function assetCreatesFromSeed(seedAssets: Array<{ type: ThemeAssetType; url: string; alt?: string }>) {
  return seedAssets.map((asset, index) => ({
    type: asset.type,
    url: asset.url,
    alt: asset.alt,
    sortOrder: index,
  }));
}

async function ensureThemeSeeded() {
  if (!seedPromise) {
    seedPromise = (async () => {
      await ensureThemeSchema();

      const themeCount = await prisma.theme.count();

      if (themeCount > 0) {
        return;
      }

      await prisma.$transaction(async (tx) => {
        let defaultThemeId = "";

        for (const seed of seedThemes) {
          const theme = await tx.theme.create({
            data: {
              name: seed.name,
              slug: seed.slug,
              description: seed.description,
              occasion: seed.occasion,
              status: seed.status,
              primaryColor: seed.colors.primary,
              secondaryColor: seed.colors.secondary,
              backgroundColor: seed.colors.background,
              textColor: seed.colors.text,
              buttonColor: seed.colors.button,
              headerNavigationColor: seed.colors.headerNavigation,
              darkPrimaryColor: seed.darkColors.primary,
              darkSecondaryColor: seed.darkColors.secondary,
              darkBackgroundColor: seed.darkColors.background,
              darkTextColor: seed.darkColors.text,
              darkButtonColor: seed.darkColors.button,
              darkHeaderNavColor: seed.darkColors.headerNavigation,
              welcomeMessage: seed.welcomeMessage,
              autoActivate: seed.autoActivate,
              revertToDefault: seed.revertToDefault,
              targets: {
                create: seed.targets.map((target) => ({ target, enabled: true })),
              },
              assets: {
                create: assetCreatesFromSeed(seed.assets),
              },
            },
          });

          if (seed.slug === "default") {
            defaultThemeId = theme.id;
          }
        }

        if (defaultThemeId) {
          for (const target of themeTargets) {
            await tx.activeThemeSetting.create({
              data: {
                target,
                themeId: defaultThemeId,
                source: "system",
                fallbackThemeSlug: "default",
              },
            });
          }
        }
      });
    })();
  }

  await seedPromise;
}

function colorsFromTheme(theme: Theme): ThemeColors {
  return {
    primary: theme.primaryColor,
    secondary: theme.secondaryColor,
    background: theme.backgroundColor,
    text: theme.textColor,
    button: theme.buttonColor,
    headerNavigation: theme.headerNavigationColor,
  };
}

function darkColorsFromTheme(theme: Theme) {
  return {
    primary: theme.darkPrimaryColor,
    secondary: theme.darkSecondaryColor,
    background: theme.darkBackgroundColor,
    text: theme.darkTextColor,
    button: theme.darkButtonColor,
    headerNavigation: theme.darkHeaderNavColor,
  };
}

function groupAssets(assets: ThemeAsset[]) {
  const firstByType = (type: ThemeAssetType) =>
    assets.find((asset) => asset.type === type)?.url ?? null;

  return {
    bannerUrl: firstByType("banner"),
    splashScreenUrl: firstByType("splash"),
    logoUrl: firstByType("logo"),
    decorativeAssets: assets
      .filter((asset) => asset.type === "decorative")
      .map((asset) => ({
        id: asset.id,
        url: asset.url,
        alt: asset.alt,
        sortOrder: asset.sortOrder,
      })),
    all: assets.map((asset) => ({
      id: asset.id,
      type: asset.type,
      url: asset.url,
      alt: asset.alt,
      sortOrder: asset.sortOrder,
      createdAt: asset.createdAt.toISOString(),
    })),
  };
}

function cssVariables(theme: Theme) {
  const light = {
    "--theme-primary": theme.primaryColor,
    "--theme-secondary": theme.secondaryColor,
    "--theme-background": theme.backgroundColor,
    "--theme-text": theme.textColor,
    "--theme-button": theme.buttonColor,
    "--theme-header-navigation": theme.headerNavigationColor,
  };
  const dark = {
    "--theme-primary": theme.darkPrimaryColor ?? theme.primaryColor,
    "--theme-secondary": theme.darkSecondaryColor ?? theme.secondaryColor,
    "--theme-background": theme.darkBackgroundColor ?? theme.backgroundColor,
    "--theme-text": theme.darkTextColor ?? theme.textColor,
    "--theme-button": theme.darkButtonColor ?? theme.buttonColor,
    "--theme-header-navigation":
      theme.darkHeaderNavColor ?? theme.headerNavigationColor,
  };

  return { light, dark };
}

export function toThemeDto(theme: ThemeWithRelations) {
  const targets = theme.targets
    .filter((target) => target.enabled)
    .map((target) => target.target);

  return {
    id: theme.id,
    name: theme.name,
    slug: theme.slug,
    description: theme.description,
    occasion: theme.occasion,
    status: theme.status,
    colors: colorsFromTheme(theme),
    darkColors: darkColorsFromTheme(theme),
    cssVariables: cssVariables(theme),
    welcomeMessage: theme.welcomeMessage,
    autoActivate: theme.autoActivate,
    revertToDefault: theme.revertToDefault,
    startAt: theme.startAt?.toISOString() ?? null,
    endAt: theme.endAt?.toISOString() ?? null,
    targets,
    applyToAll: targets.length === themeTargets.length,
    assets: groupAssets(theme.assets),
    accessibilityWarnings: accessibilityWarnings(colorsFromTheme(theme)),
    createdAt: theme.createdAt.toISOString(),
    updatedAt: theme.updatedAt.toISOString(),
  };
}

function activeThemeResponse(
  target: ThemeTargetKey,
  theme: ThemeWithRelations,
  source: string,
  isFallback: boolean,
  fallbackReason: string | null,
) {
  return {
    target,
    source,
    isFallback,
    fallbackReason,
    resolvedAt: new Date().toISOString(),
    theme: toThemeDto(theme),
  };
}

function themeSupportsTarget(theme: ThemeWithRelations, target: ThemeTargetKey) {
  return theme.targets.some(
    (themeTarget) => themeTarget.target === target && themeTarget.enabled,
  );
}

async function getDefaultTheme() {
  const defaultTheme = await prisma.theme.findUnique({
    where: { slug: "default" },
    include: themeInclude,
  });

  if (defaultTheme) {
    return defaultTheme;
  }

  await prisma.theme.create({
    data: {
      name: seedThemes[0].name,
      slug: seedThemes[0].slug,
      description: seedThemes[0].description,
      occasion: seedThemes[0].occasion,
      status: seedThemes[0].status,
      primaryColor: seedThemes[0].colors.primary,
      secondaryColor: seedThemes[0].colors.secondary,
      backgroundColor: seedThemes[0].colors.background,
      textColor: seedThemes[0].colors.text,
      buttonColor: seedThemes[0].colors.button,
      headerNavigationColor: seedThemes[0].colors.headerNavigation,
      darkPrimaryColor: seedThemes[0].darkColors.primary,
      darkSecondaryColor: seedThemes[0].darkColors.secondary,
      darkBackgroundColor: seedThemes[0].darkColors.background,
      darkTextColor: seedThemes[0].darkColors.text,
      darkButtonColor: seedThemes[0].darkColors.button,
      darkHeaderNavColor: seedThemes[0].darkColors.headerNavigation,
      welcomeMessage: seedThemes[0].welcomeMessage,
      targets: {
        create: themeTargets.map((target) => ({ target, enabled: true })),
      },
      assets: {
        create: assetCreatesFromSeed(seedThemes[0].assets),
      },
    },
  });

  const createdDefaultTheme = await prisma.theme.findUniqueOrThrow({
    where: { slug: "default" },
    include: themeInclude,
  });

  return createdDefaultTheme;
}

async function resolveActiveThemeForTarget(target: ThemeTargetKey) {
  await ensureThemeSeeded();
  const now = new Date();

  const scheduledTheme = await prisma.theme.findFirst({
    where: {
      status: "active",
      autoActivate: true,
      targets: { some: { target, enabled: true } },
      AND: [
        { OR: [{ startAt: null }, { startAt: { lte: now } }] },
        { OR: [{ endAt: null }, { endAt: { gte: now } }] },
      ],
    },
    include: themeInclude,
    orderBy: [{ startAt: "desc" }, { updatedAt: "desc" }],
  });

  if (scheduledTheme) {
    return activeThemeResponse(target, scheduledTheme, "scheduled", false, null);
  }

  const setting = (await prisma.activeThemeSetting.findUnique({
    where: { target },
    include: {
      theme: {
        include: themeInclude,
      },
    },
  })) as ActiveThemeSettingWithTheme | null;

  if (setting?.theme) {
    const expiredBySetting =
      setting.expiresAt !== null && setting.expiresAt.getTime() < now.getTime();
    const expiredByTheme =
      setting.theme.endAt !== null && setting.theme.endAt.getTime() < now.getTime();
    const startsInFuture =
      setting.theme.startAt !== null &&
      setting.theme.startAt.getTime() > now.getTime();
    const usable =
      setting.theme.status === "active" &&
      !expiredBySetting &&
      !expiredByTheme &&
      !startsInFuture &&
      themeSupportsTarget(setting.theme, target);

    if (usable) {
      return activeThemeResponse(target, setting.theme, setting.source, false, null);
    }
  }

  const defaultTheme = await getDefaultTheme();
  return activeThemeResponse(
    target,
    defaultTheme,
    "fallback",
    true,
    setting?.theme ? "active theme unavailable or expired" : "no active theme setting",
  );
}

export async function getActiveTheme(target: ThemeTargetKey) {
  return resolveActiveThemeForTarget(target);
}

export async function getActiveThemeMap() {
  const entries = await Promise.all(
    themeTargets.map(async (target) => [target, await getActiveTheme(target)] as const),
  );

  return Object.fromEntries(entries);
}

export async function listThemes() {
  await ensureThemeSeeded();

  const [themes, activeByTarget] = await Promise.all([
    prisma.theme.findMany({
      include: themeInclude,
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    }),
    getActiveThemeMap(),
  ]);

  return {
    themes: themes.map(toThemeDto),
    activeByTarget,
    options: {
      targets: themeTargets,
      occasions: themeOccasions,
      statuses: themeStatuses,
      assetTypes: themeAssetTypes,
    },
  };
}

export async function getTheme(themeId: string) {
  await ensureThemeSeeded();

  const theme = await prisma.theme.findUnique({
    where: { id: themeId },
    include: themeInclude,
  });

  return theme ? toThemeDto(theme) : null;
}

export async function createTheme(input: unknown) {
  await ensureThemeSeeded();

  const normalized = normalizeThemePayload(input, null, true);

  if (normalized.errors.length > 0) {
    return { errors: normalized.errors, warnings: normalized.warnings, theme: null };
  }

  const theme = await prisma.theme
    .create({
      data: {
        name: normalized.data.name!,
        slug: normalized.data.slug!,
        description: normalized.data.description ?? "",
        occasion: normalized.data.occasion ?? "custom",
        status: normalized.data.status ?? "inactive",
        primaryColor: normalized.data.primaryColor!,
        secondaryColor: normalized.data.secondaryColor!,
        backgroundColor: normalized.data.backgroundColor!,
        textColor: normalized.data.textColor!,
        buttonColor: normalized.data.buttonColor!,
        headerNavigationColor: normalized.data.headerNavigationColor!,
        darkPrimaryColor: normalized.data.darkPrimaryColor,
        darkSecondaryColor: normalized.data.darkSecondaryColor,
        darkBackgroundColor: normalized.data.darkBackgroundColor,
        darkTextColor: normalized.data.darkTextColor,
        darkButtonColor: normalized.data.darkButtonColor,
        darkHeaderNavColor: normalized.data.darkHeaderNavColor,
        welcomeMessage: normalized.data.welcomeMessage,
        autoActivate: normalized.data.autoActivate ?? false,
        revertToDefault: normalized.data.revertToDefault ?? true,
        startAt: normalized.data.startAt,
        endAt: normalized.data.endAt,
        targets: {
          create: (normalized.targets ?? [...themeTargets]).map((target) => ({
            target,
            enabled: true,
          })),
        },
        assets: normalized.assetUpdates?.create.length
          ? {
              create: normalized.assetUpdates.create.map((asset) => ({
                type: asset.type,
                url: asset.url,
                alt: asset.alt,
                sortOrder: asset.sortOrder,
              })),
            }
          : undefined,
      },
      include: themeInclude,
    })
    .catch((error: unknown) => {
      if (isRecord(error) && error.code === "P2002") {
        return null;
      }

      throw error;
    });

  if (!theme) {
    return {
      errors: ["Theme slug already exists. Choose a unique slug."],
      warnings: normalized.warnings,
      theme: null,
    };
  }

  return {
    theme: toThemeDto(theme),
    warnings: normalized.warnings,
    errors: [] as string[],
  };
}

export async function updateTheme(themeId: string, input: unknown) {
  await ensureThemeSeeded();

  const existing = await prisma.theme.findUnique({
    where: { id: themeId },
    include: themeInclude,
  });

  if (!existing) {
    return { status: 404 as const, message: "Theme not found" };
  }

  const normalized = normalizeThemePayload(input, existing);

  if (normalized.errors.length > 0) {
    return {
      status: 400 as const,
      errors: normalized.errors,
      warnings: normalized.warnings,
    };
  }

  const updated = await prisma
    .$transaction(async (tx) => {
      await tx.theme.update({
        where: { id: themeId },
        data: normalized.data,
      });

      if (normalized.targets) {
        await tx.themeTarget.deleteMany({ where: { themeId } });
        await tx.themeTarget.createMany({
          data: normalized.targets.map((target) => ({
            themeId,
            target,
            enabled: true,
          })),
        });
      }

      if (normalized.assetUpdates?.replaceTypes.length) {
        await tx.themeAsset.deleteMany({
          where: {
            themeId,
            type: { in: normalized.assetUpdates.replaceTypes },
          },
        });
        await tx.themeAsset.createMany({
          data: normalized.assetUpdates.create.map((asset) => ({
            themeId,
            type: asset.type,
            url: asset.url,
            alt: asset.alt,
            sortOrder: asset.sortOrder,
          })),
        });
      }

      return true;
    })
    .catch((error: unknown) => {
      if (isRecord(error) && error.code === "P2002") {
        return false;
      }

      throw error;
    });

  if (!updated) {
    return {
      status: 400 as const,
      errors: ["Theme slug already exists. Choose a unique slug."],
      warnings: normalized.warnings,
    };
  }

  const theme = await prisma.theme.findUniqueOrThrow({
    where: { id: themeId },
    include: themeInclude,
  });

  return {
    status: 200 as const,
    theme: toThemeDto(theme),
    warnings: normalized.warnings,
  };
}

export async function activateTheme(themeId: string, input: unknown = {}) {
  await ensureThemeSeeded();

  const theme = await prisma.theme.findUnique({
    where: { id: themeId },
    include: themeInclude,
  });

  if (!theme) {
    return { status: 404 as const, message: "Theme not found" };
  }

  const payload = isRecord(input) ? (input as ThemePayload) : {};
  const requestedTargets =
    parseTargets(
      payload,
      theme.targets
        .filter((target) => target.enabled)
        .map((target) => target.target as ThemeTargetKey),
    ) ?? [];

  if (requestedTargets.length === 0) {
    return {
      status: 400 as const,
      message: "Choose at least one target before activating the theme.",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.theme.update({
      where: { id: themeId },
      data: { status: "active" },
    });

    for (const target of requestedTargets) {
      await tx.themeTarget.upsert({
        where: { themeId_target: { themeId, target } },
        update: { enabled: true },
        create: { themeId, target, enabled: true },
      });
      await tx.activeThemeSetting.upsert({
        where: { target },
        update: {
          themeId,
          source: "manual",
          fallbackThemeSlug: "default",
          activatedAt: new Date(),
          expiresAt: theme.revertToDefault ? theme.endAt : null,
        },
        create: {
          target,
          themeId,
          source: "manual",
          fallbackThemeSlug: "default",
          expiresAt: theme.revertToDefault ? theme.endAt : null,
        },
      });
    }
  });

  const updatedTheme = await prisma.theme.findUniqueOrThrow({
    where: { id: themeId },
    include: themeInclude,
  });

  return {
    status: 200 as const,
    theme: toThemeDto(updatedTheme),
    activeByTarget: await getActiveThemeMap(),
  };
}

export async function deactivateTheme(themeId: string) {
  await ensureThemeSeeded();

  const existing = await prisma.theme.findUnique({ where: { id: themeId } });

  if (!existing) {
    return { status: 404 as const, message: "Theme not found" };
  }

  if (existing.slug === "default") {
    return {
      status: 400 as const,
      message: "Default theme cannot be deactivated.",
    };
  }

  await prisma.$transaction([
    prisma.theme.update({
      where: { id: themeId },
      data: { status: "inactive" },
    }),
    prisma.activeThemeSetting.deleteMany({ where: { themeId } }),
  ]);

  const theme = await prisma.theme.findUniqueOrThrow({
    where: { id: themeId },
    include: themeInclude,
  });

  return {
    status: 200 as const,
    theme: toThemeDto(theme),
    activeByTarget: await getActiveThemeMap(),
  };
}

export async function deleteOrDisableTheme(themeId: string, hardDelete = false) {
  await ensureThemeSeeded();

  const existing = await prisma.theme.findUnique({ where: { id: themeId } });

  if (!existing) {
    return { status: 404 as const, message: "Theme not found" };
  }

  if (existing.slug === "default") {
    return {
      status: 400 as const,
      message: "Default theme cannot be deleted or disabled.",
    };
  }

  if (hardDelete) {
    await prisma.$transaction([
      prisma.activeThemeSetting.deleteMany({ where: { themeId } }),
      prisma.theme.delete({ where: { id: themeId } }),
    ]);
    return { status: 200 as const, ok: true, deleted: true };
  }

  await prisma.$transaction([
    prisma.theme.update({
      where: { id: themeId },
      data: { status: "inactive" },
    }),
    prisma.activeThemeSetting.deleteMany({ where: { themeId } }),
  ]);

  return { status: 200 as const, ok: true, deleted: false };
}

export async function attachThemeAsset(themeId: string, asset: AssetCreate) {
  await ensureThemeSeeded();

  const theme = await prisma.theme.findUnique({ where: { id: themeId } });

  if (!theme) {
    return { status: 404 as const, message: "Theme not found" };
  }

  const createdAsset = await prisma.themeAsset.create({
    data: {
      themeId,
      type: asset.type,
      url: asset.url,
      alt: asset.alt,
      sortOrder: asset.sortOrder,
    },
  });

  return {
    status: 201 as const,
    asset: {
      id: createdAsset.id,
      type: createdAsset.type,
      url: createdAsset.url,
      alt: createdAsset.alt,
      sortOrder: createdAsset.sortOrder,
      createdAt: createdAsset.createdAt.toISOString(),
    },
  };
}

export function parseAssetType(value: unknown) {
  return themeAssetTypes.find((type) => type === value) ?? null;
}

export async function previewTheme(input: unknown) {
  const normalized = normalizeThemePayload(input, null, true);

  if (normalized.errors.length > 0) {
    return { status: 400 as const, errors: normalized.errors };
  }

  const now = new Date();
  const pseudoTheme: ThemeWithRelations = {
    id: "preview",
    name: normalized.data.name ?? "Preview Theme",
    slug: normalized.data.slug ?? "preview-theme",
    description: normalized.data.description ?? "",
    occasion: normalized.data.occasion ?? "custom",
    status: normalized.data.status ?? "inactive",
    primaryColor: normalized.data.primaryColor ?? defaultPalette.primary,
    secondaryColor: normalized.data.secondaryColor ?? defaultPalette.secondary,
    backgroundColor: normalized.data.backgroundColor ?? defaultPalette.background,
    textColor: normalized.data.textColor ?? defaultPalette.text,
    buttonColor: normalized.data.buttonColor ?? defaultPalette.button,
    headerNavigationColor:
      normalized.data.headerNavigationColor ?? defaultPalette.headerNavigation,
    darkPrimaryColor: normalized.data.darkPrimaryColor ?? null,
    darkSecondaryColor: normalized.data.darkSecondaryColor ?? null,
    darkBackgroundColor: normalized.data.darkBackgroundColor ?? null,
    darkTextColor: normalized.data.darkTextColor ?? null,
    darkButtonColor: normalized.data.darkButtonColor ?? null,
    darkHeaderNavColor: normalized.data.darkHeaderNavColor ?? null,
    welcomeMessage: normalized.data.welcomeMessage ?? null,
    autoActivate: normalized.data.autoActivate ?? false,
    revertToDefault: normalized.data.revertToDefault ?? true,
    startAt: normalized.data.startAt ?? null,
    endAt: normalized.data.endAt ?? null,
    createdAt: now,
    updatedAt: now,
    assets:
      normalized.assetUpdates?.create.map((asset, index) => ({
        id: `preview-asset-${index}`,
        themeId: "preview",
        type: asset.type,
        url: asset.url,
        alt: asset.alt ?? null,
        sortOrder: asset.sortOrder,
        createdAt: now,
      })) ?? [],
    targets: (normalized.targets ?? [...themeTargets]).map((target, index) => ({
      id: `preview-target-${index}`,
      themeId: "preview",
      target,
      enabled: true,
      createdAt: now,
    })),
  };

  return {
    status: 200 as const,
    preview: {
      theme: toThemeDto(pseudoTheme),
      surfaces: [
        "home-screen",
        "product-cards",
        "category-cards",
        "buttons",
        "header",
        "banners",
        "dashboard-layout",
      ],
    },
    warnings: normalized.warnings,
  };
}
