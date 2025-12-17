from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.database import get_db
from app.schemas.payment import (
    PaymentCreate,
    PaymentListResponse,
    PaymentResponse,
    PaymentSummary,
    PaymentWithOrderInfo,
)
from app.services import payment_service

router = APIRouter(prefix="/payments", tags=["payments"])


@router.get("/", response_model=List[PaymentListResponse])
def get_all_payments(db=Depends(get_db)):
    return payment_service.get_all_payments(db)


@router.get("/status/{status}", response_model=List[PaymentListResponse])
def get_payments_by_status(status: str, db=Depends(get_db)):
    valid_statuses = ["pending", "completed", "failed", "refunded"]
    if status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}",
        )
    return payment_service.get_payments_by_status(db, status)


@router.get("/method/{method}", response_model=List[PaymentListResponse])
def get_payments_by_method(method: str, db=Depends(get_db)):
    valid_methods = ["cash", "credit_card", "debit_card", "bank_transfer", "e_wallet"]
    if method not in valid_methods:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid payment method. Must be one of: {', '.join(valid_methods)}",
        )
    return payment_service.get_payments_by_method(db, method)


@router.get("/order/{order_id}", response_model=List[PaymentResponse])
def get_payments_by_order(order_id: int, db=Depends(get_db)):
    return payment_service.get_payments_by_order(db, order_id)


@router.get("/order/{order_id}/summary", response_model=PaymentSummary)
def get_payment_summary(order_id: int, db=Depends(get_db)):
    summary = payment_service.get_payment_summary(db, order_id)
    if not summary:
        raise HTTPException(status_code=404, detail="Order not found")
    return summary


@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(payment_id: int, db=Depends(get_db)):
    payment = payment_service.get_payment_by_id(db, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment


@router.get("/{payment_id}/details", response_model=PaymentWithOrderInfo)
def get_payment_details(payment_id: int, db=Depends(get_db)):
    payment = payment_service.get_payment_with_order_info(db, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment


@router.post("/", response_model=PaymentResponse)
def create_payment(payment_data: PaymentCreate, db=Depends(get_db)):
    payment = payment_service.create_payment(db, payment_data)
    if not payment:
        raise HTTPException(
            status_code=400,
            detail="Failed to create payment. Order may not exist, be cancelled, or payment exceeds remaining balance.",
        )
    return payment


@router.put("/{payment_id}/complete")
def complete_payment(payment_id: int, db=Depends(get_db)):
    result = payment_service.complete_payment(db, payment_id)
    if not result:
        raise HTTPException(
            status_code=400,
            detail="Cannot complete payment. Payment must be in 'pending' status.",
        )
    return result


@router.put("/{payment_id}/fail")
def fail_payment(payment_id: int, reason: str, db=Depends(get_db)):
    result = payment_service.fail_payment(db, payment_id, reason)
    if not result:
        raise HTTPException(
            status_code=400,
            detail="Cannot mark payment as failed. Payment must be in 'pending' status.",
        )
    return result


@router.put("/{payment_id}/refund")
def refund_payment(payment_id: int, db=Depends(get_db)):
    result = payment_service.refund_payment(db, payment_id)
    if not result:
        raise HTTPException(
            status_code=400,
            detail="Cannot refund payment. Payment must be in 'completed' status.",
        )
    return result
