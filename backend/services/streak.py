from datetime import date, timedelta


def parse_date(value: str | None) -> date | None:
    if not value:
        return None
    return date.fromisoformat(value)


def today_iso() -> str:
    return date.today().isoformat()


def yesterday_iso() -> str:
    return (date.today() - timedelta(days=1)).isoformat()


def apply_streak_on_fetch(
    streak_count: int,
    last_log_date: str | None,
) -> tuple[int, bool]:
    """
    Returns (updated_streak, streak_reset).
    On fetch/login: if last activity is older than yesterday, reset streak.
    """
    if last_log_date is None:
        return streak_count, False

    yesterday = yesterday_iso()
    if last_log_date < yesterday:
        return 0, True

    return streak_count, False


def update_streak_after_log(
    streak_count: int,
    last_log_date: str | None,
    daily_targets_met: bool,
) -> tuple[int, str]:
    today = today_iso()
    yesterday = yesterday_iso()

    if not daily_targets_met:
        return streak_count, last_log_date or today

    if last_log_date == today:
        return streak_count, today

    if last_log_date == yesterday:
        return streak_count + 1, today

    if last_log_date is None or last_log_date < yesterday:
        return 1, today

    return 1, today
