const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Product {
  id: number;
  name: string;
  description: string | null;
  selling_price: number;
  purchase_price: number;
  supplier_id: number;
  supplier_name: string;
  stock: number;
  reorder_level: number;
  reorder_amount: number;
  category: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductCreate {
  name: string;
  description?: string | null;
  selling_price: number;
  purchase_price: number;
  supplier_id: number;
  stock: number;
  reorder_level?: number;
  reorder_amount?: number;
  category: string;
  image_url?: string | null;
}

export interface ProductUpdate {
  name?: string;
  description?: string | null;
  selling_price?: number;
  purchase_price?: number;
  supplier_id?: number;
  stock?: number;
  reorder_level?: number;
  reorder_amount?: number;
  category?: string;
  image_url?: string | null;
}

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${API_URL}/products/`);

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
}

export async function createProduct(product: ProductCreate): Promise<Product> {
  const response = await fetch(`${API_URL}/products/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to create product");
  }

  return response.json();
}

export async function updateProduct(
  productId: number,
  product: ProductUpdate,
): Promise<Product> {
  const response = await fetch(`${API_URL}/products/${productId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to update product");
  }

  return response.json();
}

export async function deleteProduct(productId: number): Promise<void> {
  const response = await fetch(`${API_URL}/products/${productId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete product");
  }
}
