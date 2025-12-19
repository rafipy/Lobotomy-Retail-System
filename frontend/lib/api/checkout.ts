import { Product } from "./products";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ============================================
// CHECKOUT TYPES
// ============================================
export interface CheckoutItem {
  product: Product;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
}

export type PaymentMethod = "bank_transfer" | "e_wallet" | "cash";

export interface PaymentDetails {
  method: PaymentMethod;
  // Bank Transfer
  bankName?: string;
  accountNumber?: string;
  // E-Wallet
  walletType?: string;
  walletId?: string;
}

export interface CheckoutData {
  items: CheckoutItem[];
  shippingAddress: ShippingAddress;
  sameAsShipping: boolean;
  paymentDetails: PaymentDetails;
  notes?: string;
}

export interface OrderResponse {
  id: number;
  status: string;
  total_amount: number;
  created_at: string;
}

// ============================================
// CHECKOUT STORAGE (for passing data between pages)
// ============================================
const CHECKOUT_STORAGE_KEY = "checkout_items";

export function setCheckoutItems(items: CheckoutItem[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(items));
  }
}

export function getCheckoutItems(): CheckoutItem[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(CHECKOUT_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
}

export function clearCheckoutItems(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(CHECKOUT_STORAGE_KEY);
  }
}

// ============================================
// API CALLS (Mock for now)
// ============================================
export async function createOrder(
  customerId: number,
  items: { product_id: number; quantity: number }[],
  notes?: string,
): Promise<OrderResponse> {
  const response = await fetch(`${API_URL}/customer-orders/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customer_id: customerId,
      items,
      notes,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to create order");
  }

  return response.json();
}
