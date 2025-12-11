from datetime import datetime
from typing import Any, List, cast

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import (
    Product,
    SupplierOrder,
    SupplierOrderItem,
    SupplierOrderStatus,
    User,
)
from app.schemas.supplier_order import (
    BulkSupplierOrderCreate,
    SupplierOrderCreate,
    SupplierOrderItemResponse,
    SupplierOrderListResponse,
    SupplierOrderWithItems,
)

router = APIRouter(prefix="/supplier-orders", tags=["supplier-orders"])


def calculate_total_cost(order: SupplierOrder) -> float:
    """Calculate total cost from items using current product prices"""
    return sum(item.quantity * item.product.purchase_price for item in order.items)  # type: ignore[misc]


def build_order_response(order: SupplierOrder) -> SupplierOrderWithItems:
    """Helper to build order response with items"""
    items = []
    for item in order.items:
        unit_price = item.product.purchase_price
        items.append(
            SupplierOrderItemResponse(
                product_id=item.product_id,  # type: ignore[arg-type]
                product_name=item.product.name,  # type: ignore[arg-type]
                quantity=item.quantity,  # type: ignore[arg-type]
                unit_price=unit_price,  # type: ignore[arg-type]
                line_total=item.quantity * unit_price,  # type: ignore[arg-type]
            )
        )

    return SupplierOrderWithItems.model_validate(
        {
            "id": order.id,
            "supplier_id": order.supplier_id,
            "supplier_name": order.supplier.name if order.supplier else "Unknown",
            "employee_id": order.employee_id,
            "employee_username": order.created_by_user.username
            if order.created_by_user
            else None,
            "status": order.status,
            "total_cost": sum(item.line_total for item in items),
            "items": items,
            "created_at": order.created_at,
            "completed_at": order.completed_at,
        }
    )


@router.get("/", response_model=List[SupplierOrderListResponse])
def get_all_supplier_orders(db: Session = Depends(get_db)):
    """Get all supplier orders"""
    orders = (
        db.query(SupplierOrder)
        .options(
            joinedload(SupplierOrder.supplier),
            joinedload(SupplierOrder.created_by_user),
            joinedload(SupplierOrder.items).joinedload(SupplierOrderItem.product),
        )
        .order_by(SupplierOrder.created_at.desc())
        .all()
    )

    return [
        SupplierOrderListResponse.model_validate(
            {
                "id": order.id,
                "supplier_id": order.supplier_id,
                "supplier_name": order.supplier.name if order.supplier else "Unknown",
                "employee_id": order.employee_id,
                "employee_username": order.created_by_user.username
                if order.created_by_user
                else None,
                "status": order.status,
                "total_cost": calculate_total_cost(order),
                "item_count": len(order.items),
                "created_at": order.created_at,
                "completed_at": order.completed_at,
            }
        )
        for order in orders
    ]


@router.get("/pending", response_model=List[SupplierOrderWithItems])
def get_pending_supplier_orders(db: Session = Depends(get_db)):
    """Get all pending (processing/arrived) supplier orders with full details"""
    orders = (
        db.query(SupplierOrder)
        .options(
            joinedload(SupplierOrder.supplier),
            joinedload(SupplierOrder.created_by_user),
            joinedload(SupplierOrder.items).joinedload(SupplierOrderItem.product),
        )
        .filter(
            SupplierOrder.status.in_(
                [SupplierOrderStatus.PROCESSING, SupplierOrderStatus.ARRIVED]
            )
        )
        .order_by(SupplierOrder.created_at.desc())
        .all()
    )

    return [build_order_response(order) for order in orders]


