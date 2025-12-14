from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel


class SupplierOrderStatus(str, Enum):
    PROCESSING = "processing"
    ARRIVED = "arrived"
    COMPLETED = "completed"


# Item schemas
class SupplierOrderItemCreate(BaseModel):
    product_id: int
    quantity: int


class SupplierOrderItemResponse(BaseModel):
    product_id: int
    product_name: str
    quantity: int
    unit_price: float
    line_total: float

    class Config:
        from_attributes = True


# Order schemas
class SupplierOrderCreate(BaseModel):
    """For single product order"""

    product_id: int
    quantity: int
    employee_id: Optional[int] = None


class BulkSupplierOrderCreate(BaseModel):
    """For bulk order - multiple products"""

    items: list[SupplierOrderItemCreate]
    employee_id: Optional[int] = None


class SupplierOrderResponse(BaseModel):
    id: int
    supplier_id: int
    supplier_name: str
    employee_id: Optional[int] = None
    employee_username: Optional[str] = None
    status: SupplierOrderStatus
    total_cost: float
    items: list[SupplierOrderItemResponse]
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SupplierOrderListResponse(BaseModel):
    """Simplified response for listing orders"""

    id: int
    supplier_id: int
    supplier_name: str
    employee_id: Optional[int] = None
    employee_username: Optional[str] = None
    status: SupplierOrderStatus
    total_cost: float
    item_count: int
    created_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SupplierOrderWithItems(BaseModel):
    """Full order details with items"""

    id: int
    supplier_id: int
    supplier_name: str
    employee_id: Optional[int] = None
    employee_username: Optional[str] = None
    status: SupplierOrderStatus
    total_cost: float
    items: list[SupplierOrderItemResponse]
    created_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
