import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  attachThemeAsset,
  parseAssetType,
  type AssetCreate,
} from "@/lib/theme-store";
import { requireDashboardSession, unauthorizedResponse } from "@/lib/api-auth";

export const runtime = "nodejs";

const maxAssetSize = 5 * 1024 * 1024;

function safeFileName(value: string) {
  const extension = path.extname(value).toLowerCase() || ".png";
  const baseName = path
    .basename(value, extension)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return `${baseName || "theme-asset"}-${Date.now()}${extension}`;
}

function isAllowedAssetUrl(value: string) {
  return (
    value.startsWith("/") ||
    value.startsWith("data:image/") ||
    /^https?:\/\//i.test(value)
  );
}

async function assetFromJson(body: unknown): Promise<AssetCreate | Response> {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return Response.json({ message: "Invalid asset payload" }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  const type = parseAssetType(payload.type);
  const url = typeof payload.url === "string" ? payload.url.trim() : "";

  if (!type) {
    return Response.json(
      { message: "type must be banner, splash, logo, or decorative" },
      { status: 400 },
    );
  }

  if (!url || !isAllowedAssetUrl(url)) {
    return Response.json(
      { message: "url must be an absolute URL, a public path, or a data:image URL" },
      { status: 400 },
    );
  }

  return {
    type,
    url,
    alt: typeof payload.alt === "string" ? payload.alt.trim() : undefined,
    sortOrder:
      typeof payload.sortOrder === "number" && Number.isFinite(payload.sortOrder)
        ? payload.sortOrder
        : 0,
  };
}

async function assetFromFormData(
  formData: FormData,
  themeId: string,
): Promise<AssetCreate | Response> {
  const type = parseAssetType(formData.get("type"));
  const file = formData.get("file");
  const url = formData.get("url");

  if (!type) {
    return Response.json(
      { message: "type must be banner, splash, logo, or decorative" },
      { status: 400 },
    );
  }

  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("image/")) {
      return Response.json({ message: "Only image assets are allowed" }, { status: 400 });
    }

    if (file.size > maxAssetSize) {
      return Response.json(
        { message: "Theme asset must be 5 MB or smaller" },
        { status: 400 },
      );
    }

    const uploadRoot = path.resolve(
      process.cwd(),
      "public",
      "uploads",
      "theme-assets",
    );
    const targetDir = path.resolve(uploadRoot, themeId);

    if (!targetDir.startsWith(uploadRoot)) {
      return Response.json({ message: "Invalid upload path" }, { status: 400 });
    }

    await mkdir(targetDir, { recursive: true });

    const fileName = safeFileName(file.name);
    const filePath = path.join(targetDir, fileName);
    const bytes = Buffer.from(await file.arrayBuffer());

    await writeFile(filePath, bytes);

    return {
      type,
      url: `/uploads/theme-assets/${themeId}/${fileName}`,
      alt: typeof formData.get("alt") === "string" ? String(formData.get("alt")) : undefined,
      sortOrder: Number(formData.get("sortOrder")) || 0,
    };
  }

  if (typeof url === "string" && url.trim()) {
    const trimmedUrl = url.trim();

    if (!isAllowedAssetUrl(trimmedUrl)) {
      return Response.json(
        { message: "url must be an absolute URL, a public path, or a data:image URL" },
        { status: 400 },
      );
    }

    return {
      type,
      url: trimmedUrl,
      alt: typeof formData.get("alt") === "string" ? String(formData.get("alt")) : undefined,
      sortOrder: Number(formData.get("sortOrder")) || 0,
    };
  }

  return Response.json({ message: "Upload a file or provide an asset URL" }, { status: 400 });
}

export async function POST(
  request: Request,
  ctx: { params: Promise<{ themeId: string }> },
) {
  const session = await requireDashboardSession();

  if (!session) {
    return unauthorizedResponse();
  }

  const { themeId } = await ctx.params;
  const contentType = request.headers.get("content-type") ?? "";
  const asset = contentType.includes("application/json")
    ? await assetFromJson(await request.json().catch(() => ({})))
    : await assetFromFormData(await request.formData(), themeId);

  if (asset instanceof Response) {
    return asset;
  }

  const result = await attachThemeAsset(themeId, asset);

  if ("message" in result) {
    return Response.json({ message: result.message }, { status: result.status });
  }

  return Response.json({ asset: result.asset }, { status: result.status });
}
