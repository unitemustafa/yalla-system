import { dashboardBff } from "@/lib/dashboard-bff";

export async function GET() {
  return dashboardBff("cities");
}

export async function POST(request: Request) {
  return dashboardBff("cities", {
    method: "POST",
    body: JSON.stringify(await request.json().catch(() => ({}))),
  });
}
