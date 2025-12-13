from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, field_validator


class PaymentMethod(str, Enum):
    CASH = "cash"
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    BANK_TRANSFER = "bank_transfer"
    E_WALLET = "e_wallet"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class PaymentCreate(BaseModel):
    customer_order_id: int
    amount: float
    payment_method: PaymentMethod
    transaction_reference: Optional[str] = None

    @field_validator("amount")
    @classmethod
    def amount_must_be_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Payment amount must be greater than 0")
        return v

    @field_validator("customer_order_id")
    @classmethod
    def order_id_must_be_valid(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("Invalid customer order ID")
        return v


class PaymentUpdate(BaseModel):
    payment_status: Optional[PaymentStatus] = None
    transaction_reference: Optional[str] = None


class PaymentResponse(BaseModel):
    id: int
    customer_order_id: int
    amount: float
    payment_method: PaymentMethod
    payment_status: PaymentStatus
    transaction_reference: Optional[str] = None
    payment_date: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PaymentWithOrderInfo(BaseModel):
    id: int
    customer_order_id: int
    customer_id: int
    customer_name: str
    order_total: float
    amount: float
    payment_method: PaymentMethod
    payment_status: PaymentStatus
    transaction_reference: Optional[str] = None
    payment_date: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PaymentListResponse(BaseModel):
    id: int
    customer_order_id: int
    amount: float
    payment_method: PaymentMethod
    payment_status: PaymentStatus
    payment_date: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PaymentSummary(BaseModel):
    customer_order_id: int
    order_total: float
    total_paid: float
    remaining_balance: float
    payment_count: int
    is_fully_paid: bool

    class Config:
        from_attributes = True
