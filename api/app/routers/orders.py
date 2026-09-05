import logging
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import Client

from ..core.config import settings
from ..core.db import get_supabase_client
from ..models.order import OrderCreate, OrderResponse, OrderStatus
from ..services.monnify import MonnifyService
from ..services.paystack import PaystackService

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer(auto_error=False)


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    supabase: Client = Depends(get_supabase_client)
) -> Optional[dict]:
    if not credentials:
        return None
    try:
        user = supabase.auth.get_user(credentials.credentials)
        if not user or not user.user:
            return None

        resp = (
            supabase.table("customers")
            .select("*")
            .eq("supabase_auth_user_id", user.user.id)
            .execute()
        )
        return resp.data[0] if resp.data else None
    except Exception:
        return None


@router.get("/track/{reference}")
async def track_order(reference: str, supabase: Client = Depends(get_supabase_client)):
    resp = (
        supabase.table("orders")
        .select("*, order_items(*, products(name))")
        .eq("gateway_reference", reference)
        .execute()
    )
    if not resp.data:
        raise HTTPException(status_code=404, detail="Order not found")
    return resp.data[0]


@router.post("", response_model=dict)
@router.post("/", response_model=dict)
async def create_order(
    order_data: OrderCreate,
    background_tasks: BackgroundTasks,
    current_user: Optional[dict] = Depends(get_current_user_optional),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Create an order with items.
    Supports both authenticated customers and guest checkout.
    Returns a payment initialization URL.
    """
    # 1. Determine customer_id and email
    if current_user:
        customer_id = current_user["id"]
        customer_email = current_user.get("email") or order_data.guest_email
    else:
        customer_email = order_data.guest_email
        if not customer_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email address is required for guest checkout."
            )
        customer_id = None

    # 2. Recalculate total to ensure price integrity
    calculated_total = float(sum(float(item.unit_price) * item.quantity for item in order_data.items))
    order_total = float(order_data.total)
    
    if abs(calculated_total - order_total) > 0.01:
        raise HTTPException(status_code=400, detail="Total amount mismatch")

    # 3. Construct dictionary matching DB columns specifically
    now_iso = datetime.now(timezone.utc).isoformat()
    order_dict = {
        "customer_id": customer_id,
        "email": customer_email,
        "phone": order_data.phone,
        "delivery_address": order_data.address,
        "total": calculated_total,
        "currency": order_data.currency,
        "gateway": order_data.gateway.lower(),
        "status": OrderStatus.PENDING.value,
        "created_at": now_iso,
        "updated_at": now_iso
    }

    # 4. Insert Order into Database
    resp = supabase.table("orders").insert(order_dict).execute()
    if not resp.data:
        raise HTTPException(status_code=500, detail="Failed to create order")
    
    order = resp.data[0]
    order_id = order["id"]

    # 5. Insert Order Items
    items = []
    for item in order_data.items:
        item_dict = {
            "order_id": order_id,
            "product_id": item.product_id,
            "quantity": item.quantity,
            "unit_price": float(item.unit_price)
        }
        items.append(item_dict)

    supabase.table("order_items").insert(items).execute()

    # 6. Initialize Payment Gateway Transaction
    gateway = order_data.gateway.lower()
    
    if gateway == "paystack":
        service = PaystackService()
        payment_data = await service.initialize_transaction(
            order_id=order_id,
            amount=calculated_total,
            email=customer_email,
            callback_url=f"{settings.FRONTEND_URL}/payment/verify"
        )
        
        # Save reference back to order
        supabase.table("orders").update({
            "gateway_reference": payment_data["reference"]
        }).eq("id", order_id).execute()

        return {
            "order_id": order_id,
            "authorization_url": payment_data["authorization_url"],
            "reference": payment_data["reference"]
        }

    elif gateway == "monnify":
        service = MonnifyService()
        payment_data = await service.initialize_transaction(
            order_id=order_id,
            amount=calculated_total,
            email=customer_email,
            customer_name=current_user.get("first_name", "Guest Customer") if current_user else "Guest Customer"
        )

        supabase.table("orders").update({
            "gateway_reference": payment_data["reference"]
        }).eq("id", order_id).execute()

        return {
            "order_id": order_id,
            "authorization_url": payment_data["authorization_url"],
            "reference": payment_data["reference"]
        }

    else:
        raise HTTPException(status_code=400, detail="Unsupported payment gateway")
