import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { requireDashboardSession, unauthorizedResponse } from "@/lib/api-auth";

export const runtime = "nodejs";

const maxImageSize = 8 * 1024 * 1024;
const allowedImageTypes = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
]);

export async function POST(request: Request) {
  const session = await requireDashboardSession();

  if (!session) {
    return unauthorizedResponse();
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return Response.json({ message: "Image file is required" }, { status: 400 });
  }

  const extension = allowedImageTypes.get(file.type.toLowerCase());

  if (!extension) {
    return Response.json(
      { message: "Only JPG, PNG, WEBP, and GIF images are supported" },
      { status: 400 },
    );
  }

  if (file.size > maxImageSize) {
    return Response.json(
      { message: "Image must be 8MB or smaller" },
      { status: 413 },
    );
  }

  const uploadDirectory = path.join(
    process.cwd(),
    "public",
    "uploads",
    "dashboard",
  );
  const fileName = `${new Date().toISOString().slice(0, 10)}-${randomUUID()}${extension}`;

  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(
    path.join(uploadDirectory, fileName),
    Buffer.from(await file.arrayBuffer()),
  );

  return Response.json({
    name: file.name,
    url: `/uploads/dashboard/${fileName}`,
  });
}
