import enum
from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    PrimaryKeyConstraint,
)
from sqlalchemy.orm import relationship

from app.database import Base


class SupplierOrderStatus(str, enum.Enum):
    PROCESSING = "processing"
    ARRIVED = "arrived"
    COMPLETED = "completed"


class SupplierOrder(Base):
    __tablename__ = "supplier_orders"

    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    employee_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(
        Enum(SupplierOrderStatus),
        default=SupplierOrderStatus.PROCESSING,
        nullable=False,
    )
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    supplier = relationship("Supplier", back_populates="supplier_orders")
    created_by_user = relationship("User", back_populates="supplier_orders")

    items = relationship(
        "SupplierOrderItem",
        back_populates="supplier_order",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class SupplierOrderItem(Base):
    """Weak entity - identified by supplier_order_id + product_id"""

    __tablename__ = "supplier_order_items"

    supplier_order_id = Column(
        Integer, ForeignKey("supplier_orders.id", ondelete="CASCADE"), nullable=False
    )
    product_id = Column(
        Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False
    )
    quantity = Column(Integer, nullable=False)

    __table_args__ = (PrimaryKeyConstraint("supplier_order_id", "product_id"),)

    supplier_order = relationship("SupplierOrder", back_populates="items")
    product = relationship("Product", back_populates="supplier_order_items")
