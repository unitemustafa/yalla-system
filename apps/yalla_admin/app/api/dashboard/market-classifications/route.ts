import { dashboardBff } from "@/lib/dashboard-bff";

export async function GET() {
  return dashboardBff("market-classifications");
}
