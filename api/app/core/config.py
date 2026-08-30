from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Supabase
    SUPABASE_URL: str
    SUPABASE_KEY: str

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

    # SMTP (internal notifications)
    SMTP_HOST: str
    SMTP_PORT: int
    SMTP_USER: str
    SMTP_PASSWORD: str
    INTERNAL_NOTIFICATION_EMAIL: str

    # Nominatim
    NOMINATIM_USER_AGENT: str = "Muzoscent/1.0"
    NOMINATIM_EMAIL: str

    # Frontend URL (for CORS, callback)
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
