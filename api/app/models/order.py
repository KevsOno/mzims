import enum
from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field, ValidationInfo, field_validator


# ==============================
# 1. Order Status Enum
# ==============================

class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    STOCK_UNAVAILABLE = "stock_unavailable"


# ==============================
# 2. Pydantic Schemas (Supabase Native)
# ==============================

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(gt=0, description="Quantity must be greater than 0")
    unit_price: Decimal = Field(gt=0, description="Unit price must be positive")

    @field_validator("unit_price", mode="before")
    @classmethod
    def parse_decimal(cls, v):
        if isinstance(v, (str, int, float)):
            return Decimal(str(v))
        return v


class OrderCreate(BaseModel):
    customer_id: Optional[str] = None
    guest_email: Optional[str] = Field(None, alias="email")
    email: Optional[str] = None
    phone: Optional[str] = None
    
    # Accepts 'address' or 'shipping_address' from frontend payload
    address: str = Field(..., validation_alias="shipping_address")
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    
    total: Decimal = Field(gt=0)
    currency: str = "NGN"
    
    # Accepts 'gateway' or 'payment_gateway' from frontend payload
    gateway: str = Field(..., validation_alias="payment_gateway")
    
    items: List[OrderItemCreate]

    @field_validator("total", mode="before")
    @classmethod
    def parse_total(cls, v):
        if isinstance(v, (str, int, float)):
            return Decimal(str(v))
        return v

    @field_validator("guest_email", mode="before")
    @classmethod
    def resolve_guest_email(cls, v, info: ValidationInfo):
        # Fallback check if email was supplied directly under 'email' key
        if not v and "email" in info.data:
            return info.data.get("email")
        return v

    class Config:
        populate_by_name = True


class OrderItemResponse(BaseModel):
    id: int
    order_id: int
    product_id: int
    quantity: int
    unit_price: float
    created_at: datetime


class OrderResponse(BaseModel):
    id: int
    customer_id: Optional[str] = None
    total: float
    currency: str
    gateway: str
    status: OrderStatus
    address: Optional[str] = None
    phone: Optional[str] = None
    email: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
