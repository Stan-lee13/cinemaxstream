
interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at?: string;
  updated_at?: string;
  subscription_tier: string;
  subscription_expires_at?: string;
  role: 'free' | 'pro' | 'premium';
  downloads_today?: number;
  watched_today?: number;
}
