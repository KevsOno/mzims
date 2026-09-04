# api/app/models/__init__.py

# Existing imports
from .product import ProductCreate, ProductUpdate, ProductResponse

# Add these imports - adjust file names as needed
from .order import Order, OrderItem          # if defined in order.py
from .customer import Customer              # if in customer.py
from .address import Address                # if in address.py

# If you have many models, you can also export everything from each file:
# from .order import *
# from .customer import *
# from .address import *
