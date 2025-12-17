const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type PaymentMethodType =
  | "cash"
  | "credit_card"
  | "debit_card"
  | "bank_transfer"
  | "e_wallet";
export type PaymentStatusType = "pending" | "completed" | "failed" | "refunded";

export interface Payment {
  id: number;
  customer_order_id: number;
  amount: number;
  payment_method: PaymentMethodType;
  payment_status: PaymentStatusType;
  transaction_reference: string | null;
  payment_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentCreate {
  customer_order_id: number;
  amount: number;
  payment_method: PaymentMethodType;
  transaction_reference?: string;
}

export interface PaymentSummary {
  customer_order_id: number;
  order_total: number;
  total_paid: number;
  remaining_balance: number;
  payment_count: number;
  is_fully_paid: boolean;
}

// Create payment
export async function createPayment(
  paymentData: PaymentCreate,
): Promise<Payment> {
  const response = await fetch(`${API_URL}/payments/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(paymentData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to create payment");
  }

  return response.json();
}

// Get payments for an order
export async function getPaymentsForOrder(orderId: number): Promise<Payment[]> {
  const response = await fetch(`${API_URL}/payments/order/${orderId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch payments");
  }

  return response.json();
}

// Get payment summary for an order
export async function getPaymentSummary(
  orderId: number,
): Promise<PaymentSummary> {
  const response = await fetch(`${API_URL}/payments/order/${orderId}/summary`);

  if (!response.ok) {
    throw new Error("Failed to fetch payment summary");
  }

  return response.json();
}

// Complete payment
export async function completePayment(
  paymentId: number,
): Promise<{ message: string; payment_id: number }> {
  const response = await fetch(`${API_URL}/payments/${paymentId}/complete`, {
    method: "PUT",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to complete payment");
  }

  return response.json();
}

// Get all payments (for admin)
export async function getAllPayments(): Promise<Payment[]> {
  const response = await fetch(`${API_URL}/payments/`);

  if (!response.ok) {
    throw new Error("Failed to fetch payments");
  }

  return response.json();
}
