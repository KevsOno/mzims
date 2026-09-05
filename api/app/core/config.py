from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    # Supabase
    SUPABASE_URL: str
    SUPABASE_KEY: str

    # Database
    DATABASE_URL: str

    # Paystack
    PAYSTACK_SECRET_KEY: str
    PAYSTACK_PUBLIC_KEY: str

    # Monnify
    MONNIFY_API_KEY: str
    MONNIFY_SECRET_KEY: str
    MONNIFY_CONTRACT_CODE: str

    # Mailchimp
    MAILCHIMP_API_KEY: str
    MAILCHIMP_SERVER_PREFIX: str
    MAILCHIMP_LIST_ID: str

    # Brevo Email Service
    BREVO_API_KEY: Optional[str] = None
    BREVO_SENDER_EMAIL: Optional[str] = None

    # Internal Alerts / Notifications
    NOTIFY_EMAIL: Optional[str] = None
    INTERNAL_NOTIFICATION_EMAIL: Optional[str] = None

    # Legacy SMTP (Optional so Render won't crash if omitted)
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: Optional[int] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None

    # Nominatim
    NOMINATIM_USER_AGENT: str = "Muzoscent/1.0"
    NOMINATIM_EMAIL: str

    # Frontend URL (for CORS, callback)
    FRONTEND_URL: str = "http://localhost:5173"

    # Pydantic V2 Configuration
    model_config = ConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"  # Prevents crashes if extra variables exist in .env or environment
    )

settings = Settings()
