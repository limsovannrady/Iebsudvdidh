import os
import psycopg2
import psycopg2.extras

def get_connection():
    return psycopg2.connect(os.environ["DATABASE_URL"], sslmode="require")

def ensure_table():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS bot_users (
                    user_id BIGINT PRIMARY KEY,
                    username TEXT DEFAULT '',
                    first_name TEXT DEFAULT '',
                    last_name TEXT DEFAULT '',
                    message_count INTEGER DEFAULT 0,
                    first_seen TIMESTAMP DEFAULT NOW(),
                    last_seen TIMESTAMP DEFAULT NOW()
                )
            """)
        conn.commit()

def upsert_user(user_id, username, first_name, last_name):
    ensure_table()
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO bot_users (user_id, username, first_name, last_name, message_count, first_seen, last_seen)
                VALUES (%s, %s, %s, %s, 1, NOW(), NOW())
                ON CONFLICT (user_id) DO UPDATE SET
                    username = EXCLUDED.username,
                    first_name = EXCLUDED.first_name,
                    last_name = EXCLUDED.last_name,
                    message_count = bot_users.message_count + 1,
                    last_seen = NOW()
            """, (user_id, username or '', first_name or '', last_name or ''))
        conn.commit()

def get_all_users():
    ensure_table()
    with get_connection() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""
                SELECT user_id, username, first_name, last_name,
                       message_count, first_seen, last_seen
                FROM bot_users
                ORDER BY last_seen DESC
            """)
            rows = cur.fetchall()
    return [
        {
            "user_id": r["user_id"],
            "username": r["username"],
            "first_name": r["first_name"],
            "last_name": r["last_name"],
            "message_count": r["message_count"],
            "first_seen": r["first_seen"].isoformat() if r["first_seen"] else "",
            "last_seen": r["last_seen"].isoformat() if r["last_seen"] else "",
        }
        for r in rows
    ]
