from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import Customer, Order, OrderItem, Product, CartItem
from ..schemas.product import ProductResponse

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.get("/user", response_model=List[ProductResponse])
def get_user_recommendations(
    customer_id: str = Query(..., description="Supabase Auth UUID"),
    limit: int = 6,
    db: Session = Depends(get_db)
):
    # 1. Fetch user's purchase history & active cart
    customer = db.query(Customer).filter(Customer.supabase_auth_user_id == customer_id).first()
    if not customer:
        # Fallback for new/guest users: return top 6 general catalog products
        return db.query(Product).limit(limit).all()

    # Get all purchased & in-cart product IDs
    purchased_orders = db.query(Order).filter(Order.customer_id == customer.id).all()
    purchased_order_ids = [o.id for o in purchased_orders]
    
    purchased_items = db.query(OrderItem).filter(OrderItem.order_id.in_(purchased_order_ids)).all() if purchased_order_ids else []
    cart_items = db.query(CartItem).filter(CartItem.customer_id == customer_id).all()

    purchased_product_ids = {item.product_id for item in purchased_items}
    cart_product_ids = {item.product_id for item in cart_items}
    exclude_ids = purchased_product_ids.union(cart_product_ids)

    # 2. Extract User Affinity Signals
    known_product_ids = list(purchased_product_ids.union(cart_product_ids))
    interacted_products = db.query(Product).filter(Product.id.in_(known_product_ids)).all() if known_product_ids else []

    scent_family_counts = {}
    gender_counts = {}
    prices = []

    for p in interacted_products:
        if p.scent_family:
            scent_family_counts[p.scent_family] = scent_family_counts.get(p.scent_family, 0) + 1
        if p.gender:
            gender_counts[p.gender] = gender_counts.get(p.gender, 0) + 1
        if p.selling_price:
            prices.append(p.selling_price)

    top_scent_family = max(scent_family_counts, key=scent_family_counts.get) if scent_family_counts else None
    preferred_gender = max(gender_counts, key=gender_counts.get) if gender_counts else None
    avg_price = sum(prices) / len(prices) if prices else None

    # 3. Fetch candidate products (excluding already bought/in-cart)
    candidate_query = db.query(Product)
    if exclude_ids:
        candidate_query = candidate_query.filter(~Product.id.in_(exclude_ids))
    candidates = candidate_query.all()

    # 4. Score Candidates
    scored_candidates = []
    for p in candidates:
        score = 0.0
        
        # Rule 1: Scent Family Match (+50 pts)
        if top_scent_family and p.scent_family == top_scent_family:
            score += 50.0

        # Rule 2: Gender Match (+20 pts)
        if preferred_gender and p.gender == preferred_gender:
            score += 20.0

        # Rule 3: Price Affinity (+15 pts if within 30% of average spend)
        if avg_price and p.selling_price:
            price_diff_ratio = abs(p.selling_price - avg_price) / avg_price
            if price_diff_ratio <= 0.3:
                score += 15.0

        scored_candidates.append((score, p))

    # Sort by highest score first
    scored_candidates.sort(key=lambda x: x[0], reverse=True)

    # Return top N products
    return [p for score, p in scored_candidates[:limit]]
