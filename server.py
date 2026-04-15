import json
import os
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

USERS_FILE = "users.json"


def load_users():
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


@app.route("/api/users")
def get_users():
    users = load_users()
    user_list = list(users.values())
    user_list.sort(key=lambda u: u.get("last_seen", ""), reverse=True)
    return jsonify({
        "users": user_list,
        "total": len(user_list),
        "total_messages": sum(u.get("message_count", 0) for u in user_list),
    })


@app.route("/api/stats")
def get_stats():
    users = load_users()
    user_list = list(users.values())
    return jsonify({
        "total_users": len(user_list),
        "total_messages": sum(u.get("message_count", 0) for u in user_list),
        "active_today": sum(
            1 for u in user_list
            if u.get("last_seen", "")[:10] == __import__("datetime").date.today().isoformat()
        ),
    })


if __name__ == "__main__":
    port = int(os.environ.get("API_PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=False)
