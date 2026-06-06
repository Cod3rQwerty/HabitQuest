# HabitQuest

## Overview
**HabitQuest** is a developer-focused, habit-building dashboard experience built with a **Next.js (React) frontend**. The app helps users track daily progress (e.g., **water**, **sleep**, **journal**, and **side quests**) while visualizing **XP progress**, **streaks**, and a **global leaderboard**. It also includes UX enhancements like **theme switching** (light/dark) and **confetti celebrations**.

The frontend communicates with a backend API via a centralized client in `frontend/src/lib/api.ts`.

---

## Key Features
- **Daily water tracking**
  - View consumed water and remaining amount against a configurable target (`WaterTracker`).
  - Circular progress visualization based on `daily.water_ml` vs `daily.water_target_ml`.
  - Log entries with validation and optional target updates.
  - Quick add buttons (e.g., 250/500/750 ml).
  - Loading state disables submit and shows “Logging…”.

- **Sleep tracking with chart + rewards**
  - Bar chart comparing **Min (6h)**, **Ideal (8h)**, **You**, and **Max (10h)** using **Recharts** (`SleepTracker`).
  - Conditional coloring when logged sleep is within **7–9 hours**.
  - Awards “Perfect Rest +20 XP” badge for 7–9 hours.
  - Hours input supports 0.5–24 hours in 0.5 steps.

- **Daily journal**
  - Editable journal textarea synced to `daily.journal_text` (`JournalCard`).
  - Submit non-empty journal text via async handler; button label changes between:
    - **“Submit Journal”** (if not already submitted today)
    - **“Update Entry”** (if already submitted today)
  - Character count (0–5000) and loading state with “Saving…”.

- **Side quests (Daily Side-Quest)**
  - Card UI for a given `SideQuest` that:
    - Shows completion status (checkmark vs target icon).
    - Changes messaging and styling when `quest.completed` is `true`.
  - Displays quest title, description, and bonus XP (`SideQuestPanel`).

- **XP profile + streak visualization**
  - Profile summary card showing:
    - Welcome + avatar (first letter)
    - Current level
    - XP progress bar with computed “gained this level” and “XP needed to next level”
    - Streak count with glow when `streak_count > 0`
    - Earned badges as chips (`ProfileCard`)
  - Uses `stats.xp_progress_percent` to size the progress bar.

- **Leaderboard with podium + current user highlight**
  - Splits top 3 entries into a podium display with medal styling (`Leaderboard`).
  - Renders full ranking list with:
    - Rank, level, XP
    - Highlighting for the `currentUserId` entry and a “(You)” label.

- **Theme management (light/dark)**
  - App-wide `ThemeProvider` initializes theme from:
    - `localStorage` (`habitquest-theme`) if set
    - otherwise system preference (`prefers-color-scheme`)
  - Applies theme by toggling the `dark` class on `document.documentElement`.
  - Delays child rendering until theme is mounted to prevent hydration mismatch (`ThemeProvider`, `ThemeToggle`).

- **Confetti celebrations**
  - Client component triggers confetti bursts when `trigger` becomes `true`, using `canvas-confetti`.
  - Renders nothing (`null`)—side-effect only (`ConfettiCelebration`).

- **Toast notifications**
  - Reusable client-side toast component:
    - Renders nothing when `message` is `null`
    - Otherwise displays message with a dismiss “×” button (`Toast`).

---

## Tech Stack
**Frontend**
- **Next.js** + **React**
- **TypeScript**
- **Tailwind CSS** (global styles + utility patterns)
- **ESLint / Next linting**
- **Recharts** (sleep chart visualization)
- **canvas-confetti** (celebration effects)

**Frontend API layer**
- `fetch`-based JSON request helper with typed responses (`frontend/src/lib/api.ts`)

---

## Project Architecture
### 1) App Shell & Theming
- **Root layout**: `frontend/src/app/layout.tsx`
  - Sets page metadata (title/description)
  - Loads Google Fonts (Geist Sans / Geist Mono)
  - Imports `globals.css`
  - Wraps the entire app in `ThemeProvider`

- **Theme provider**: `frontend/src/components/ThemeProvider.tsx`
  - Provides `theme`, `setTheme`, and `toggleTheme` through context
  - Handles persistence (localStorage) and system theme changes
  - Adds/removes `dark` class on `<html>`
  - Uses a `mounted` guard to avoid initial render mismatch

- **Theme toggle UI**: `frontend/src/components/ThemeToggle.tsx`
  - Shows sun/moon icon depending on current theme
  - Accessible `aria-label` describes next mode

### 2) Backend Communication (Centralized API Client)
- **API base configuration**: `frontend/src/lib/api.ts`
  - Uses `NEXT_PUBLIC_API_URL` with fallback to `http://localhost:8000`
- **Typed request helper**:
  - Sends JSON to `${API_BASE}${path}`
  - Throws informative errors when response status isn’t OK
- **Exposed API operations**:
  - `getUserStats(userId)`
  - `getDailyProgress(userId)`
  - `logWater(userId, amountMl, targetMl?)`
  - `logSleep(userId, hours)`
  - `logJournal(userId, text)`
  - `getLeaderboard()`

### 3) Domain Models (Shared Types)
- `frontend/src/lib/types.ts`
  - Interfaces for:
    - `Badges`, `UserStats`
    - `SideQuest`
    - `DailyProgress`
    - `ActionResponse` (includes XP changes, updated progress, and badges)
    - `Leaderboard` wrapper + entry types
    - `DashboardData` (composed structure of stats, daily, leaderboard)

### 4) UI Components (Client-Side)
The UI is composed of client components that render specific daily widgets and dashboards:
- `WaterTracker.tsx` — water intake widget + progress indicator + logging
- `SleepTracker.tsx` — sleep bar chart + logging + badge logic
- `JournalCard.tsx` — journal textarea + submit/update logic
- `SideQuestPanel.tsx` — daily side quest status card
- `ProfileCard.tsx` — level, streak, XP bar, and badges
- `Leaderboard.tsx` — podium top-3 + full ranking list highlighting user
- `ConfettiCelebration.tsx` — animation side-effect
- `Toast.tsx` — dismissible status message
- Styling utilities and global theme variables live in `frontend/src/app/globals.css`

---

## Installation (Placeholder)
> Assumes you’re working inside the `frontend/` directory.

1. **Install dependencies**
   bash
   cd frontend
   npm install
   
2. **Configure backend URL (optional)**
   - Set `NEXT_PUBLIC_API_URL` to your backend server (defaults to `http://localhost:8000`).

---

## Usage (Placeholder)
### Development
bash
cd frontend
npm run dev


### Production Build
bash
cd frontend
npm run build
npm run start


### Lint
bash
cd frontend
npm run lint


---

## Notes for Developers
- Prefer using the centralized client in **`frontend/src/lib/api.ts`** for all backend calls.
- UI components such as **WaterTracker/SleepTracker/JournalCard/SideQuestPanel** are designed to be driven by typed domain objects (`SideQuest`, `DailyProgress`, etc.).
- Theme state is managed globally via **`ThemeProvider`**, so components should use `useTheme()` rather than reading storage directly.

---
*This README was generated with [PresentMe](https://www.presentmeapp.xyz/). View the full presentation [here](https://www.presentmeapp.xyz/p/ccc634e7-9747-486b-9801-f071758f5d63).*
