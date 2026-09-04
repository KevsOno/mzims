# app/models/order.py
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pydantic import BaseModel, Field
from typing import Optional, List
from decimal import Decimal
import uuid

from app.database import Base  # Assume Base is defined in database.py

# ==============================
# SQLAlchemy Models (Database)
# ==============================

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    supabase_auth_user_id = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
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
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    total = Column(Float, nullable=False)
    currency = Column(String(3), nullable=False)
    gateway = Column(String(20), nullable=False)  # "paystack" or "monnify"
    status = Column(String(20), default="pending")
    delivery_address = Column(Text, nullable=True)
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
    product_id = Column(Integer, nullable=False)  # assuming product id from product service
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    order = relationship("Order", back_populates="items")


# ==============================
# Pydantic Schemas (Request/Response)
# ==============================

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int
    unit_price: Decimal

class OrderCreate(BaseModel):
    customer_id: Optional[str] = None  # Supabase auth user ID as string
    email: str
    phone: Optional[str] = None
    address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    total: Decimal
    currency: str
    gateway: str  # "paystack" or "monnify"
    items: List[OrderItemCreate]

class OrderResponse(BaseModel):
    id: int
    total: float
    currency: str
    gateway: str
    status: str
    delivery_address: Optional[str] = None
    phone: Optional[str] = None
    email: str
    created_at: str  # or datetime

    class Config:
        orm_mode = True
