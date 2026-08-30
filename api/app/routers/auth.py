from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from supabase import Client
from ..core.db import get_supabase_client
from ..core.config import settings
from ..models.customer import CustomerResponse, CustomerCreate

router = APIRouter()
security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase: Client = Depends(get_supabase_client)
):
    token = credentials.credentials
    try:
        # Decode JWT from Supabase Auth (using the project's JWT secret)
        # In production, use the Supabase JWT secret from the dashboard.
        # We'll use the public key or the client to verify.
        # Since we have the SUPABASE_KEY (service role), we can call the auth API.
        # For simplicity, we verify using the same key.
        # We'll use the Supabase client's auth.get_user() method.
        user = supabase.auth.get_user(token)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        # user is a dict with 'id', 'email', etc.
        # Now we need to find the corresponding customer record.
        resp = supabase.table("customers").select("*").eq("supabase_auth_user_id", user.user.id).execute()
        if not resp.data:
            # If not found, create a new customer record.
            new_customer = CustomerCreate(
                supabase_auth_user_id=user.user.id,
                email=user.user.email,
                phone=None
            )
            insert_resp = supabase.table("customers").insert(new_customer.dict()).execute()
            customer = insert_resp.data[0]
        else:
            customer = resp.data[0]
        return customer
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
