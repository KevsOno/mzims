import enum
from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


# ==============================
# 1. SQLAlchemy Models
# ==============================

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    supabase_auth_user_id = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    orders = relationship("Order", back_populates="customer")
    addresses = relationship("Address", back_populates="customer")


class Address(Base):
    __tablename__ = "addresses"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    formatted_address = Column(Text, nullable=False)
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    customer = relationship("Customer", back_populates="addresses")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    total = Column(Float, nullable=False)
    currency = Column(String(3), nullable=False, default="NGN")
    gateway = Column(String(20), nullable=False)
    status = Column(String(20), default="pending")
    address = Column(Text, nullable=True)  # Matched DB column
    phone = Column(String, nullable=True)
    email = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    customer = relationship("Customer", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    order = relationship("Order", back_populates="items")


# ==============================
# 2. Order Status Enum
# ==============================

class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


# ==============================
# 3. Pydantic Schemas
# ==============================

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int
    unit_price: Decimal


class OrderCreate(BaseModel):
    customer_id: Optional[str] = None
    guest_email: Optional[str] = Field(default=None, validation_alias="email")
    phone: Optional[str] = None
    address: Optional[str] = Field(default=None, validation_alias="shipping_address")
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    total: Decimal
    currency: str = "NGN"
    gateway: str = Field(..., validation_alias="payment_gateway")
    items: List[OrderItemCreate]

    class Config:
        populate_by_name = True


class OrderResponse(BaseModel):
    id: int
    customer_id: Optional[int] = None
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
