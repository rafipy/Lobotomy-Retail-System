from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.database import get_db
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
def login(user_login: UserLogin, db: dict = Depends(get_db)):
    cursor = db["cursor"]
    cursor.execute(
        "SELECT id, username, password_hash, role FROM users WHERE username = %s",
        (user_login.username,),
    )
    user = cursor.fetchone()
    if not user or not verify_password(user_login.password, str(user["password_hash"])):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"], "role": str(user["role"])},
        expires_delta=access_token_expires,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": str(user["role"]),
        "username": str(user["username"]),
        "user_id": user["id"],
    }


@router.post("/register", response_model=CustomerRegisterResponse)
def register_customer(register_data: CustomerRegister, db: dict = Depends(get_db)):
    cursor = db["cursor"]

    # Check if username already exists
    cursor.execute(
        "SELECT id FROM users WHERE username = %s", (register_data.username,)
    )
    existing = cursor.fetchone()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )

    # Create user
    password_hash = get_password_hash(register_data.password)
    cursor.execute(
        "INSERT INTO users (username, password_hash, role) VALUES (%s, %s, %s)",
        (register_data.username, password_hash, "customer"),
    )
    user_id = cursor.lastrowid

    cursor.execute(
        """
        INSERT INTO customers
        (first_name, last_name, email, phone_number, address, city, postal_code, birth_date, user_id)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """,
        (
            register_data.first_name,
            register_data.last_name,
            register_data.email,
            register_data.phone_number,
            register_data.address,
            register_data.city,
            register_data.postal_code,
            register_data.birth_date,
            user_id,
        ),
    )
    customer_id = cursor.lastrowid

    return CustomerRegisterResponse(
        id=user_id,
        username=register_data.username,
        customer_id=customer_id,
        first_name=register_data.first_name,
        last_name=register_data.last_name,
        message="Registration successful",
    )
