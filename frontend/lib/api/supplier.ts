const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Supplier {
  id: number;
  code: string;
  name: string;
  full_name: string;
  description: string | null;
  address: string;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupplierBrief {
  id: number;
  code: string;
  name: string;
  full_name: string;
  description: string | null;
}

export async function getSuppliers(): Promise<Supplier[]> {
  const response = await fetch(`${API_URL}/suppliers/`);

  if (!response.ok) {
    throw new Error("Failed to fetch suppliers");
  }

  return response.json();
}

export async function getActiveSuppliers(): Promise<SupplierBrief[]> {
  const response = await fetch(`${API_URL}/suppliers/active`);

  if (!response.ok) {
    throw new Error("Failed to fetch active suppliers");
  }

  return response.json();
}

export async function seedSuppliers(): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/suppliers/seed`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to seed suppliers");
  }

  return response.json();
}
