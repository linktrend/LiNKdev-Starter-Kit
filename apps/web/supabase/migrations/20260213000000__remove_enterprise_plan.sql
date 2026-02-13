-- =====================================================
-- Remove Enterprise Plan Tier
-- Migration: 20260213000000__remove_enterprise_plan.sql
--
-- Purpose: The starter kit defaults to 3 tiers: Free / Pro / Business.
--          This migration removes the legacy "enterprise" tier from
--          check constraints and deletes any seeded enterprise rows.
-- =====================================================

-- 1) Remove any seeded enterprise plan feature rows (safe if none exist)
DELETE FROM public.plan_features
WHERE plan_name = 'enterprise';

-- 2) Migrate any existing enterprise subscriptions to Business (best-effort)
UPDATE public.org_subscriptions
SET plan_name = 'business',
    updated_at = now()
WHERE plan_name = 'enterprise';

-- 3) Update CHECK constraints to exclude enterprise
ALTER TABLE public.org_subscriptions
  DROP CONSTRAINT IF EXISTS org_subscriptions_plan_name_check;

ALTER TABLE public.org_subscriptions
  ADD CONSTRAINT org_subscriptions_plan_name_check
  CHECK (plan_name IN ('free', 'pro', 'business'));

ALTER TABLE public.plan_features
  DROP CONSTRAINT IF EXISTS plan_features_plan_name_check;

ALTER TABLE public.plan_features
  ADD CONSTRAINT plan_features_plan_name_check
  CHECK (plan_name IN ('free', 'pro', 'business'));

