const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  phone_number: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  birth_date: string | null;
  user_id: number;
  username: string;
  created_at: string;
}

export async function getCustomerByUserId(userId: number): Promise<Customer> {
  const url = `${API_URL}/customers/user/${userId}`;
  const response = await fetch(url);

  if (!response.ok) {
    let bodyText: string;
    try {
      bodyText = await response.text();
    } catch {
      bodyText = "<could not read response body>";
    }
    throw new Error(
      `Failed to fetch customer: ${response.status} ${response.statusText} - ${bodyText}`,
    );
  }

  return response.json();
}
export async function getCustomer(customerId: number): Promise<Customer> {
  const response = await fetch(`${API_URL}/customers/${customerId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch customer");
  }

  return response.json();
}

export async function getAllCustomers(): Promise<Customer[]> {
  const response = await fetch(`${API_URL}/customers/`);

  if (!response.ok) {
    throw new Error("Failed to fetch customers");
  }

  return response.json();
}