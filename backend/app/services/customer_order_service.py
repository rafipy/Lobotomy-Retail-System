from typing import List, Optional

from app.schemas.customer_order import (
    CustomerOrderCreate,
    CustomerOrderItemResponse,
    CustomerOrderListResponse,
    CustomerOrderWithItems,
)


def calculate_total_amount(items: list[dict]) -> float:
    return sum(item["quantity"] * item["unit_price"] for item in items)


def build_order_response(order_row: dict, items: list[dict]) -> CustomerOrderWithItems:
    item_responses = []
    for item in items:
        item_responses.append(
            CustomerOrderItemResponse(
                product_id=item["product_id"],
                product_name=item["product_name"],
                quantity=item["quantity"],
                unit_price=item["unit_price"],
                line_total=item["quantity"] * item["unit_price"],
            )
        )

    return CustomerOrderWithItems.model_validate(
        {
            "id": order_row["id"],
            "customer_id": order_row["customer_id"],
            "customer_name": order_row.get("customer_name") or "Unknown",
            "employee_id": order_row.get("employee_id"),
            "employee_username": order_row.get("employee_username"),
            "status": order_row["status"],
            "total_amount": order_row.get("total_amount")
            or sum(i.line_total for i in item_responses),
            "notes": order_row.get("notes"),
            "items": item_responses,
            "created_at": order_row.get("created_at"),
            "completed_at": order_row.get("completed_at"),
        }
    )


def get_all_customer_orders(db: dict) -> List[CustomerOrderListResponse]:
    cursor = db["cursor"]
    cursor.execute(
        """
        SELECT co.*,
               CONCAT(c.first_name, ' ', c.last_name) as customer_name,
               u.username as employee_username
        FROM customer_orders co
        LEFT JOIN customers c ON co.customer_id = c.id
        LEFT JOIN users u ON co.employee_id = u.id
        ORDER BY co.created_at DESC
        """
    )
    orders = cursor.fetchall()

    results = []
    for order in orders:
        cursor.execute(
            """
            SELECT COUNT(*) as item_count
            FROM customer_order_items
            WHERE customer_order_id = %s
            """,
            (order["id"],),
        )
        count_result = cursor.fetchone()
        item_count = count_result["item_count"] if count_result else 0

        results.append(
            CustomerOrderListResponse.model_validate(
                {
                    "id": order["id"],
                    "customer_id": order["customer_id"],
                    "customer_name": order.get("customer_name") or "Unknown",
                    "employee_id": order.get("employee_id"),
                    "employee_username": order.get("employee_username"),
                    "status": order["status"],
                    "total_amount": float(order.get("total_amount") or 0),
                    "item_count": item_count,
                    "created_at": order.get("created_at"),
                    "completed_at": order.get("completed_at"),
                }
            )
        )
    return results


def get_customer_orders_by_customer(
    db: dict, customer_id: int
) -> List[CustomerOrderListResponse]:
    cursor = db["cursor"]
    cursor.execute(
        """
        SELECT co.*,
               CONCAT(c.first_name, ' ', c.last_name) as customer_name,
               u.username as employee_username
        FROM customer_orders co
        LEFT JOIN customers c ON co.customer_id = c.id
        LEFT JOIN users u ON co.employee_id = u.id
        WHERE co.customer_id = %s
        ORDER BY co.created_at DESC
        """,
        (customer_id,),
    )
    orders = cursor.fetchall()

    results = []
    for order in orders:
        cursor.execute(
            """
            SELECT COUNT(*) as item_count
            FROM customer_order_items
            WHERE customer_order_id = %s
            """,
            (order["id"],),
        )
        count_result = cursor.fetchone()
        item_count = count_result["item_count"] if count_result else 0

        results.append(
            CustomerOrderListResponse.model_validate(
                {
                    "id": order["id"],
                    "customer_id": order["customer_id"],
                    "customer_name": order.get("customer_name") or "Unknown",
                    "employee_id": order.get("employee_id"),
                    "employee_username": order.get("employee_username"),
                    "status": order["status"],
                    "total_amount": float(order.get("total_amount") or 0),
                    "item_count": item_count,
                    "created_at": order.get("created_at"),
                    "completed_at": order.get("completed_at"),
                }
            )
        )
    return results


def get_pending_customer_orders(db: dict) -> List[CustomerOrderWithItems]:
    cursor = db["cursor"]
    cursor.execute(
        """
        SELECT co.*,
               CONCAT(c.first_name, ' ', c.last_name) as customer_name,
               u.username as employee_username
        FROM customer_orders co
        LEFT JOIN customers c ON co.customer_id = c.id
        LEFT JOIN users u ON co.employee_id = u.id
        WHERE co.status IN ('pending', 'processing')
        ORDER BY co.created_at DESC
        """
    )
    orders = cursor.fetchall()

    results = []
    for order in orders:
        cursor.execute(
            """
            SELECT coi.product_id, coi.quantity, coi.unit_price,
                   p.name as product_name
            FROM customer_order_items coi
            JOIN products p ON coi.product_id = p.id
            WHERE coi.customer_order_id = %s
            """,
            (order["id"],),
        )
        items = cursor.fetchall()
        results.append(build_order_response(order, items))
    return results


