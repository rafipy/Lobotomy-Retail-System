from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import ValidationError

from app.database import get_db
from app.schemas.product import (
    ProductCreate,
    ProductListResponse,
    ProductResponse,
    ProductUpdate,
)

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/", response_model=List[ProductListResponse])
def get_products(db: dict = Depends(get_db)):
    cursor = db["cursor"]
    cursor.execute(
        """
        SELECT p.*, s.name as supplier_name
        FROM products p
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        ORDER BY p.name
        """
    )
    rows = cursor.fetchall()
    # Map DB rows into the response model expected by Pydantic
    results = []
    for p in rows:
        results.append(
            ProductListResponse.model_validate(
                {
                    "id": p["id"],
                    "name": p["name"],
                    "description": p["description"],
                    "selling_price": p["selling_price"],
                    "purchase_price": p["purchase_price"],
                    "supplier_id": p["supplier_id"],
                    "supplier_name": p.get("supplier_name") or "Unknown",
                    "stock": p["stock"],
                    "reorder_level": p["reorder_level"],
                    "reorder_amount": p["reorder_amount"],
                    "category": p["category"],
                    "image_url": p["image_url"],
                    "created_at": p.get("created_at"),
                    "updated_at": p.get("updated_at"),
                }
            )
        )
    return results


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: dict = Depends(get_db)):
    cursor = db["cursor"]
    cursor.execute("SELECT * FROM products WHERE id = %s", (product_id,))
    product = cursor.fetchone()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/", response_model=ProductResponse)
def create_product(product_data: ProductCreate, db: dict = Depends(get_db)):
    cursor = db["cursor"]
    # Verify supplier exists
    cursor.execute(
        "SELECT id FROM suppliers WHERE id = %s", (product_data.supplier_id,)
    )
    if not cursor.fetchone():
        raise HTTPException(status_code=400, detail="Supplier not found")

    cursor.execute(
        """
        INSERT INTO products
        (name, description, selling_price, purchase_price, supplier_id, stock, reorder_level, reorder_amount, category, image_url, created_at, updated_at)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """,
        (
            product_data.name,
            product_data.description,
            product_data.selling_price,
            product_data.purchase_price,
            product_data.supplier_id,
            product_data.stock or 0,
            product_data.reorder_level or 50,
            product_data.reorder_amount or 100,
            product_data.category,
            product_data.image_url,
            datetime.utcnow(),
            datetime.utcnow(),
        ),
    )
    new_id = cursor.lastrowid
    cursor.execute("SELECT * FROM products WHERE id = %s", (new_id,))
    return cursor.fetchone()


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int, product_data: ProductUpdate, db: dict = Depends(get_db)
):
    cursor = db["cursor"]
    cursor.execute("SELECT * FROM products WHERE id = %s", (product_id,))
    existing = cursor.fetchone()
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = product_data.model_dump(exclude_unset=True)

    if "supplier_id" in update_data and update_data["supplier_id"] is not None:
        cursor.execute(
            "SELECT id FROM suppliers WHERE id = %s", (update_data["supplier_id"],)
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=400, detail="Supplier not found")

    if not update_data:
        return existing

    set_clauses = []
    params = []
    for k, v in update_data.items():
        set_clauses.append(f"{k} = %s")
        params.append(v)
    params.append(product_id)
    sql = f"UPDATE products SET {', '.join(set_clauses)}, updated_at = %s WHERE id = %s"
    params.insert(-1, datetime.utcnow())  # insert updated_at before id
    cursor.execute(sql, tuple(params))
    cursor.execute("SELECT * FROM products WHERE id = %s", (product_id,))
    return cursor.fetchone()


@router.delete("/{product_id}")
def delete_product(product_id: int, db: dict = Depends(get_db)):
    cursor = db["cursor"]
    cursor.execute("SELECT * FROM products WHERE id = %s", (product_id,))
    product = cursor.fetchone()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    cursor.execute(
        """
        SELECT soi.* FROM supplier_order_items soi
        JOIN supplier_orders so ON soi.supplier_order_id = so.id
        WHERE soi.product_id = %s AND so.status IN (%s, %s)
        LIMIT 1
        """,
        (product_id, "processing", "arrived"),
    )
    pending = cursor.fetchone()
    if pending:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete product while there are incoming supplier orders (processing or arrived).",
        )

    cursor.execute("DELETE FROM products WHERE id = %s", (product_id,))
    return {"message": "Product deleted successfully"}
