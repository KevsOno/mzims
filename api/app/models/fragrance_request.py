from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum
from uuid import UUID

class RequestStatus(str, Enum):
    NEW = "new"
    CONTACTED = "contacted"
    FULFILLED = "fulfilled"
    CLOSED = "closed"

class FragranceRequestBase(BaseModel):
    customer_id: Optional[UUID] = None  # Updated from int to UUID to match Supabase auth
    request_text: str
    contact: str  # email or phone
    status: RequestStatus = RequestStatus.NEW

class FragranceRequestCreate(FragranceRequestBase):
    pass

class FragranceRequestResponse(FragranceRequestBase):
    id: UUID  # Updated from int to UUID
    created_at: datetime

    class Config:
        from_attributes = True  # Pydantic v2 ORM compatibility
        orm_mode = True         # Pydantic v1 fallback compatibility
