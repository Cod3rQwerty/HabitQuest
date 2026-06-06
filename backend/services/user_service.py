import sqlite3
from datetime import datetime

from schemas import (
    ActionResponse,
    Badge,
    DailyProgress,
    LeaderboardEntry,
    LeaderboardResponse,
    SideQuest,
    UserStats,
)
from services.quests import get_daily_quest, is_quest_complete
from services.streak import (
    apply_streak_on_fetch,
    today_iso,
    update_streak_after_log,
)
from services.xp import (
    JOURNAL_XP,
    PERFECT_REST_BONUS_XP,
    SLEEP_LOG_XP,
    WATER_TARGET_XP,
    badges_for_level,
    level_from_xp,
    new_badges_from_level_up,
    xp_progress,
)


def _row_to_dict(row: sqlite3.Row | None) -> dict | None:
    if row is None:
        return None
    return dict(row)


def _get_user(conn: sqlite3.Connection, user_id: int) -> dict:
    row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    user = _row_to_dict(row)
    if not user:
        raise ValueError("User not found")
    return user


def _get_or_create_daily_log(conn: sqlite3.Connection, user_id: int, log_date: str) -> dict:
    row = conn.execute(
        "SELECT * FROM daily_logs WHERE user_id = ? AND log_date = ?",
        (user_id, log_date),
    ).fetchone()
    if row:
        return dict(row)

    conn.execute(
        """
        INSERT INTO daily_logs (user_id, log_date)
        VALUES (?, ?)
        """,
        (user_id, log_date),
    )
    row = conn.execute(
        "SELECT * FROM daily_logs WHERE user_id = ? AND log_date = ?",
        (user_id, log_date),
    ).fetchone()
    return dict(row)


def _daily_targets_met(log: dict, water_target_ml: int) -> bool:
    water_met = (log.get("water_ml") or 0) >= water_target_ml
    sleep_logged = log.get("sleep_hours") is not None
    journal_submitted = bool((log.get("journal_text") or "").strip())
    return water_met and sleep_logged and journal_submitted


def _build_daily_progress(user: dict, log: dict, log_date: str) -> DailyProgress:
    water_target = user["water_target_ml"]
    water_ml = log.get("water_ml") or 0
    quest_def = get_daily_quest(log_date)
    quest_done = bool(log.get("quest_completed"))

    side_quest = SideQuest(
        id=quest_def["id"],
        title=quest_def["title"],
        description=quest_def["description"],
        bonus_xp=quest_def["bonus_xp"],
        completed=quest_done,
    )

    return DailyProgress(
        log_date=log_date,
        water_ml=water_ml,
        water_target_ml=water_target,
        water_remaining_ml=max(0, water_target - water_ml),
        water_target_met=water_ml >= water_target,
        sleep_hours=log.get("sleep_hours"),
        journal_text=log.get("journal_text"),
        journal_submitted=bool((log.get("journal_text") or "").strip()),
        side_quest=side_quest,
        daily_targets_met=_daily_targets_met(log, water_target),
    )


def _award_xp(conn: sqlite3.Connection, user_id: int, xp_gain: int) -> tuple[dict, bool, list[Badge]]:
    user = _get_user(conn, user_id)
    old_level = user["current_level"]
    new_xp = user["current_xp"] + xp_gain
    new_level = level_from_xp(new_xp)
    leveled_up = new_level > old_level

    conn.execute(
        "UPDATE users SET current_xp = ?, current_level = ? WHERE id = ?",
        (new_xp, new_level, user_id),
    )
    user = _get_user(conn, user_id)
    badge_dicts = new_badges_from_level_up(old_level, new_level)
    return user, leveled_up, [Badge(**b) for b in badge_dicts]


def sync_streak_on_fetch(conn: sqlite3.Connection, user_id: int) -> dict:
    user = _get_user(conn, user_id)
    log_date = today_iso()
    new_streak, reset = apply_streak_on_fetch(
        user["streak_count"],
        user["last_log_date"],
    )

    if reset:
        conn.execute(
            "UPDATE users SET streak_count = ? WHERE id = ?",
            (new_streak, user_id),
        )
        user = _get_user(conn, user_id)

    return user


