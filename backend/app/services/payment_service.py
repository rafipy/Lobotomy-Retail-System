from typing import List, Optional

from app.schemas.payment import (
    PaymentCreate,
    PaymentListResponse,
    PaymentResponse,
    PaymentSummary,
    PaymentWithOrderInfo,
)


def get_all_payments(db: dict) -> List[PaymentListResponse]:
    cursor = db["cursor"]
    cursor.execute(
        """
        SELECT * FROM payments
        ORDER BY created_at DESC
        """
    )
    payments = cursor.fetchall()

    return [
        PaymentListResponse.model_validate(
            {
                "id": p["id"],
                "customer_order_id": p["customer_order_id"],
                "amount": float(p["amount"]),
                "payment_method": p["payment_method"],
                "payment_status": p["payment_status"],
                "payment_date": p.get("payment_date"),
                "created_at": p.get("created_at"),
            }
        )
        for p in payments
    ]


def get_payment_by_id(db: dict, payment_id: int) -> Optional[PaymentResponse]:
    cursor = db["cursor"]
    cursor.execute("SELECT * FROM payments WHERE id = %s", (payment_id,))
    payment = cursor.fetchone()

    if not payment:
        return None

    return PaymentResponse.model_validate(
        {
            "id": payment["id"],
            "customer_order_id": payment["customer_order_id"],
            "amount": float(payment["amount"]),
            "payment_method": payment["payment_method"],
            "payment_status": payment["payment_status"],
            "transaction_reference": payment.get("transaction_reference"),
            "payment_date": payment.get("payment_date"),
            "created_at": payment.get("created_at"),
            "updated_at": payment.get("updated_at"),
        }
    )


def get_payments_by_order(db: dict, order_id: int) -> List[PaymentResponse]:
    cursor = db["cursor"]
    cursor.execute(
        """
        SELECT * FROM payments
        WHERE customer_order_id = %s
        ORDER BY created_at DESC
        """,
        (order_id,),
    )
    payments = cursor.fetchall()

    return [
        PaymentResponse.model_validate(
            {
                "id": p["id"],
                "customer_order_id": p["customer_order_id"],
                "amount": float(p["amount"]),
                "payment_method": p["payment_method"],
                "payment_status": p["payment_status"],
                "transaction_reference": p.get("transaction_reference"),
                "payment_date": p.get("payment_date"),
                "created_at": p.get("created_at"),
                "updated_at": p.get("updated_at"),
            }
        )
        for p in payments
    ]


def get_payment_with_order_info(
    db: dict, payment_id: int
) -> Optional[PaymentWithOrderInfo]:
    cursor = db["cursor"]
    cursor.execute(
        """
        SELECT p.*,
               co.customer_id,
               co.total_amount as order_total,
               CONCAT(c.first_name, ' ', c.last_name) as customer_name
        FROM payments p
        JOIN customer_orders co ON p.customer_order_id = co.id
        JOIN customers c ON co.customer_id = c.id
        WHERE p.id = %s
        """,
        (payment_id,),
    )
    result = cursor.fetchone()

    if not result:
        return None

    return PaymentWithOrderInfo.model_validate(
        {
            "id": result["id"],
            "customer_order_id": result["customer_order_id"],
            "customer_id": result["customer_id"],
            "customer_name": result["customer_name"],
            "order_total": float(result["order_total"]),
            "amount": float(result["amount"]),
            "payment_method": result["payment_method"],
            "payment_status": result["payment_status"],
            "transaction_reference": result.get("transaction_reference"),
            "payment_date": result.get("payment_date"),
            "created_at": result.get("created_at"),
        }
    )


def get_payment_summary(db: dict, order_id: int) -> Optional[PaymentSummary]:
    cursor = db["cursor"]

    cursor.execute(
        "SELECT total_amount FROM customer_orders WHERE id = %s", (order_id,)
    )
    order = cursor.fetchone()
    if not order:
        return None

    order_total = float(order["total_amount"])

    cursor.execute(
        """
        SELECT COALESCE(SUM(amount), 0) as total_paid, COUNT(*) as payment_count
        FROM payments
        WHERE customer_order_id = %s AND payment_status = 'completed'
        """,
        (order_id,),
    )
    payment_info = cursor.fetchone()
    total_paid = float(payment_info["total_paid"]) if payment_info else 0
    payment_count = payment_info["payment_count"] if payment_info else 0

    remaining_balance = order_total - total_paid

    return PaymentSummary.model_validate(
        {
            "customer_order_id": order_id,
            "order_total": order_total,
            "total_paid": total_paid,
            "remaining_balance": remaining_balance,
            "payment_count": payment_count,
            "is_fully_paid": remaining_balance <= 0,
        }
    )


