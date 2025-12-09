import { InventorySection } from "@/app/components/inventory/inventory-section";
import { AuthRedirect } from "@/app/components/auth/auth-redirect";

export default function InventoryPage() {
  return (
    <AuthRedirect requiredRole="admin">
      <InventorySection />
    </AuthRedirect>

  )


}