def get_user_stats(conn: sqlite3.Connection, user_id: int) -> UserStats:
    user = sync_streak_on_fetch(conn, user_id)
    floor_xp, ceiling_xp, percent = xp_progress(user["current_xp"])
    badge_list = [Badge(**b) for b in badges_for_level(user["current_level"])]

    return UserStats(
        user_id=user["id"],
        username=user["username"],
        current_level=user["current_level"],
        current_xp=user["current_xp"],
        xp_for_current_level=floor_xp,
        xp_for_next_level=ceiling_xp,
        xp_progress_percent=percent,
        streak_count=user["streak_count"],
        badges=badge_list,
        water_target_ml=user["water_target_ml"],
    )


def get_daily_progress(conn: sqlite3.Connection, user_id: int) -> DailyProgress:
    user = sync_streak_on_fetch(conn, user_id)
    log_date = today_iso()
    log = _get_or_create_daily_log(conn, user_id, log_date)
    return _build_daily_progress(user, log, log_date)


def log_water(
    conn: sqlite3.Connection,
    user_id: int,
    amount_ml: int,
    target_ml: int | None = None,
) -> ActionResponse:
    user = _get_user(conn, user_id)
    log_date = today_iso()
    log = _get_or_create_daily_log(conn, user_id, log_date)

    if target_ml is not None:
        conn.execute(
            "UPDATE users SET water_target_ml = ? WHERE id = ?",
            (target_ml, user_id),
        )
        user = _get_user(conn, user_id)

    new_water = (log.get("water_ml") or 0) + amount_ml
    conn.execute(
        "UPDATE daily_logs SET water_ml = ? WHERE id = ?",
        (new_water, log["id"]),
    )
    log["water_ml"] = new_water

    xp_gained = 0
    message_parts = [f"Logged {amount_ml}ml of water."]

    water_target = user["water_target_ml"]
    if new_water >= water_target and not log.get("water_xp_awarded"):
        xp_gained += WATER_TARGET_XP
        conn.execute(
            "UPDATE daily_logs SET water_xp_awarded = 1 WHERE id = ?",
            (log["id"],),
        )
        message_parts.append(f"Water target met! +{WATER_TARGET_XP} XP.")

    quest_xp = _maybe_award_quest(conn, user_id, log_date)
    xp_gained += quest_xp

    new_badges: list[Badge] = []
    leveled_up = False
    user = _get_user(conn, user_id)

    if xp_gained > 0:
        user, leveled_up, new_badges = _award_xp(conn, user_id, xp_gained)

    log = _get_or_create_daily_log(conn, user_id, log_date)
    user = _get_user(conn, user_id)
    streak, last_date = update_streak_after_log(
        user["streak_count"],
        user["last_log_date"],
        _daily_targets_met(log, user["water_target_ml"]),
    )
    conn.execute(
        "UPDATE users SET streak_count = ?, last_log_date = ? WHERE id = ?",
        (streak, last_date, user_id),
    )
    user = _get_user(conn, user_id)
    daily = _build_daily_progress(user, log, log_date)

    return ActionResponse(
        success=True,
        xp_gained=xp_gained,
        total_xp=user["current_xp"],
        current_level=user["current_level"],
        leveled_up=leveled_up,
        new_badges=new_badges,
        message=" ".join(message_parts),
        daily=daily,
    )


def log_sleep(conn: sqlite3.Connection, user_id: int, hours: float) -> ActionResponse:
    user = _get_user(conn, user_id)
    log_date = today_iso()
    log = _get_or_create_daily_log(conn, user_id, log_date)

    conn.execute(
        "UPDATE daily_logs SET sleep_hours = ? WHERE id = ?",
        (hours, log["id"]),
    )
    log["sleep_hours"] = hours

    xp_gained = 0
    message_parts = [f"Logged {hours}h of sleep."]

    if not log.get("sleep_xp_awarded"):
        xp_gained += SLEEP_LOG_XP
        conn.execute(
            "UPDATE daily_logs SET sleep_xp_awarded = 1 WHERE id = ?",
            (log["id"],),
        )
        message_parts.append(f"Sleep logged! +{SLEEP_LOG_XP} XP.")

        if 7 <= hours <= 9:
            xp_gained += PERFECT_REST_BONUS_XP
            message_parts.append(f"Perfect Rest Bonus! +{PERFECT_REST_BONUS_XP} XP.")

    quest_xp = _maybe_award_quest(conn, user_id, log_date)
    xp_gained += quest_xp

    new_badges: list[Badge] = []
    leveled_up = False

    if xp_gained > 0:
        user, leveled_up, new_badges = _award_xp(conn, user_id, xp_gained)

    log = _get_or_create_daily_log(conn, user_id, log_date)
    user = _get_user(conn, user_id)
    streak, last_date = update_streak_after_log(
        user["streak_count"],
        user["last_log_date"],
        _daily_targets_met(log, user["water_target_ml"]),
    )
    conn.execute(
        "UPDATE users SET streak_count = ?, last_log_date = ? WHERE id = ?",
        (streak, last_date, user_id),
    )
    user = _get_user(conn, user_id)
    daily = _build_daily_progress(user, log, log_date)

    return ActionResponse(
        success=True,
        xp_gained=xp_gained,
        total_xp=user["current_xp"],
        current_level=user["current_level"],
        leveled_up=leveled_up,
        new_badges=new_badges,
        message=" ".join(message_parts),
        daily=daily,
    )


