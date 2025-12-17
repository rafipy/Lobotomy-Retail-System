from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, field_validator


class UserProfileResponse(BaseModel):
    """Complete user profile data"""

    user_id: int
    username: str
    role: str
    created_at: str

    # Customer-specific (optional)
    customer_id: Optional[int] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    birth_date: Optional[str] = None


class UpdateCustomerProfile(BaseModel):
    """Update customer profile fields"""

    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    birth_date: Optional[str] = None  # Format: YYYY-MM-DD

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: Optional[str]) -> Optional[str]:
        if v and v.strip():
            if "@" not in v or "." not in v.split("@")[-1]:
                raise ValueError("Invalid email format")
            return v.strip()
        return v

    @field_validator("birth_date")
    @classmethod
    def validate_birth_date(cls, v: Optional[str]) -> Optional[str]:
        if v and v.strip():
            try:
                # Validate date format
                date.fromisoformat(v.strip())
                return v.strip()
            except ValueError:
                raise ValueError("Invalid date format. Use YYYY-MM-DD")
        return v


class UpdateUsername(BaseModel):
    """Update username (for both admin and customer)"""

    new_username: str

    @field_validator("new_username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters")
        if len(v) > 50:
            raise ValueError("Username must be less than 50 characters")
        # Only alphanumeric and underscore
        if not v.replace("_", "").isalnum():
            raise ValueError(
                "Username can only contain letters, numbers, and underscores"
            )
        return v


class ChangePassword(BaseModel):
    """Change user password"""

    current_password: str
    new_password: str
    confirm_password: str

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class UserStatistics(BaseModel):
    """User statistics for display"""

    total_orders: int
    total_spent: float
    completed_orders: int
