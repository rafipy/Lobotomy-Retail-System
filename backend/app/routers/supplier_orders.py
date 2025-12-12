from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.database import get_db
from app.schemas.supplier_order import (
    BulkSupplierOrderCreate,
    SupplierOrderCreate,
    SupplierOrderItemResponse,
    SupplierOrderListResponse,
    SupplierOrderWithItems,
)

router = APIRouter(prefix="/supplier-orders", tags=["supplier-orders"])


def calculate_total_cost(items: list[dict]) -> float:
    return sum(i["quantity"] * i["purchase_price"] for i in items)


def build_order_response(order_row: dict, items: list[dict]) -> SupplierOrderWithItems:
    item_responses = []
    for it in items:
        item_responses.append(
            SupplierOrderItemResponse(
                product_id=it["product_id"],
                product_name=it["product_name"],
                quantity=it["quantity"],
                unit_price=it["purchase_price"],
                line_total=it["quantity"] * it["purchase_price"],
            )
        )

    return SupplierOrderWithItems.model_validate(
        {
            "id": order_row["id"],
            "supplier_id": order_row["supplier_id"],
            "supplier_name": order_row.get("supplier_name") or "Unknown",
            "employee_id": order_row.get("employee_id"),
            "employee_username": order_row.get("employee_username"),
            "status": order_row["status"],
            "total_cost": sum(i.line_total for i in item_responses),
            "items": item_responses,
            "created_at": order_row.get("created_at"),
            "completed_at": order_row.get("completed_at"),
        }
    )


@router.get("/", response_model=List[SupplierOrderListResponse])
def get_all_supplier_orders(db: dict = Depends(get_db)):
    cursor = db["cursor"]
    cursor.execute(
        """
        SELECT so.*, s.name as supplier_name, u.username as employee_username
        FROM supplier_orders so
        LEFT JOIN suppliers s ON so.supplier_id = s.id
        LEFT JOIN users u ON so.employee_id = u.id
        ORDER BY so.created_at DESC
        """
    )
    orders = cursor.fetchall()
    results = []
    for o in orders:
        cursor.execute(
            """
            SELECT soi.product_id, soi.quantity, p.name as product_name, p.purchase_price
            FROM supplier_order_items soi
            JOIN products p ON soi.product_id = p.id
            WHERE soi.supplier_order_id = %s
            """,
            (o["id"],),
        )
        items = cursor.fetchall()
        results.append(
            SupplierOrderListResponse.model_validate(
                {
                    "id": o["id"],
                    "supplier_id": o["supplier_id"],
                    "supplier_name": o.get("supplier_name") or "Unknown",
                    "employee_id": o.get("employee_id"),
                    "employee_username": o.get("employee_username"),
                    "status": o["status"],
                    "total_cost": calculate_total_cost(items),
                    "item_count": len(items),
                    "created_at": o.get("created_at"),
                    "completed_at": o.get("completed_at"),
                }
            )
        )
    return results


@router.get("/pending", response_model=List[SupplierOrderWithItems])
def get_pending_supplier_orders(db: dict = Depends(get_db)):
    cursor = db["cursor"]
    cursor.execute(
        """
        SELECT so.*, s.name as supplier_name, u.username as employee_username
        FROM supplier_orders so
        LEFT JOIN suppliers s ON so.supplier_id = s.id
        LEFT JOIN users u ON so.employee_id = u.id
        WHERE so.status IN (%s, %s)
        ORDER BY so.created_at DESC
        """,
        ("processing", "arrived"),
    )
    orders = cursor.fetchall()
    results = []
    for o in orders:
        cursor.execute(
            """
            SELECT soi.product_id, soi.quantity, p.name as product_name, p.purchase_price
            FROM supplier_order_items soi
            JOIN products p ON soi.product_id = p.id
            WHERE soi.supplier_order_id = %s
            """,
            (o["id"],),
        )
        items = cursor.fetchall()
        results.append(build_order_response(o, items))
    return results


