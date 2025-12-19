from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.database import get_db
from app.schemas.customer import CustomerResponse, CustomerUpdate

router = APIRouter(prefix="/customers", tags=["customers"])


@router.get("/user/{user_id}", response_model=CustomerResponse)
def get_customer_by_user_id(user_id: int, db=Depends(get_db)):
    cursor = db["cursor"]
    cursor.execute(
        """
        SELECT c.*, u.username
        FROM customers c
        JOIN users u ON c.user_id = u.id
        WHERE c.user_id = %s
        """,
        (user_id,),
    )
    customer = cursor.fetchone()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    return CustomerResponse.model_validate(
        {
            "id": customer["id"],
            "first_name": customer["first_name"],
            "last_name": customer["last_name"],
            "email": customer.get("email"),
            "phone_number": customer.get("phone_number"),
            "address": customer.get("address"),
            "city": customer.get("city"),
            "postal_code": customer.get("postal_code"),
            "user_id": customer["user_id"],
            "username": customer["username"],
            "created_at": customer.get("created_at"),
        }
    )


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: int, db=Depends(get_db)):
    """Get customer details by customer_id"""
    cursor = db["cursor"]
    cursor.execute(
        """
        SELECT c.*, u.username
        FROM customers c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = %s
        """,
        (customer_id,),
    )
    customer = cursor.fetchone()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    return CustomerResponse.model_validate(
        {
            "id": customer["id"],
            "first_name": customer["first_name"],
            "last_name": customer["last_name"],
            "email": customer.get("email"),
            "phone_number": customer.get("phone_number"),
            "address": customer.get("address"),
            "city": customer.get("city"),
            "postal_code": customer.get("postal_code"),
            "user_id": customer["user_id"],
            "username": customer["username"],
            "created_at": customer.get("created_at"),
        }
    )


@router.get("/", response_model=List[CustomerResponse])
def get_all_customers(db=Depends(get_db)):
    """Get all customers (for admin)"""
    cursor = db["cursor"]
    cursor.execute(
        """
        SELECT c.*, u.username
        FROM customers c
        JOIN users u ON c.user_id = u.id
        ORDER BY c.created_at DESC
        """
    )
    customers = cursor.fetchall()

    return [
        CustomerResponse.model_validate(
            {
                "id": c["id"],
                "first_name": c["first_name"],
                "last_name": c["last_name"],
                "email": c.get("email"),
                "phone_number": c.get("phone_number"),
                "address": c.get("address"),
                "city": c.get("city"),
                "postal_code": c.get("postal_code"),
                "user_id": c["user_id"],
                "username": c["username"],
                "created_at": c.get("created_at"),
            }
        )
        for c in customers
    ]


@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(customer_id: int, update_data: CustomerUpdate, db=Depends(get_db)):
    """Update customer details"""
    cursor = db["cursor"]

    # Check if customer exists
    cursor.execute(
        """
        SELECT c.*, u.username
        FROM customers c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = %s
        """,
        (customer_id,),
    )
    customer = cursor.fetchone()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Build update query dynamically based on provided fields
    update_fields = []
    values = []
    update_dict = update_data.model_dump(exclude_unset=True)

    for field, value in update_dict.items():
        if value is not None:
            update_fields.append(f"{field} = %s")
            values.append(value)

    if update_fields:
        values.append(customer_id)
        cursor.execute(
            f"UPDATE customers SET {', '.join(update_fields)} WHERE id = %s",
            tuple(values),
        )

    # Fetch updated customer
    cursor.execute(
        """
        SELECT c.*, u.username
        FROM customers c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = %s
        """,
        (customer_id,),
    )
    updated_customer = cursor.fetchone()

    return CustomerResponse.model_validate(
        {
            "id": updated_customer["id"],
            "first_name": updated_customer["first_name"],
            "last_name": updated_customer["last_name"],
            "email": updated_customer.get("email"),
            "phone_number": updated_customer.get("phone_number"),
            "address": updated_customer.get("address"),
            "city": updated_customer.get("city"),
            "postal_code": updated_customer.get("postal_code"),
            "user_id": updated_customer["user_id"],
            "username": updated_customer["username"],
            "created_at": updated_customer.get("created_at"),
        }
    )
