import os
import json
import asyncio
import threading
from datetime import datetime
from telegram import Update, constants
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, filters, ContextTypes

TOKEN = os.environ["TELEGRAM_BOT_TOKEN"]
USERS_FILE = "users.json"
users_lock = threading.Lock()


def load_users():
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_users(users):
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, ensure_ascii=False, indent=2)


def update_user(user):
    with users_lock:
        users = load_users()
        uid = str(user.id)
        if uid not in users:
            users[uid] = {
                "user_id": user.id,
                "username": user.username or "",
                "first_name": user.first_name or "",
                "last_name": user.last_name or "",
                "message_count": 0,
                "first_seen": datetime.now().isoformat(),
                "last_seen": datetime.now().isoformat(),
            }
        users[uid]["message_count"] += 1
        users[uid]["last_seen"] = datetime.now().isoformat()
        users[uid]["username"] = user.username or ""
        users[uid]["first_name"] = user.first_name or ""
        users[uid]["last_name"] = user.last_name or ""
        save_users(users)


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    update_user(update.effective_user)
    await context.bot.send_chat_action(update.effective_chat.id, constants.ChatAction.TYPING)
    await update.message.reply_text(f"សួស្តី {update.effective_user.first_name}")


async def track_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_user:
        update_user(update.effective_user)


app = ApplicationBuilder().token(TOKEN).build()
app.add_handler(CommandHandler("start", start))
app.add_handler(MessageHandler(filters.ALL, track_message))

app.run_polling(drop_pending_updates=True, allowed_updates=Update.ALL_TYPES)
