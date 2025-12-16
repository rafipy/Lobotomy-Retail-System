# backend/app/routers/users.py
# Create this new file for user management endpoints

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import date

from app.database import get_db
from app.utils.auth import get_password_hash

router = APIRouter(prefix="/api/users", tags=["users"])

# ============================================
# SCHEMAS FOR USER SETTINGS
# ============================================

class UserProfileResponse(BaseModel):
    """
    Response model for user profile data
    Contains both user account info and customer/admin details
    """
    # Basic user info (from users table)
    user_id: int
    username: str
    role: str  # 'customer' or 'admin'
    created_at: str
    
    # Customer-specific info (from customers table)
    customer_id: Optional[int] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    birth_date: Optional[str] = None


class UpdateUserProfile(BaseModel):
    """
    Model for updating user profile
    All fields are optional so user can update only what they want
    """
    # Customer info that can be updated
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    birth_date: Optional[date] = None
    
    @field_validator("email")
    @classmethod
    def validate_email(cls, v: Optional[str]) -> Optional[str]:
        """Validate email format if provided"""
        if v and v.strip():
            if "@" not in v or "." not in v:
                raise ValueError("Invalid email format")
        return v


class ChangePassword(BaseModel):
    """Model for password change"""
    current_password: str
    new_password: str
    confirm_password: str
    
    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Ensure password meets minimum requirements"""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v


# ============================================
# ENDPOINTS
# ============================================

@router.get("/{user_id}/profile", response_model=UserProfileResponse)
def get_user_profile(user_id: int, db=Depends(get_db)):
    """
    Get complete user profile including customer details
    
    WHY: We need to fetch data from both 'users' and 'customers' tables
    because user account info is separate from personal customer info
    
    WHAT IT DOES:
    1. Fetches basic user data (username, role) from users table
    2. If user is a customer, joins with customers table to get personal info
    3. Returns combined data
    """
    cursor = db["cursor"]
    
    # Fetch user data with optional customer data (LEFT JOIN)
    # LEFT JOIN means: include user even if no customer record exists
    cursor.execute("""
        SELECT 
            u.id as user_id,
            u.username,
            u.role,
            u.created_at,
            c.id as customer_id,
            c.first_name,
            c.last_name,
            c.email,
            c.phone_number,
            c.address,
            c.city,
            c.postal_code,
            c.birth_date
        FROM users u
        LEFT JOIN customers c ON u.id = c.user_id
        WHERE u.id = %s
    """, (user_id,))
    
    user = cursor.fetchone()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Convert database row to response model
    # We convert birth_date to string because dates can't be JSON serialized
    return UserProfileResponse(
        user_id=user["user_id"],
        username=user["username"],
        role=user["role"],
        created_at=str(user["created_at"]),
        customer_id=user.get("customer_id"),
        first_name=user.get("first_name"),
        last_name=user.get("last_name"),
        email=user.get("email"),
        phone_number=user.get("phone_number"),
        address=user.get("address"),
        city=user.get("city"),
        postal_code=user.get("postal_code"),
        birth_date=str(user.get("birth_date")) if user.get("birth_date") else None,
    )


@router.put("/{user_id}/profile")
def update_user_profile(user_id: int, update_data: UpdateUserProfile, db=Depends(get_db)):
    """
    Update user profile information
    
    WHY: Users need to be able to update their personal information
    Only updates the customers table since user account info (username/role) shouldn't change
    
    WHAT IT DOES:
    1. Checks if user has a customer record
    2. Builds dynamic UPDATE query with only the fields provided
    3. Updates the database
    4. Returns updated profile
    """
    cursor = db["cursor"]
    
    # First, check if user exists and has a customer record
    cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if customer record exists
    cursor.execute("SELECT id FROM customers WHERE user_id = %s", (user_id,))
    customer = cursor.fetchone()
    
    if not customer:
        # If no customer record exists, create one first
        # This handles the case where admin users want to add customer info
        cursor.execute("""
            INSERT INTO customers (user_id, first_name, last_name, created_at)
            VALUES (%s, %s, %s, NOW())
        """, (user_id, "User", str(user_id)))
        customer_id = cursor.lastrowid
    else:
        customer_id = customer["id"]
    
    # Build dynamic UPDATE query
    # WHY DYNAMIC: Only update fields that were actually provided
    # This allows partial updates (e.g., only email without changing address)
    update_fields = []
    update_values = []
    
    # model_dump(exclude_unset=True) returns only fields that were set in the request
    # Example: if user only sends {email: "new@email.com"}, only email is in this dict
    for field, value in update_data.model_dump(exclude_unset=True).items():
        if value is not None:  # Skip None values
            update_fields.append(f"{field} = %s")
            update_values.append(value)
    
    if not update_fields:
        # No fields to update, return current profile
        return get_user_profile(user_id, db)
    
    # Add customer_id to values for WHERE clause
    update_values.append(customer_id)
    
    # Execute the UPDATE
    # Example SQL: UPDATE customers SET email = %s, phone_number = %s WHERE id = %s
    sql = f"UPDATE customers SET {', '.join(update_fields)} WHERE id = %s"
    cursor.execute(sql, tuple(update_values))
    
    print(f"✅ Updated {cursor.rowcount} customer record(s)")
    
    # Return the updated profile
    return get_user_profile(user_id, db)


@router.put("/{user_id}/password")
def change_password(user_id: int, password_data: ChangePassword, db=Depends(get_db)):
    """
    Change user password
    
    WHY: Users need to be able to change their password securely
    
    WHAT IT DOES:
    1. Verifies the current password is correct (security measure)
    2. Checks new password matches confirmation
    3. Hashes the new password (NEVER store plain text!)
    4. Updates the database
    """
    from app.utils.auth import verify_password
    
    cursor = db["cursor"]
    
    # Fetch current password hash
    cursor.execute(
        "SELECT password_hash FROM users WHERE id = %s", 
        (user_id,)
    )
    user = cursor.fetchone()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify current password is correct
    # WHY: Prevents someone who got access to a logged-in session from changing password
    if not verify_password(password_data.current_password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    # Check new password matches confirmation
    if password_data.new_password != password_data.confirm_password:
        raise HTTPException(status_code=400, detail="New passwords do not match")
    
    # Hash the new password
    # WHY: NEVER store passwords in plain text for security
    new_password_hash = get_password_hash(password_data.new_password)
    
    # Update password in database
    cursor.execute(
        "UPDATE users SET password_hash = %s WHERE id = %s",
        (new_password_hash, user_id)
    )
    
    print(f"✅ Password updated for user {user_id}")
    
    return {"message": "Password changed successfully"}


@router.delete("/{user_id}/account")
def delete_user_account(user_id: int, password: str, db=Depends(get_db)):
    """
    Delete user account (with password confirmation)
    
    WHY: Users should be able to delete their accounts
    Requires password confirmation for security
    
    WHAT IT DOES:
    1. Verifies password
    2. Deletes customer record (if exists)
    3. Deletes user account
    
    NOTE: This is a hard delete. In production, you might want "soft delete"
    (marking as deleted but keeping data for legal/audit purposes)
    """
    from app.utils.auth import verify_password
    
    cursor = db["cursor"]
    
    # Verify user exists and password is correct
    cursor.execute(
        "SELECT password_hash FROM users WHERE id = %s", 
        (user_id,)
    )
    user = cursor.fetchone()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not verify_password(password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Incorrect password")
    
    # Delete customer record first (if exists)
    # WHY FIRST: Foreign key constraint - must delete child records before parent
    cursor.execute("DELETE FROM customers WHERE user_id = %s", (user_id,))
    
    # Delete user account
    cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
    
    print(f"✅ Deleted user account {user_id}")
    
    return {"message": "Account deleted successfully"}


# ============================================
# STATISTICS ENDPOINTS (Optional - for admin)
# ============================================

@router.get("/{user_id}/statistics")
def get_user_statistics(user_id: int, db=Depends(get_db)):
    """
    Get user statistics (order count, total spent, etc.)
    Useful for showing on settings page
    """
    cursor = db["cursor"]
    
    # Get customer_id from user_id
    cursor.execute(
        "SELECT id FROM customers WHERE user_id = %s", 
        (user_id,)
    )
    customer = cursor.fetchone()
    
    if not customer:
        return {
            "total_orders": 0,
            "total_spent": 0,
            "completed_orders": 0,
        }
    
    customer_id = customer["id"]
    
    # Get order statistics
    cursor.execute("""
        SELECT 
            COUNT(*) as total_orders,
            COALESCE(SUM(total_amount), 0) as total_spent,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_orders
        FROM customer_orders
        WHERE customer_id = %s
    """, (customer_id,))
    
    stats = cursor.fetchone()
    
    return {
        "total_orders": stats["total_orders"],
        "total_spent": float(stats["total_spent"]),
        "completed_orders": stats["completed_orders"],
    }