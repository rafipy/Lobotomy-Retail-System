import { useState, useEffect } from "react";
import { 
  Package, 
  User, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  XCircle,
  Clock,
  Eye,
  UserPlus,
  Loader2,
  ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

// Types
interface OrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

interface Order {
  id: number;
  customer_id: number;
  customer_name: string;
  employee_id: number | null;
  employee_username: string | null;
  status: string;
  total_amount: number;
  notes: string | null;
  items: OrderItem[];
  created_at: string;
  completed_at: string | null;
}

function OrderManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [assigningOrder, setAssigningOrder] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "unassigned" | "assigned">("unassigned");

  // Get current employee info from localStorage
  const currentEmployeeId = parseInt(localStorage.getItem("user_id") || "0");
  const currentUsername = localStorage.getItem("username") || "Admin";

  // Fetch orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/customer-orders/pending");
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        console.error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  // Assign employee to order
  const assignEmployee = async (orderId: number) => {
    setAssigningOrder(orderId);
    try {
      const response = await fetch(
        `http://localhost:8000/customer-orders/${orderId}/assign/${currentEmployeeId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        console.log("✅ Employee assigned successfully");
        // Refresh orders
        await fetchOrders();
        alert("Order assigned to you successfully!");
      } else {
        const error = await response.json();
        alert(`Failed to assign order: ${error.detail}`);
      }
    } catch (error) {
      console.error("Error assigning employee:", error);
      alert("Failed to assign order. Please try again.");
    } finally {
      setAssigningOrder(null);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(
        `http://localhost:8000/customer-orders/${orderId}/${newStatus}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        console.log(`✅ Order status updated to ${newStatus}`);
        await fetchOrders();
        alert(`Order ${newStatus} successfully!`);
        setShowDetailsDialog(false);
      } else {
        const error = await response.json();
        alert(`Failed to update order: ${error.detail}`);
      }
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order. Please try again.");
    }
  };

  // View order details
  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsDialog(true);
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (filter === "unassigned") return order.employee_id === null;
    if (filter === "assigned") return order.employee_id !== null;
    return true;
  });

  // Status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-500", text: "Pending" },
      processing: { color: "bg-blue-500", text: "Processing" },
      completed: { color: "bg-green-500", text: "Completed" },
      cancelled: { color: "bg-red-500", text: "Cancelled" },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge className={`${config.color} text-white`}>
        {config.text}
      </Badge>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8 animate-fade-in">
      <div className="bg-black/40 border-2 border-red-500 rounded-xl p-6 backdrop-blur-sm">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-heading font-bold text-teal-200 mb-2 flex items-center gap-2">
              <ShoppingBag className="h-6 w-6" />
              Order Management
            </h2>
            <p className="text-gray-400 font-body">
              Assign yourself to orders and manage their status
            </p>
          </div>
          <Button
            onClick={fetchOrders}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            Refresh Orders
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2">
          <Button
            onClick={() => setFilter("unassigned")}
            variant={filter === "unassigned" ? "default" : "outline"}
            className={filter === "unassigned" ? "bg-red-600 text-white" : ""}
          >
            Unassigned ({orders.filter(o => o.employee_id === null).length})
          </Button>
          <Button
            onClick={() => setFilter("assigned")}
            variant={filter === "assigned" ? "default" : "outline"}
            className={filter === "assigned" ? "bg-teal-600 text-white" : ""}
          >
            Assigned ({orders.filter(o => o.employee_id !== null).length})
          </Button>
          <Button
            onClick={() => setFilter("all")}
            variant={filter === "all" ? "default" : "outline"}
            className={filter === "all" ? "bg-teal-600 text-white" : ""}
          >
            All ({orders.length})
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
            <span className="ml-3 text-gray-400">Loading orders...</span>
          </div>
        )}

        {/* Orders List */}
        {!loading && filteredOrders.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl font-body">No {filter} orders found</p>
          </div>
        )}

        {!loading && filteredOrders.length > 0 && (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className={`bg-black/60 border-2 rounded-xl p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${
                  order.employee_id === null
                    ? "border-yellow-500 hover:shadow-yellow-500/50"
                    : order.employee_id === currentEmployeeId
                    ? "border-teal-500 hover:shadow-teal-500/50"
                    : "border-gray-600 hover:shadow-gray-500/50"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-xl font-heading font-bold text-teal-200">
                        Order #{order.id}
                      </h3>
                      {getStatusBadge(order.status)}
                      {order.employee_id === null && (
                        <Badge className="bg-yellow-500 text-black">
                          🆕 Unassigned
                        </Badge>
                      )}
                      {order.employee_id === currentEmployeeId && (
                        <Badge className="bg-teal-600 text-white">
                          👤 Your Order
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-300">
                        <User className="h-4 w-4 text-teal-400" />
                        <span>{order.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Package className="h-4 w-4 text-teal-400" />
                        <span>{order.items.length} items</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <DollarSign className="h-4 w-4 text-yellow-400" />
                        <span className="text-yellow-400 font-bold">
                          ${order.total_amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar className="h-4 w-4 text-teal-400" />
                        <span>
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {order.employee_username && (
                      <div className="flex items-center gap-2 text-sm text-teal-300">
                        <UserPlus className="h-4 w-4" />
                        <span>
                          Assigned to: <strong>{order.employee_username}</strong>
                        </span>
                      </div>
                    )}

                    {order.notes && (
                      <div className="text-sm text-gray-400 italic">
                        Note: {order.notes}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 min-w-[180px]">
                    <Button
                      onClick={() => viewOrderDetails(order)}
                      className="bg-teal-600 hover:bg-teal-700 text-white w-full"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>

                    {order.employee_id === null && (
                      <Button
                        onClick={() => assignEmployee(order.id)}
                        disabled={assigningOrder === order.id}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white w-full"
                      >
                        {assigningOrder === order.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Assigning...
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Take Order
                          </>
                        )}
                      </Button>
                    )}

                    {order.employee_id === currentEmployeeId &&
                      order.status === "pending" && (
                        <Button
                          onClick={() => updateOrderStatus(order.id, "process")}
                          className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Start Processing
                        </Button>
                      )}

                    {order.employee_id === currentEmployeeId &&
                      order.status === "processing" && (
                        <Button
                          onClick={() => updateOrderStatus(order.id, "complete")}
                          className="bg-green-600 hover:bg-green-700 text-white w-full"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Complete Order
                        </Button>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="bg-black border-2 border-teal-500 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading text-teal-200">
              Order #{selectedOrder?.id} Details
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Complete order information and items
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="bg-black/40 border border-teal-500/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Status:</span>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Customer:</span>
                  <span className="text-white font-semibold">
                    {selectedOrder.customer_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Assigned To:</span>
                  <span className="text-teal-300 font-semibold">
                    {selectedOrder.employee_username || "Unassigned"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Order Date:</span>
                  <span className="text-white">
                    {new Date(selectedOrder.created_at).toLocaleString()}
                  </span>
                </div>
                {selectedOrder.notes && (
                  <div className="pt-2 border-t border-teal-500/30">
                    <span className="text-gray-400 block mb-1">Notes:</span>
                    <span className="text-white italic">
                      {selectedOrder.notes}
                    </span>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold text-teal-200 mb-3">
                  Order Items
                </h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="bg-black/40 border border-teal-500/30 rounded-lg p-3 flex justify-between items-center"
                    >
                      <div>
                        <div className="text-white font-semibold">
                          {item.product_name}
                        </div>
                        <div className="text-sm text-gray-400">
                          ${item.unit_price.toFixed(2)} × {item.quantity}
                        </div>
                      </div>
                      <div className="text-yellow-400 font-bold">
                        ${item.line_total.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="bg-teal-900/30 border border-teal-500/50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-semibold text-white">
                    Total Amount:
                  </span>
                  <span className="text-2xl font-bold text-yellow-400">
                    ${selectedOrder.total_amount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end">
                {selectedOrder.employee_id === null && (
                  <Button
                    onClick={() => {
                      assignEmployee(selectedOrder.id);
                      setShowDetailsDialog(false);
                    }}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Take This Order
                  </Button>
                )}
                {selectedOrder.employee_id === currentEmployeeId &&
                  selectedOrder.status === "pending" && (
                    <Button
                      onClick={() =>
                        updateOrderStatus(selectedOrder.id, "process")
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Start Processing
                    </Button>
                  )}
                {selectedOrder.employee_id === currentEmployeeId &&
                  selectedOrder.status === "processing" && (
                    <Button
                      onClick={() =>
                        updateOrderStatus(selectedOrder.id, "complete")
                      }
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Order
                    </Button>
                  )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default OrderManagementPage;