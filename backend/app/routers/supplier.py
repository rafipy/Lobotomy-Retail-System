from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.database import get_db
from app.schemas.supplier import SupplierBrief, SupplierResponse
from app.services import supplier_service

router = APIRouter(prefix="/suppliers", tags=["suppliers"])


@router.get("/", response_model=List[SupplierResponse])
def get_all_suppliers(db=Depends(get_db)):
    return supplier_service.get_all_suppliers(db)


@router.get("/active", response_model=List[SupplierBrief])
def get_active_suppliers(db=Depends(get_db)):
    return supplier_service.get_active_suppliers(db)


@router.get("/{supplier_id}", response_model=SupplierResponse)
def get_supplier(supplier_id: int, db=Depends(get_db)):
    supplier = supplier_service.get_supplier_by_id(db, supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier


@router.post("/seed")
def seed_suppliers(db=Depends(get_db)):
    return supplier_service.seed_suppliers(db)
