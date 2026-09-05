import smtplib
import socket
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging

logger = logging.getLogger(__name__)

def send_internal_notification(subject: str, body: str):
    # Defaulting to Port 587 to prevent Render port 465 timeouts
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    admin_email = os.getenv("NOTIFY_EMAIL") or os.getenv("ADMIN_EMAIL") or smtp_user

    if not all([smtp_host, smtp_user, smtp_password]):
        logger.error("⚠️ SMTP credentials not fully configured in environment. Skipping email dispatch.")
        return

    msg = MIMEMultipart()
    msg['From'] = smtp_user
    msg['To'] = admin_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    try:
        # Resolve strictly to IPv4 to prevent Render [Errno 101] Network Unreachable
        addr_info = socket.getaddrinfo(smtp_host, smtp_port, socket.AF_INET, socket.SOCK_STREAM)
        ipv4_target = addr_info[0][4][0]

        if smtp_port == 465:
            with smtplib.SMTP_SSL(ipv4_target, smtp_port, timeout=15) as server:
                server.server_hostname = smtp_host
                server.login(smtp_user, smtp_password)
                server.send_message(msg)
        else:
            # Port 587 STARTTLS workflow
            with smtplib.SMTP(ipv4_target, smtp_port, timeout=15) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(smtp_user, smtp_password)
                server.send_message(msg)

        logger.info(f"✅ Notification email sent successfully to {admin_email}")

    except Exception as e:
        logger.error(f"❌ Failed to send internal notification email: {str(e)}", exc_info=True)
