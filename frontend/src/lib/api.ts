import type {
  ActionResponse,
  DailyProgress,
  LeaderboardResponse,
  UserStats,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  getUserStats(userId: number): Promise<UserStats> {
    return request<UserStats>(`/user/${userId}/stats`);
  },

  getDailyProgress(userId: number): Promise<DailyProgress> {
    return request<DailyProgress>(`/user/${userId}/daily`);
  },

  logWater(
    userId: number,
    amountMl: number,
    targetMl?: number,
  ): Promise<ActionResponse> {
    return request<ActionResponse>(`/user/${userId}/log-water`, {
      method: "POST",
      body: JSON.stringify({
        amount_ml: amountMl,
        ...(targetMl !== undefined ? { target_ml: targetMl } : {}),
      }),
    });
  },

  logSleep(userId: number, hours: number): Promise<ActionResponse> {
    return request<ActionResponse>(`/user/${userId}/log-sleep`, {
      method: "POST",
      body: JSON.stringify({ hours }),
    });
  },

  logJournal(userId: number, text: string): Promise<ActionResponse> {
    return request<ActionResponse>(`/user/${userId}/log-journal`, {
      method: "POST",
      body: JSON.stringify({ text }),
    });
  },

  getLeaderboard(): Promise<LeaderboardResponse> {
    return request<LeaderboardResponse>("/leaderboard");
  },
};
