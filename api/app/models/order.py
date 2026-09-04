from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Union
from datetime import datetime
from enum import Enum

class OrderStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    FULFILLED = "fulfilled"
    FAILED = "failed"
    STOCK_UNAVAILABLE = "stock_unavailable"

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)
    unit_price: float

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemResponse(OrderItemBase):
    id: int
    order_id: int
    created_at: datetime

class OrderBase(BaseModel):
    # Accepts either an integer DB ID or a Supabase UUID string
    customer_id: Optional[Union[int, str]] = None
    email: EmailStr
    phone: str
    address: str
    street_address: Optional[str] = None
    building_details: Optional[str] = None
    landmark: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    total: float
    currency: str = "NGN"
    gateway: str  # "paystack" or "monnify"
    gateway_reference: Optional[str] = None
    status: OrderStatus = OrderStatus.PENDING

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class OrderResponse(OrderBase):
    id: int
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse]
