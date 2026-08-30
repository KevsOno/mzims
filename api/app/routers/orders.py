from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import List
from supabase import Client
from ..core.db import get_supabase_client
from ..models.order import OrderCreate, OrderResponse, OrderStatus
from ..models.customer import CustomerResponse
from ..services.paystack import PaystackService
from ..services.monnify import MonnifyService
from .auth import get_current_user
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/", response_model=dict)
async def create_order(
    order_data: OrderCreate,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Create an order with items. The order status is 'pending'.
    Returns a payment initialization URL.
    """
    # Ensure customer_id matches authenticated user
    if order_data.customer_id != current_user['id']:
        raise HTTPException(status_code=403, detail="Customer mismatch")
    
    # Calculate total from items (or trust the client? We'll recalc)
    total = sum(item.unit_price * item.quantity for item in order_data.items)
    if abs(total - order_data.total) > 0.01:
        raise HTTPException(status_code=400, detail="Total mismatch")
    
    # Insert order
    order_dict = order_data.dict(exclude={'items'})
    order_dict['status'] = OrderStatus.PENDING.value
    order_dict['created_at'] = datetime.utcnow().isoformat()
    order_dict['updated_at'] = order_dict['created_at']
    resp = supabase.table("orders").insert(order_dict).execute()
    if not resp.data:
        raise HTTPException(status_code=500, detail="Failed to create order")
    order = resp.data[0]
    order_id = order['id']
    
    # Insert order items
    items = []
    for item in order_data.items:
        item_dict = item.dict()
        item_dict['order_id'] = order_id
        items.append(item_dict)
    items_resp = supabase.table("order_items").insert(items).execute()
    
    # Initiate payment with selected gateway
    gateway = order_data.gateway.lower()
    if gateway == "paystack":
        service = PaystackService()
        payment_data = service.initialize_transaction(
            order_id=order_id,
            amount=total,
            email=current_user['email'],
            callback_url=f"{settings.FRONTEND_URL}/payment/verify"
        )
        return {"order_id": order_id, "authorization_url": payment_data['authorization_url'], "reference": payment_data['reference']}
    elif gateway == "monnify":
        service = MonnifyService()
        payment_data = service.initialize_transaction(
            order_id=order_id,
            amount=total,
            email=current_user['email'],
            customer_name=current_user.get('email', 'Customer')
        )
        return {"order_id": order_id, "authorization_url": payment_data['authorization_url'], "reference": payment_data['reference']}
    else:
        raise HTTPException(status_code=400, detail="Unsupported gateway")
