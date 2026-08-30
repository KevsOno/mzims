from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from supabase import Client
from ..core.db import get_supabase_client
from ..models.fragrance_request import FragranceRequestCreate, FragranceRequestResponse
from ..services.mailchimp import MailchimpService
from ..services.email import send_internal_notification
from .auth import get_current_user
from typing import Optional

router = APIRouter()

@router.post("/", response_model=FragranceRequestResponse)
async def create_fragrance_request(
    request_data: FragranceRequestCreate,
    background_tasks: BackgroundTasks,
    current_user: Optional[dict] = Depends(get_current_user),  # optional, guests can submit
    supabase: Client = Depends(get_supabase_client)
):
    # If user is authenticated, link customer_id
    if current_user:
        request_data.customer_id = current_user['id']
    
    # Insert into DB
    resp = supabase.table("fragrance_requests").insert(request_data.dict()).execute()
    if not resp.data:
        raise HTTPException(status_code=500, detail="Failed to create request")
    new_req = resp.data[0]
    
    # Sync to Mailchimp (if we have email/contact)
    if request_data.contact and "@" in request_data.contact:
        background_tasks.add_task(
            MailchimpService().add_or_update_subscriber,
            email=request_data.contact,
            tags=["fragrance-request"]
        )
        # Also send a receipt to customer via Mailchimp transactional (or separate)
    
    # Internal notification via SMTP
    background_tasks.add_task(
        send_internal_notification,
        subject=f"New Fragrance Request: {new_req['id']}",
        body=f"Request: {request_data.request_text}\nContact: {request_data.contact}"
    )
    
    return new_req
