import { DashboardLayout } from "@/features/dashboard/layout";
import { AuthGate } from "@/features/auth/auth-gate";

export default function DashboardRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGate>
  );
}
