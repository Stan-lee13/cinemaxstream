-- Create premium_codes table for storing premium access codes
CREATE TABLE IF NOT EXISTS public.premium_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_by uuid REFERENCES auth.users(id),
  notes TEXT
);

-- Enable RLS on premium_codes
ALTER TABLE public.premium_codes ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_premium_codes_code ON public.premium_codes(code);
CREATE INDEX IF NOT EXISTS idx_premium_codes_active ON public.premium_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_premium_codes_expires ON public.premium_codes(expires_at);

-- RLS policies for premium_codes table
-- Allow authenticated users to validate codes (read-only)
CREATE POLICY "Allow users to validate active codes"
ON public.premium_codes
FOR SELECT
TO authenticated
USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()) AND (max_uses IS NULL OR current_uses < max_uses));

-- Admins can manage codes
CREATE POLICY "Admins can manage premium codes"
ON public.premium_codes
FOR ALL
TO authenticated
USING (public.is_admin());

-- Create function to validate premium codes
CREATE OR REPLACE FUNCTION public.validate_premium_code(input_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code_record RECORD;
BEGIN
  -- Look up the code (case insensitive)
  SELECT * INTO code_record
  FROM public.premium_codes
  WHERE UPPER(code) = UPPER(TRIM(input_code))
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW())
    AND (max_uses IS NULL OR current_uses < max_uses);
  
  -- If code exists and is valid, increment usage counter
  IF FOUND THEN
    UPDATE public.premium_codes
    SET current_uses = current_uses + 1
    WHERE id = code_record.id;
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE public.premium_codes TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_premium_code(TEXT) TO authenticated;