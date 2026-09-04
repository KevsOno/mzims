# api/app/routers/profile.py
from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone

from app.core.db import get_supabase_client
from app.core.auth import get_current_user

router = APIRouter(prefix="/profile", tags=["profile"])

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None


@router.get("/")
async def get_profile(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Retrieve the profile for the authenticated user.
    Uses the 'customers' table directly (since that's where user data lives).
    If you have a separate 'profiles' table, adjust the table name.
    """
    # Option A: Use the 'customers' table (recommended, no extra table needed)
    resp = supabase.table("customers").select("*").eq("id", current_user["id"]).execute()
    if not resp.data:
        # If not found, create a minimal record (shouldn't happen if properly set up)
        new_profile = {
            "id": current_user["id"],
            "supabase_auth_user_id": current_user.get("supabase_auth_user_id"),
            "email": current_user.get("email"),
        }
        supabase.table("customers").insert(new_profile).execute()
        return new_profile
    return resp.data[0]

    # Option B: If you insist on a separate 'profiles' table, use:
    # resp = supabase.table("profiles").select("*").eq("customer_id", current_user["id"]).execute()
    # ... then handle accordingly.


@router.put("/")
async def update_profile(
    data: ProfileUpdate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Update the profile for the authenticated user.
    """
    # Remove None values (Pydantic v2: use .model_dump())
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    # Add updated_at timestamp (use ISO format for Supabase)
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

    # Update the 'customers' table (or 'profiles' if you prefer)
    resp = supabase.table("customers").update(update_data).eq("id", current_user["id"]).execute()

    if not resp.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return resp.data[0]
