
-- Remove the hide_activity column if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'user_profiles'
        AND column_name = 'hide_activity'
    ) THEN
        ALTER TABLE public.user_profiles
        DROP COLUMN hide_activity;
    END IF;
END
$$;
