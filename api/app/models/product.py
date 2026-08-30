from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ProductBase(BaseModel):
    sku: str
    name: str
    description: Optional[str] = None
    category: Optional[str] = None          # legacy free-text
    category_id: Optional[int] = None       # new FK
    selling_price: float = Field(..., ge=0)
    purchase_price: float = Field(0, ge=0)
    lead_time_days: int = 7
    shelf_life_days: int = 90
    slug: Optional[str] = None
    images: Optional[List[str]] = None      # list of URLs
    scent_family: Optional[str] = None
    gender: Optional[str] = None
    parent_sku: Optional[str] = None        # for variants
    current_stock: Optional[int] = 0        # denormalized

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
