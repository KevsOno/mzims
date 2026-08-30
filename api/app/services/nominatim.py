import httpx
from ..core.config import settings
from ..core.db import get_supabase_client
import logging
import asyncio

logger = logging.getLogger(__name__)

class NominatimService:
    BASE_URL = "https://nominatim.openstreetmap.org"
    
    def __init__(self):
        self.user_agent = settings.NOMINATIM_USER_AGENT
        self.email = settings.NOMINATIM_EMAIL
        self.supabase = get_supabase_client()
    
    async def reverse_geocode(self, lat: float, lng: float) -> str:
        # Check cache (rounded to 4 decimals)
        rounded_lat = round(lat, 4)
        rounded_lng = round(lng, 4)
        cache_resp = self.supabase.table("geo_cache") \
            .select("formatted_address") \
            .eq("lat", rounded_lat) \
            .eq("lng", rounded_lng) \
            .execute()
        if cache_resp.data:
            return cache_resp.data[0]["formatted_address"]
        
        # Not in cache - call Nominatim
        async with httpx.AsyncClient() as client:
            params = {
                "lat": lat,
                "lon": lng,
                "format": "json",
                "zoom": 18,
                "addressdetails": 1
            }
            headers = {
                "User-Agent": f"{self.user_agent} (contact: {self.email})"
            }
            # Rate limit: 1 request/sec
            await asyncio.sleep(1)
            resp = await client.get(f"{self.BASE_URL}/reverse", params=params, headers=headers)
            data = resp.json()
            if "display_name" in data:
                address = data["display_name"]
                # Store in cache
                self.supabase.table("geo_cache").insert({
                    "lat": rounded_lat,
                    "lng": rounded_lng,
                    "formatted_address": address
                }).execute()
                return address
            else:
                raise Exception("Geocoding failed")
