import json
from http.server import BaseHTTPRequestHandler
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from api._db import get_all_users


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            users = get_all_users()
            result = {
                "users": users,
                "total": len(users),
                "total_messages": sum(u["message_count"] for u in users),
            }
            body = json.dumps(result).encode()
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(body)

        except Exception as e:
            self.send_response(500)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())

    def log_message(self, format, *args):
        pass