def get_customer_order(db: dict, order_id: int) -> Optional[CustomerOrderWithItems]:
    cursor = db["cursor"]
    cursor.execute(
        """
        SELECT co.*,
               CONCAT(c.first_name, ' ', c.last_name) as customer_name,
               u.username as employee_username
        FROM customer_orders co
        LEFT JOIN customers c ON co.customer_id = c.id
        LEFT JOIN users u ON co.employee_id = u.id
        WHERE co.id = %s
        """,
        (order_id,),
    )
    order = cursor.fetchone()
    if not order:
        return None

    cursor.execute(
        """
        SELECT coi.product_id, coi.quantity, coi.unit_price,
               p.name as product_name
        FROM customer_order_items coi
        JOIN products p ON coi.product_id = p.id
        WHERE coi.customer_order_id = %s
        """,
        (order_id,),
    )
    items = cursor.fetchall()
    return build_order_response(order, items)


def create_customer_order(
    db: dict, order_data: CustomerOrderCreate
) -> Optional[CustomerOrderWithItems]:
    cursor = db["cursor"]

    cursor.execute("SELECT id FROM customers WHERE id = %s", (order_data.customer_id,))
    if not cursor.fetchone():
        return None

    if order_data.employee_id:
        cursor.execute("SELECT id FROM users WHERE id = %s", (order_data.employee_id,))
        if not cursor.fetchone():
            return None

    items_with_prices = []
    for item in order_data.items:
        cursor.execute(
            "SELECT id, name, selling_price, stock FROM products WHERE id = %s",
            (item.product_id,),
        )
        product = cursor.fetchone()
        if not product:
            return None
        if product["stock"] < item.quantity:
            return None
        items_with_prices.append(
            {
                "product_id": product["id"],
                "product_name": product["name"],
                "quantity": item.quantity,
                "unit_price": float(product["selling_price"]),
            }
        )

    total_amount = sum(
        item["quantity"] * item["unit_price"] for item in items_with_prices
    )

    cursor.execute(
        """
        INSERT INTO customer_orders (customer_id, employee_id, status, total_amount, notes, created_at)
        VALUES (%s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
        """,
        (
            order_data.customer_id,
            order_data.employee_id,
            "pending",
            total_amount,
            order_data.notes,
        ),
    )
    order_id = cursor.lastrowid

    for item in items_with_prices:
        cursor.execute(
            """
            INSERT INTO customer_order_items (customer_order_id, product_id, quantity, unit_price)
            VALUES (%s, %s, %s, %s)
            """,
            (order_id, item["product_id"], item["quantity"], item["unit_price"]),
        )
        cursor.execute(
            "UPDATE products SET stock = stock - %s WHERE id = %s",
            (item["quantity"], item["product_id"]),
        )

    return get_customer_order(db, order_id)


def update_order_status(db: dict, order_id: int, new_status: str) -> Optional[dict]:
    cursor = db["cursor"]

    cursor.execute("SELECT status FROM customer_orders WHERE id = %s", (order_id,))
    order = cursor.fetchone()
    if not order:
        return None

    current_status = order["status"]

    valid_transitions = {
        "pending": ["processing", "cancelled"],
        "processing": ["completed", "cancelled"],
        "completed": [],
        "cancelled": [],
    }

    if new_status not in valid_transitions.get(current_status, []):
        return None

    update_data = {"status": new_status}
    if new_status == "completed":
        cursor.execute(
            """
            UPDATE customer_orders
            SET status = %s, updated_at = CURRENT_TIMESTAMP, completed_at = CURRENT_TIMESTAMP
            WHERE id = %s
            """,
            (new_status, order_id),
        )
    else:
        cursor.execute(
            """
            UPDATE customer_orders
            SET status = %s, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            """,
            (new_status, order_id),
        )

    return {"message": f"Order status updated to {new_status}"}


def cancel_customer_order(db: dict, order_id: int) -> Optional[dict]:
    cursor = db["cursor"]

    cursor.execute("SELECT status FROM customer_orders WHERE id = %s", (order_id,))
    order = cursor.fetchone()
    if not order:
        return None

    if order["status"] in ("completed", "cancelled"):
        return None

    cursor.execute(
        """
        SELECT product_id, quantity FROM customer_order_items
        WHERE customer_order_id = %s
        """,
        (order_id,),
    )
    items = cursor.fetchall()

    for item in items:
        cursor.execute(
            "UPDATE products SET stock = stock + %s WHERE id = %s",
            (item["quantity"], item["product_id"]),
        )

    cursor.execute(
        """
        UPDATE customer_orders
        SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
        WHERE id = %s
        """,
        (order_id,),
    )

    return {"message": "Order cancelled successfully", "items_restored": len(items)}


def assign_employee(db: dict, order_id: int, employee_id: int) -> Optional[dict]:
    cursor = db["cursor"]

    cursor.execute("SELECT id, status FROM customer_orders WHERE id = %s", (order_id,))
    order = cursor.fetchone()
    if not order:
        return None

    cursor.execute("SELECT id, username, role FROM users WHERE id = %s", (employee_id,))
    employee = cursor.fetchone()
    if not employee:
        return None

    cursor.execute(
        """
        UPDATE customer_orders
        SET employee_id = %s, updated_at = CURRENT_TIMESTAMP
        WHERE id = %s
        """,
        (employee_id, order_id),
    )

    return {
        "message": f"Employee {employee['username']} assigned to order {order_id}",
        "employee_id": employee_id,
        "employee_username": employee["username"],
    }
