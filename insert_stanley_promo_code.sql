-- Script to insert the Stanley123. promo code into the database
-- This ensures the original promo code mentioned in the requirements works correctly

INSERT INTO public.premium_codes (
  code,
  is_active,
  max_uses,
  current_uses,
  expires_at,
  notes
) VALUES (
  'STANLEY123.',
  true,
  1,
  0,
  NULL,
  'Original promo code from requirements'
)
ON CONFLICT (code) DO UPDATE SET
  is_active = EXCLUDED.is_active,
  max_uses = EXCLUDED.max_uses,
  notes = EXCLUDED.notes;

-- Verify the code was inserted
SELECT * FROM public.premium_codes WHERE code = 'STANLEY123.';