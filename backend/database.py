import sqlite3
from contextlib import contextmanager
from pathlib import Path

DB_PATH = Path(__file__).parent / "habitquest.db"


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


@contextmanager
def get_db():
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db() -> None:
    with get_db() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                current_level INTEGER NOT NULL DEFAULT 1,
                current_xp INTEGER NOT NULL DEFAULT 0,
                streak_count INTEGER NOT NULL DEFAULT 0,
                last_log_date TEXT,
                water_target_ml INTEGER NOT NULL DEFAULT 2000
            );

            CREATE TABLE IF NOT EXISTS daily_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                log_date TEXT NOT NULL,
                water_ml INTEGER NOT NULL DEFAULT 0,
                sleep_hours REAL,
                journal_text TEXT,
                quest_completed INTEGER NOT NULL DEFAULT 0,
                water_xp_awarded INTEGER NOT NULL DEFAULT 0,
                sleep_xp_awarded INTEGER NOT NULL DEFAULT 0,
                journal_xp_awarded INTEGER NOT NULL DEFAULT 0,
                quest_xp_awarded INTEGER NOT NULL DEFAULT 0,
                journal_before_noon INTEGER NOT NULL DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE (user_id, log_date)
            );
            """
        )
