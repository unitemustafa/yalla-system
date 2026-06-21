import { extractBackendErrorMessage } from "@/lib/backend-auth";
import { djangoFetch } from "@/lib/django-bff";

async function proxy(method: "GET" | "POST", request?: Request) {
  const response = await djangoFetch("auth/couriers", {
    method,
    body: method === "POST" ? await request?.text() : undefined,
  });
  if (!response) {
    return Response.json({ message: "Courier service is unavailable." }, { status: 503 });
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    return Response.json(
      { message: extractBackendErrorMessage(data, "Courier request failed.") },
      { status: response.status },
    );
  }
  return Response.json(data, { status: response.status });
}

export async function GET() {
  return proxy("GET");
}

export async function POST(request: Request) {
  return proxy("POST", request);
}
