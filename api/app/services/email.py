import os
import logging

logger = logging.getLogger(__name__)

# Fallback check for SDK versions
try:
    from brevo import Brevo
    from brevo.core.api_error import ApiError
    USE_NEW_SDK = True
except ImportError:
    try:
        import sib_api_v3_sdk as brevo_sdk
        from sib_api_v3_sdk.rest import ApiException
        USE_NEW_SDK = False
    except ImportError:
        brevo_sdk = None
        USE_NEW_SDK = None


def send_internal_notification(subject: str, body: str):
    api_key = os.getenv("BREVO_API_KEY")
    admin_email = os.getenv("NOTIFY_EMAIL") or os.getenv("ADMIN_EMAIL")
    sender_email = os.getenv("BREVO_SENDER_EMAIL", admin_email)

    if not api_key or not admin_email:
        logger.error("⚠️ BREVO_API_KEY or NOTIFY_EMAIL missing in environment variables. Skipping email.")
        return

    # Modern, inline-styled HTML template
    html_template = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f6; margin: 0; padding: 20px;">
        <div style="max-width: 550px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb; overflow: hidden;">
            <div style="background-color: #43408C; color: #ffffff; padding: 20px; text-align: center;">
                <h2 style="margin: 0; font-size: 20px;">{subject}</h2>
            </div>
            <div style="padding: 24px; color: #374151; line-height: 1.6;">
                <p>Hello Admin,</p>
                <p>A new notification has been triggered on <strong>Muzo Scent</strong>:</p>
                <div style="background-color: #f9fafb; border-left: 4px solid #43408C; padding: 16px; margin: 16px 0; border-radius: 4px; white-space: pre-wrap;">
                    {body}
                </div>
            </div>
            <div style="background-color: #f9fafb; padding: 12px 24px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb;">
                &copy; Muzo Scent • Automated System Notification
            </div>
        </div>
    </body>
    </html>
    """

    # 1. Modern Brevo SDK execution (v5+)
    if USE_NEW_SDK:
        try:
            client = Brevo(api_key=api_key)
            response = client.transactional_emails.send_transac_email(
                sender={"email": sender_email, "name": "Muzo Scent Admin Alerts"},
                to=[{"email": admin_email}],
                subject=subject,
                html_content=html_template,
                text_content=body
            )
            logger.info(f"✅ Brevo notification sent to {admin_email}. Response: {response}")
        except ApiError as e:
            logger.error(f"❌ Brevo API Error (Status {e.status_code}): {e.body}")
        except Exception as e:
            logger.error(f"❌ Unexpected error sending email via Brevo: {str(e)}", exc_info=True)

    # 2. Legacy SDK execution (sib_api_v3_sdk)
    elif USE_NEW_SDK is False:
        try:
            configuration = brevo_sdk.Configuration()
            configuration.api_key['api-key'] = api_key
            api_instance = brevo_sdk.TransactionalEmailsApi(brevo_sdk.ApiClient(configuration))
            
            send_smtp_email = brevo_sdk.SendSmtpEmail(
                to=[{"email": admin_email}],
                sender={"email": sender_email, "name": "Muzo Scent Admin Alerts"},
                subject=subject,
                html_content=html_template,
                text_content=body
            )
            api_response = api_instance.send_transac_email(send_smtp_email)
            logger.info(f"✅ Brevo notification sent successfully. Message ID: {api_response.message_id}")
        except ApiException as e:
            logger.error(f"❌ Brevo API Exception: {e}")
        except Exception as e:
            logger.error(f"❌ Unexpected error sending email via Brevo: {str(e)}", exc_info=True)

    else:
        logger.error("❌ No valid Brevo SDK installed. Add 'brevo-python' to requirements.txt")
