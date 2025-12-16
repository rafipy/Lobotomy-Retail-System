"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  Package,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getCustomerOrders,
  getCustomerOrder,
  CustomerOrderListItem,
  CustomerOrder,
  CustomerOrderStatus,
} from "@/lib/api/customer-orders";
import { getCustomerByUserId } from "@/lib/api/customers";

const STATUS_CONFIG: Record<
  CustomerOrderStatus,
  {
    label: string;
    icon: React.ReactNode;
    className: string;
  }
> = {
  pending: {
    label: "Pending Payment",
    icon: <Clock className="h-4 w-4" />,
    className: "bg-yellow-900/30 text-yellow-400 border-yellow-600",
  },
  processing: {
    label: "Processing",
    icon: <Truck className="h-4 w-4" />,
    className: "bg-blue-900/30 text-blue-400 border-blue-600",
  },
  completed: {
    label: "Completed",
    icon: <CheckCircle2 className="h-4 w-4" />,
    className: "bg-teal-900/30 text-teal-400 border-teal-600",
  },
  cancelled: {
    label: "Cancelled",
    icon: <XCircle className="h-4 w-4" />,
    className: "bg-red-900/30 text-red-400 border-red-600",
  },
};

export function TransactionHistory() {
  const [orders, setOrders] = useState<CustomerOrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
  const [orderDetails, setOrderDetails] = useState<
    Record<number, CustomerOrder>
  >({});
  const [loadingDetails, setLoadingDetails] = useState<Set<number>>(new Set());

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);

      // Debug: inspect localStorage value
      const rawUserId = localStorage.getItem("user_id");
      console.debug(
        "TransactionHistory: raw user_id from localStorage:",
        rawUserId,
      );

      if (!rawUserId) {
        throw new Error("User not logged in (no user_id in localStorage)");
      }

      const parsedUserId = parseInt(rawUserId, 10);
      if (Number.isNaN(parsedUserId)) {
        throw new Error(
          `Invalid user_id in localStorage: "${rawUserId}" (parseInt -> NaN)`,
        );
      }

      console.debug("TransactionHistory: parsed user_id:", parsedUserId);

      const customer = await getCustomerByUserId(parsedUserId);
      console.debug("TransactionHistory: customer response:", customer);

      if (!customer || typeof customer.id !== "number") {
        throw new Error("getCustomerByUserId returned invalid customer object");
      }

      const data = await getCustomerOrders(customer.id);
      setOrders(data);
      setError(null);
    } catch (err) {
      // Surface error details in UI and console
      const message = err instanceof Error ? err.message : String(err);
      setError(`Failed to load orders: ${message}`);
      console.error("TransactionHistory fetchOrders error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  async function toggleExpanded(orderId: number) {
    const isExpanded = expandedOrders.has(orderId);

    if (isExpanded) {
      setExpandedOrders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    } else {
      setExpandedOrders((prev) => new Set(prev).add(orderId));

      // Load order details if not already loaded
      if (!orderDetails[orderId]) {
        setLoadingDetails((prev) => new Set(prev).add(orderId));
        try {
          const details = await getCustomerOrder(orderId);
          setOrderDetails((prev) => ({ ...prev, [orderId]: details }));
        } catch (err) {
          console.error("Failed to load order details:", err);
        } finally {
          setLoadingDetails((prev) => {
            const newSet = new Set(prev);
            newSet.delete(orderId);
            return newSet;
          });
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
        <span className="ml-3 text-gray-400">
          Loading transaction history...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 text-red-400 border-2 border-red-500 rounded-xl bg-red-950/20">
        <p className="text-xl font-body">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto px-6 py-12 animate-fade-in">
        <div className="bg-black/60 border-2 border-teal-500 rounded-xl p-8 backdrop-blur-sm text-center">
          <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-gray-500" />
          <h2 className="text-xl font-heading text-gray-400">No Orders Yet</h2>
          <p className="text-gray-500 mt-2">
            Start shopping to see your order history here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-8 animate-fade-in">
      <div className="bg-black/40 border-2 border-teal-500 rounded-xl p-6 backdrop-blur-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-heading font-bold text-teal-200 mb-2 flex items-center gap-2">
            <Package className="h-6 w-6" />
            Transaction History
          </h2>
          <p className="text-gray-400 font-body">
            View all your past and current orders
          </p>
        </div>

        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrders.has(order.id);
            const details = orderDetails[order.id];
            const isLoadingDetails = loadingDetails.has(order.id);
            const statusConfig = STATUS_CONFIG[order.status];

            return (
              <div
                key={order.id}
                className="bg-black/60 border-2 border-teal-500/50 rounded-xl overflow-hidden hover:border-teal-400 transition-all"
              >
                {/* Order Header */}
                <div className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-heading font-bold text-teal-200">
                        Order #{order.id}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border-2 flex items-center gap-1 ${statusConfig.className}`}
                      >
                        {statusConfig.icon}
                        {statusConfig.label}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-400">
                      <span>
                        {order.item_count} item
                        {order.item_count !== 1 ? "s" : ""}
                      </span>
                      <span>•</span>
                      <span className="text-yellow-400 font-bold">
                        ${order.total_amount.toFixed(2)}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(order.id)}
                    className="text-teal-400 hover:bg-teal-900/30"
                  >
                    {isExpanded ? (
                      <>
                        Hide Details <ChevronUp className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        View Details <ChevronDown className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>

                {/* Order Details (Expandable) */}
                {isExpanded && (
                  <div className="border-t border-teal-500/30 bg-black/40 p-4">
                    {isLoadingDetails ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-teal-400" />
                        <span className="ml-2 text-gray-400">
                          Loading details...
                        </span>
                      </div>
                    ) : details ? (
                      <div className="space-y-4">
                        {/* Items */}
                        <div>
                          <h4 className="text-sm font-semibold text-teal-200 mb-2">
                            Items
                          </h4>
                          <div className="space-y-2">
                            {details.items.map((item) => (
                              <div
                                key={item.product_id}
                                className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-teal-500/20"
                              >
                                <div className="flex-1">
                                  <p className="text-white font-medium">
                                    {item.product_name}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    Qty: {item.quantity} × $
                                    {item.unit_price.toFixed(2)}
                                  </p>
                                </div>
                                <p className="text-yellow-400 font-bold">
                                  ${item.line_total.toFixed(2)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Notes */}
                        {details.notes && (
                          <div>
                            <h4 className="text-sm font-semibold text-teal-200 mb-2">
                              Notes
                            </h4>
                            <p className="text-gray-300 text-sm bg-black/40 p-3 rounded-lg border border-teal-500/20">
                              {details.notes}
                            </p>
                          </div>
                        )}

                        {/* Employee */}
                        {details.employee_username && (
                          <div>
                            <h4 className="text-sm font-semibold text-teal-200 mb-2">
                              Handled By
                            </h4>
                            <p className="text-gray-300 text-sm">
                              Employee: {details.employee_username}
                            </p>
                          </div>
                        )}

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <h4 className="text-gray-400 mb-1">Created</h4>
                            <p className="text-white">
                              {new Date(details.created_at).toLocaleString()}
                            </p>
                          </div>
                          {details.completed_at && (
                            <div>
                              <h4 className="text-gray-400 mb-1">Completed</h4>
                              <p className="text-white">
                                {new Date(
                                  details.completed_at,
                                ).toLocaleString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-red-400 text-center py-4">
                        Failed to load order details
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
