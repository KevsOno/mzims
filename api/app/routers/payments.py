import logging
from fastapi import APIRouter, HTTPException, status
from ..core.db import get_supabase_client
from ..services.paystack import PaystackService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/payments", tags=["Payments"])

@router.get("/verify/{reference}")
async def verify_and_get_receipt(reference: str):
    """
    Verifies the transaction status and returns order details with itemized receipt data.
    """
    supabase = get_supabase_client()

    # 1. Fetch order from Supabase
    order_resp = (
        supabase.table("orders")
        .select("*")
        .eq("gateway_reference", reference)
        .execute()
    )

    if not order_resp.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found for the provided reference."
        )

    order = order_resp.data[0]
    order_id = order["id"]

    # 2. If webhook hasn't marked it 'paid' yet, double-check directly with Paystack
    if order.get("status") == "pending":
        service = PaystackService()
        is_success, paystack_data = await service.verify_transaction(reference)

        if is_success:
            # Update order status in Supabase if Paystack confirms success
            supabase.table("orders").update({
                "status": "paid",
                "updated_at": paystack_data.get("paid_at")
            }).eq("id", order_id).execute()
            order["status"] = "paid"

    # 3. Fetch order line items along with product names/details
    items_resp = (
        supabase.table("order_items")
        .select("*, products(name, description, image_url)")
        .eq("order_id", order_id)
        .execute()
    )

    # 4. Return complete receipt payload
    return {
        "status": order["status"],
        "order_id": order_id,
        "reference": reference,
        "gateway": order.get("gateway", "paystack"),
        "total_amount": float(order["total_amount"]),
        "created_at": order["created_at"],
        "items": [
            {
                "product_id": item["product_id"],
                "product_name": item.get("products", {}).get("name", "Unknown Product"),
                "image_url": item.get("products", {}).get("image_url"),
                "quantity": item["quantity"],
                "unit_price": float(item["unit_price"]),
                "subtotal": float(item["unit_price"]) * item["quantity"]
            }
            for item in (items_resp.data or [])
        ]
    }
