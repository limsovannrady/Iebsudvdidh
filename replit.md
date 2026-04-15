# Telegram Bot + Dashboard

## Project Overview

A Telegram bot that greets users in Khmer, with a real-time web dashboard to monitor all bot users.

## Architecture

- **bot.py** — Telegram bot (python-telegram-bot). Tracks all users who send messages and saves them to `users.json`.
- **server.py** — Flask API server (port 5001). Serves user data from `users.json` to the dashboard.
- **artifacts/bot-dashboard/** — React + Vite web dashboard. Shows all bot users with stats.

## Data Flow

1. User sends `/start` or any message to the bot
2. `bot.py` saves user info (user_id, username, first_name, last_name, message_count, last_seen) to `users.json`
3. Flask `server.py` serves this data via `/api/users` and `/api/stats`
4. React dashboard fetches and displays the data, auto-refreshes every 30 seconds

## Workflows

- **Telegram Bot** — `python3 bot.py`
- **Bot API Server** — `API_PORT=5001 python3 server.py`
- **artifacts/bot-dashboard: web** — `pnpm --filter @workspace/bot-dashboard run dev`

## Dependencies

- Python: `python-telegram-bot`, `flask`, `flask-cors`
- Node: React, Vite, Tailwind CSS, lucide-react

## Users File

`users.json` — stores user data. Created automatically when the first user interacts with the bot.
