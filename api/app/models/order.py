from pydantic import BaseModel, Field
from typing import Optional, List
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
    customer_id: int
    total: float
    currency: str = "NGN"
    gateway: str  # "paystack" or "monnify"
    gateway_reference: Optional[str] = None
    status: OrderStatus = OrderStatus.PENDING

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]  # nested for creation

class OrderResponse(OrderBase):
    id: int
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse]
