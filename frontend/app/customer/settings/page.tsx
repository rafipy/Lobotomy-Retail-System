"use client";

import { AuthRedirect } from "@/app/components/auth/auth-redirect";
import  SettingsPage  from "@/app/components/settings/user-settings";

export default function CustomerSettingsPage() {
  return (
    <AuthRedirect requiredRole="customer">
      <SettingsPage/>
    </AuthRedirect>
  );
}