from datetime import date
from typing import Optional

from pydantic import BaseModel


class CustomerBase(BaseModel):
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    birth_date: Optional[date] = None


class CustomerCreate(CustomerBase):
    user_id: int


class CustomerUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None


class CustomerResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    birth_date: Optional[date] = None
    user_id: int
    username: Optional[str] = None

    class Config:
        from_attributes = True


class CustomerBrief(BaseModel):
    """Simplified customer info"""

    id: int
    first_name: str
    last_name: str

    class Config:
        from_attributes = True
