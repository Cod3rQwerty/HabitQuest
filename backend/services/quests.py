import hashlib
from datetime import date

QUEST_POOL = [
    {
        "id": "hydro_homie",
        "title": "Hydro Homie",
        "description": "Drink 2 extra cups of water (add 500ml beyond your target)",
        "bonus_xp": 20,
        "check": "extra_water",
    },
    {
        "id": "early_bird",
        "title": "Early Bird",
        "description": "Submit your mindfulness journal before noon",
        "bonus_xp": 15,
        "check": "journal_early",
    },
    {
        "id": "dream_catcher",
        "title": "Dream Catcher",
        "description": "Log 8+ hours of sleep tonight",
        "bonus_xp": 25,
        "check": "long_sleep",
    },
    {
        "id": "triple_threat",
        "title": "Triple Threat",
        "description": "Complete water, sleep, and journal in one day",
        "bonus_xp": 30,
        "check": "all_three",
    },
    {
        "id": "zen_master",
        "title": "Zen Master",
        "description": "Write a journal entry with at least 100 characters",
        "bonus_xp": 15,
        "check": "long_journal",
    },
    {
        "id": "hydration_hero",
        "title": "Hydration Hero",
        "description": "Exceed your water target by 25%",
        "bonus_xp": 20,
        "check": "water_overachieve",
    },
    {
        "id": "restful_night",
        "title": "Restful Night",
        "description": "Log sleep within the perfect 7–9 hour window",
        "bonus_xp": 20,
        "check": "perfect_sleep",
    },
]


def _seed_for_date(log_date: str) -> int:
    digest = hashlib.md5(log_date.encode()).hexdigest()
    return int(digest[:8], 16)


def get_daily_quest(log_date: str) -> dict:
    index = _seed_for_date(log_date) % len(QUEST_POOL)
    return QUEST_POOL[index]


def is_quest_complete(quest: dict, log: dict, water_target_ml: int) -> bool:
    check = quest["check"]
    water_ml = log.get("water_ml") or 0
    sleep_hours = log.get("sleep_hours")
    journal_text = (log.get("journal_text") or "").strip()
    journal_submitted = bool(journal_text)

    if check == "extra_water":
        return water_ml >= water_target_ml + 500

    if check == "journal_early":
        before_noon = log.get("journal_before_noon")
        if isinstance(before_noon, int):
            before_noon = bool(before_noon)
        return journal_submitted and bool(before_noon)

    if check == "long_sleep":
        return sleep_hours is not None and sleep_hours >= 8

    if check == "all_three":
        water_met = water_ml >= water_target_ml
        sleep_logged = sleep_hours is not None
        return water_met and sleep_logged and journal_submitted

    if check == "long_journal":
        return len(journal_text) >= 100

    if check == "water_overachieve":
        return water_ml >= int(water_target_ml * 1.25)

    if check == "perfect_sleep":
        return sleep_hours is not None and 7 <= sleep_hours <= 9

    return False
