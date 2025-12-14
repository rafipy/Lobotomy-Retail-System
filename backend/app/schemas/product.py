from datetime import datetime
from typing import Optional

from pydantic import BaseModel, field_validator


class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    selling_price: float
    purchase_price: float
    supplier_id: int
    stock: int = 0
    reorder_level: int = 50
    reorder_amount: int = 100
    category: str
    image_url: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Product name is required")
        return v.strip()

    @field_validator("selling_price")
    @classmethod
    def selling_price_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Selling price must be greater than 0")
        return v

    @field_validator("purchase_price")
    @classmethod
    def purchase_price_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Purchase price must be greater than 0")
        return v

    @field_validator("supplier_id")
    @classmethod
    def supplier_id_valid(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("Please select a supplier")
        return v

    @field_validator("stock")
    @classmethod
    def stock_not_negative(cls, v: int) -> int:
        if v < 0:
            raise ValueError("Stock cannot be negative")
        return v

    @field_validator("reorder_level")
    @classmethod
    def reorder_level_not_negative(cls, v: int) -> int:
        if v < 0:
            raise ValueError("Reorder level cannot be negative")
        return v

    @field_validator("reorder_amount")
    @classmethod
    def reorder_amount_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("Reorder amount must be greater than 0")
        return v

    @field_validator("category")
    @classmethod
    def category_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Please select a category")
        return v.strip()


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    selling_price: Optional[float] = None
    purchase_price: Optional[float] = None
    supplier_id: Optional[int] = None
    stock: Optional[int] = None
    reorder_level: Optional[int] = None
    reorder_amount: Optional[int] = None
    category: Optional[str] = None
    image_url: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError("Product name cannot be empty")
        return v.strip() if v else v

    @field_validator("selling_price")
    @classmethod
    def selling_price_positive(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v <= 0:
            raise ValueError("Selling price must be greater than 0")
        return v

    @field_validator("purchase_price")
    @classmethod
    def purchase_price_positive(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v <= 0:
            raise ValueError("Purchase price must be greater than 0")
        return v

    @field_validator("supplier_id")
    @classmethod
    def supplier_id_valid(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v <= 0:
            raise ValueError("Invalid supplier")
        return v

    @field_validator("stock")
    @classmethod
    def stock_not_negative(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v < 0:
            raise ValueError("Stock cannot be negative")
        return v

    @field_validator("reorder_level")
    @classmethod
    def reorder_level_not_negative(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v < 0:
            raise ValueError("Reorder level cannot be negative")
        return v

    @field_validator("reorder_amount")
    @classmethod
    def reorder_amount_positive(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v <= 0:
            raise ValueError("Reorder amount must be greater than 0")
        return v

    @field_validator("category")
    @classmethod
    def category_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError("Category cannot be empty")
        return v.strip() if v else v


class ProductResponse(ProductBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    selling_price: float
    purchase_price: float
    supplier_id: int
    supplier_name: str
    stock: int
    reorder_level: int
    reorder_amount: int
    category: str
    image_url: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
