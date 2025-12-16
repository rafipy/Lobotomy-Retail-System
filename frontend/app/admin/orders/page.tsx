// frontend/app/admin/orders/page.tsx
// Create this file

import { AuthRedirect } from "@/app/components/auth/auth-redirect";
import OrderManagementPage from "@/app/components/order/order-management";

export default function AdminOrdersPage() {
  return (
    <AuthRedirect requiredRole="admin">
      <OrderManagementPage />
    </AuthRedirect>
  );
}