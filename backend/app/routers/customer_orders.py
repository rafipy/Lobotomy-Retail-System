from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.database import get_db
from app.schemas.customer_order import (
    CustomerOrderCreate,
    CustomerOrderListResponse,
    CustomerOrderUpdate,
    CustomerOrderWithItems,
)
from app.services import customer_order_service

router = APIRouter(prefix="/customer-orders", tags=["customer-orders"])


@router.get("/", response_model=List[CustomerOrderListResponse])
def get_all_customer_orders(db=Depends(get_db)):
    return customer_order_service.get_all_customer_orders(db)


@router.get("/pending", response_model=List[CustomerOrderWithItems])
def get_pending_customer_orders(db=Depends(get_db)):
    return customer_order_service.get_pending_customer_orders(db)


@router.get("/customer/{customer_id}", response_model=List[CustomerOrderListResponse])
def get_customer_orders_by_customer(customer_id: int, db=Depends(get_db)):
    return customer_order_service.get_customer_orders_by_customer(db, customer_id)


@router.get("/{order_id}", response_model=CustomerOrderWithItems)
def get_customer_order(order_id: int, db=Depends(get_db)):
    order = customer_order_service.get_customer_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Customer order not found")
    return order


@router.post("/", response_model=CustomerOrderWithItems)
def create_customer_order(order_data: CustomerOrderCreate, db=Depends(get_db)):
    order = customer_order_service.create_customer_order(db, order_data)
    if not order:
        raise HTTPException(
            status_code=400,
            detail="Failed to create order. Check that customer, employee, and products exist with sufficient stock.",
        )
    return order


@router.put("/{order_id}/status")
def update_order_status(
    order_id: int, update_data: CustomerOrderUpdate, db=Depends(get_db)
):
    if not update_data.status:
        raise HTTPException(status_code=400, detail="Status is required")

    result = customer_order_service.update_order_status(
        db, order_id, update_data.status.value
    )
    if not result:
        raise HTTPException(
            status_code=400,
            detail="Invalid status transition or order not found",
        )
    return result


@router.put("/{order_id}/process")
def process_order(order_id: int, db=Depends(get_db)):
    result = customer_order_service.update_order_status(db, order_id, "processing")
    if not result:
        raise HTTPException(
            status_code=400,
            detail="Cannot process order. Order must be in 'pending' status.",
        )
    return result


@router.put("/{order_id}/complete")
def complete_order(order_id: int, db=Depends(get_db)):
    result = customer_order_service.update_order_status(db, order_id, "completed")
    if not result:
        raise HTTPException(
            status_code=400,
            detail="Cannot complete order. Order must be in 'processing' status.",
        )
    return result


@router.put("/{order_id}/assign/{employee_id}")
def assign_employee_to_order(order_id: int, employee_id: int, db=Depends(get_db)):
    result = customer_order_service.assign_employee(db, order_id, employee_id)
    if not result:
        raise HTTPException(
            status_code=400,
            detail="Failed to assign employee. Check that order and employee exist.",
        )
    return result


@router.delete("/{order_id}")
def cancel_customer_order(order_id: int, db=Depends(get_db)):
    result = customer_order_service.cancel_customer_order(db, order_id)
    if not result:
        raise HTTPException(
            status_code=400,
            detail="Cannot cancel order. Order may not exist or is already completed/cancelled.",
        )
    return result
