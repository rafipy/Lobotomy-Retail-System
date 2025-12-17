import { CheckoutPage } from "@/app/components/layout/checkout-page";

import { AuthRedirect } from "@/app/components/auth/auth-redirect";

export default function Checkout() {
  return (
    <AuthRedirect requiredRole="customer">
      <CheckoutPage />
    </AuthRedirect>
  );
}
