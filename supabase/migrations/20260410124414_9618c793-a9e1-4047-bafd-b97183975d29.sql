-- Add unique constraint on device_sessions to prevent duplicate fingerprints per user
ALTER TABLE public.device_sessions
ADD CONSTRAINT device_sessions_user_fingerprint_unique UNIQUE (user_id, device_fingerprint);