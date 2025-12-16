from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


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
    username: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
