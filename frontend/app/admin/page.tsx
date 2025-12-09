import { AdminLoginSection } from "@/app/components/form/admin-login-section";
import { AuthRedirect } from "@/app/components/auth/auth-redirect";

export default function AdminLoginPage() {
  return (
    <AuthRedirect redirectIfAuthenticated={true}>
      <AdminLoginSection />
    </AuthRedirect>
  );
}
