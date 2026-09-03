from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional, List
from supabase import Client
from ..core.db import get_supabase_client
from ..models.product import ProductResponse

router = APIRouter()

@router.get("", response_model=List[ProductResponse])
async def list_products(
    category: Optional[str] = None,
    scent_family: Optional[str] = None,
    gender: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    cursor: Optional[int] = None,
    limit: int = Query(20, le=100),
    supabase: Client = Depends(get_supabase_client)
):
    # Build query
    query = supabase.table("products").select("*")
    
    if cursor:
        query = query.gt("id", cursor)
    
    if category:
        query = query.eq("category", category)
    if scent_family:
        query = query.eq("scent_family", scent_family)
    if gender:
        query = query.eq("gender", gender)
    if min_price is not None:
        query = query.gte("selling_price", min_price)
    if max_price is not None:
        query = query.lte("selling_price", max_price)
    
    if search:
        # Use trigram search: ilike with pattern
        query = query.ilike("name", f"%{search}%")
    
    query = query.order("id", desc=False).limit(limit)
    resp = query.execute()
    return resp.data

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, supabase: Client = Depends(get_supabase_client)):
    resp = supabase.table("products").select("*").eq("id", product_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Product not found")
    return resp.data[0]

@router.get("/slug/{slug}", response_model=ProductResponse)
async def get_product_by_slug(slug: str, supabase: Client = Depends(get_supabase_client)):
    # ----- STRICT GUARD -----
    # Reject literal "null", "undefined", empty, or whitespace-only slugs
    if not slug or slug in ("null", "undefined") or slug.strip() == "":
        raise HTTPException(status_code=400, detail="Invalid slug")
    
    resp = supabase.table("products").select("*").eq("slug", slug).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Product not found")
    return resp.data[0]
