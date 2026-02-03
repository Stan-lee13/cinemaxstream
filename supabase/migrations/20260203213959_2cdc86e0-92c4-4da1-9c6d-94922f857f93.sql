-- Fix expired promo codes - update expiration dates
UPDATE public.premium_codes 
SET expires_at = '2027-12-31 00:00:00+00' 
WHERE code IN ('CINEMAX2024', 'PREMIUM30', 'VIP90', 'FREEMONTH');

-- Also reset current_uses for testing
UPDATE public.premium_codes 
SET current_uses = 0 
WHERE current_uses > 0;