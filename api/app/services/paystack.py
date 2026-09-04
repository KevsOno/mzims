import hmac
import hashlib
from datetime import datetime
import httpx
from ..core.config import settings

class PaystackService:
    BASE_URL = "https://api.paystack.co"

    def __init__(self):
        self.secret_key = settings.PAYSTACK_SECRET_KEY
        self.public_key = settings.PAYSTACK_PUBLIC_KEY
        self.headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json"
        }

    async def initialize_transaction(self, order_id: int, amount: float, email: str, callback_url: str):
        """
        Initialize a Paystack transaction.
        """
        async with httpx.AsyncClient() as client:
            payload = {
                "amount": int(amount * 100),  # in kobo
                "email": email,
                "reference": f"mz-{order_id}-{int(datetime.utcnow().timestamp())}",
                "callback_url": callback_url,
                "metadata": {"order_id": order_id}
            }
            resp = await client.post(f"{self.BASE_URL}/transaction/initialize", json=payload, headers=self.headers)
            data = resp.json()
            if data.get("status"):
                return {
                    "authorization_url": data["data"]["authorization_url"],
                    "reference": data["data"]["reference"]
                }
            raise Exception(f"Paystack init failed: {data.get('message')}")

    async def verify_transaction(self, reference: str):
        """
        Manually verify transaction status via Paystack API.
        """
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{self.BASE_URL}/transaction/verify/{reference}", headers=self.headers)
            data = resp.json()
            if data.get("status") and data["data"]["status"] == "success":
                return True, data["data"]
            return False, data.get("message", "Payment verification failed")

    def verify_webhook(self, payload: bytes, signature: str) -> bool:
        """
        Verify webhook signature using secret key.
        """
        computed = hmac.new(
            self.secret_key.encode('utf-8'),
            payload,
            hashlib.sha512
        ).hexdigest()
        return hmac.compare_digest(computed, signature)
