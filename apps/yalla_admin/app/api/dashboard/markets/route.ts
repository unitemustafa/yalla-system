import { dashboardBff } from "@/lib/dashboard-bff";

export async function GET() {
  return dashboardBff("markets");
}

export async function POST(request: Request) {
  return dashboardBff("markets", {
    method: "POST",
    body: JSON.stringify(await request.json().catch(() => ({}))),
  });
}
