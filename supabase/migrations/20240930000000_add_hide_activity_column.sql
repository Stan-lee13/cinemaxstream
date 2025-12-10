
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS hide_activity BOOLEAN DEFAULT false;
