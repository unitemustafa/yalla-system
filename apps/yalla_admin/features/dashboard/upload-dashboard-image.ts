export async function uploadDashboardImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/dashboard/uploads", {
    method: "POST",
    body: formData,
  });

  const data = (await response.json().catch(() => null)) as {
    url?: unknown;
  } | null;

  if (!response.ok || typeof data?.url !== "string") {
    throw new Error("Failed to upload dashboard image");
  }

  return data.url;
}
