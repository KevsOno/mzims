from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from pydantic import BaseModel
from typing import Optional
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
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    resp = supabase.table("profiles").select("*").eq("id", current_user.id).execute()
    if not resp.data:
        # Create a profile if it doesn't exist (should happen via trigger, but just in case)
        new_profile = {"id": current_user.id}
        supabase.table("profiles").insert(new_profile).execute()
        return new_profile
    return resp.data[0]

@router.put("/")
async def update_profile(
    data: ProfileUpdate,
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    # Remove None values
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    update_data["updated_at"] = "now()"  # if you want to track updates
    resp = supabase.table("profiles").update(update_data).eq("id", current_user.id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return resp.data[0]