@router.get("/{order_id}", response_model=SupplierOrderWithItems)
def get_supplier_order(order_id: int, db: dict = Depends(get_db)):
    cursor = db["cursor"]
    cursor.execute(
        """
        SELECT so.*, s.name as supplier_name, u.username as employee_username
        FROM supplier_orders so
        LEFT JOIN suppliers s ON so.supplier_id = s.id
        LEFT JOIN users u ON so.employee_id = u.id
        WHERE so.id = %s
        """,
        (order_id,),
    )
    order = cursor.fetchone()
    if not order:
        raise HTTPException(status_code=404, detail="Supplier order not found")

    cursor.execute(
        """
        SELECT soi.product_id, soi.quantity, p.name as product_name, p.purchase_price
        FROM supplier_order_items soi
        JOIN products p ON soi.product_id = p.id
        WHERE soi.supplier_order_id = %s
        """,
        (order_id,),
    )
    items = cursor.fetchall()
    return build_order_response(order, items)


@router.post("/", response_model=SupplierOrderWithItems)
def create_supplier_order(order_data: SupplierOrderCreate, db: dict = Depends(get_db)):
    cursor = db["cursor"]
    # fetch product and supplier
    cursor.execute(
        "SELECT p.*, s.name as supplier_name FROM products p LEFT JOIN suppliers s ON p.supplier_id = s.id WHERE p.id = %s",
        (order_data.product_id,),
    )
    product = cursor.fetchone()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if order_data.employee_id:
        cursor.execute(
            "SELECT id, username FROM users WHERE id = %s", (order_data.employee_id,)
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="User not found")

    # create order
    cursor.execute(
        "INSERT INTO supplier_orders (supplier_id, employee_id, status, created_at) VALUES (%s,%s,%s,%s)",
        (
            product["supplier_id"],
            order_data.employee_id,
            "processing",
            datetime.utcnow(),
        ),
    )
    order_id = cursor.lastrowid

    # create item
    cursor.execute(
        "INSERT INTO supplier_order_items (supplier_order_id, product_id, quantity) VALUES (%s,%s,%s)",
        (order_id, product["id"], order_data.quantity),
    )

    # reload order + items
    cursor.execute(
        """
        SELECT so.*, s.name as supplier_name, u.username as employee_username
        FROM supplier_orders so
        LEFT JOIN suppliers s ON so.supplier_id = s.id
        LEFT JOIN users u ON so.employee_id = u.id
        WHERE so.id = %s
        """,
        (order_id,),
    )
    order = cursor.fetchone()
    cursor.execute(
        """
        SELECT soi.product_id, soi.quantity, p.name as product_name, p.purchase_price
        FROM supplier_order_items soi
        JOIN products p ON soi.product_id = p.id
        WHERE soi.supplier_order_id = %s
        """,
        (order_id,),
    )
    items = cursor.fetchall()
    return build_order_response(order, items)


