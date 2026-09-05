# api/app/core/auth.py
import logging
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import Client

from .config import settings
from .db import get_supabase_client

logger = logging.getLogger(__name__)

# auto_error=False ensures missing Bearer tokens don't automatically trigger a 403/401 HTTP exception
security = HTTPBearer(auto_error=False)


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    supabase: Client = Depends(get_supabase_client)
) -> Optional[dict]:
    """
    Dependency for endpoints that allow BOTH guest and authenticated requests.
    Returns the user dict if authenticated, or None if guest/invalid token.
    """
    if not credentials or not credentials.credentials:
        return None

    try:
        # Verify the access token with Supabase Auth
        user_response = supabase.auth.get_user(credentials.credentials)
        if not user_response or not user_response.user:
            return None

        auth_user = user_response.user

        # Try fetching customer record from DB
        try:
            resp = supabase.table("customers").select("*").eq("supabase_auth_user_id", auth_user.id).execute()
            if resp.data and len(resp.data) > 0:
                return resp.data[0]
        except Exception as db_err:
            logger.warning(f"Failed to fetch customer profile row: {db_err}")

        # Fallback dict containing basic auth user details if customer profile row is missing
        return {
            "id": auth_user.id,
            "email": auth_user.email,
            "supabase_auth_user_id": auth_user.id
        }

    except Exception as e:
        logger.warning(f"Auth optional error: {e}")
        return None


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    supabase: Client = Depends(get_supabase_client)
) -> dict:
    """
    Dependency for strict endpoints that REQUIRE authentication.
    Raises an HTTP 401 exception if the user is unauthenticated or token is invalid.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_response = supabase.auth.get_user(credentials.credentials)
        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )

        auth_user = user_response.user

        # Fetch customer profile
        resp = supabase.table("customers").select("*").eq("supabase_auth_user_id", auth_user.id).execute()
        if resp.data and len(resp.data) > 0:
            return resp.data[0]

        # Return minimal user profile dict if DB row hasn't synced yet
        return {
            "id": auth_user.id,
            "email": auth_user.email,
            "supabase_auth_user_id": auth_user.id
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )
