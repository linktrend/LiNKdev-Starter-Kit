-- Add missing fields to org_subscriptions for complete Stripe webhook sync
-- BILLING-2: Stripe Webhook Handler & Event Processing

-- Add stripe_subscription_id as an alias/duplicate of stripe_sub_id for clarity
-- We'll keep both for backward compatibility
ALTER TABLE public.org_subscriptions 
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

-- Add cancellation tracking fields
ALTER TABLE public.org_subscriptions 
  ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean DEFAULT false;

ALTER TABLE public.org_subscriptions 
  ADD COLUMN IF NOT EXISTS canceled_at timestamptz;

-- Add trial start tracking (trial_end already exists)
ALTER TABLE public.org_subscriptions 
  ADD COLUMN IF NOT EXISTS trial_start timestamptz;

-- Create index on stripe_subscription_id for efficient webhook lookups
CREATE INDEX IF NOT EXISTS idx_org_subscriptions_stripe_subscription_id 
  ON public.org_subscriptions(stripe_subscription_id);

-- Sync existing stripe_sub_id values to stripe_subscription_id
UPDATE public.org_subscriptions 
SET stripe_subscription_id = stripe_sub_id 
WHERE stripe_sub_id IS NOT NULL 
  AND stripe_subscription_id IS NULL;

-- Add comment explaining the dual fields
COMMENT ON COLUMN public.org_subscriptions.stripe_subscription_id IS 
  'Stripe subscription ID - preferred field for new code. Kept in sync with stripe_sub_id for backward compatibility.';

COMMENT ON COLUMN public.org_subscriptions.stripe_sub_id IS 
  'Legacy field - use stripe_subscription_id instead. Kept for backward compatibility.';
