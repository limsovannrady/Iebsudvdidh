"""
Run this script after deploying to Vercel to set the Telegram webhook.
Usage: python3 set_webhook.py https://your-project.vercel.app
"""
import sys
import os
import urllib.request
import json

if len(sys.argv) < 2:
    print("Usage: python3 set_webhook.py https://your-project.vercel.app")
    sys.exit(1)

vercel_url = sys.argv[1].rstrip("/")
token = os.environ.get("TELEGRAM_BOT_TOKEN", "")

if not token:
    print("Error: TELEGRAM_BOT_TOKEN not set")
    sys.exit(1)

webhook_url = f"{vercel_url}/api/webhook"
api_url = f"https://api.telegram.org/bot{token}/setWebhook"

data = json.dumps({
    "url": webhook_url,
    "allowed_updates": ["message", "edited_message"]
}).encode()

req = urllib.request.Request(api_url, data=data, headers={"Content-Type": "application/json"})
with urllib.request.urlopen(req) as resp:
    result = json.loads(resp.read())

if result.get("ok"):
    print(f"Webhook set successfully: {webhook_url}")
else:
    print(f"Failed: {result}")
