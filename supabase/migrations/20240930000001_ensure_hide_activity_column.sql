
-- Check if the column already exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'user_profiles'
        AND column_name = 'hide_activity'
    ) THEN
        ALTER TABLE user_profiles
        ADD COLUMN hide_activity BOOLEAN DEFAULT false;
    END IF;
END
$$;

-- Update any null values to false
UPDATE public.user_profiles
SET hide_activity = false
WHERE hide_activity IS NULL;
