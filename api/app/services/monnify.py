import base64
import hmac
import hashlib
from datetime import datetime
import httpx
from ..core.config import settings

class MonnifyService:
    BASE_URL = "https://api.monnify.com"

    def __init__(self):
        self.api_key = settings.MONNIFY_API_KEY
        self.secret_key = settings.MONNIFY_SECRET_KEY
        self.contract_code = settings.MONNIFY_CONTRACT_CODE
        self.auth = base64.b64encode(f"{self.api_key}:{self.secret_key}".encode()).decode()
        self.headers = {
            "Authorization": f"Basic {self.auth}",
            "Content-Type": "application/json"
        }

    async def _get_access_token(self):
        async with httpx.AsyncClient() as client:
            resp = await client.post(f"{self.BASE_URL}/api/v1/auth/login", headers=self.headers)
            data = resp.json()
            return data.get("responseBody", {}).get("accessToken")

    async def initialize_transaction(self, order_id: int, amount: float, email: str, customer_name: str):
        token = await self._get_access_token()
        headers = {**self.headers, "Authorization": f"Bearer {token}"}
        payload = {
            "amount": amount,
            "customerEmail": email,
            "customerName": customer_name,
            "paymentReference": f"mz-{order_id}-{int(datetime.utcnow().timestamp())}",
            "paymentDescription": f"Order #{order_id}",
            "contractCode": self.contract_code,
            "redirectUrl": f"{settings.FRONTEND_URL}/payment/verify"
        }
        async with httpx.AsyncClient() as client:
            resp = await client.post(f"{self.BASE_URL}/api/v1/merchant/transactions/init-transaction", json=payload, headers=headers)
            data = resp.json()
            if data.get("requestSuccessful"):
                return {
                    "authorization_url": data["responseBody"]["checkoutUrl"],
                    "reference": data["responseBody"]["paymentReference"]
                }
            raise Exception(f"Monnify init failed: {data.get('responseMessage')}")

    def verify_webhook(self, payload: bytes, signature: str) -> bool:
        """
        Verify Monnify webhook signature using transaction Hash (SHA512).
        """
        computed = hmac.new(
            self.secret_key.encode('utf-8'),
            payload,
            hashlib.sha512
        ).hexdigest()
        return hmac.compare_digest(computed, signature)
