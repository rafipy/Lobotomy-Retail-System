from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Customer, User, UserRole
from app.schemas.user import (
    CustomerRegister,
    CustomerRegisterResponse,
    Token,
    UserLogin,
)
from app.utils.auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    get_password_hash,
    verify_password,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=Token)
def login(user_login: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == user_login.username).first()

    if not user or not verify_password(user_login.password, str(user.password_hash)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": str(user.role.value)},
        expires_delta=access_token_expires,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": str(user.role.value),
        "username": str(user.username),
        "user_id": user.id,
    }


@router.post("/register", response_model=CustomerRegisterResponse)
def register_customer(register_data: CustomerRegister, db: Session = Depends(get_db)):
    """Register a new customer"""
    # Check if username already exists
    existing_user = (
        db.query(User).filter(User.username == register_data.username).first()
    )
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )

    # Create user
    user = User(
        username=register_data.username,
        password_hash=get_password_hash(register_data.password),
        role=UserRole.CUSTOMER,
    )
    db.add(user)
    db.flush()

    # Create customer profile
    customer = Customer(
        first_name=register_data.first_name,
        last_name=register_data.last_name,
        email=register_data.email,
        phone_number=register_data.phone_number,
        address=register_data.address,
        city=register_data.city,
        postal_code=register_data.postal_code,
        birth_date=register_data.birth_date,
        user_id=user.id,
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)

    return CustomerRegisterResponse(
        id=user.id,  # type: ignore
        username=user.username,  # type: ignore
        customer_id=customer.id,  # type: ignore
        first_name=customer.first_name,  # type: ignore
        last_name=customer.last_name,  # type: ignore
        message="Registration successful",
    )
