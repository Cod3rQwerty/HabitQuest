XP_PER_LEVEL = 100

WATER_TARGET_XP = 25
SLEEP_LOG_XP = 15
PERFECT_REST_BONUS_XP = 20
JOURNAL_XP = 10

BADGE_MILESTONES = {
    10: {"id": "wellness_warrior", "name": "Wellness Warrior", "description": "Reached Level 10"},
    50: {"id": "health_hero", "name": "Health Hero", "description": "Reached Level 50"},
    100: {"id": "vitality_legend", "name": "Vitality Legend", "description": "Reached Level 100"},
}


def xp_for_level(level: int) -> int:
    return (level - 1) * XP_PER_LEVEL


def level_from_xp(total_xp: int) -> int:
    return max(1, (total_xp // XP_PER_LEVEL) + 1)


def xp_progress(total_xp: int) -> tuple[int, int, float]:
    level = level_from_xp(total_xp)
    current_floor = xp_for_level(level)
    next_ceiling = xp_for_level(level + 1)
    span = next_ceiling - current_floor
    progress = total_xp - current_floor
    percent = (progress / span * 100) if span else 100.0
    return current_floor, next_ceiling, min(100.0, percent)


def badges_for_level(level: int) -> list[dict]:
    result = []
    for milestone, badge in BADGE_MILESTONES.items():
        result.append({**badge, "earned": level >= milestone})
    return result


def new_badges_from_level_up(old_level: int, new_level: int) -> list[dict]:
    earned = []
    for milestone, badge in BADGE_MILESTONES.items():
        if old_level < milestone <= new_level:
            earned.append({**badge, "earned": True})
    return earned
