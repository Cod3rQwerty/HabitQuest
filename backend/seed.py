"""Seed the database with demo users for the leaderboard."""

from database import get_db, init_db

DEMO_USERS = [
    ("Aria", 12, 1180, 14),
    ("Kai", 8, 760, 7),
    ("Nova", 15, 1490, 21),
    ("River", 5, 420, 3),
    ("Sage", 20, 2050, 30),
    ("You", 1, 0, 0),
]


def seed() -> None:
    init_db()
    with get_db() as conn:
        existing = conn.execute("SELECT COUNT(*) AS c FROM users").fetchone()["c"]
        if existing:
            print(f"Database already has {existing} users — skipping seed.")
            return

        for username, level, xp, streak in DEMO_USERS:
            conn.execute(
                """
                INSERT INTO users (username, current_level, current_xp, streak_count, water_target_ml)
                VALUES (?, ?, ?, ?, 2000)
                """,
                (username, level, xp, streak),
            )
        print(f"Seeded {len(DEMO_USERS)} users.")


if __name__ == "__main__":
    seed()
