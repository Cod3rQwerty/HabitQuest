from pydantic import BaseModel, Field


class Badge(BaseModel):
    id: str
    name: str
    description: str
    earned: bool


class UserStats(BaseModel):
    user_id: int
    username: str
    current_level: int
    current_xp: int
    xp_for_current_level: int
    xp_for_next_level: int
    xp_progress_percent: float
    streak_count: int
    badges: list[Badge]
    water_target_ml: int


class SideQuest(BaseModel):
    id: str
    title: str
    description: str
    bonus_xp: int
    completed: bool


class DailyProgress(BaseModel):
    log_date: str
    water_ml: int
    water_target_ml: int
    water_remaining_ml: int
    water_target_met: bool
    sleep_hours: float | None
    journal_text: str | None
    journal_submitted: bool
    side_quest: SideQuest
    daily_targets_met: bool


class LogWaterRequest(BaseModel):
    amount_ml: int = Field(gt=0, le=10000)
    target_ml: int | None = Field(default=None, gt=0, le=10000)


class LogSleepRequest(BaseModel):
    hours: float = Field(gt=0, le=24)


class LogJournalRequest(BaseModel):
    text: str = Field(min_length=1, max_length=5000)


class ActionResponse(BaseModel):
    success: bool
    xp_gained: int
    total_xp: int
    current_level: int
    leveled_up: bool
    new_badges: list[Badge]
    message: str
    daily: DailyProgress


class LeaderboardEntry(BaseModel):
    rank: int
    user_id: int
    username: str
    current_level: int
    current_xp: int
    streak_count: int


class LeaderboardResponse(BaseModel):
    entries: list[LeaderboardEntry]
