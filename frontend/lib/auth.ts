const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface AuthData {
  token: string;
  role: string;
  username: string;
}

export interface DecodedToken {
  sub: string;
  role: string;
  exp: number;
}

export interface CustomerRegisterData {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  birth_date?: string;
}

export interface CustomerRegisterResponse {
  id: number;
  username: string;
  customer_id: number;
  first_name: string;
  last_name: string;
  message: string;
}

export interface CurrentUserResponse {
  id: number;
  username: string;
  role: string;
  customer_id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export async function registerCustomer(
  data: CustomerRegisterData,
): Promise<CustomerRegisterResponse> {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Registration failed");
  }

  return response.json();
}

export async function getCurrentUser(): Promise<CurrentUserResponse | null> {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) return null;

  return response.json();
}

// Decode token
export function decodeJWT(token: string): DecodedToken | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}

//Check JWT expiration
export function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;

  // exp is in seconds, Date.now() is in milliseconds
  return decoded.exp * 1000 < Date.now();
}

//Get authentication data from localStorage
export function getAuthData(): AuthData | null {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const username = localStorage.getItem("username");

  if (!token || !role || !username) return null;

  return { token, role, username };
}

export function isAuthenticated(): boolean {
  const authData = getAuthData();
  if (!authData) return false;

  return !isTokenExpired(authData.token);
}

export function hasRole(role: string): boolean {
  const authData = getAuthData();
  if (!authData) return false;

  return authData.role === role && !isTokenExpired(authData.token);
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("username");
}

export function getAuthHeader(): Record<string, string> {
  const authData = getAuthData();
  if (!authData) return {};

  return {
    Authorization: `Bearer ${authData.token}`,
  };
}
