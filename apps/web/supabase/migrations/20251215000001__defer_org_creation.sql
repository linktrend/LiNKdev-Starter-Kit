-- Defer Personal Organization Creation Until Onboarding Step 2
-- This migration modifies handle_new_user() to NOT create personal org on signup
-- The org will be created when user completes onboarding Step 2

-- Update handle_new_user() trigger to defer org creation
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  -- Insert user record with onboarding flags set to false
  INSERT INTO public.users (
    id, 
    email,
    username,
    full_name, 
    avatar_url,
    account_type,
    profile_completed,
    onboarding_completed,
    created_at,
    updated_at
  )
  VALUES (
    new.id, 
    new.email,
    NULL, -- Username will be set during onboarding Step 2
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    'user', -- Default account type for all new signups
    false,  -- Profile not completed yet
    false,  -- Onboarding not completed yet
    now(),
    now()
  );
  
  -- Do NOT create personal organization here
  -- It will be created when user completes onboarding Step 2
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger is still attached (it should be, but let's be explicit)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Note: Existing users already have personal orgs created by previous migration
-- This change only affects NEW signups going forward
