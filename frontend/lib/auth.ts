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
