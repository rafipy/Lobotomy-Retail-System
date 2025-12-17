const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type CustomerOrderStatus =
  | "pending"
  | "processing"
  | "completed"
  | "cancelled";

export interface CustomerOrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface CustomerOrder {
  id: number;
  customer_id: number;
  customer_name: string;
  employee_id: number | null;
  employee_username: string | null;
  status: CustomerOrderStatus;
  total_amount: number;
  notes: string | null;
  items: CustomerOrderItem[];
  created_at: string;
  completed_at: string | null;
}

export interface CustomerOrderListItem {
  id: number;
  customer_id: number;
  customer_name: string;
  employee_id: number | null;
  employee_username: string | null;
  status: CustomerOrderStatus;
  total_amount: number;
  item_count: number;
  created_at: string;
  completed_at: string | null;
}

export interface CustomerOrderItemCreate {
  product_id: number;
  quantity: number;
}

export interface CustomerOrderCreate {
  customer_id: number;
  employee_id?: number;
  items: CustomerOrderItemCreate[];
  notes?: string;
}

// Get all orders for a specific customer
export async function getCustomerOrders(
  customerId: number,
): Promise<CustomerOrderListItem[]> {
  const response = await fetch(
    `${API_URL}/customer-orders/customer/${customerId}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch customer orders");
  }

  return response.json();
}

// Get single order details
export async function getCustomerOrder(
  orderId: number,
): Promise<CustomerOrder> {
  const response = await fetch(`${API_URL}/customer-orders/${orderId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch order details");
  }

  return response.json();
}

// Get all pending orders (for admin)
export async function getPendingCustomerOrders(): Promise<CustomerOrder[]> {
  const response = await fetch(`${API_URL}/customer-orders/pending`);

  if (!response.ok) {
    throw new Error("Failed to fetch pending orders");
  }

  return response.json();
}

// Get all orders (for admin)
export async function getAllCustomerOrders(): Promise<CustomerOrderListItem[]> {
  const response = await fetch(`${API_URL}/customer-orders/`);

  if (!response.ok) {
    throw new Error("Failed to fetch all orders");
  }

  return response.json();
}

// Create new order
export async function createCustomerOrder(
  orderData: CustomerOrderCreate,
): Promise<CustomerOrder> {
  const response = await fetch(`${API_URL}/customer-orders/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to create order");
  }

  return response.json();
}

// Mark order as processing and assign employee
export async function processOrder(
  orderId: number,
): Promise<{ message: string }> {
  const response = await fetch(
    `${API_URL}/customer-orders/${orderId}/process`,
    {
      method: "PUT",
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to process order");
  }

  return response.json();
}

// Complete order
export async function completeOrder(
  orderId: number,
): Promise<{ message: string }> {
  const response = await fetch(
    `${API_URL}/customer-orders/${orderId}/complete`,
    {
      method: "PUT",
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to complete order");
  }

  return response.json();
}

// Cancel order
export async function cancelOrder(
  orderId: number,
): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/customer-orders/${orderId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to cancel order");
  }

  return response.json();
}

// Assign employee to order
export async function assignEmployee(
  orderId: number,
  employeeId: number,
): Promise<{ message: string }> {
  const response = await fetch(
    `${API_URL}/customer-orders/${orderId}/assign/${employeeId}`,
    {
      method: "PUT",
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to assign employee");
  }

  return response.json();
}