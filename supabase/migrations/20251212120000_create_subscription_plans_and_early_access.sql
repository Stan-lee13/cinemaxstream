-- Create subscription_plans table
CREATE TABLE public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id text UNIQUE NOT NULL,
  name text NOT NULL,
  price_naira integer NOT NULL,
  max_streams integer NOT NULL,
  max_downloads integer NOT NULL,
  unlimited boolean DEFAULT false,
  features jsonb DEFAULT '[]'::jsonb,
  priority_level integer DEFAULT 3,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on subscription_plans
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Insert default subscription plans
INSERT INTO public.subscription_plans (plan_id, name, price_naira, max_streams, max_downloads, unlimited, features, priority_level) VALUES
  ('free', 'Free', 0, 5, 0, false, '["5 streams per day", "Standard quality", "Basic support", "Limited content"]'::jsonb, 3),
  ('pro', 'Pro', 500, 12, 5, false, '["12 streams per day", "5 downloads per day", "HD quality", "Priority download queue", "Priority support", "All content access"]'::jsonb, 2),
  ('premium', 'Premium', 1500, 0, 0, true, '["Unlimited streams", "Unlimited downloads", "4K streaming", "Premium-only catalog", "VIP support"]'::jsonb, 1);

-- Add early access columns to content table
ALTER TABLE public.content 
ADD COLUMN IF NOT EXISTS is_trending_new boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS early_access_until timestamptz;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_early_access ON public.content(early_access_until);
CREATE INDEX IF NOT EXISTS idx_content_trending_new ON public.content(is_trending_new);

-- RLS policies for subscription_plans table
CREATE POLICY "Anyone can view subscription plans"
ON public.subscription_plans
FOR SELECT
USING (true);

CREATE POLICY "Only admins can insert subscription plans"
ON public.subscription_plans
FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update subscription plans"
ON public.subscription_plans
FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Only admins can delete subscription plans"
ON public.subscription_plans
FOR DELETE
USING (public.is_admin());

-- Update function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for subscription_plans updated_at
CREATE TRIGGER update_subscription_plans_updated_at 
    BEFORE UPDATE ON public.subscription_plans 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create RPC function to get subscription plan by role
CREATE OR REPLACE FUNCTION public.get_subscription_plan_by_role(role_param TEXT)
RETURNS TABLE (
    id UUID,
    plan_id TEXT,
    name TEXT,
    price_naira INTEGER,
    max_streams INTEGER,
    max_downloads INTEGER,
    unlimited BOOLEAN,
    features JSONB,
    priority_level INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sp.id,
        sp.plan_id,
        sp.name,
        sp.price_naira,
        sp.max_streams,
        sp.max_downloads,
        sp.unlimited,
        sp.features,
        sp.priority_level,
        sp.created_at,
        sp.updated_at
    FROM public.subscription_plans sp
    WHERE sp.plan_id = role_param;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_subscription_plan_by_role(TEXT) TO anon, authenticated;