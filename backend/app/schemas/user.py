from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str
    user_id: int


class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None


class CustomerRegister(BaseModel):
    username: str
    password: str
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None


class CustomerRegisterResponse(BaseModel):
    id: int
    username: str
    customer_id: int
    first_name: str
    last_name: str
    message: str

    class Config:
        from_attributes = True
