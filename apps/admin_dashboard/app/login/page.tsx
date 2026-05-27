import { LoginPage } from "@/features/auth/login-page";
import { getLoginDashboardSnapshot } from "@/lib/login-dashboard-snapshot";

export const dynamic = "force-dynamic";

export default async function LoginRoute() {
  const snapshot = await getLoginDashboardSnapshot();

  return <LoginPage snapshot={snapshot} />;
}
