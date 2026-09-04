# api/app/routers/recommendations.py
from fastapi import APIRouter, Depends, Query, HTTPException
from supabase import Client
from typing import List, Optional
from app.core.db import get_supabase_client
from app.models.product import ProductResponse

# No prefix here – main.py already mounts with "/api/v1/recommendations"
router = APIRouter(tags=["Recommendations"])

@router.get("/user", response_model=List[ProductResponse])
def get_user_recommendations(
    customer_id: str = Query(..., description="Supabase Auth UUID"),
    limit: int = 6,
    supabase: Client = Depends(get_supabase_client)
):
    # -------------------------------------------------------------
    # 1. Fetch customer record
    # -------------------------------------------------------------
    customer_resp = supabase.table("customers")\
        .select("*")\
        .eq("supabase_auth_user_id", customer_id)\
        .execute()
    
    customer = customer_resp.data[0] if customer_resp.data else None

    # If no customer, fallback: return top 6 products (by popularity or random)
    if not customer:
        # You can customize this – e.g., bestsellers or newest
        fallback_resp = supabase.table("products")\
            .select("*")\
            .order("created_at", desc=True)\
            .limit(limit)\
            .execute()
        return fallback_resp.data

    # -------------------------------------------------------------
    # 2. Get all order IDs for this customer
    # -------------------------------------------------------------
    orders_resp = supabase.table("orders")\
        .select("id")\
        .eq("customer_id", customer["id"])\
        .execute()
    
    order_ids = [order["id"] for order in orders_resp.data] if orders_resp.data else []

    # -------------------------------------------------------------
    # 3. Fetch purchased product IDs from order_items
    # -------------------------------------------------------------
    purchased_product_ids = set()
    if order_ids:
        items_resp = supabase.table("order_items")\
            .select("product_id")\
            .in_("order_id", order_ids)\
            .execute()
        purchased_product_ids = {item["product_id"] for item in items_resp.data}

    # -------------------------------------------------------------
    # 4. Fetch cart product IDs (if cart_items table exists)
    # -------------------------------------------------------------
    cart_product_ids = set()
    try:
        cart_resp = supabase.table("cart_items")\
            .select("product_id")\
            .eq("customer_id", customer_id)\
            .execute()
        cart_product_ids = {item["product_id"] for item in cart_resp.data}
    except Exception:
        # If cart_items table doesn't exist, ignore
        pass

    # All product IDs the user has interacted with (purchased or in cart)
    interacted_ids = purchased_product_ids.union(cart_product_ids)
    exclude_ids = list(interacted_ids)

    # -------------------------------------------------------------
    # 5. Fetch all products the user has interacted with (for affinity)
    # -------------------------------------------------------------
    interacted_products = []
    if interacted_ids:
        # Supabase 'in' filter expects a list
        interacted_resp = supabase.table("products")\
            .select("*")\
            .in_("id", list(interacted_ids))\
            .execute()
        interacted_products = interacted_resp.data

    # -------------------------------------------------------------
    # 6. Compute affinity signals
    # -------------------------------------------------------------
    scent_family_counts = {}
    gender_counts = {}
    prices = []

    for p in interacted_products:
        scent = p.get("scent_family")
        if scent:
            scent_family_counts[scent] = scent_family_counts.get(scent, 0) + 1
        gender = p.get("gender")
        if gender:
            gender_counts[gender] = gender_counts.get(gender, 0) + 1
        price = p.get("selling_price")
        if price is not None:
            prices.append(float(price))

    top_scent_family = max(scent_family_counts, key=scent_family_counts.get) if scent_family_counts else None
    preferred_gender = max(gender_counts, key=gender_counts.get) if gender_counts else None
    avg_price = sum(prices) / len(prices) if prices else None

    # -------------------------------------------------------------
    # 7. Fetch candidate products (excluding interacted ones)
    # -------------------------------------------------------------
    query = supabase.table("products").select("*")
    if exclude_ids:
        # Supabase `not.in_` filter
        query = query.not_.in_("id", exclude_ids)
    
    # Optionally, limit to a reasonable number to avoid heavy scoring
    candidates_resp = query.execute()
    candidates = candidates_resp.data

    # -------------------------------------------------------------
    # 8. Score candidates
    # -------------------------------------------------------------
    scored = []
    for p in candidates:
        score = 0.0

        # Rule 1: Scent family match (+50)
        if top_scent_family and p.get("scent_family") == top_scent_family:
            score += 50.0

        # Rule 2: Gender match (+20)
        if preferred_gender and p.get("gender") == preferred_gender:
            score += 20.0

        # Rule 3: Price affinity (+15 if within 30% of average)
        if avg_price and p.get("selling_price") is not None:
            price = float(p["selling_price"])
            diff_ratio = abs(price - avg_price) / avg_price
            if diff_ratio <= 0.3:
                score += 15.0

        scored.append((score, p))

    # Sort by score descending, then by maybe popularity or random
    scored.sort(key=lambda x: x[0], reverse=True)

    # Return top N products
    return [product for _, product in scored[:limit]]
