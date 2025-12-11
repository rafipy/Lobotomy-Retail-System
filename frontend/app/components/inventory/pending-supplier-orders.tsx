"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  Package,
  PackageCheck,
  Truck,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getPendingSupplierOrders,
  markSupplierOrderArrived,
  completeSupplierOrder,
  cancelSupplierOrder,
  SupplierOrder,
} from "@/lib/api/supplier-orders";

interface PendingSupplierOrdersProps {
  onStockUpdated: () => void;
  refreshTrigger?: number;
}

export function PendingSupplierOrders({
  onStockUpdated,
  refreshTrigger,
}: PendingSupplierOrdersProps) {
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPendingSupplierOrders();
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch supplier orders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders, refreshTrigger]);

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

  async function handleMarkArrived(orderId: number) {
    try {
      setActionLoading(orderId);
      await markSupplierOrderArrived(orderId);
      await fetchOrders();
    } catch (err) {
      console.error("Failed to mark as arrived:", err);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleComplete(orderId: number) {
    try {
      setActionLoading(orderId);
      await completeSupplierOrder(orderId);
      await fetchOrders();
      onStockUpdated();
    } catch (err) {
      console.error("Failed to complete supplier order:", err);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCancel(orderId: number) {
    try {
      setActionLoading(orderId);
      await cancelSupplierOrder(orderId);
      await fetchOrders();
    } catch (err) {
      console.error("Failed to cancel supplier order:", err);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-teal-400" />
        <span className="ml-2 text-gray-400">Loading supplier orders...</span>
      </div>
    );
  }

  if (orders.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-heading text-yellow-400 mb-3 flex items-center gap-2">
        <Truck className="h-5 w-5" />
        Pending Supplier Orders ({orders.length})
      </h3>
      <div className="grid gap-3">
        {orders.map((order) => {
          const isExpanded = expandedOrders.has(order.id);

          return (
            <div
              key={order.id}
              className={`bg-black/60 border-2 rounded-lg overflow-hidden ${
                order.status === "processing"
                  ? "border-yellow-500/50"
                  : "border-green-500/50"
              }`}
            >
              {/* Order Header */}
              <div className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {order.status === "processing" ? (
                    <Package className="h-8 w-8 text-yellow-400" />
                  ) : (
                    <PackageCheck className="h-8 w-8 text-green-400" />
                  )}
                  <div>
                    <h4 className="text-teal-200 font-semibold">
                      Order #{order.id} - {order.supplier_name}
                    </h4>
                    <div className="flex gap-3 text-xs text-gray-400">
                      <span>{order.items.length} item(s)</span>
                      <span>
                        Total:{" "}
                        <span className="text-yellow-400">
                          ${order.total_cost.toFixed(2)}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(order.id)}
                    className="text-gray-400 hover:bg-yellow-400"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.status === "processing"
                        ? "bg-yellow-900/50 text-yellow-400 border border-yellow-500"
                        : "bg-green-900/50 text-green-400 border border-green-500"
                    }`}
                  >
                    {order.status === "processing" ? "Processing" : "Arrived"}
                  </span>

                  {order.status === "processing" ? (
                    <Button
                      size="sm"
                      onClick={() => handleMarkArrived(order.id)}
                      disabled={actionLoading === order.id}
                      className="bg-green-600 hover:bg-green-700 text-white border border-green-400"
                    >
                      {actionLoading === order.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Mark Arrived"
                      )}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleComplete(order.id)}
                      disabled={actionLoading === order.id}
                      className="bg-teal-600 hover:bg-teal-700 text-white border border-teal-400"
                    >
                      {actionLoading === order.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Complete & Add Stock"
                      )}
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancel(order.id)}
                    disabled={actionLoading === order.id}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/30 h-8 w-8 p-0"
                    title="Cancel Order"
                  >
                    {actionLoading === order.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Order Items (Expandable) */}
              {isExpanded && (
                <div className="border-t border-gray-700 bg-black/40 p-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400 text-left">
                        <th className="pb-2">Product</th>
                        <th className="pb-2 text-right">Qty</th>
                        <th className="pb-2 text-right">Unit Price</th>
                        <th className="pb-2 text-right">Line Total</th>
                        <th className="pb-2 text-right">Employee</th>
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
                          <td className="py-2 text-right text-gray-300">
                            {order.employee_username}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
