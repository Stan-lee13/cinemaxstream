-- Enhance promo code schema to support tier-specific redemptions

ALTER TABLE public.premium_codes
  ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'premium',
  ADD COLUMN IF NOT EXISTS months_granted INTEGER DEFAULT 12;

UPDATE public.premium_codes
SET tier = COALESCE(NULLIF(tier, ''), 'premium'),
    months_granted = COALESCE(months_granted, 12)
WHERE tier IS NULL
   OR tier = ''
   OR months_granted IS NULL;

ALTER TABLE public.premium_codes
  ALTER COLUMN tier SET NOT NULL,
  ALTER COLUMN months_granted SET NOT NULL;

ALTER TABLE public.premium_codes
  ADD CONSTRAINT premium_codes_tier_check CHECK (tier IN ('pro', 'premium'));

ALTER TABLE public.premium_codes
  ADD CONSTRAINT premium_codes_months_check CHECK (months_granted BETWEEN 1 AND 36);

CREATE OR REPLACE FUNCTION public.get_promo_code_details(input_code TEXT)
RETURNS TABLE (
  id uuid,
  code TEXT,
  tier TEXT,
  months_granted INTEGER,
  max_uses INTEGER,
  current_uses INTEGER,
  expires_at timestamptz,
  is_active BOOLEAN,
  notes TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT pc.id,
         pc.code,
         pc.tier,
         pc.months_granted,
         pc.max_uses,
         pc.current_uses,
         pc.expires_at,
         pc.is_active,
         pc.notes
  FROM public.premium_codes pc
  WHERE UPPER(pc.code) = UPPER(TRIM(input_code))
  LIMIT 1;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

GRANT EXECUTE ON FUNCTION public.get_promo_code_details(TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.redeem_promo_code(code_id UUID)
RETURNS TABLE (
  id uuid,
  current_uses INTEGER,
  max_uses INTEGER,
  is_active BOOLEAN
) AS $$
DECLARE
  updated_record RECORD;
BEGIN
  UPDATE public.premium_codes
  SET current_uses = current_uses + 1,
      is_active = CASE
        WHEN max_uses IS NOT NULL AND current_uses + 1 >= max_uses THEN false
        ELSE is_active
      END
  WHERE id = code_id
    AND is_active = true
    AND (max_uses IS NULL OR current_uses < max_uses)
  RETURNING id, current_uses, max_uses, is_active
  INTO updated_record;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Promo code cannot be redeemed';
  END IF;

  RETURN QUERY
  SELECT updated_record.id,
         updated_record.current_uses,
         updated_record.max_uses,
         updated_record.is_active;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

GRANT EXECUTE ON FUNCTION public.redeem_promo_code(UUID) TO authenticated;
