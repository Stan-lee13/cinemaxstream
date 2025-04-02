
interface UserProfile {
  id: string;
  username: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
  subscription_tier: string;
  subscription_expires_at: string;
  hide_activity?: boolean;
}
