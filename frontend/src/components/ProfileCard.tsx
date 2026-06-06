"use client";

import type { Badge, UserStats } from "@/lib/types";

interface ProfileCardProps {
  stats: UserStats;
}

export function ProfileCard({ stats }: ProfileCardProps) {
  const xpInLevel = stats.current_xp - stats.xp_for_current_level;
  const xpNeeded = stats.xp_for_next_level - stats.xp_for_current_level;

  return (
    <section className="card-base card-hover animate-rise-in flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-4xl bg-accent-soft text-2xl font-bold text-accent">
          {stats.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm text-ink-muted">Welcome back</p>
          <h1 className="text-2xl font-semibold tracking-tight">{stats.username}</h1>
          <p className="text-sm text-ink-faint">SDG 3 · Good Health & Well-being</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 lg:gap-8">
        <div className="min-w-[120px]">
          <p className="text-xs uppercase tracking-wider text-ink-faint">Level</p>
          <p className="text-3xl font-bold text-accent">{stats.current_level}</p>
        </div>

        <div className="min-w-[200px] flex-1 lg:max-w-xs">
          <div className="mb-1.5 flex justify-between text-xs text-ink-muted">
            <span>{xpInLevel} XP</span>
            <span>{xpNeeded} to next</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-water transition-all duration-700 ease-smooth"
              style={{ width: `${stats.xp_progress_percent}%` }}
            />
          </div>
        </div>

        <div
          className={`flex items-center gap-2 rounded-4xl bg-orange-500/10 px-4 py-3 ${
            stats.streak_count > 0 ? "streak-glow" : ""
          }`}
        >
          <span className="text-2xl" aria-hidden>
            🔥
          </span>
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-faint">Streak</p>
            <p className="text-xl font-bold text-streak">{stats.streak_count} days</p>
          </div>
        </div>
      </div>

      <BadgeRow badges={stats.badges} />
    </section>
  );
}

function BadgeRow({ badges }: { badges: Badge[] }) {
  return (
    <div className="flex flex-wrap gap-2 lg:max-w-sm">
      {badges.map((badge) => (
        <span
          key={badge.id}
          title={badge.description}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-opacity ${
            badge.earned
              ? "bg-quest/20 text-quest"
              : "bg-surface-muted text-ink-faint opacity-60"
          }`}
        >
          {badge.earned ? "✦ " : "○ "}
          {badge.name}
        </span>
      ))}
    </div>
  );
}
