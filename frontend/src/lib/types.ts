export interface Badge {
  id: string;
  name: string;
  description: string;
  earned: boolean;
}

export interface UserStats {
  user_id: number;
  username: string;
  current_level: number;
  current_xp: number;
  xp_for_current_level: number;
  xp_for_next_level: number;
  xp_progress_percent: number;
  streak_count: number;
  badges: Badge[];
  water_target_ml: number;
}

export interface SideQuest {
  id: string;
  title: string;
  description: string;
  bonus_xp: number;
  completed: boolean;
}

export interface DailyProgress {
  log_date: string;
  water_ml: number;
  water_target_ml: number;
  water_remaining_ml: number;
  water_target_met: boolean;
  sleep_hours: number | null;
  journal_text: string | null;
  journal_submitted: boolean;
  side_quest: SideQuest;
  daily_targets_met: boolean;
}

export interface ActionResponse {
  success: boolean;
  xp_gained: number;
  total_xp: number;
  current_level: number;
  leveled_up: boolean;
  new_badges: Badge[];
  message: string;
  daily: DailyProgress;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  current_level: number;
  current_xp: number;
  streak_count: number;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
}

export interface DashboardData {
  stats: UserStats;
  daily: DailyProgress;
  leaderboard: LeaderboardResponse;
}
