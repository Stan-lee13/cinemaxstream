interface UserProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  created_at?: string;
  updated_at?: string;
  subscription_tier: string | null;
  subscription_expires_at?: string | null;
  role: string | null;
  downloads_today?: number | null;
  watched_today?: number | null;
}

interface UserProfileRow {
  id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  subscription_tier: string | null;
  subscription_expires_at: string | null;
  role: string | null;
  priority_level: number | null;
  timezone: string | null;
}

interface UserUsageRow {
  id: string;
  user_id: string;
  watched_today: number | null;
  downloads_today: number | null;
  last_reset: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface UserUsage {
  watched_today: number | null | undefined;
  downloads_today: number | null | undefined;
  last_reset: string | null | undefined;
}