def log_journal(conn: sqlite3.Connection, user_id: int, text: str) -> ActionResponse:
    user = _get_user(conn, user_id)
    log_date = today_iso()
    log = _get_or_create_daily_log(conn, user_id, log_date)

    journal_before_noon = datetime.now().hour < 12

    conn.execute(
        """
        UPDATE daily_logs
        SET journal_text = ?, journal_before_noon = ?
        WHERE id = ?
        """,
        (text.strip(), int(journal_before_noon), log["id"]),
    )
    log["journal_text"] = text.strip()
    log["journal_before_noon"] = journal_before_noon

    xp_gained = 0
    message_parts = ["Journal entry saved."]

    if not log.get("journal_xp_awarded"):
        xp_gained += JOURNAL_XP
        conn.execute(
            "UPDATE daily_logs SET journal_xp_awarded = 1 WHERE id = ?",
            (log["id"],),
        )
        message_parts.append(f"Mindfulness bonus! +{JOURNAL_XP} XP.")

    quest_xp = _maybe_award_quest(conn, user_id, log_date, extra_log={"journal_before_noon": journal_before_noon})
    xp_gained += quest_xp

    new_badges: list[Badge] = []
    leveled_up = False

    if xp_gained > 0:
        user, leveled_up, new_badges = _award_xp(conn, user_id, xp_gained)

    log = _get_or_create_daily_log(conn, user_id, log_date)
    log["journal_before_noon"] = journal_before_noon
    user = _get_user(conn, user_id)
    streak, last_date = update_streak_after_log(
        user["streak_count"],
        user["last_log_date"],
        _daily_targets_met(log, user["water_target_ml"]),
    )
    conn.execute(
        "UPDATE users SET streak_count = ?, last_log_date = ? WHERE id = ?",
        (streak, last_date, user_id),
    )
    user = _get_user(conn, user_id)
    daily = _build_daily_progress(user, log, log_date)

    return ActionResponse(
        success=True,
        xp_gained=xp_gained,
        total_xp=user["current_xp"],
        current_level=user["current_level"],
        leveled_up=leveled_up,
        new_badges=new_badges,
        message=" ".join(message_parts),
        daily=daily,
    )


def _maybe_award_quest(
    conn: sqlite3.Connection,
    user_id: int,
    log_date: str,
    extra_log: dict | None = None,
) -> int:
    user = _get_user(conn, user_id)
    log = _get_or_create_daily_log(conn, user_id, log_date)
    if extra_log:
        log = {**log, **extra_log}

    if log.get("quest_completed"):
        return 0

    quest_def = get_daily_quest(log_date)
    if not is_quest_complete(quest_def, log, user["water_target_ml"]):
        return 0

    bonus = quest_def["bonus_xp"]
    conn.execute(
        """
        UPDATE daily_logs
        SET quest_completed = 1, quest_xp_awarded = ?
        WHERE user_id = ? AND log_date = ?
        """,
        (bonus, user_id, log_date),
    )
    return bonus


def get_leaderboard(conn: sqlite3.Connection) -> LeaderboardResponse:
    rows = conn.execute(
        """
        SELECT id, username, current_level, current_xp, streak_count
        FROM users
        ORDER BY current_xp DESC, current_level DESC
        LIMIT 5
        """
    ).fetchall()

    entries = [
        LeaderboardEntry(
            rank=index + 1,
            user_id=row["id"],
            username=row["username"],
            current_level=row["current_level"],
            current_xp=row["current_xp"],
            streak_count=row["streak_count"],
        )
        for index, row in enumerate(rows)
    ]
    return LeaderboardResponse(entries=entries)
