# HabitQuest

A gamified health tracker aligned with **UN Sustainable Development Goal 3** (Good Health and Well-being). Earn XP, build daily streaks, complete side-quests, and climb the global leaderboard — all from manually logged wellness data.

## Features

- **Levelling & XP** — 100 XP per level; milestone badges at levels 10, 50, and 100
- **Daily streaks** — Duolingo-style counter; resets if you miss a day
- **Water intake** — Set a daily ml target with a visual progress ring
- **Sleep tracker** — Log hours; +20 XP Perfect Rest Bonus for 7–9 hours
- **Mindfulness journal** — Daily reflection (+10 XP once per day)
- **Side-quests** — Rotating daily challenges with bonus XP
- **Leaderboard** — Top 5 users by total XP with podium view

## Tech Stack

| Layer    | Stack                                      |
|----------|--------------------------------------------|
| Backend  | Python 3.11+, FastAPI, SQLite, Pydantic    |
| Frontend | Next.js 15, React 19, TypeScript, Tailwind |
| Charts   | Recharts                                   |
| FX       | canvas-confetti                            |

## Project Structure

```
HabitQuest/
├── backend/
│   ├── main.py                 # FastAPI app entry
│   ├── database.py             # SQLite setup
│   ├── schemas.py              # Pydantic models
│   ├── seed.py                 # Demo data
│   ├── routers/
│   │   ├── user.py             # User & logging endpoints
│   │   └── leaderboard.py
│   └── services/
│       ├── xp.py               # Level & badge logic
│       ├── streak.py           # Streak rules
│       ├── quests.py           # Daily side-quests
│       └── user_service.py     # Business logic
└── frontend/
    └── src/
        ├── app/                # Next.js App Router
        ├── components/         # UI modules
        └── lib/                # API client & types
```

## Quick Start

### 1. Backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
python seed.py
uvicorn main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

App: http://localhost:3000

## API Endpoints

| Method | Path                      | Description                    |
|--------|---------------------------|--------------------------------|
| GET    | `/user/demo/id`           | Demo player ID ("You")         |
| GET    | `/user/{id}/stats`        | Level, XP, streak, badges      |
| GET    | `/user/{id}/daily`        | Today's log + side-quest       |
| POST   | `/user/{id}/log-water`    | Log water intake               |
| POST   | `/user/{id}/log-sleep`    | Log sleep hours                |
| POST   | `/user/{id}/log-journal`  | Submit journal entry           |
| GET    | `/leaderboard`            | Top 5 users by XP              |

## XP Rules

| Action              | XP        |
|---------------------|-----------|
| Meet water target   | +25       |
| Log sleep           | +15       |
| Perfect rest (7–9h) | +20 bonus |
| Journal entry       | +10       |
| Side-quest complete | +15–30    |

## License

MIT — built for educational and hackathon use.
