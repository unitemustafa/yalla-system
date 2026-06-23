import { LoginPage } from "@/features/auth/login-page";
import { loginDashboardSnapshot } from "@/features/dashboard/static-data";

export default function LoginRoute() {
  return <LoginPage snapshot={loginDashboardSnapshot} />;
}
