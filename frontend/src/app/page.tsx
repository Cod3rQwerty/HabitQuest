"use client";

import { useCallback, useEffect, useState } from "react";
import { ConfettiCelebration } from "@/components/ConfettiCelebration";
import { JournalCard } from "@/components/JournalCard";
import { Leaderboard } from "@/components/Leaderboard";
import { ProfileCard } from "@/components/ProfileCard";
import { SideQuestPanel } from "@/components/SideQuestPanel";
import { SleepTracker } from "@/components/SleepTracker";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Toast } from "@/components/Toast";
import { WaterTracker } from "@/components/WaterTracker";
import { api } from "@/lib/api";
import type { ActionResponse, DailyProgress, LeaderboardResponse, UserStats } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function DashboardPage() {
  const [userId, setUserId] = useState<number | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [daily, setDaily] = useState<DailyProgress | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshAll = useCallback(async (id: number) => {
    const [nextStats, nextDaily, nextBoard] = await Promise.all([
      api.getUserStats(id),
      api.getDailyProgress(id),
      api.getLeaderboard(),
    ]);
    setStats(nextStats);
    setDaily(nextDaily);
    setLeaderboard(nextBoard);
  }, []);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        const demoRes = await fetch(`${API_BASE}/user/demo/id`);
        if (!demoRes.ok) {
          throw new Error("Demo user not found. Seed the backend database first.");
        }
        const { user_id } = (await demoRes.json()) as { user_id: number };
        if (!active) return;
        setUserId(user_id);
        await refreshAll(user_id);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    bootstrap();
    return () => {
      active = false;
    };
  }, [refreshAll]);

  const handleAction = useCallback(
    async (label: string, action: () => Promise<ActionResponse>) => {
      if (!userId) return;
      setActionLoading(label);
      try {
        const result = await action();
        setDaily(result.daily);
        setToast(result.message);
        if (result.leveled_up || result.xp_gained >= 20) {
          setCelebrate(true);
        }
        await refreshAll(userId);
      } catch (err) {
        setToast(err instanceof Error ? err.message : "Action failed");
      } finally {
        setActionLoading(null);
      }
    },
    [refreshAll, userId],
  );

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <p className="text-ink-muted">Loading your quest…</p>
        </div>
      </main>
    );
  }

  if (error || !stats || !daily || !leaderboard || userId === null) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="card-base max-w-md text-center">
          <h1 className="text-xl font-semibold">HabitQuest</h1>
          <p className="mt-2 text-ink-muted">{error ?? "Unable to load data"}</p>
          <p className="mt-4 text-sm text-ink-faint">
            Start the API with <code className="rounded bg-surface-muted px-1">uvicorn main:app --reload</code>{" "}
            and run <code className="rounded bg-surface-muted px-1">python seed.py</code>.
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <ConfettiCelebration
        trigger={celebrate}
        onComplete={() => setCelebrate(false)}
      />
      <Toast message={toast} onDismiss={() => setToast(null)} />

      <div className="min-h-screen">
        <header className="sticky top-0 z-40 border-b border-subtle bg-surface/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-lg font-bold text-white">
                H
              </div>
              <div>
                <p className="font-semibold leading-tight">HabitQuest</p>
                <p className="text-xs text-ink-faint">Health · XP · Streaks</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:space-y-8 lg:px-8 lg:py-10">
          <ProfileCard stats={stats} />

          <div className="grid gap-6 lg:grid-cols-3">
            <WaterTracker
              daily={daily}
              loading={actionLoading === "water"}
              onLog={(amountMl, targetMl) =>
                handleAction("water", () => api.logWater(userId, amountMl, targetMl))
              }
            />
            <SleepTracker
              daily={daily}
              loading={actionLoading === "sleep"}
              onLog={(hours) => handleAction("sleep", () => api.logSleep(userId, hours))}
            />
            <JournalCard
              daily={daily}
              loading={actionLoading === "journal"}
              onLog={(text) => handleAction("journal", () => api.logJournal(userId, text))}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <SideQuestPanel quest={daily.side_quest} />
            <Leaderboard entries={leaderboard.entries} currentUserId={userId} />
          </div>
        </main>
      </div>
    </>
  );
}
