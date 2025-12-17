const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Employee {
  id: number;
  user_id: number;
  username: string;
}

export async function getEmployeeByUserId(userId: number): Promise<Employee> {
  const response = await fetch(`${API_URL}/employees/user/${userId}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch employee");
  }
  return response.json();
}