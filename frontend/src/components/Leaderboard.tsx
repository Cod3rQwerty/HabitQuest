"use client";

import type { LeaderboardEntry } from "@/lib/types";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId: number;
}

const PODIUM_STYLES = [
  "order-2 sm:order-1 bg-quest/10 border-quest/30",
  "order-1 sm:order-2 bg-accent-soft border-accent/30 scale-105",
  "order-3 bg-surface-muted border-subtle",
];

const PODIUM_HEIGHTS = ["h-20", "h-28", "h-16"];
const MEDALS = ["🥈", "🥇", "🥉"];

export function Leaderboard({ entries, currentUserId }: LeaderboardProps) {
  const podium = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <section className="card-base animate-rise-in">
      <header className="mb-6">
        <p className="text-sm font-medium text-accent">Global</p>
        <h2 className="text-xl font-semibold">Leaderboard</h2>
        <p className="mt-1 text-sm text-ink-muted">Top 5 adventurers by total XP</p>
      </header>

      {podium.length > 0 && (
        <div className="mb-8 flex items-end justify-center gap-3 sm:gap-4">
          {podium.map((entry, index) => (
            <div
              key={entry.user_id}
              className={`flex w-full max-w-[120px] flex-col items-center rounded-3xl border p-3 transition-transform ${PODIUM_STYLES[index]}`}
            >
              <span className="text-2xl" aria-hidden>
                {MEDALS[index]}
              </span>
              <p className="mt-1 truncate text-sm font-semibold">{entry.username}</p>
              <p className="text-xs text-ink-muted">Lv.{entry.current_level}</p>
              <p className="text-sm font-bold text-accent">{entry.current_xp} XP</p>
              <div
                className={`mt-3 w-full rounded-t-2xl bg-accent/20 ${PODIUM_HEIGHTS[index]}`}
              />
            </div>
          ))}
        </div>
      )}

      <ul className="space-y-2">
        {entries.map((entry) => (
          <li
            key={entry.user_id}
            className={`flex items-center justify-between rounded-3xl px-4 py-3 transition-colors ${
              entry.user_id === currentUserId
                ? "bg-accent-soft ring-1 ring-accent/20"
                : "bg-surface-muted/60"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-elevated text-sm font-bold text-ink-muted">
                {entry.rank}
              </span>
              <div>
                <p className="font-medium">
                  {entry.username}
                  {entry.user_id === currentUserId && (
                    <span className="ml-2 text-xs text-accent">(You)</span>
                  )}
                </p>
                <p className="text-xs text-ink-faint">
                  Level {entry.current_level} · 🔥 {entry.streak_count}
                </p>
              </div>
            </div>
            <span className="font-semibold text-accent">{entry.current_xp} XP</span>
          </li>
        ))}
      </ul>

      {rest.length === 0 && entries.length <= 3 && entries.length > 0 && null}
    </section>
  );
}
