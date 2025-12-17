import { AuthRedirect } from "@/app/components/auth/auth-redirect";
import { TransactionHistory } from "@/app/components/transactions/transaction-history";

export default function CustomerTransactionsPage() {
  return (
    <AuthRedirect requiredRole="customer">
      <TransactionHistory />
    </AuthRedirect>
  );
}
