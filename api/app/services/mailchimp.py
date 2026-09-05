import mailchimp_marketing as MailchimpMarketing
from mailchimp_marketing.api_client import ApiClientError
import os

class MailchimpService:
    def __init__(self):
        self.api_key = os.getenv("MAILCHIMP_API_KEY")
        self.server_prefix = os.getenv("MAILCHIMP_SERVER_PREFIX")
        self.list_id = os.getenv("MAILCHIMP_LIST_ID")
        
        if self.api_key and self.server_prefix:
            MailchimpMarketing.Client().set_config({
                "api_key": self.api_key,
                "server": self.server_prefix
            })

    def add_or_update_subscriber(self, email: str, tags: list = None):
        if not self.list_id or not self.api_key:
            print("⚠️ Mailchimp API Key or List ID missing in environment variables.")
            return

        try:
            client = MailchimpMarketing.Client()
            client.set_config({
                "api_key": self.api_key,
                "server": self.server_prefix
            })

            # Add subscriber or update tags
            response = client.lists.add_list_member(self.list_id, {
                "email_address": email,
                "status": "subscribed",
                "tags": tags or ["fragrance-request"]
            })
            print(f"✅ Mailchimp subscriber added/updated: {email}")
        except ApiClientError as error:
            print(f"⚠️ Mailchimp API error: {error.text}")
