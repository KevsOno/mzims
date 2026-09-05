import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging

logger = logging.getLogger(__name__)

def send_internal_notification(subject: str, body: str):
    # Default host and port 465 for SSL
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 465))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    
    # Checks NOTIFY_EMAIL first, falls back to ADMIN_EMAIL, then smtp_user
    admin_email = os.getenv("NOTIFY_EMAIL") or os.getenv("ADMIN_EMAIL") or smtp_user

    if not all([smtp_host, smtp_user, smtp_password]):
        logger.error("⚠️ SMTP credentials not fully configured in environment. Skipping email dispatch.")
        print("⚠️ SMTP credentials not fully configured in environment. Skipping email dispatch.")
        return

    msg = MIMEMultipart()
    msg['From'] = smtp_user
    msg['To'] = admin_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    try:
        # Port 465 uses SMTP_SSL (direct encrypted connection)
        if smtp_port == 465:
            with smtplib.SMTP_SSL(smtp_host, smtp_port) as server:
                server.login(smtp_user, smtp_password)
                server.send_message(msg)
        else:
            # Fallback for port 587
            with smtplib.SMTP(smtp_host, smtp_port) as server:
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.send_message(msg)

        logger.info(f"✅ Notification email sent successfully to {admin_email}")
        print(f"✅ Notification email sent successfully to {admin_email}")

    except Exception as e:
        logger.error(f"❌ Failed to send internal notification email: {str(e)}", exc_info=True)
        print(f"❌ Failed to send internal notification email: {str(e)}")
