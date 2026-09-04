from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Literal
from datetime import datetime
from ..core.db import get_supabase_client
from ..services.paystack import PaystackService
from ..services.monnify import MonnifyService

router = APIRouter()

class CheckoutRequest(BaseModel):
    customer_id: str
    email: str
    customer_name: str
    payment_gateway: Literal["paystack", "monnify"]
    callback_url: str  # Frontend page to redirect user after payment

@router.post("/initialize")
async def initialize_checkout(body: CheckoutRequest):
    supabase = get_supabase_client()

    # 1. Fetch user's cart items
    cart_resp = supabase.table("cart_items").select("*, products(*)").eq("customer_id", body.customer_id).execute()
    cart_items = cart_resp.data
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # 2. Calculate total amount
    total_amount = sum(item["quantity"] * item["products"]["price"] for item in cart_items)

    # 3. Create 'pending' order in DB
    order_resp = supabase.table("orders").insert({
        "customer_id": body.customer_id,
        "total_amount": total_amount,
        "status": "pending",
        "created_at": datetime.utcnow().isoformat()
    }).execute()
    order = order_resp.data[0]

    # 4. Save order items
    order_items = [
        {
            "order_id": order["id"],
            "product_id": item["product_id"],
            "quantity": item["quantity"],
            "unit_price": item["products"]["price"]
        }
        for item in cart_items
    ]
    supabase.table("order_items").insert(order_items).execute()

    # 5. Initialize payment with selected gateway
    if body.payment_gateway == "paystack":
        service = PaystackService()
        payment_data = await service.initialize_transaction(
            order_id=order["id"],
            amount=total_amount,
            email=body.email,
            callback_url=body.callback_url
        )
    elif body.payment_gateway == "monnify":
        service = MonnifyService()
        payment_data = await service.initialize_transaction(
            order_id=order["id"],
            amount=total_amount,
            email=body.email,
            customer_name=body.customer_name
        )

    # 6. Save gateway reference to the order
    supabase.table("orders").update({
        "gateway_reference": payment_data["reference"],
        "gateway": body.payment_gateway
    }).eq("id", order["id"]).execute()

    # 7. Clear the user's cart
    supabase.table("cart_items").delete().eq("customer_id", body.customer_id).execute()

    # Return authorization URL to frontend for redirection
    return {
        "order_id": order["id"],
        "checkout_url": payment_data["authorization_url"],
        "reference": payment_data["reference"]
    }
