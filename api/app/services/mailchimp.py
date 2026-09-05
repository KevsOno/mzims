import hashlib
import os
import logging
import mailchimp_marketing as MailchimpMarketing
from mailchimp_marketing.api_client import ApiClientError

logger = logging.getLogger(__name__)

class MailchimpService:
    def __init__(self):
        self.api_key = os.getenv("MAILCHIMP_API_KEY")
        self.server_prefix = os.getenv("MAILCHIMP_SERVER_PREFIX")
        self.list_id = os.getenv("MAILCHIMP_LIST_ID")

    def _get_client(self):
        client = MailchimpMarketing.Client()
        client.set_config({
            "api_key": self.api_key,
            "server": self.server_prefix
        })
        return client

    def add_or_update_subscriber(self, email: str, tags: list = None):
        if not self.list_id or not self.api_key or not self.server_prefix:
            logger.warning("⚠️ Mailchimp API Key, Server Prefix, or List ID missing in environment variables.")
            return

        try:
            client = self._get_client()
            
            # Mailchimp requires MD5 hash of lowercased email for upserts
            subscriber_hash = hashlib.md5(email.lower().strip().encode("utf-8")).hexdigest()

            # set_list_member performs a PUT operation (upsert)
            response = client.lists.set_list_member(
                self.list_id,
                subscriber_hash,
                {
                    "email_address": email,
                    "status_if_new": "subscribed",
                    "tags": tags or ["fragrance-request"]
                }
            )
            logger.info(f"✅ Mailchimp subscriber successfully added/updated: {email}")

        except ApiClientError as error:
            logger.error(f"⚠️ Mailchimp API error: {error.text}")
        except Exception as e:
            logger.error(f"❌ Unexpected Mailchimp error: {str(e)}")
