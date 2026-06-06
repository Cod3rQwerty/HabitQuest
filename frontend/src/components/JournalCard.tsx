"use client";

import { useEffect, useState } from "react";
import type { DailyProgress } from "@/lib/types";

interface JournalCardProps {
  daily: DailyProgress;
  onLog: (text: string) => Promise<void>;
  loading?: boolean;
}

export function JournalCard({ daily, onLog, loading }: JournalCardProps) {
  const [text, setText] = useState(daily.journal_text ?? "");

  useEffect(() => {
    setText(daily.journal_text ?? "");
  }, [daily.journal_text]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    await onLog(text.trim());
  };

  return (
    <section className="card-base card-hover animate-rise-in flex h-full flex-col gap-5">
      <header>
        <p className="text-sm font-medium text-journal">Mindfulness</p>
        <h2 className="text-xl font-semibold">Daily Journal</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Reflect on your day. One entry earns +10 XP.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="How are you feeling today? What went well?"
          rows={6}
          maxLength={5000}
          className="input-base min-h-[140px] flex-1 resize-none"
        />
        <div className="flex items-center justify-between text-xs text-ink-faint">
          <span>{text.length} / 5000</span>
          {daily.journal_submitted && (
            <span className="text-journal">Submitted today ✓</span>
          )}
        </div>
        <button
          type="submit"
          className="btn-primary w-full"
          disabled={loading || !text.trim()}
        >
          {loading ? "Saving…" : daily.journal_submitted ? "Update Entry" : "Submit Journal"}
        </button>
      </form>
    </section>
  );
}
