from enum import Enum


class UserRole(str, Enum):
    ADMIN = "admin"
    CUSTOMER = "customer"


class SupplierOrderStatus(str, Enum):
    PROCESSING = "processing"
    ARRIVED = "arrived"
    COMPLETED = "completed"


class CustomerOrderStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


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


__all__ = [
    "UserRole",
    "SupplierOrderStatus",
    "CustomerOrderStatus",
    "PaymentMethod",
    "PaymentStatus",
]
