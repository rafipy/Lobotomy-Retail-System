import { AuthRedirect } from "@/app/components/auth/auth-redirect";
import SettingsPage from "@/app/components/settings/user-settings";

export default function AdminSettingsPage() {
  return (
    <AuthRedirect requiredRole="admin">
      <SettingsPage />
    </AuthRedirect>
  );
}