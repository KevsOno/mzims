from fastapi import APIRouter, Request, HTTPException, BackgroundTasks
from supabase import Client
from ..core.db import get_supabase_client
from ..services.paystack import PaystackService
from ..services.monnify import MonnifyService
from ..services.email import send_internal_notification
from ..core.config import settings
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/paystack")
async def paystack_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    Handle Paystack webhook events.
    """
    payload = await request.body()
    signature = request.headers.get("x-paystack-signature")
    
    service = PaystackService()
    if not service.verify_webhook(payload, signature):
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    event = await request.json()
    event_data = event.get("data")
    event_type = event.get("event")
    
    if event_type == "charge.success":
        # Process successful payment
        reference = event_data.get("reference")
        # Use idempotency check via processed_webhooks
        supabase = get_supabase_client()
        # Check if already processed
        existing = supabase.table("processed_webhooks").select("*").eq("gateway_event_id", reference).eq("gateway", "paystack").execute()
        if existing.data:
            logger.info(f"Webhook already processed: {reference}")
            return {"status": "already_processed"}
        
        # Update order status to paid and record sale
        # Find order by gateway_reference
        order_resp = supabase.table("orders").select("*").eq("gateway_reference", reference).execute()
        if not order_resp.data:
            raise HTTPException(status_code=404, detail="Order not found")
        order = order_resp.data[0]
        order_id = order['id']
        customer_id = order['customer_id']
        
        # Fetch order items
        items_resp = supabase.table("order_items").select("*").eq("order_id", order_id).execute()
        items = items_resp.data
        
        # Begin transaction: we'll call record_sale for each item
        # We'll use Supabase's RPC, but we need to handle errors atomically.
        # Since we don't have a transaction across multiple RPC calls, we'll do them sequentially
        # and if any fails, we'll mark order as failed and notify.
        # Better: wrap in a single transaction via a custom RPC, but we'll keep it simple.
        
        success = True
        error_msg = ""
        for item in items:
            rpc_params = {
                "p_product_id": item['product_id'],
                "p_quantity": item['quantity'],
                "p_selling_price_per_unit": item['unit_price'],
                "p_sale_date": datetime.utcnow().date().isoformat()
            }
            rpc_resp = supabase.rpc("record_sale", rpc_params).execute()
            if not rpc_resp.data.get("success"):
                success = False
                error_msg = f"Stock insufficient for product {item['product_id']}"
                break
        
        if success:
            # Update order status
            supabase.table("orders").update({"status": "paid", "updated_at": datetime.utcnow().isoformat()}).eq("id", order_id).execute()
            # Insert webhook processed record
            supabase.table("processed_webhooks").insert({
                "gateway_event_id": reference,
                "gateway": "paystack"
            }).execute()
            # Optionally send confirmation email
            # ...
            return {"status": "success"}
        else:
            # Mark order as failed
            supabase.table("orders").update({
                "status": "stock_unavailable",
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", order_id).execute()
            # Send internal notification
            background_tasks.add_task(
                send_internal_notification,
                subject=f"Stock failure for order {order_id}",
                body=f"Order {order_id} failed due to insufficient stock. Please check inventory."
            )
            # Also notify customer (via email)
            # ...
            raise HTTPException(status_code=400, detail=error_msg)
    
    return {"status": "ignored"}
