from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class RequestStatus(str, Enum):
    NEW = "new"
    CONTACTED = "contacted"
    FULFILLED = "fulfilled"
    CLOSED = "closed"

class FragranceRequestBase(BaseModel):
    customer_id: Optional[int] = None
    request_text: str
    contact: str  # email or phone
    status: RequestStatus = RequestStatus.NEW

class FragranceRequestCreate(FragranceRequestBase):
    pass

class FragranceRequestResponse(FragranceRequestBase):
    id: int
    created_at: datetime
