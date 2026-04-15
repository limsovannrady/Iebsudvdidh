import json
import sys
import os
from http.server import BaseHTTPRequestHandler

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from api._db import upsert_user

TELEGRAM_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            update = json.loads(body)

            message = update.get("message") or update.get("edited_message")
            if message:
                user = message.get("from", {})
                user_id = user.get("id")
                if user_id:
                    upsert_user(
                        user_id=user_id,
                        username=user.get("username", ""),
                        first_name=user.get("first_name", ""),
                        last_name=user.get("last_name", ""),
                    )

                if message.get("text", "").startswith("/start"):
                    first_name = user.get("first_name", "")
                    chat_id = message["chat"]["id"]
                    _send_message(chat_id, f"សួស្តី {first_name}")

            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"ok": True}).encode())

        except Exception as e:
            self.send_response(500)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"ok": False, "error": str(e)}).encode())

    def log_message(self, format, *args):
        pass


def _send_message(chat_id, text):
    import urllib.request
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    data = json.dumps({"chat_id": chat_id, "text": text}).encode()
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    urllib.request.urlopen(req)
