import { AuthRedirect } from "@/app/components/auth/auth-redirect";
import { AdminOrdersSection } from "@/app/components/orders/admin-orders-section";

export default function AdminOrdersPage() {
  return (
    <AuthRedirect requiredRole="admin">
      <AdminOrdersSection />
    </AuthRedirect>
  );
}
