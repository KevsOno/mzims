import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import Client

from ..core.config import settings
from ..core.db import get_supabase_client
from ..models.order import OrderCreate, OrderStatus
from ..services.monnify import MonnifyService
from ..services.paystack import PaystackService

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer(auto_error=False)


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    supabase: Client = Depends(get_supabase_client)
) -> Optional[dict]:
    """
    Optional auth dependency using Supabase Auth JWT.
    Returns customer metadata or None for guest checkouts.
    """
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
    except Exception as e:
        logger.warning(f"Auth verification failed: {str(e)}")
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


@router.post("/", response_model=dict)
@router.post("", response_model=dict, include_in_schema=False)
async def create_order(
    order_data: OrderCreate,
    background_tasks: BackgroundTasks,
    current_user: Optional[dict] = Depends(get_current_user_optional),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Creates an order and items directly in Supabase.
    Supports both registered customers and guest checkouts seamlessly.
    """
    # 1. Resolve customer identity & email
    if current_user:
        customer_id = current_user.get("id")
        customer_email = current_user.get("email") or order_data.guest_email or order_data.email
    else:
        customer_email = order_data.guest_email or order_data.email
        if not customer_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A valid email address is required for checkout."
            )
        customer_id = None

    # 2. Recalculate and verify prices
    calculated_total = float(sum(float(item.unit_price) * item.quantity for item in order_data.items))
    order_total = float(order_data.total)

    if abs(calculated_total - order_total) > 0.01:
        raise HTTPException(status_code=400, detail="Order total mismatch")

    # 3. Construct Order object for Supabase
    now_iso = datetime.now(timezone.utc).isoformat()
    order_dict = {
        "customer_id": customer_id,
        "email": customer_email,
        "phone": order_data.phone,
        "address": order_data.address,
        "latitude": order_data.latitude,
        "longitude": order_data.longitude,
        "total": calculated_total,
        "currency": order_data.currency.upper(),
        "gateway": order_data.gateway.lower(),
        "status": OrderStatus.PENDING.value,
        "created_at": now_iso,
        "updated_at": now_iso
    }

    # 4. Insert Order into Supabase
    resp = supabase.table("orders").insert(order_dict).execute()
    if not resp.data:
        raise HTTPException(status_code=500, detail="Failed to save order to database")

    order = resp.data[0]
    order_id = order["id"]

    # 5. Insert Order Items into Supabase
    items = [
        {
            "order_id": order_id,
            "product_id": item.product_id,
            "quantity": item.quantity,
            "unit_price": float(item.unit_price)
        }
        for item in order_data.items
    ]
    supabase.table("order_items").insert(items).execute()

    # 6. Initialize Payment Gateway Transaction
    gateway = order_data.gateway.lower()

    if gateway == "paystack":
        service = PaystackService()
        payment_data = service.initialize_transaction(
            order_id=order_id,
            amount=calculated_total,
            email=customer_email,
            callback_url=f"{settings.FRONTEND_URL}/payment/verify"
        )
        
        # Save payment reference back to order record
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
        payment_data = service.initialize_transaction(
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
