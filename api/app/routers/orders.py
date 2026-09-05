import logging
from datetime import datetime, timezone

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
security = HTTPBearer(auto_error=True)  # Set auto_error to True to block unauthenticated calls immediately


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase: Client = Depends(get_supabase_client)
) -> dict:
    """Strictly requires an authenticated customer account."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to place an order."
        )
    try:
        user = supabase.auth.get_user(credentials.credentials)
        if not user or not user.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired authentication token."
            )

        resp = (
            supabase.table("customers")
            .select("*")
            .eq("supabase_auth_user_id", user.user.id)
            .execute()
        )
        if not resp.data:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Customer account profile not found."
            )
        return resp.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"Failed to resolve user token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not authenticate request."
        )


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
    current_user: dict = Depends(get_current_user),  # Enforce required authentication
    supabase: Client = Depends(get_supabase_client)
):
    try:
        # 1. Resolve Customer Details from Session
        customer_id = current_user["id"]
        customer_email = current_user.get("email") or order_data.guest_email

        if not customer_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email address is required for checkout."
            )

        # 2. Price Integrity Check
        calculated_total = float(sum(float(item.unit_price) * item.quantity for item in order_data.items))
        order_total = float(order_data.total)
        
        if abs(calculated_total - order_total) > 0.01:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail=f"Total mismatch. Calculated: {calculated_total}, Received: {order_total}"
            )

        # 3. Construct Payload Matching Exact Supabase Columns
        now_iso = datetime.now(timezone.utc).isoformat()
        order_dict = {
            "customer_id": customer_id,
            "email": customer_email,
            "phone": order_data.phone,
            "delivery_address": order_data.address,  # Maps Pydantic address to DB 'delivery_address'
            "total": calculated_total,
            "currency": order_data.currency,
            "gateway": order_data.gateway.lower(),
            "status": OrderStatus.PENDING.value,
            "created_at": now_iso,
            "updated_at": now_iso
        }

        # 4. Insert Order Record
        resp = supabase.table("orders").insert(order_dict).execute()
        if not resp.data:
            raise HTTPException(status_code=500, detail="Database insertion failed")
        
        order = resp.data[0]
        order_id = order["id"]

        # 5. Insert Order Items
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
        customer_name = current_user.get("first_name", "Valued Customer")
        
        if gateway == "paystack":
            service = PaystackService()
            payment_data = await service.initialize_transaction(
                order_id=order_id,
                amount=calculated_total,
                email=customer_email,
                callback_url=f"{settings.FRONTEND_URL}/payment/verify"
            )
        elif gateway == "monnify":
            service = MonnifyService()
            payment_data = await service.initialize_transaction(
                order_id=order_id,
                amount=calculated_total,
                email=customer_email,
                customer_name=customer_name
            )
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported payment gateway: {gateway}")

        # 7. Update gateway reference
        supabase.table("orders").update({
            "gateway_reference": payment_data["reference"]
        }).eq("id", order_id).execute()

        return {
            "order_id": order_id,
            "authorization_url": payment_data["authorization_url"],
            "reference": payment_data["reference"]
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error processing order request:")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process order: {str(e)}"
        )
