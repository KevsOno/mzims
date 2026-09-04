# api/app/models/__init__.py

from .order import Order
from .order_item import OrderItem   # if this file exists
from .customer import Customer
from .address import Address

# Also export any other models you have
from .product import ProductCreate, ProductUpdate, ProductResponse
