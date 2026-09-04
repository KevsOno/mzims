# api/app/core/auth.py
import logging
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import Client

from .config import settings
from .db import get_supabase_client

logger = logging.getLogger(__name__)
security = HTTPBearer(auto_error=False)


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    supabase: Client = Depends(get_supabase_client)
) -> Optional[dict]:
    if not credentials:
        return None
    try:
        user = supabase.auth.get_user(credentials.credentials)
        if not user or not user.user:
            return None
        resp = supabase.table("customers").select("*").eq("supabase_auth_user_id", user.user.id).execute()
        return resp.data[0] if resp.data else None
    except Exception as e:
        logger.warning(f"Auth optional error: {e}")
        return None


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase: Client = Depends(get_supabase_client)
) -> dict:
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated", headers={"WWW-Authenticate": "Bearer"})
    try:
        user = supabase.auth.get_user(credentials.credentials)
        if not user or not user.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        resp = supabase.table("customers").select("*").eq("supabase_auth_user_id", user.user.id).execute()
        if not resp.data:
            raise HTTPException(status_code=404, detail="Customer profile not found")
        return resp.data[0]
    except Exception as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")
