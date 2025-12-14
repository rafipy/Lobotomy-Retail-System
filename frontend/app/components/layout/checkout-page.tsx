"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Building2,
  Wallet,
  Banknote,
  Truck,
  FileText,
  Shield,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Package,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  CheckoutItem,
  ShippingAddress,
  PaymentMethod,
  getCheckoutItems,
  clearCheckoutItems,
} from "@/lib/api/checkout";
import { useCart } from "@/app/components/dashboard/cart";

// ============================================
// PAYMENT METHOD OPTIONS
// ============================================
const PAYMENT_METHODS: {
  id: PaymentMethod;
  name: string;
  icon: React.ReactNode;
  description: string;
}[] = [
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    icon: <Building2 className="h-6 w-6" />,
    description: "Transfer directly from your bank",
  },
  {
    id: "e_wallet",
    name: "E-Wallet",
    icon: <Wallet className="h-6 w-6" />,
    description: "GCash, PayMaya, and more",
  },
  {
    id: "cash",
    name: "Cash on Delivery",
    icon: <Banknote className="h-6 w-6" />,
    description: "Pay when you receive your order",
  },
];

// ============================================
// VALIDATION TYPES
// ============================================
interface ValidationErrors {
  // Shipping
  shippingFullName?: string;
  shippingEmail?: string;
  shippingPhone?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingZipCode?: string;
  shippingCountry?: string;
  // Billing
  billingFullName?: string;
  billingEmail?: string;
  billingPhone?: string;
  billingAddress?: string;
  billingCity?: string;
  billingState?: string;
  billingZipCode?: string;
  billingCountry?: string;
  // Payment
  walletId?: string;
  bankName?: string;
  accountNumber?: string;
}

// Helper function to get customer ID from localStorage
function getCustomerId(): number | null {
  if (typeof window === "undefined") return null;
  const userId = localStorage.getItem("user_id");
  return userId ? parseInt(userId) : null;
}

