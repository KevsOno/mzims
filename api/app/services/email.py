import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from ..core.config import settings
import logging

logger = logging.getLogger(__name__)

def send_internal_notification(subject: str, body: str):
    """
    Send an email to the internal team using SMTP.
    """
    msg = MIMEMultipart()
    msg["From"] = settings.SMTP_USER
    msg["To"] = settings.INTERNAL_NOTIFICATION_EMAIL
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))
    
    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
        logger.info(f"Internal notification sent: {subject}")
    except Exception as e:
        logger.error(f"Failed to send internal email: {e}")
