"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailyProgress } from "@/lib/types";

interface SleepTrackerProps {
  daily: DailyProgress;
  onLog: (hours: number) => Promise<void>;
  loading?: boolean;
}

export function SleepTracker({ daily, onLog, loading }: SleepTrackerProps) {
  const [hours, setHours] = useState(
    daily.sleep_hours !== null ? String(daily.sleep_hours) : "7.5",
  );

  const chartData = useMemo(() => {
    const logged = daily.sleep_hours ?? 0;
    return [
      { label: "Min", hours: 6, fill: "var(--color-surface-muted)" },
      { label: "Ideal", hours: 8, fill: "var(--color-sleep)" },
      { label: "You", hours: logged || 0.5, fill: logged >= 7 && logged <= 9 ? "#34d399" : "#f97316" },
      { label: "Max", hours: 10, fill: "var(--color-surface-muted)" },
    ];
  }, [daily.sleep_hours]);

  const perfectRest =
    daily.sleep_hours !== null &&
    daily.sleep_hours >= 7 &&
    daily.sleep_hours <= 9;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(hours);
    if (!value || value <= 0 || value > 24) return;
    await onLog(value);
  };

  return (
    <section className="card-base card-hover animate-rise-in flex h-full flex-col gap-5">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-sleep">Recovery</p>
          <h2 className="text-xl font-semibold">Sleep Tracker</h2>
        </div>
        {perfectRest && (
          <span className="rounded-full bg-journal/15 px-3 py-1 text-xs font-medium text-journal">
            Perfect Rest +20 XP
          </span>
        )}
      </header>

      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="20%">
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--color-ink-muted)", fontSize: 12 }}
            />
            <YAxis
              domain={[0, 12]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--color-ink-faint)", fontSize: 11 }}
              width={28}
            />
            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{
                borderRadius: "1rem",
                border: "none",
                background: "var(--color-surface-elevated)",
                boxShadow: "var(--shadow-card)",
                color: "var(--color-ink)",
              }}
              formatter={(value: number) => [`${value}h`, "Sleep"]}
            />
            <Bar dataKey="hours" radius={[12, 12, 4, 4]}>
              {chartData.map((entry) => (
                <Cell key={entry.label} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-sm text-ink-muted">
        {daily.sleep_hours !== null
          ? `Last logged: ${daily.sleep_hours} hours`
          : "Log your sleep to earn XP. 7–9 hours unlocks the Perfect Rest Bonus."}
      </p>

      <form onSubmit={handleSubmit} className="mt-auto space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs text-ink-muted">Hours slept</span>
          <input
            type="number"
            min={0.5}
            max={24}
            step={0.5}
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="input-base"
          />
        </label>
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Saving…" : "Log Sleep"}
        </button>
      </form>
    </section>
  );
}
