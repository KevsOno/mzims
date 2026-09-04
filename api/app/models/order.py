from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
import uuid

# Import your database session dependency and SQLAlchemy models
from app.database import get_db
# from app.models import Order, OrderItem, Customer, Address  # Your SQLAlchemy models
from app.schemas.order import OrderCreate, OrderResponse    # Your updated Pydantic schemas
from app.services.payment import initialize_payment        # Your Paystack/Monnify service
router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db)
):
    # -------------------------------------------------------------
    # 1. Resolve or Create the Customer Record
    # -------------------------------------------------------------
    customer = None

    # Try looking up by Supabase Auth User ID if passed as string UUID
    if payload.customer_id and isinstance(payload.customer_id, str) and payload.customer_id != "0":
        customer = db.query(Customer).filter(
            Customer.supabase_auth_user_id == payload.customer_id
        ).first()

    # Fallback: Look up by Email if customer not found yet
    if not customer:
        customer = db.query(Customer).filter(
            Customer.email == payload.email
        ).first()

    # If customer still doesn't exist in DB, create them on the fly
    if not customer:
        customer = Customer(
            supabase_auth_user_id=str(payload.customer_id) if payload.customer_id else str(uuid.uuid4()),
            email=payload.email,
            phone=payload.phone
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)

    # -------------------------------------------------------------
    # 2. Save Delivery Address (Optional Audit/Reuse)
    # -------------------------------------------------------------
    if payload.latitude and payload.longitude:
        address_record = Address(
            customer_id=customer.id,
            lat=payload.latitude,
            lng=payload.longitude,
            formatted_address=payload.address,
            is_default=True
        )
        db.add(address_record)

    # -------------------------------------------------------------
    # 3. Create the Main Order
    # -------------------------------------------------------------
    new_order = Order(
        customer_id=customer.id,  # Integer FK matching DB Customer table
        total=payload.total,
        currency=payload.currency,
        gateway=payload.gateway,
        status="pending",
        # Save full doorstep address details to order notes or direct columns
        delivery_address=payload.address,
        phone=payload.phone,
        email=payload.email
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    # -------------------------------------------------------------
    # 4. Insert Order Items
    # -------------------------------------------------------------
    order_items = [
        OrderItem(
            order_id=new_order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.unit_price
        )
        for item in payload.items
    ]
    db.add_all(order_items)
    db.commit()

    # -------------------------------------------------------------
    # 5. Initialize Payment with Gateway (Paystack or Monnify)
    # -------------------------------------------------------------
    payment_response = await initialize_payment(
        gateway=payload.gateway,
        order_id=new_order.id,
        amount=payload.total,
        email=payload.email
    )

    # Return authorization URL so React can redirect window.location.href
    return {
        "order_id": new_order.id,
        "authorization_url": payment_response.get("authorization_url")
    }