// Helper function to get auth token
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}
// ============================================
// MAIN CHECKOUT PAGE COMPONENT
// ============================================
export function CheckoutPage() {
  const router = useRouter();
  const { clearCart, removeItems } = useCart();

  // Checkout items state
  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [isFromCart, setIsFromCart] = useState(false);

  // Form states
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  const [billingAddress, setBillingAddress] = useState<ShippingAddress>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>("bank_transfer");
  const [orderNotes, setOrderNotes] = useState("");

  // E-Wallet details
  const [walletType, setWalletType] = useState("gcash");
  const [walletId, setWalletId] = useState("");

  // Bank transfer details
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  // Processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  // Validation state
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showErrors, setShowErrors] = useState(false);

  // Load checkout items
  useEffect(() => {
    const checkoutItems = getCheckoutItems();
    if (checkoutItems.length === 0) {
      router.push("/customer/dashboard");
      return;
    }
    setItems(checkoutItems);

    const fromCartFlag = localStorage.getItem("checkout_from_cart");
    setIsFromCart(fromCartFlag === "true");
  }, [router]);

  // Calculate totals
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.selling_price * item.quantity,
    0,
  );
  const taxRate = 0.12;
  const tax = subtotal * taxRate;
  const shippingFee = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + tax + shippingFee;

  // Email validation
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Phone validation (basic)
  const isValidPhone = (phone: string) => {
    return phone.replace(/\D/g, "").length >= 10;
  };

  // Clear a specific error when user starts typing
  const clearError = (field: keyof ValidationErrors) => {
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    // Hide error summary if all errors are cleared
    if (Object.keys(errors).length <= 1) {
      setShowErrors(false);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Shipping Address Validation
    if (!shippingAddress.fullName.trim()) {
      newErrors.shippingFullName = "Full name is required";
    }
    if (!shippingAddress.email.trim()) {
      newErrors.shippingEmail = "Email is required";
    } else if (!isValidEmail(shippingAddress.email)) {
      newErrors.shippingEmail = "Please enter a valid email";
    }
    if (!shippingAddress.phone.trim()) {
      newErrors.shippingPhone = "Phone number is required";
    } else if (!isValidPhone(shippingAddress.phone)) {
      newErrors.shippingPhone = "Please enter a valid phone number";
    }
    if (!shippingAddress.address.trim()) {
      newErrors.shippingAddress = "Street address is required";
    }
    if (!shippingAddress.city.trim()) {
      newErrors.shippingCity = "City is required";
    }
    if (!shippingAddress.state.trim()) {
      newErrors.shippingState = "State/Province is required";
    }
    if (!shippingAddress.zipCode.trim()) {
      newErrors.shippingZipCode = "ZIP/Postal code is required";
    }
    if (!shippingAddress.country.trim()) {
      newErrors.shippingCountry = "Country is required";
    }

    // Billing Address Validation (if not same as shipping)
    if (!sameAsShipping) {
      if (!billingAddress.fullName.trim()) {
        newErrors.billingFullName = "Full name is required";
      }
      if (!billingAddress.email.trim()) {
        newErrors.billingEmail = "Email is required";
      } else if (!isValidEmail(billingAddress.email)) {
        newErrors.billingEmail = "Please enter a valid email";
      }
      if (!billingAddress.phone.trim()) {
        newErrors.billingPhone = "Phone number is required";
      } else if (!isValidPhone(billingAddress.phone)) {
        newErrors.billingPhone = "Please enter a valid phone number";
      }
      if (!billingAddress.address.trim()) {
        newErrors.billingAddress = "Street address is required";
      }
      if (!billingAddress.city.trim()) {
        newErrors.billingCity = "City is required";
      }
      if (!billingAddress.state.trim()) {
        newErrors.billingState = "State/Province is required";
      }
      if (!billingAddress.zipCode.trim()) {
        newErrors.billingZipCode = "ZIP/Postal code is required";
      }
      if (!billingAddress.country.trim()) {
        newErrors.billingCountry = "Country is required";
      }
    }

    // Payment Method Validation
    if (selectedPaymentMethod === "e_wallet") {
      if (!walletId.trim()) {
        newErrors.walletId = "Mobile number is required";
      } else if (!isValidPhone(walletId)) {
        newErrors.walletId = "Please enter a valid mobile number";
      }
    } else if (selectedPaymentMethod === "bank_transfer") {
      if (!bankName.trim()) {
        newErrors.bankName = "Bank name is required";
      }
      if (!accountNumber.trim()) {
        newErrors.accountNumber = "Account number is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handlePlaceOrder = async () => {
    setShowErrors(true);

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const customerId = getCustomerId();
    if (!customerId) {
      alert("Please log in to place an order");
      router.push("/login");
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Create customer order
      const orderResponse = await fetch("http://localhost:8000/customer-orders/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_id: customerId,
          items: items.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity,
          })),
          notes: orderNotes || null,
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.detail || "Failed to create order");
      }

      const order = await orderResponse.json();
      console.log("Order created:", order);

      // Step 2: Create payment record
      // Map frontend payment method to backend enum values
      let backendPaymentMethod = selectedPaymentMethod;
      if (selectedPaymentMethod === "cash") {
        backendPaymentMethod = "cash";
      }

      const transactionRef = `TXN-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

      const paymentResponse = await fetch("http://localhost:8000/payments/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_order_id: order.id,
          amount: total,
          payment_method: backendPaymentMethod,
          transaction_reference: transactionRef,
        }),
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(errorData.detail || "Failed to create payment");
      }

      const payment = await paymentResponse.json();
      console.log("Payment created:", payment);

      // Step 3: Complete the payment (mark as completed)
      const completeResponse = await fetch(
        `http://localhost:8000/payments/${payment.id}/complete`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (completeResponse.ok) {
        console.log("Payment marked as completed");
      }

      // Success! Set order details
      setOrderId(order.id.toString());
      setTransactionId(payment.transaction_reference);
      setOrderComplete(true);

      // Clear checkout items
      clearCheckoutItems();

      // Remove items from cart if checkout was from cart
      if (isFromCart) {
        const selectedIdsJson = localStorage.getItem("checkout_selected_ids");
        if (selectedIdsJson) {
          const selectedIds = JSON.parse(selectedIdsJson) as number[];
          removeItems(selectedIds);
          localStorage.removeItem("checkout_selected_ids");
        }
      }

      localStorage.removeItem("checkout_from_cart");
    } catch (error) {
      console.error("Order failed:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to place order. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };
  // Order Success Screen
  if (orderComplete) {
    return (
      <div className="w-full max-w-3xl mx-auto px-6 py-12 animate-fade-in">
        <div className="bg-black/60 border-2 border-teal-500 rounded-xl p-8 backdrop-blur-sm text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-teal-500/20 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-teal-400" />
          </div>

          <h1 className="text-3xl font-heading font-bold text-teal-200 mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-400 mb-6">
            Thank you for your purchase at L. Corp Store
          </p>

          <div className="bg-black/40 border border-teal-500/50 rounded-lg p-6 mb-6 text-left">
            <h3 className="text-lg font-semibold text-teal-200 mb-4">
              Order Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Order ID:</span>
                <span className="text-teal-300 font-mono">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Transaction ID:</span>
                <span className="text-teal-300 font-mono">{transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payment Method:</span>
                <span className="text-white">
                  {
                    PAYMENT_METHODS.find((m) => m.id === selectedPaymentMethod)
                      ?.name
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Amount:</span>
                <span className="text-yellow-400 font-bold">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-black/40 border border-teal-500/50 rounded-lg p-6 mb-6 text-left">
            <h3 className="text-lg font-semibold text-teal-200 mb-4">
              Shipping To
            </h3>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Name:</span>
                <span className="text-white font-semibold">{shippingAddress.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Address:</span>
                <span className="text-white">{shippingAddress.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">City:</span>
                <span className="text-white">{shippingAddress.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">State:</span>
                <span className="text-white">{shippingAddress.state}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Zip Code:</span>
                <span className="text-white">{shippingAddress.zipCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Country:</span>
                <span className="text-white">{shippingAddress.country}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span className="text-white">{shippingAddress.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Phone:</span>
                <span className="text-white">{shippingAddress.phone}</span>
              </div>
            </div>
          </div>


          <div className="bg-teal-900/30 border border-teal-600/50 rounded-lg p-4 mb-6">
            <p className="text-teal-200 text-sm">
              <Shield className="inline h-4 w-4 mr-2" />A confirmation email has
              been sent to your email address. You can track your order in the
              Transaction History section.
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => router.push("/customer/dashboard")}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
            >
              Continue Shopping
            </Button>
            <Button
              onClick={() => router.push("/customer/transactions")}
              className="bg-teal-600 text-white font-black hover:bg-teal-700"
            >
              View Orders
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto px-6 py-12 animate-fade-in">
        <div className="bg-black/60 border-2 border-teal-500 rounded-xl p-8 backdrop-blur-sm text-center">
          <Package className="h-16 w-16 mx-auto mb-4 text-gray-500" />
          <h2 className="text-xl font-heading text-gray-400">
            No items to checkout
          </h2>
          <p className="text-gray-500 mt-2">
            Add some items to your cart first.
          </p>
          <Button
            onClick={() => router.push("/customer/dashboard")}
            className="mt-6 bg-teal-600 hover:bg-teal-700 text-white"
          >
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  // Count total errors
  const errorCount = Object.keys(errors).length;

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-teal-400 hover:text-teal-200 hover:bg-teal-900/30 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-heading font-bold text-teal-200">
          Checkout
        </h1>
        <p className="text-gray-400 mt-1">Complete your purchase</p>
      </div>

      {/* Error Summary */}
      {showErrors && errorCount > 0 && (
        <div className="mb-6 bg-red-900/30 border-2 border-red-500 rounded-xl p-4 animate-fade-in">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-semibold">
              Please fix {errorCount} error{errorCount > 1 ? "s" : ""} before
              placing your order
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="bg-black/60 border-2 border-teal-500 rounded-xl p-6 backdrop-blur-sm">
            <h2 className="text-xl font-heading font-bold text-teal-200 mb-4 flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Shipping Address
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Full Name *</Label>
                <Input
                  value={shippingAddress.fullName}
                  onChange={(e) => {
                    setShippingAddress({
                      ...shippingAddress,
                      fullName: e.target.value,
                    });
                    clearError("shippingFullName");
                  }}
                  placeholder="John Doe"
                  className={`bg-black/50 border-teal-600 text-white placeholder:text-gray-500 focus:border-teal-400 ${
                    showErrors && errors.shippingFullName
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                />
                {showErrors && errors.shippingFullName && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.shippingFullName}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-gray-300">Email *</Label>
                <Input
                  type="email"
                  value={shippingAddress.email}
                  onChange={(e) => {
                    setShippingAddress({
                      ...shippingAddress,
                      email: e.target.value,
                    });
                    clearError("shippingEmail");
                  }}
                  placeholder="john@example.com"
                  className={`bg-black/50 border-teal-600 text-white placeholder:text-gray-500 focus:border-teal-400 ${
                    showErrors && errors.shippingEmail
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                />
                {showErrors && errors.shippingEmail && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.shippingEmail}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-gray-300">Phone *</Label>
                <Input
                  type="tel"
                  value={shippingAddress.phone}
                  onChange={(e) => {
                    setShippingAddress({
                      ...shippingAddress,
                      phone: e.target.value,
                    });
                    clearError("shippingPhone");
                  }}
                  placeholder="+1 234 567 8900"
                  className={`bg-black/50 border-teal-600 text-white placeholder:text-gray-500 focus:border-teal-400 ${
                    showErrors && errors.shippingPhone
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                />
                {showErrors && errors.shippingPhone && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.shippingPhone}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-gray-300">Country *</Label>
                <Input
                  value={shippingAddress.country}
                  onChange={(e) => {
                    setShippingAddress({
                      ...shippingAddress,
                      country: e.target.value,
                    });
                    clearError("shippingCountry");
                  }}
                  placeholder="United States"
                  className={`bg-black/50 border-teal-600 text-white placeholder:text-gray-500 focus:border-teal-400 ${
                    showErrors && errors.shippingCountry
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                />
                {showErrors && errors.shippingCountry && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.shippingCountry}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label className="text-gray-300">Street Address *</Label>
                <Input
                  value={shippingAddress.address}
                  onChange={(e) => {
                    setShippingAddress({
                      ...shippingAddress,
                      address: e.target.value,
                    });
                    clearError("shippingAddress");
                  }}
                  placeholder="123 Main Street, Apt 4B"
                  className={`bg-black/50 border-teal-600 text-white placeholder:text-gray-500 focus:border-teal-400 ${
                    showErrors && errors.shippingAddress
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                />
                {showErrors && errors.shippingAddress && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.shippingAddress}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-gray-300">City *</Label>
                <Input
                  value={shippingAddress.city}
                  onChange={(e) => {
                    setShippingAddress({
                      ...shippingAddress,
                      city: e.target.value,
                    });
                    clearError("shippingCity");
                  }}
                  placeholder="New York"
                  className={`bg-black/50 border-teal-600 text-white placeholder:text-gray-500 focus:border-teal-400 ${
                    showErrors && errors.shippingCity
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                />
                {showErrors && errors.shippingCity && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.shippingCity}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-gray-300">State/Province *</Label>
                <Input
                  value={shippingAddress.state}
                  onChange={(e) => {
                    setShippingAddress({
                      ...shippingAddress,
                      state: e.target.value,
                    });
                    clearError("shippingState");
                  }}
                  placeholder="NY"
                  className={`bg-black/50 border-teal-600 text-white placeholder:text-gray-500 focus:border-teal-400 ${
                    showErrors && errors.shippingState
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                />
                {showErrors && errors.shippingState && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.shippingState}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-gray-300">ZIP/Postal Code *</Label>
                <Input
                  value={shippingAddress.zipCode}
                  onChange={(e) => {
                    setShippingAddress({
                      ...shippingAddress,
                      zipCode: e.target.value,
                    });
                    clearError("shippingZipCode");
                  }}
                  placeholder="10001"
                  className={`bg-black/50 border-teal-600 text-white placeholder:text-gray-500 focus:border-teal-400 ${
                    showErrors && errors.shippingZipCode
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                />
                {showErrors && errors.shippingZipCode && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.shippingZipCode}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Billing Address */}
          <div className="bg-black/60 border-2 border-teal-500 rounded-xl p-6 backdrop-blur-sm">
            <h2 className="text-xl font-heading font-bold text-teal-200 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Billing Address
            </h2>

            <div className="flex items-center gap-2 mb-4">
              <Checkbox
                id="sameAsShipping"
                checked={sameAsShipping}
                onCheckedChange={(checked) =>
                  setSameAsShipping(checked as boolean)
                }
                className="border-teal-500 data-[state=checked]:bg-teal-600"
              />
              <Label
                htmlFor="sameAsShipping"
                className="text-gray-300 cursor-pointer"
              >
                Same as shipping address
              </Label>
            </div>

            {!sameAsShipping && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Full Name *</Label>
                  <Input
                    value={billingAddress.fullName}
                    onChange={(e) => {
                      setBillingAddress({
                        ...billingAddress,
                        fullName: e.target.value,
                      });
                      clearError("billingFullName");
                    }}
                    placeholder="John Doe"
                    className={`bg-black/50 border-teal-600 text-white placeholder:text-gray-500 focus:border-teal-400 ${
                      showErrors && errors.billingFullName
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }`}
                  />
                  {showErrors && errors.billingFullName && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.billingFullName}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-gray-300">Email *</Label>
                  <Input
                    type="email"
                    value={billingAddress.email}
                    onChange={(e) => {
                      setBillingAddress({
                        ...billingAddress,
                        email: e.target.value,
                      });
                      clearError("billingEmail");
                    }}
                    placeholder="john@example.com"
                    className={`bg-black/50 border-teal-600 text-white placeholder:text-gray-500 focus:border-teal-400 ${
                      showErrors && errors.billingEmail
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }`}
                  />
                  {showErrors && errors.billingEmail && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.billingEmail}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-gray-300">Phone *</Label>
                  <Input
                    type="tel"
                    value={billingAddress.phone}
                    onChange={(e) => {
                      setBillingAddress({
                        ...billingAddress,
                        phone: e.target.value,
                      });
                      clearError("billingPhone");
                    }}
                    placeholder="+1 234 567 8900"
                    className={`bg-black/50 border-teal-600 text-white placeholder:text-gray-500 focus:border-teal-400 ${
                      showErrors && errors.billingPhone
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }`}
                  />
                  {showErrors && errors.billingPhone && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.billingPhone}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-gray-300">Country *</Label>
                  <Input
                    value={billingAddress.country}
                    onChange={(e) => {
                      setBillingAddress({
                        ...billingAddress,
                        country: e.target.value,
                      });
                      clearError("billingCountry");
                    }}
                    placeholder="United States"
                    className={`bg-black/50 border-teal-600 text-white placeholder:text-gray-500 focus:border-teal-400 ${
                      showErrors && errors.billingCountry
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }`}
                  />
                  {showErrors && errors.billingCountry && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.billingCountry}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label className="text-gray-300">Street Address *</Label>
                  <Input
                    value={billingAddress.address}
                    onChange={(e) => {
                      setBillingAddress({
                        ...billingAddress,
                        address: e.target.value,
                      });
                      clearError("billingAddress");
                    }}
                    placeholder="123 Main Street, Apt 4B"
                    className={`bg-black/50 border-teal-600 text-white placeholder:text-gray-500 focus:border-teal-400 ${
                      showErrors && errors.billingAddress
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }`}
                  />
                  {showErrors && errors.billingAddress && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.billingAddress}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-gray-300">City *</Label>
                  <Input
                    value={billingAddress.city}
                    onChange={(e) => {
                      setBillingAddress({
                        ...billingAddress,
                        city: e.target.value,
                      });
                      clearError("billingCity");
                    }}
                    placeholder="New York"
                    className={`bg-black/50 border-teal-600 text-white placeholder:text-gray-500 focus:border-teal-400 ${
                      showErrors && errors.billingCity
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }`}
                  />
                  {showErrors && errors.billingCity && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.billingCity}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-gray-300">State/Province *</Label>
                  <Input
                    value={billingAddress.state}
                    onChange={(e) => {
                      setBillingAddress({
                        ...billingAddress,
                        state: e.target.value,
                      });
                      clearError("billingState");
                    }}
                    placeholder="NY"
                    className={`bg-black/50 border-teal-600 text-white placeholder:text-gray-500 focus:border-teal-400 ${
                      showErrors && errors.billingState
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }`}
                  />
                  {showErrors && errors.billingState && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.billingState}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-gray-300">ZIP/Postal Code *</Label>
                  <Input
                    value={billingAddress.zipCode}
                    onChange={(e) => {
                      setBillingAddress({
                        ...billingAddress,
                        zipCode: e.target.value,
                      });
                      clearError("billingZipCode");
                    }}
                    placeholder="10001"
                    className={`bg-black/50 border-teal-600 text-white placeholder:text-gray-500 focus:border-teal-400 ${
                      showErrors && errors.billingZipCode
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }`}
                  />
                  {showErrors && errors.billingZipCode && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.billingZipCode}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-black/60 border-2 border-teal-500 rounded-xl p-6 backdrop-blur-sm">
            <h2 className="text-xl font-heading font-bold text-teal-200 mb-4 flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Payment Method
            </h2>

            {/* Payment Method Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedPaymentMethod(method.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    selectedPaymentMethod === method.id
                      ? "border-teal-400 bg-teal-900/30"
                      : "border-teal-600/50 bg-black/30 hover:border-teal-500"
                  }`}
                >
                  <div
                    className={`mb-2 ${selectedPaymentMethod === method.id ? "text-teal-400" : "text-gray-400"}`}
                  >
                    {method.icon}
                  </div>
                  <div
                    className={`font-semibold ${selectedPaymentMethod === method.id ? "text-teal-200" : "text-gray-300"}`}
                  >
                    {method.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {method.description}
                  </div>
                </button>
              ))}
            </div>

            {/* Payment Details Form */}
            <div className="border-t border-teal-500/30 pt-6">
              {/* Bank Transfer Form */}
              {selectedPaymentMethod === "bank_transfer" && (
                <div className="space-y-4">
                  <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
                    <h4 className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Bank Transfer Instructions
                    </h4>
                    <p className="text-yellow-200/70 text-sm">
                      Transfer the total amount to the following account. Your
                      order will be processed once payment is confirmed.
                    </p>
                    <div className="mt-3 space-y-1 text-sm">
                      <p className="text-gray-300">
                        Bank:{" "}
                        <span className="text-white font-mono">
                          L. Corp Federal Bank
                        </span>
                      </p>
                      <p className="text-gray-300">
                        Account:{" "}
                        <span className="text-white font-mono">
                          1234-5678-9012
                        </span>
                      </p>
                      <p className="text-gray-300">
                        Swift:{" "}
                        <span className="text-white font-mono">LCORPUS33</span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-300">Your Bank Name *</Label>
                    <Input
                      value={bankName}
                      onChange={(e) => {
                        setBankName(e.target.value);
                        clearError("bankName");
                      }}
                      placeholder="Enter your bank name"
                      className={`bg-black/50 border-teal-600 text-white placeholder:text-gray-500 focus:border-teal-400 ${
                        showErrors && errors.bankName
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
                    />
                    {showErrors && errors.bankName && (
                      <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.bankName}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-gray-300">
                      Your Account Number *
                    </Label>
                    <Input
                      value={accountNumber}
                      onChange={(e) => {
                        setAccountNumber(e.target.value);
                        clearError("accountNumber");
                      }}
                      placeholder="Enter your account number"
                      className={`bg-black/50 border-teal-600 text-white placeholder:text-gray-500 focus:border-teal-400 font-mono ${
                        showErrors && errors.accountNumber
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
                    />
                    {showErrors && errors.accountNumber && (
                      <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.accountNumber}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* E-Wallet Form */}
              {selectedPaymentMethod === "e_wallet" && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Select E-Wallet</Label>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      {["GoPay", "ShopeePay", "OVO"].map((wallet) => (
                        <button
                          key={wallet}
                          onClick={() => setWalletType(wallet.toLowerCase())}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            walletType === wallet.toLowerCase()
                              ? "border-teal-400 bg-teal-900/30 text-teal-200"
                              : "border-teal-600/50 bg-black/30 text-gray-400 hover:border-teal-500"
                          }`}
                        >
                          {wallet}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-300">Mobile Number *</Label>
                    <Input
                      value={walletId}
                      onChange={(e) => {
                        setWalletId(e.target.value);
                        clearError("walletId");
                      }}
                      placeholder="+63 9XX XXX XXXX"
                      className={`bg-black/50 border-teal-600 text-white placeholder:text-gray-500 focus:border-teal-400 ${
                        showErrors && errors.walletId
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
                    />
                    {showErrors && errors.walletId && (
                      <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.walletId}
                      </p>
                    )}
                  </div>

                  <div className="bg-teal-900/20 border border-teal-600/30 rounded-lg p-3">
                    <p className="text-xs text-teal-300">
                      You will receive a payment request on your{" "}
                      {walletType.charAt(0).toUpperCase() + walletType.slice(1)}{" "}
                      app.
                    </p>
                  </div>
                </div>
              )}

              {/* Cash on Delivery */}
              {selectedPaymentMethod === "cash" && (
                <div className="bg-teal-900/20 border border-teal-600/30 rounded-lg p-4">
                  <h4 className="text-teal-400 font-semibold mb-2 flex items-center gap-2">
                    <Banknote className="h-4 w-4" />
                    Cash on Delivery
                  </h4>
                  <p className="text-teal-200/70 text-sm">
                    Pay in cash when your order is delivered. Please prepare the
                    exact amount of{" "}
                    <span className="text-yellow-400 font-bold">
                      ${total.toFixed(2)}
                    </span>{" "}
                    for faster transaction.
                  </p>
                  <p className="text-gray-400 text-xs mt-2">
                    Note: A verification call may be made before dispatch.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Notes */}
          <div className="bg-black/60 border-2 border-teal-500 rounded-xl p-6 backdrop-blur-sm">
            <h2 className="text-xl font-heading font-bold text-teal-200 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Order Notes (Optional)
            </h2>
            <textarea
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="Add any special instructions for your order..."
              rows={3}
              className="w-full bg-black/50 border-2 border-teal-600 rounded-lg p-3 text-white placeholder:text-gray-500 focus:border-teal-400 focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-black/60 border-2 border-teal-500 rounded-xl p-6 backdrop-blur-sm sticky top-24">
            <h2 className="text-xl font-heading font-bold text-teal-200 mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Summary
            </h2>

            {/* Items List */}
            <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-3 bg-black/40 p-3 rounded-lg border border-teal-500/30"
                >
                  <div className="relative w-12 h-12 bg-gray-800 rounded-lg overflow-hidden shrink-0">
                    {item.product.image_url ? (
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-2xl">
                        📦
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-teal-200 truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-xs text-gray-400">
                      Qty: {item.quantity} × $
                      {item.product.selling_price.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-sm font-bold text-yellow-400">
                    ${(item.product.selling_price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <Separator className="bg-teal-500/30 my-4" />

            {/* Price Breakdown */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tax (12%)</span>
                <span className="text-white">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Shipping</span>
                <span
                  className={shippingFee === 0 ? "text-teal-400" : "text-white"}
                >
                  {shippingFee === 0 ? "FREE" : `$${shippingFee.toFixed(2)}`}
                </span>
              </div>
              {shippingFee === 0 && (
                <p className="text-xs text-teal-400">
                  🎉 Free shipping on orders over $100!
                </p>
              )}
            </div>

            <Separator className="bg-teal-500/30 my-4" />

            {/* Total */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-semibold text-white">Total</span>
              <span className="text-2xl font-bold text-yellow-400">
                ${total.toFixed(2)}
              </span>
            </div>

            {/* Place Order Button */}
            <Button
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-6 text-lg disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5 mr-2" />
                  Place Order
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center mt-4">
              By placing your order, you agree to L. Corp&apos;s Terms of
              Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
