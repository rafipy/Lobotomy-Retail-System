"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  Package,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Truck,
  X,
  Clock,
  XCircle,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getPendingCustomerOrders,
  processOrder,
  completeOrder,
  cancelOrder,
  assignEmployee,
  CustomerOrder,
  CustomerOrderStatus,
} from "@/lib/api/customer-orders";
import { getEmployeeByUserId, Employee } from "@/lib/api/employees";

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

export function AdminOrdersSection() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());

  // Fetch employee for current user
  useEffect(() => {
    // Only run in browser
    try {
      const rawUserId =
        typeof window !== "undefined" ? localStorage.getItem("user_id") : null;
      if (!rawUserId) {
        console.warn("No user_id in localStorage; cannot load employee");
        return;
      }
      const parsed = parseInt(rawUserId, 10);
      if (Number.isNaN(parsed)) {
        console.warn("Invalid user_id in localStorage:", rawUserId);
        return;
      }

      getEmployeeByUserId(parsed)
        .then((emp) => {
          setEmployee(emp);
        })
        .catch((err) => {
          console.error("Failed to fetch employee for current user:", err);
        });
    } catch (err) {
      console.error("Error while trying to load employee:", err);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPendingCustomerOrders();
      setOrders(data);
      setError(null);
    } catch (err) {
      setError("Failed to load orders");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  function toggleExpanded(orderId: number) {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  }

  // Assign employee then process order
  async function handleProcessOrder(orderId: number) {
    if (!employee) {
      alert("Employee not loaded. Cannot process order.");
      return;
    }

    try {
      setActionLoading(orderId);

      // Assign employee to order first
      await assignEmployee(orderId, employee.id);

      // Then mark order as processing
      await processOrder(orderId);

      await fetchOrders();
    } catch (err) {
      console.error("Failed to process order:", err);
      alert(err instanceof Error ? err.message : "Failed to process order");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCompleteOrder(orderId: number) {
    try {
      setActionLoading(orderId);
      await completeOrder(orderId);
      await fetchOrders();
    } catch (err) {
      console.error("Failed to complete order:", err);
      alert(err instanceof Error ? err.message : "Failed to complete order");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCancelOrder(orderId: number) {
    if (
      !confirm(
        "Are you sure you want to cancel this order? Stock will be restored.",
      )
    ) {
      return;
    }

    try {
      setActionLoading(orderId);
      await cancelOrder(orderId);
      await fetchOrders();
    } catch (err) {
      console.error("Failed to cancel order:", err);
      alert(err instanceof Error ? err.message : "Failed to cancel order");
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
        <span className="ml-3 text-gray-400">Loading orders...</span>
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
      <div className="w-full max-w-6xl mx-auto px-6 py-12 animate-fade-in">
        <div className="bg-black/60 border-2 border-teal-500 rounded-xl p-8 backdrop-blur-sm text-center">
          <Package className="h-16 w-16 mx-auto mb-4 text-gray-500" />
          <h2 className="text-xl font-heading text-gray-400">
            No Pending Orders
          </h2>
          <p className="text-gray-500 mt-2">All orders have been processed!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-8 animate-fade-in">
      <div className="bg-black/40 border-2 border-teal-500 rounded-xl p-6 backdrop-blur-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-heading font-bold text-teal-200 mb-2 flex items-center gap-2">
            <Package className="h-6 w-6" />
            Customer Orders ({orders.length})
          </h2>
          <p className="text-gray-400 font-body">
            Manage and process customer orders
          </p>
        </div>

        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrders.has(order.id);
            const statusConfig = STATUS_CONFIG[order.status];
            const isProcessingAction = actionLoading === order.id;

            return (
              <div
                key={order.id}
                className={`bg-black/60 border-2 rounded-xl overflow-hidden ${
                  order.status === "pending"
                    ? "border-yellow-500/50"
                    : "border-blue-500/50"
                }`}
              >
                {/* Order Header */}
                <div className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Package
                      className={`h-8 w-8 ${
                        order.status === "pending"
                          ? "text-yellow-400"
                          : "text-blue-400"
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-lg font-heading font-bold text-teal-200">
                          Order #{order.id}
                        </h4>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border-2 flex items-center gap-1 ${statusConfig.className}`}
                        >
                          {statusConfig.icon}
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="flex gap-3 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {order.customer_name}
                        </span>
                        <span>•</span>
                        <span>{order.items.length} item(s)</span>
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
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(order.id)}
                      className="text-gray-400 hover:bg-teal-900/30"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>

                    {order.status === "pending" ? (
                      <Button
                        size="sm"
                        onClick={() => handleProcessOrder(order.id)}
                        disabled={isProcessingAction || !employee}
                        className="bg-blue-600 hover:bg-blue-700 text-white border border-blue-400"
                        title={
                          !employee ? "Employee not loaded" : "Process order"
                        }
                      >
                        {isProcessingAction ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Truck className="mr-2 h-4 w-4" />
                            Process
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleCompleteOrder(order.id)}
                        disabled={isProcessingAction}
                        className="bg-teal-600 hover:bg-teal-700 text-white border border-teal-400"
                      >
                        {isProcessingAction ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Complete
                          </>
                        )}
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={isProcessingAction}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/30 h-8 w-8 p-0"
                      title="Cancel Order"
                    >
                      {isProcessingAction ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Order Details (Expandable) */}
                {isExpanded && (
                  <div className="border-t border-gray-700 bg-black/40 p-4">
                    <div className="space-y-4">
                      {/* Items */}
                      <div>
                        <h4 className="text-sm font-semibold text-teal-200 mb-2">
                          Items
                        </h4>
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-gray-400 text-left">
                              <th className="pb-2">Product</th>
                              <th className="pb-2 text-right">Qty</th>
                              <th className="pb-2 text-right">Unit Price</th>
                              <th className="pb-2 text-right">Line Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items.map((item) => (
                              <tr
                                key={item.product_id}
                                className="border-t border-gray-800"
                              >
                                <td className="py-2 text-teal-200">
                                  {item.product_name}
                                </td>
                                <td className="py-2 text-right text-white">
                                  {item.quantity}
                                </td>
                                <td className="py-2 text-right text-gray-300">
                                  ${item.unit_price.toFixed(2)}
                                </td>
                                <td className="py-2 text-right text-yellow-400">
                                  ${item.line_total.toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Notes */}
                      {order.notes && (
                        <div>
                          <h4 className="text-sm font-semibold text-teal-200 mb-2">
                            Order Notes
                          </h4>
                          <p className="text-gray-300 text-sm bg-black/40 p-3 rounded-lg border border-teal-500/20">
                            {order.notes}
                          </p>
                        </div>
                      )}

                      {/* Employee */}
                      {order.employee_username && (
                        <div>
                          <h4 className="text-sm font-semibold text-teal-200 mb-2">
                            Assigned Employee
                          </h4>
                          <p className="text-gray-300 text-sm">
                            {order.employee_username}
                          </p>
                        </div>
                      )}

                      {/* Dates */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <h4 className="text-gray-400 mb-1">Created</h4>
                          <p className="text-white">
                            {new Date(order.created_at).toLocaleString()}
                          </p>
                        </div>
                        {order.completed_at && (
                          <div>
                            <h4 className="text-gray-400 mb-1">Completed</h4>
                            <p className="text-white">
                              {new Date(order.completed_at).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
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
