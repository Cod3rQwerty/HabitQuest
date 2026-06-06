"use client";

import { useState } from "react";
import type { DailyProgress } from "@/lib/types";

interface WaterTrackerProps {
  daily: DailyProgress;
  onLog: (amountMl: number, targetMl?: number) => Promise<void>;
  loading?: boolean;
}

const QUICK_AMOUNTS = [250, 500, 750];

export function WaterTracker({ daily, onLog, loading }: WaterTrackerProps) {
  const [amount, setAmount] = useState("250");
  const [target, setTarget] = useState(String(daily.water_target_ml));

  const progress =
    daily.water_target_ml > 0
      ? Math.min(100, (daily.water_ml / daily.water_target_ml) * 100)
      : 0;

  const circumference = 2 * Math.PI * 54;
  const strokeOffset = circumference - (progress / 100) * circumference;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ml = parseInt(amount, 10);
    const targetMl = parseInt(target, 10);
    if (!ml || ml <= 0) return;
    await onLog(ml, targetMl > 0 ? targetMl : undefined);
  };

  return (
    <section className="card-base card-hover animate-rise-in flex h-full flex-col gap-5">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-water">Hydration</p>
          <h2 className="text-xl font-semibold">Water Intake</h2>
        </div>
        {daily.water_target_met && (
          <span className="rounded-full bg-water/15 px-3 py-1 text-xs font-medium text-water">
            Target met ✓
          </span>
        )}
      </header>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative h-36 w-36 shrink-0">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-surface-muted"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="url(#waterGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
              className="transition-all duration-700 ease-smooth"
            />
            <defs>
              <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#4f6ef7" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-2xl font-bold">{daily.water_ml}</p>
            <p className="text-xs text-ink-muted">/ {daily.water_target_ml} ml</p>
          </div>
        </div>

        <div className="w-full flex-1 space-y-2 text-sm">
          <div className="flex justify-between text-ink-muted">
            <span>Consumed</span>
            <span className="font-medium text-ink">{daily.water_ml} ml</span>
          </div>
          <div className="flex justify-between text-ink-muted">
            <span>Remaining</span>
            <span className="font-medium text-ink">
              {daily.water_remaining_ml} ml
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-water transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-auto space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs text-ink-muted">Log amount (ml)</span>
            <input
              type="number"
              min={50}
              max={5000}
              step={50}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-base"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-ink-muted">Daily target (ml)</span>
            <input
              type="number"
              min={500}
              max={5000}
              step={100}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="input-base"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          {QUICK_AMOUNTS.map((ml) => (
            <button
              key={ml}
              type="button"
              className="btn-ghost !rounded-2xl !px-3 !py-1.5 text-xs"
              onClick={() => setAmount(String(ml))}
            >
              +{ml}ml
            </button>
          ))}
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Logging…" : "Log Water"}
        </button>
      </form>
    </section>
  );
}
