import { AdminDashboard } from "@/app/components/dashboard/admin-dashboard";
import { AuthRedirect } from "@/app/components/auth/auth-redirect";

export default function AdminDashboardPage() {
  return (
    <AuthRedirect requiredRole="admin">
      <AdminDashboard />
    </AuthRedirect>
  );
}
