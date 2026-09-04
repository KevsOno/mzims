from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client
from ..core.db import get_supabase_client
from ..models.customer import CustomerCreate

router = APIRouter()
security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase: Client = Depends(get_supabase_client)
):
    token = credentials.credentials
    try:
        # Verify the JWT directly with Supabase Auth
        user = supabase.auth.get_user(token)
        user_data = user.user

        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

        # Retrieve the corresponding customer record
        resp = supabase.table("customers").select("*").eq("supabase_auth_user_id", user_data.id).execute()
        
        if not resp.data:
            # Create a new customer record if it doesn't exist
            new_customer = CustomerCreate(
                supabase_auth_user_id=user_data.id,
                email=user_data.email,
                phone=None
            )
            insert_resp = supabase.table("customers").insert(new_customer.model_dump()).execute()
            customer = insert_resp.data[0]
        else:
            customer = resp.data[0]

        return customer

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
