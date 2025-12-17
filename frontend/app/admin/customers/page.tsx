import { AuthRedirect } from "@/app/components/auth/auth-redirect";
import CustomersPage from "@/app/components/customers/customers-page";

export default function AdminCustomersPage() {
  return (
    <AuthRedirect requiredRole="admin">
      <CustomersPage />
    </AuthRedirect>
  );
}