def create_payment(db: dict, payment_data: PaymentCreate) -> Optional[PaymentResponse]:
    cursor = db["cursor"]

    # Just verify the order exists, don't check status or balance
    cursor.execute(
        "SELECT id FROM customer_orders WHERE id = %s",
        (payment_data.customer_order_id,),
    )
    order = cursor.fetchone()
    if not order:
        return None

    # Simply create the payment without any validation
    cursor.execute(
        """
        INSERT INTO payments
        (customer_order_id, amount, payment_method, payment_status, transaction_reference, payment_date, created_at)
        VALUES (%s, %s, %s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        """,
        (
            payment_data.customer_order_id,
            payment_data.amount,
            payment_data.payment_method.value,
            "pending",
            payment_data.transaction_reference,
        ),
    )
    payment_id = cursor.lastrowid

    return get_payment_by_id(db, payment_id)


def complete_payment(db: dict, payment_id: int) -> Optional[dict]:
    cursor = db["cursor"]

    cursor.execute(
        "SELECT id, payment_status, customer_order_id FROM payments WHERE id = %s",
        (payment_id,),
    )
    payment = cursor.fetchone()
    if not payment:
        return None

    if payment["payment_status"] != "pending":
        return None

    cursor.execute(
        """
        UPDATE payments
        SET payment_status = 'completed', payment_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = %s
        """,
        (payment_id,),
    )

    return {"message": "Payment completed successfully", "payment_id": payment_id}


def fail_payment(
    db: dict, payment_id: int, reason: Optional[str] = None
) -> Optional[dict]:
    cursor = db["cursor"]

    cursor.execute(
        "SELECT id, payment_status FROM payments WHERE id = %s", (payment_id,)
    )
    payment = cursor.fetchone()
    if not payment:
        return None

    if payment["payment_status"] != "pending":
        return None

    cursor.execute(
        """
        UPDATE payments
        SET payment_status = 'failed', updated_at = CURRENT_TIMESTAMP
        WHERE id = %s
        """,
        (payment_id,),
    )

    return {
        "message": "Payment marked as failed",
        "payment_id": payment_id,
        "reason": reason,
    }


def refund_payment(db: dict, payment_id: int) -> Optional[dict]:
    cursor = db["cursor"]

    cursor.execute(
        "SELECT id, payment_status, customer_order_id, amount FROM payments WHERE id = %s",
        (payment_id,),
    )
    payment = cursor.fetchone()
    if not payment:
        return None

    if payment["payment_status"] != "completed":
        return None

    cursor.execute(
        """
        UPDATE payments
        SET payment_status = 'refunded', updated_at = CURRENT_TIMESTAMP
        WHERE id = %s
        """,
        (payment_id,),
    )

    return {
        "message": "Payment refunded successfully",
        "payment_id": payment_id,
        "refunded_amount": float(payment["amount"]),
    }


def get_payments_by_status(db: dict, status: str) -> List[PaymentListResponse]:
    cursor = db["cursor"]
    cursor.execute(
        """
        SELECT * FROM payments
        WHERE payment_status = %s
        ORDER BY created_at DESC
        """,
        (status,),
    )
    payments = cursor.fetchall()

    return [
        PaymentListResponse.model_validate(
            {
                "id": p["id"],
                "customer_order_id": p["customer_order_id"],
                "amount": float(p["amount"]),
                "payment_method": p["payment_method"],
                "payment_status": p["payment_status"],
                "payment_date": p.get("payment_date"),
                "created_at": p.get("created_at"),
            }
        )
        for p in payments
    ]


def get_payments_by_method(db: dict, method: str) -> List[PaymentListResponse]:
    cursor = db["cursor"]
    cursor.execute(
        """
        SELECT * FROM payments
        WHERE payment_method = %s
        ORDER BY created_at DESC
        """,
        (method,),
    )
    payments = cursor.fetchall()

    return [
        PaymentListResponse.model_validate(
            {
                "id": p["id"],
                "customer_order_id": p["customer_order_id"],
                "amount": float(p["amount"]),
                "payment_method": p["payment_method"],
                "payment_status": p["payment_status"],
                "payment_date": p.get("payment_date"),
                "created_at": p.get("created_at"),
            }
        )
        for p in payments
    ]
