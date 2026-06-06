from fastapi import APIRouter

from database import get_db
from schemas import LeaderboardResponse
from services import user_service

router = APIRouter(tags=["leaderboard"])


@router.get("/leaderboard", response_model=LeaderboardResponse)
def get_leaderboard() -> LeaderboardResponse:
    with get_db() as conn:
        return user_service.get_leaderboard(conn)
