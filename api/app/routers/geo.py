from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from ..services.nominatim import NominatimService
from ..core.db import get_supabase_client

router = APIRouter()

class GeoRequest(BaseModel):
    lat: float
    lng: float

@router.post("/reverse")
async def reverse_geocode(data: GeoRequest):
    service = NominatimService()
    try:
        address = await service.reverse_geocode(data.lat, data.lng)
        return {"address": address}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