@router.post("/bulk", response_model=List[SupplierOrderWithItems])
def create_bulk_supplier_order(
    bulk_data: BulkSupplierOrderCreate, db: dict = Depends(get_db)
):
    cursor = db["cursor"]
    if bulk_data.employee_id:
        cursor.execute("SELECT id FROM users WHERE id = %s", (bulk_data.employee_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="User not found")

    # group by supplier
    supplier_items: dict[int, list[tuple[int, int]]] = {}
    for item in bulk_data.items:
        cursor.execute(
            "SELECT id, supplier_id FROM products WHERE id = %s", (item.product_id,)
        )
        p = cursor.fetchone()
        if not p:
            continue
        sid = int(p["supplier_id"])
        supplier_items.setdefault(sid, []).append((p["id"], item.quantity))

    created_order_ids = []
    for supplier_id, items in supplier_items.items():
        cursor.execute(
            "INSERT INTO supplier_orders (supplier_id, employee_id, status, created_at) VALUES (%s,%s,%s,%s)",
            (supplier_id, bulk_data.employee_id, "processing", datetime.utcnow()),
        )
        order_id = cursor.lastrowid
        for pid, qty in items:
            cursor.execute(
                "INSERT INTO supplier_order_items (supplier_order_id, product_id, quantity) VALUES (%s,%s,%s)",
                (order_id, pid, qty),
            )
        created_order_ids.append(order_id)

    # fetch created orders
    results = []
    for oid in created_order_ids:
        cursor.execute(
            """
            SELECT so.*, s.name as supplier_name, u.username as employee_username
            FROM supplier_orders so
            LEFT JOIN suppliers s ON so.supplier_id = s.id
            LEFT JOIN users u ON so.employee_id = u.id
            WHERE so.id = %s
            """,
            (oid,),
        )
        order = cursor.fetchone()
        cursor.execute(
            """
            SELECT soi.product_id, soi.quantity, p.name as product_name, p.purchase_price
            FROM supplier_order_items soi
            JOIN products p ON soi.product_id = p.id
            WHERE soi.supplier_order_id = %s
            """,
            (oid,),
        )
        items = cursor.fetchall()
        results.append(build_order_response(order, items))
    return results


@router.put("/{order_id}/arrive")
def mark_as_arrived(order_id: int, db: dict = Depends(get_db)):
    cursor = db["cursor"]
    cursor.execute("SELECT status FROM supplier_orders WHERE id = %s", (order_id,))
    o = cursor.fetchone()
    if not o:
        raise HTTPException(status_code=404, detail="Supplier order not found")
    if o["status"] != "processing":
        raise HTTPException(status_code=400, detail="Order is not in processing state")
    cursor.execute(
        "UPDATE supplier_orders SET status = %s, updated_at = %s WHERE id = %s",
        ("arrived", datetime.utcnow(), order_id),
    )
    return {"message": "Supplier order marked as arrived"}


@router.put("/{order_id}/complete")
def complete_supplier_order(order_id: int, db: dict = Depends(get_db)):
    cursor = db["cursor"]
    # load order with items and product rows
    cursor.execute(
        """
        SELECT soi.quantity, p.id as product_id, p.stock, p.name, p.purchase_price
        FROM supplier_order_items soi
        JOIN products p ON soi.product_id = p.id
        JOIN supplier_orders so ON soi.supplier_order_id = so.id
        WHERE so.id = %s
        """,
        (order_id,),
    )
    rows = cursor.fetchall()
    if not rows:
        raise HTTPException(
            status_code=404, detail="Supplier order not found or has no items"
        )

    # check order status
    cursor.execute("SELECT status FROM supplier_orders WHERE id = %s", (order_id,))
    so = cursor.fetchone()
    if not so or so["status"] != "arrived":
        raise HTTPException(
            status_code=400, detail="Order must be marked as arrived first"
        )

    stock_updates = []
    for item in rows:
        new_stock = (item["stock"] or 0) + item["quantity"]
        cursor.execute(
            "UPDATE products SET stock = %s WHERE id = %s",
            (new_stock, item["product_id"]),
        )
        stock_updates.append(
            {
                "product_name": item["name"],
                "quantity_added": item["quantity"],
                "new_stock": new_stock,
            }
        )

    # mark completed and remove order and its items
    cursor.execute(
        "DELETE FROM supplier_order_items WHERE supplier_order_id = %s", (order_id,)
    )
    cursor.execute("DELETE FROM supplier_orders WHERE id = %s", (order_id,))

    return {
        "message": f"Order completed and removed. Updated stock for {len(stock_updates)} products.",
        "stock_updates": stock_updates,
    }


@router.delete("/{order_id}")
def cancel_supplier_order(order_id: int, db: dict = Depends(get_db)):
    cursor = db["cursor"]
    cursor.execute("SELECT status FROM supplier_orders WHERE id = %s", (order_id,))
    o = cursor.fetchone()
    if not o:
        raise HTTPException(status_code=404, detail="Supplier order not found")
    if o["status"] == "completed":
        raise HTTPException(status_code=400, detail="Cannot cancel a completed order")
    cursor.execute(
        "DELETE FROM supplier_order_items WHERE supplier_order_id = %s", (order_id,)
    )
    cursor.execute("DELETE FROM supplier_orders WHERE id = %s", (order_id,))
    return {"message": "Supplier order cancelled"}
