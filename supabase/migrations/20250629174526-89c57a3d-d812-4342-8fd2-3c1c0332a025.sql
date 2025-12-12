
-- Phase 1: Critical Database Fixes
-- Fix RLS policies for user_profiles table

-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;

-- Create proper RLS policies for user_profiles
CREATE POLICY "Users can view own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Ensure RLS is enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Fix user_favorites table RLS policies
DROP POLICY IF EXISTS "Users can view own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.user_favorites;

CREATE POLICY "Users can view own favorites" 
ON public.user_favorites 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" 
ON public.user_favorites 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" 
ON public.user_favorites 
FOR DELETE 
USING (auth.uid() = user_id);

ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Fix watch_sessions table RLS policies
DROP POLICY IF EXISTS "Users can view own sessions" ON public.watch_sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON public.watch_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON public.watch_sessions;

CREATE POLICY "Users can view own sessions" 
ON public.watch_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" 
ON public.watch_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" 
ON public.watch_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

ALTER TABLE public.watch_sessions ENABLE ROW LEVEL SECURITY;
