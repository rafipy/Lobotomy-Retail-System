from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class SupplierBase(BaseModel):
    code: str
    name: str
    full_name: str
    description: Optional[str] = None
    address: str
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    full_name: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None


class SupplierResponse(SupplierBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SupplierBrief(BaseModel):
    """Brief supplier info for dropdowns"""

    id: int
    code: str
    name: str
    full_name: str

    class Config:
        from_attributes = True