@router.get("/{order_id}", response_model=SupplierOrderWithItems)
def get_supplier_order(order_id: int, db: Session = Depends(get_db)):
    """Get a specific supplier order with items"""
    order = (
        db.query(SupplierOrder)
        .options(
            joinedload(SupplierOrder.supplier),
            joinedload(SupplierOrder.created_by_user),
            joinedload(SupplierOrder.items).joinedload(SupplierOrderItem.product),
        )
        .filter(SupplierOrder.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(status_code=404, detail="Supplier order not found")

    return build_order_response(order)


@router.post("/", response_model=SupplierOrderWithItems)
def create_supplier_order(
    order_data: SupplierOrderCreate, db: Session = Depends(get_db)
):
    """Create a new supplier order for a single product"""
    product = (
        db.query(Product)
        .options(joinedload(Product.supplier))
        .filter(Product.id == order_data.product_id)
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Validate employee_id (admin user_id) if provided
    if order_data.employee_id:
        user = db.query(User).filter(User.id == order_data.employee_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

    # Create the order
    order = SupplierOrder(
        supplier_id=product.supplier_id,  # type: ignore[arg-type]
        employee_id=order_data.employee_id,
        status=SupplierOrderStatus.PROCESSING,
    )
    db.add(order)
    db.flush()

    # Create the order item
    order_item = SupplierOrderItem(
        supplier_order_id=order.id,  # type: ignore[arg-type]
        product_id=product.id,  # type: ignore[arg-type]
        quantity=order_data.quantity,
    )
    db.add(order_item)
    db.commit()

    # Reload with relationships
    order = (
        db.query(SupplierOrder)
        .options(
            joinedload(SupplierOrder.supplier),
            joinedload(SupplierOrder.created_by_user),
            joinedload(SupplierOrder.items).joinedload(SupplierOrderItem.product),
        )
        .filter(SupplierOrder.id == order.id)  # type: ignore[arg-type]
        .first()
    )

    if not order:
        raise HTTPException(status_code=500, detail="Failed to reload order")

    return build_order_response(order)


@router.post("/bulk", response_model=List[SupplierOrderWithItems])
def create_bulk_supplier_order(
    bulk_data: BulkSupplierOrderCreate, db: Session = Depends(get_db)
):
    """Create supplier orders grouped by supplier"""
    # Validate employee_id (admin user_id) if provided
    if bulk_data.employee_id:
        user = db.query(User).filter(User.id == bulk_data.employee_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

    # Group items by supplier
    supplier_items: dict[int, list[tuple[Product, int]]] = {}

    for item in bulk_data.items:
        product = (
            db.query(Product)
            .options(joinedload(Product.supplier))
            .filter(Product.id == item.product_id)
            .first()
        )
        if not product:
            continue

        sid: int = cast(int, product.supplier_id)
        if sid not in supplier_items:
            supplier_items[sid] = []
        supplier_items[sid].append((product, item.quantity))

    # Create one order per supplier
    created_orders: list[Any] = []

    for supplier_id, products_and_quantities in supplier_items.items():
        order = SupplierOrder(
            supplier_id=supplier_id,
            employee_id=bulk_data.employee_id,
            status=SupplierOrderStatus.PROCESSING,
        )
        db.add(order)
        db.flush()

        for product, quantity in products_and_quantities:
            order_item = SupplierOrderItem(
                supplier_order_id=order.id,  # type: ignore[arg-type]
                product_id=product.id,  # type: ignore[arg-type]
                quantity=quantity,
            )
            db.add(order_item)

        created_orders.append(order.id)

    db.commit()

    orders = (
        db.query(SupplierOrder)
        .options(
            joinedload(SupplierOrder.supplier),
            joinedload(SupplierOrder.created_by_user),
            joinedload(SupplierOrder.items).joinedload(SupplierOrderItem.product),
        )
        .filter(SupplierOrder.id.in_(created_orders))
        .all()
    )

    return [build_order_response(order) for order in orders]


@router.put("/{order_id}/arrive")
def mark_as_arrived(order_id: int, db: Session = Depends(get_db)):
    """Mark a supplier order as arrived"""
    order = db.query(SupplierOrder).filter(SupplierOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Supplier order not found")

    current_status = cast(SupplierOrderStatus, order.status)
    if current_status != SupplierOrderStatus.PROCESSING:
        raise HTTPException(status_code=400, detail="Order is not in processing state")

    order.status = SupplierOrderStatus.ARRIVED  # type: ignore[assignment]
    db.commit()

    return {"message": "Supplier order marked as arrived"}


@router.put("/{order_id}/complete")
def complete_supplier_order(order_id: int, db: Session = Depends(get_db)):
    """Complete a supplier order: add stock to products, then delete the order and its items."""
    order = (
        db.query(SupplierOrder)
        .options(
            joinedload(SupplierOrder.items).joinedload(SupplierOrderItem.product),
        )
        .filter(SupplierOrder.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Supplier order not found")

    current_status = cast(SupplierOrderStatus, order.status)
    if current_status != SupplierOrderStatus.ARRIVED:
        raise HTTPException(
            status_code=400, detail="Order must be marked as arrived first"
        )

    stock_updates = []
    for item in order.items:
        item.product.stock += item.quantity  # type: ignore[operator]
        stock_updates.append(
            {
                "product_name": item.product.name,
                "quantity_added": item.quantity,
                "new_stock": item.product.stock,
            }
        )

    order.status = SupplierOrderStatus.COMPLETED  # type: ignore[assignment]
    order.completed_at = datetime.utcnow()  # type: ignore[assignment]

    db.delete(order)
    db.commit()

    return {
        "message": f"Order completed and removed. Updated stock for {len(stock_updates)} products.",
        "stock_updates": stock_updates,
    }


@router.delete("/{order_id}")
def cancel_supplier_order(order_id: int, db: Session = Depends(get_db)):
    """Cancel/delete a supplier order (only if not completed)"""
    order = db.query(SupplierOrder).filter(SupplierOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Supplier order not found")

    current_status = cast(SupplierOrderStatus, order.status)
    if current_status == SupplierOrderStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Cannot cancel a completed order")

    db.delete(order)
    db.commit()

    return {"message": "Supplier order cancelled"}
