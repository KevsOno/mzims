import httpx
from ..core.config import settings

class MailchimpService:
    BASE_URL = f"https://{settings.MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0"
    
    def __init__(self):
        self.api_key = settings.MAILCHIMP_API_KEY
        self.list_id = settings.MAILCHIMP_LIST_ID
        self.headers = {
            "Authorization": f"apikey {self.api_key}",
            "Content-Type": "application/json"
        }
    
    async def add_or_update_subscriber(self, email: str, tags: list = None, status: str = "subscribed"):
        """
        Add or update a subscriber in the Mailchimp list.
        """
        member_data = {
            "email_address": email,
            "status_if_new": status,
            "tags": [{"name": t, "status": "active"} for t in (tags or [])]
        }
        async with httpx.AsyncClient() as client:
            resp = await client.put(
                f"{self.BASE_URL}/lists/{self.list_id}/members/{self._hash_email(email)}",
                json=member_data,
                headers=self.headers
            )
            return resp.json()
    
    def _hash_email(self, email: str) -> str:
        import hashlib
        return hashlib.md5(email.lower().encode()).hexdigest()
