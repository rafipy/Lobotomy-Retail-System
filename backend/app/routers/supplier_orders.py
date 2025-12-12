from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.database import get_db
from app.schemas.supplier_order import (
    BulkSupplierOrderCreate,
    SupplierOrderCreate,
    SupplierOrderListResponse,
    SupplierOrderWithItems,
)
from app.services import supplier_order_service

router = APIRouter(prefix="/supplier-orders", tags=["supplier-orders"])


@router.get("/", response_model=List[SupplierOrderListResponse])
def get_all_supplier_orders(db=Depends(get_db)):
    return supplier_order_service.get_all_supplier_orders(db)


@router.get("/pending", response_model=List[SupplierOrderWithItems])
def get_pending_supplier_orders(db=Depends(get_db)):
    return supplier_order_service.get_pending_supplier_orders(db)


@router.get("/{order_id}", response_model=SupplierOrderWithItems)
def get_supplier_order(order_id: int, db=Depends(get_db)):
    order = supplier_order_service.get_supplier_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Supplier order not found")
    return order


@router.post("/", response_model=SupplierOrderWithItems)
def create_supplier_order_route(order_data: SupplierOrderCreate, db=Depends(get_db)):
    order = supplier_order_service.create_supplier_order(db, order_data)
    if not order:
        raise HTTPException(status_code=404, detail="Product or user not found")
    return order


@router.post("/bulk", response_model=List[SupplierOrderWithItems])
def create_bulk_supplier_order_route(
    bulk_data: BulkSupplierOrderCreate, db=Depends(get_db)
):
    results = supplier_order_service.create_bulk_supplier_order(db, bulk_data)
    return results


@router.put("/{order_id}/arrive")
def mark_as_arrived_route(order_id: int, db=Depends(get_db)):
    res = supplier_order_service.mark_as_arrived(db, order_id)
    if not res:
        raise HTTPException(status_code=400, detail="Invalid order state or not found")
    return res


@router.put("/{order_id}/complete")
def complete_supplier_order_route(order_id: int, db=Depends(get_db)):
    res = supplier_order_service.complete_supplier_order(db, order_id)
    if not res:
        raise HTTPException(status_code=400, detail="Invalid order state or not found")
    return res


@router.delete("/{order_id}")
def cancel_supplier_order_route(order_id: int, db=Depends(get_db)):
    res = supplier_order_service.cancel_supplier_order(db, order_id)
    if not res:
        raise HTTPException(status_code=400, detail="Invalid order state or not found")
    return res
