import os
import logging
import brevo_python
from brevo_python.rest import ApiException

logger = logging.getLogger(__name__)

def send_internal_notification(subject: str, body: str):
    api_key = os.getenv("BREVO_API_KEY")
    admin_email = os.getenv("NOTIFY_EMAIL") or os.getenv("ADMIN_EMAIL")
    sender_email = os.getenv("BREVO_SENDER_EMAIL", admin_email)

    if not api_key:
        logger.error("⚠️ BREVO_API_KEY missing in environment variables. Skipping email dispatch.")
        return

    if not admin_email:
        logger.error("⚠️ NOTIFY_EMAIL/ADMIN_EMAIL missing in environment variables. Skipping email dispatch.")
        return

    # Configure Brevo API Client
    configuration = brevo_python.Configuration()
    configuration.api_key['api-key'] = api_key

    api_instance = brevo_python.TransactionalEmailsApi(brevo_python.ApiClient(configuration))

    # Construct Email Object
    send_smtp_email = brevo_python.SendSmtpEmail(
        to=[{"email": admin_email}],
        sender={"email": sender_email, "name": "Muzo Scent Admin Alerts"},
        subject=subject,
        text_content=body
    )

    try:
        api_response = api_instance.send_transac_email(send_smtp_email)
        logger.info(f"✅ Brevo notification sent successfully to {admin_email}. Message ID: {api_response.message_id}")
    except ApiException as e:
        logger.error(f"❌ Brevo API Exception when sending email: {e}")
    except Exception as e:
        logger.error(f"❌ Unexpected error sending email via Brevo: {str(e)}", exc_info=True)
