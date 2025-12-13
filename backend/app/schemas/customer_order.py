from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel


class CustomerOrderStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class CustomerOrderItemCreate(BaseModel):
    product_id: int
    quantity: int


class CustomerOrderItemResponse(BaseModel):
    product_id: int
    product_name: str
    quantity: int
    unit_price: float
    line_total: float

    class Config:
        from_attributes = True


class CustomerOrderCreate(BaseModel):
    customer_id: int
    employee_id: Optional[int] = None
    items: list[CustomerOrderItemCreate]
    notes: Optional[str] = None


class CustomerOrderUpdate(BaseModel):
    status: Optional[CustomerOrderStatus] = None
    employee_id: Optional[int] = None
    notes: Optional[str] = None


class CustomerOrderResponse(BaseModel):
    id: int
    customer_id: int
    customer_name: str
    employee_id: Optional[int] = None
    employee_username: Optional[str] = None
    status: CustomerOrderStatus
    total_amount: float
    notes: Optional[str] = None
    items: list[CustomerOrderItemResponse]
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CustomerOrderListResponse(BaseModel):
    id: int
    customer_id: int
    customer_name: str
    employee_id: Optional[int] = None
    employee_username: Optional[str] = None
    status: CustomerOrderStatus
    total_amount: float
    item_count: int
    created_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CustomerOrderWithItems(BaseModel):
    id: int
    customer_id: int
    customer_name: str
    employee_id: Optional[int] = None
    employee_username: Optional[str] = None
    status: CustomerOrderStatus
    total_amount: float
    notes: Optional[str] = None
    items: list[CustomerOrderItemResponse]
    created_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
