from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import ValidationError
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Product, Supplier
from app.schemas.product import (
    ProductCreate,
    ProductListResponse,
    ProductResponse,
    ProductUpdate,
)

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/", response_model=List[ProductListResponse])
def get_products(db: Session = Depends(get_db)):
    """Get all products with supplier names"""
    products = (
        db.query(Product)
        .options(joinedload(Product.supplier))
        .order_by(Product.name)
        .all()
    )

    return [
        ProductListResponse(
            id=p.id,  # type: ignore[arg-type]
            name=p.name,  # type: ignore[arg-type]
            description=p.description,  # type: ignore[arg-type]
            selling_price=p.selling_price,  # type: ignore[arg-type]
            purchase_price=p.purchase_price,  # type: ignore[arg-type]
            supplier_id=p.supplier_id,  # type: ignore[arg-type]
            supplier_name=p.supplier.name if p.supplier else "Unknown",  # type: ignore[arg-type]
            stock=p.stock,  # type: ignore[arg-type]
            reorder_level=p.reorder_level,  # type: ignore[arg-type]
            reorder_amount=p.reorder_amount,  # type: ignore[arg-type]
            category=p.category,  # type: ignore[arg-type]
            image_url=p.image_url,  # type: ignore[arg-type]
            created_at=p.created_at,  # type: ignore[arg-type]
            updated_at=p.updated_at,  # type: ignore[arg-type]
        )
        for p in products
    ]


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a single product by ID"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/", response_model=ProductResponse)
def create_product(product_data: ProductCreate, db: Session = Depends(get_db)):
    """Create a new product"""
    # Verify supplier exists
    supplier = (
        db.query(Supplier).filter(Supplier.id == product_data.supplier_id).first()
    )
    if not supplier:
        raise HTTPException(status_code=400, detail="Supplier not found")

    product = Product(**product_data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int, product_data: ProductUpdate, db: Session = Depends(get_db)
):
    """Update an existing product"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # If updating supplier_id, verify it exists
    if product_data.supplier_id is not None:
        supplier = (
            db.query(Supplier).filter(Supplier.id == product_data.supplier_id).first()
        )
        if not supplier:
            raise HTTPException(status_code=400, detail="Supplier not found")

    # Update only provided fields
    update_data = product_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    """Delete a product"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully"}
