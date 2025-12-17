const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Debug helper - logs API calls in development
function debugLog(message: string, data?: unknown) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[Settings API] ${message}`, data ?? "");
  }
}

export interface UserProfile {
  user_id: number;
  username: string;
  role: string;
  created_at: string;
  customer_id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  birth_date?: string;
}

export interface UpdateCustomerProfileData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  address?: string;
  city?: string;
  postal_code?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export async function getUserProfile(userId: number): Promise<UserProfile> {
  const url = `${API_URL}/api/users/${userId}/profile`;
  debugLog(`Fetching profile for user ${userId}`, { url });

  try {
    const response = await fetch(url);
    debugLog(`Profile response status: ${response.status}`, {
      ok: response.ok,
      statusText: response.statusText,
    });

    if (!response.ok) {
      const errorText = await response.text();
      debugLog(`Profile error response body:`, errorText);
      let error: { detail?: string } = {};
      try {
        error = JSON.parse(errorText);
      } catch {}
      throw new Error(
        error.detail || `Failed to load profile (HTTP ${response.status})`,
      );
    }

    const data = await response.json();
    debugLog(`Profile loaded successfully:`, data);
    return data;
  } catch (err) {
    debugLog(`Profile fetch error:`, err);
    throw err;
  }
}

export async function updateUsername(
  userId: number,
  newUsername: string,
): Promise<void> {
  const response = await fetch(`${API_URL}/api/users/${userId}/username`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ new_username: newUsername }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Failed to update username");
  }
}

export async function updateCustomerProfile(
  userId: number,
  updates: UpdateCustomerProfileData,
): Promise<UserProfile> {
  const response = await fetch(`${API_URL}/api/users/${userId}/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Failed to update profile");
  }
  return response.json();
}

export async function changePassword(
  userId: number,
  passwordData: ChangePasswordData,
): Promise<void> {
  const response = await fetch(`${API_URL}/api/users/${userId}/password`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(passwordData),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Failed to change password");
  }
}

export async function updateUsernameByUserId(
  targetUserId: number,
  newUsername: string,
): Promise<void> {
  const response = await fetch(
    `${API_URL}/api/users/${targetUserId}/username`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ new_username: newUsername }),
    },
  );
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Failed to update username");
  }
}

export async function getUserByUserId(userId: number): Promise<UserProfile> {
  const response = await fetch(`${API_URL}/api/users/${userId}/profile`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "User not found");
  }
  return response.json();
}
