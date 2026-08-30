from supabase import create_client, Client
from .config import settings

supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

# For convenience, we'll also use the PostgREST client directly
def get_supabase_client() -> Client:
    return supabase
