from datetime import datetime
import logging
from fastapi import APIRouter, Request, BackgroundTasks
from ..core.db import get_supabase_client
from ..services.paystack import PaystackService
from ..services.email import send_internal_notification

logger = logging.getLogger(__name__)
router = APIRouter()

def process_order_inventory_and_fulfill(order_id: int, reference: str, gateway: str = "paystack") -> tuple[bool, str]:
    """
    Helper function to record sales and deduct inventory idempotently.
    Can be safely called by both webhooks and payment verification endpoints.
    """
    supabase = get_supabase_client()

    # Fetch order items
    items_resp = (
        supabase.table("order_items")
        .select("*")
        .eq("order_id", order_id)
        .execute()
    )
    items = items_resp.data or []

    for item in items:
        rpc_params = {
            "p_product_id": item["product_id"],
            "p_quantity": item["quantity"],
            "p_selling_price_per_unit": float(item["unit_price"]),
            "p_sale_date": datetime.utcnow().date().isoformat()
        }
        try:
            rpc_resp = supabase.rpc("record_sale", rpc_params).execute()
            result = rpc_resp.data
            if isinstance(result, dict) and not result.get("success"):
                return False, result.get("message", "Stock insufficient")
            elif isinstance(result, bool) and not result:
                return False, f"Stock insufficient for product {item['product_id']}"
        except Exception as e:
            logger.error(f"RPC record_sale error for item {item['product_id']}: {str(e)}")
            return False, str(e)

    # Update order status & mark webhook/verification complete
    supabase.table("orders").update({
        "status": "paid",
        "updated_at": datetime.utcnow().isoformat()
    }).eq("id", order_id).execute()

    supabase.table("processed_webhooks").insert({
        "gateway_event_id": reference,
        "gateway": gateway
    }).execute()

    return True, ""


@router.post("/paystack")
async def paystack_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    Handle Paystack webhook events.
    """
    payload = await request.body()
    signature = request.headers.get("x-paystack-signature", "")

    service = PaystackService()
    if not service.verify_webhook(payload, signature):
        logger.warning("Invalid Paystack webhook signature")
        return {"status": "error", "message": "Invalid signature"}

    event = await request.json()
    event_data = event.get("data", {})
    event_type = event.get("event")

    if event_type == "charge.success":
        reference = event_data.get("reference")
        supabase = get_supabase_client()

        # 1. Idempotency Check (FIXED: selected 'gateway_event_id' instead of 'id')
        existing = (
            supabase.table("processed_webhooks")
            .select("gateway_event_id")
            .eq("gateway_event_id", reference)
            .eq("gateway", "paystack")
            .execute()
        )
        if existing.data:
            logger.info(f"Webhook already processed: {reference}")
            return {"status": "already_processed"}

        # 2. Fetch Order
        order_resp = (
            supabase.table("orders")
            .select("*")
            .eq("gateway_reference", reference)
            .execute()
        )
        if not order_resp.data:
            logger.error(f"Order not found for reference: {reference}")
            return {"status": "ignored", "reason": "Order not found"}

        order = order_resp.data[0]
        order_id = order["id"]

        # If already paid by frontend verification route, record event & exit
        if order.get("status") == "paid":
            supabase.table("processed_webhooks").insert({
                "gateway_event_id": reference,
                "gateway": "paystack"
            }).execute()
            return {"status": "already_paid"}

        # 3. Process Inventory / Record Sales
        success, error_msg = process_order_inventory_and_fulfill(order_id, reference, "paystack")

        if not success:
            supabase.table("orders").update({
                "status": "stock_unavailable",
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", order_id).execute()

            background_tasks.add_task(
                send_internal_notification,
                subject=f"Stock failure for order {order_id}",
                body=f"Order {order_id} payment succeeded on Paystack, but failed inventory allocation: {error_msg}"
            )
            return {"status": "failed", "reason": error_msg}

        return {"status": "success"}

    return {"status": "ignored"}
