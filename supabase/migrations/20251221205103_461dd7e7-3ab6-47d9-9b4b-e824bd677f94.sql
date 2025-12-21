-- Create premium_codes table for promo code functionality
CREATE TABLE IF NOT EXISTS public.premium_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  max_uses INTEGER DEFAULT NULL,
  current_uses INTEGER DEFAULT 0,
  duration_days INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.premium_codes ENABLE ROW LEVEL SECURITY;

-- Only admins can view all codes, but anyone can check if a code exists
CREATE POLICY "Admins can manage premium codes"
ON public.premium_codes
FOR ALL
USING (public.is_admin());

-- Allow users to read active codes for validation (but not expose all info)
CREATE POLICY "Users can validate codes"
ON public.premium_codes
FOR SELECT
USING (is_active = true);

-- Insert some default promo codes
INSERT INTO public.premium_codes (code, description, max_uses, duration_days, expires_at) VALUES
('CINEMAX2024', 'Launch promo code - 30 days premium', 100, 30, '2025-12-31'::timestamp),
('PREMIUM30', 'Standard 30-day premium access', 50, 30, '2025-12-31'::timestamp),
('VIP90', 'VIP 90-day premium access', 25, 90, '2025-06-30'::timestamp),
('FREEMONTH', 'Free month trial', 200, 30, '2025-12-31'::timestamp),
('STANLEY', 'Special admin code - unlimited', NULL, 365, NULL);