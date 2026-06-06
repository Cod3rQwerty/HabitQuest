from fastapi import APIRouter, HTTPException

from database import get_db
from schemas import (
    ActionResponse,
    DailyProgress,
    LogJournalRequest,
    LogSleepRequest,
    LogWaterRequest,
    UserStats,
)
from services import user_service

router = APIRouter(prefix="/user", tags=["user"])


@router.get("/demo/id")
def get_demo_user_id() -> dict:
    with get_db() as conn:
        row = conn.execute(
            "SELECT id FROM users WHERE username = ?",
            ("You",),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Demo user not found. Run seed.py first.")
        return {"user_id": row["id"]}


@router.get("/{user_id}/stats", response_model=UserStats)
def get_stats(user_id: int) -> UserStats:
    try:
        with get_db() as conn:
            return user_service.get_user_stats(conn, user_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/{user_id}/daily", response_model=DailyProgress)
def get_daily(user_id: int) -> DailyProgress:
    try:
        with get_db() as conn:
            return user_service.get_daily_progress(conn, user_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/{user_id}/log-water", response_model=ActionResponse)
def log_water(user_id: int, body: LogWaterRequest) -> ActionResponse:
    try:
        with get_db() as conn:
            return user_service.log_water(conn, user_id, body.amount_ml, body.target_ml)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/{user_id}/log-sleep", response_model=ActionResponse)
def log_sleep(user_id: int, body: LogSleepRequest) -> ActionResponse:
    try:
        with get_db() as conn:
            return user_service.log_sleep(conn, user_id, body.hours)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/{user_id}/log-journal", response_model=ActionResponse)
def log_journal(user_id: int, body: LogJournalRequest) -> ActionResponse:
    try:
        with get_db() as conn:
            return user_service.log_journal(conn, user_id, body.text)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
