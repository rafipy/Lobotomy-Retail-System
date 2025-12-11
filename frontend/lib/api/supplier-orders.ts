const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type SupplierOrderStatus = "processing" | "arrived" | "completed";

export interface SupplierOrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface SupplierOrder {
  id: number;
  supplier_id: number;
  supplier_name: string;
  employee_id: number | null;
  employee_username: string | null;
  status: SupplierOrderStatus;
  total_cost: number;
  items: SupplierOrderItem[];
  created_at: string;
  completed_at: string | null;
}

export interface SupplierOrderCreate {
  product_id: number;
  quantity: number;
  employee_id?: number;
}

export interface BulkSupplierOrderItemCreate {
  product_id: number;
  quantity: number;
}

export interface BulkSupplierOrderCreate {
  items: BulkSupplierOrderItemCreate[];
  employee_id?: number;
}

export async function getSupplierOrders(): Promise<SupplierOrder[]> {
  const response = await fetch(`${API_URL}/supplier-orders/`);

  if (!response.ok) {
    throw new Error("Failed to fetch supplier orders");
  }

  return response.json();
}

export async function getPendingSupplierOrders(): Promise<SupplierOrder[]> {
  const response = await fetch(`${API_URL}/supplier-orders/pending`);

  if (!response.ok) {
    throw new Error("Failed to fetch pending supplier orders");
  }

  return response.json();
}

export async function createSupplierOrder(
  data: SupplierOrderCreate,
): Promise<SupplierOrder> {
  const response = await fetch(`${API_URL}/supplier-orders/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to create supplier order");
  }

  return response.json();
}

export async function createBulkSupplierOrder(
  data: BulkSupplierOrderCreate,
): Promise<SupplierOrder[]> {
  const response = await fetch(`${API_URL}/supplier-orders/bulk`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to create bulk supplier order");
  }

  return response.json();
}

export async function markSupplierOrderArrived(orderId: number): Promise<void> {
  const response = await fetch(`${API_URL}/supplier-orders/${orderId}/arrive`, {
    method: "PUT",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to mark order as arrived");
  }
}

export async function completeSupplierOrder(orderId: number): Promise<{
  message: string;
  stock_updates: Array<{
    product_name: string;
    quantity_added: number;
    new_stock: number;
  }>;
}> {
  const response = await fetch(
    `${API_URL}/supplier-orders/${orderId}/complete`,
    {
      method: "PUT",
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to complete supplier order");
  }

  return response.json();
}

export async function cancelSupplierOrder(orderId: number): Promise<void> {
  const response = await fetch(`${API_URL}/supplier-orders/${orderId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to cancel supplier order");
  }
}
