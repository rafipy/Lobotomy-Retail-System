const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Product {
  id: number;
  name: string;
  description: string | null;
  selling_price: number;
  purchase_price: number;
  supplier_name: string;
  stock: number;
  category: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${API_URL}/products/`);

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
}
