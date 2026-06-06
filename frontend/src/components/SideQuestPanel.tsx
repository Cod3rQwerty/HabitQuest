"use client";

import type { SideQuest } from "@/lib/types";

interface SideQuestPanelProps {
  quest: SideQuest;
}

export function SideQuestPanel({ quest }: SideQuestPanelProps) {
  return (
    <section className="card-base animate-rise-in">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-quest">Daily Side-Quest</p>
          <h2 className="text-xl font-semibold">{quest.title}</h2>
        </div>
        <span className="rounded-full bg-quest/15 px-3 py-1 text-sm font-semibold text-quest">
          +{quest.bonus_xp} XP
        </span>
      </div>

      <p className="mb-5 text-sm leading-relaxed text-ink-muted">
        {quest.description}
      </p>

      <div
        className={`flex items-center gap-3 rounded-3xl px-4 py-3 transition-colors ${
          quest.completed
            ? "bg-journal/10 text-journal"
            : "bg-surface-muted text-ink-muted"
        }`}
      >
        <span className="text-lg" aria-hidden>
          {quest.completed ? "✓" : "◎"}
        </span>
        <span className="text-sm font-medium">
          {quest.completed
            ? "Quest complete — bonus XP awarded!"
            : "Complete the challenge to earn bonus XP"}
        </span>
      </div>
    </section>
  );
}
