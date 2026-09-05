from typing import Optional
import logging

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from supabase import Client

from ..core.db import get_supabase_client
from ..models.fragrance_request import FragranceRequestCreate, FragranceRequestResponse
from ..services.mailchimp import MailchimpService
from ..services.email import send_internal_notification
from .auth import get_current_user_optional  # <-- Updated to optional auth helper

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/", response_model=FragranceRequestResponse)
async def create_fragrance_request(
    request_data: FragranceRequestCreate,
    background_tasks: BackgroundTasks,
    current_user: Optional[dict] = Depends(get_current_user_optional),  # Allows both guests & logged-in users
    supabase: Client = Depends(get_supabase_client)
):
    # Convert Pydantic model to dict safely for Pydantic v1 and v2
    payload = request_data.model_dump() if hasattr(request_data, 'model_dump') else request_data.dict()

    # Link authenticated customer ID if present; otherwise ensure it's None
    if current_user and "id" in current_user:
        payload["customer_id"] = current_user["id"]
    else:
        payload["customer_id"] = None

    try:
        # Insert request into Supabase table
        resp = supabase.table("fragrance_requests").insert(payload).execute()

        if not resp.data or len(resp.data) == 0:
            raise HTTPException(status_code=500, detail="Failed to create request in database")

        new_req = resp.data[0]

        # Sync email contact to Mailchimp in background
        if request_data.contact and "@" in request_data.contact:
            background_tasks.add_task(
                MailchimpService().add_or_update_subscriber,
                email=request_data.contact,
                tags=["fragrance-request"]
            )

        # Trigger internal admin email notification in background
        background_tasks.add_task(
            send_internal_notification,
            subject=f"New Fragrance Request: {new_req.get('id')}",
            body=f"Request: {request_data.request_text}\nContact: {request_data.contact}"
        )

        return new_req

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing fragrance request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
