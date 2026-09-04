# app/models/__init__.py

# SQLAlchemy models (database tables)
from .order import (
    Order, OrderItem, Customer, Address,
    OrderStatus,
)

# Pydantic schemas (request/response)
from .order import (
    OrderCreate, OrderResponse, OrderItemCreate,
)

# If you have separate product schemas in .product
from .product import ProductCreate, ProductUpdate, ProductResponse

# Optionally, to make everything available from app.models
__all__ = [
    "Order", "OrderItem", "Customer", "Address",
    "OrderStatus",
    "OrderCreate", "OrderResponse", "OrderItemCreate",
    "ProductCreate", "ProductUpdate", "ProductResponse",
]
