import { AuthRedirect } from "@/app/components/auth/auth-redirect";
import { EmployeeSettings } from "@/app/components/settings/employee-settings";

export default function AdminSettingsPage() {
  return (
    <AuthRedirect requiredRole="admin">
      <EmployeeSettings />
    </AuthRedirect>
  );
}
