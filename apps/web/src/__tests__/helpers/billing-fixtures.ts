import type { OrgSubscription, BillingCustomer } from '@/types/billing';

/**
 * Mock organization subscription for testing
 */
export const mockOrgSubscription: OrgSubscription = {
  org_id: 'test-org-id',
  stripe_subscription_id: 'sub_test123',
  stripe_customer_id: 'cus_test123',
  status: 'active',
  plan_name: 'pro',
  billing_interval: 'monthly',
  seats: 1,
  current_period_start: new Date().toISOString(),
  current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  cancel_at_period_end: false,
  canceled_at: null,
  trial_start: null,
  trial_end: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

/**
 * Mock organization for testing
 */
export const mockOrganization = {
  id: 'test-org-id',
  name: 'Test Organization',
  owner_id: 'test-user-id',
  slug: 'test-org',
  is_personal: false,
  org_type: 'team',
  created_by: 'test-user-id',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

/**
 * Mock user for testing
 */
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  username: 'testuser',
  full_name: 'Test User',
  first_name: 'Test',
  last_name: 'User',
  display_name: null,
  avatar_url: null,
  phone_country_code: null,
  phone_number: null,
  bio: null,
  account_type: 'user',
  profile_completed: true,
  onboarding_completed: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
};

/**
 * Mock billing customer for testing
 */
export const mockBillingCustomer: BillingCustomer = {
  org_id: 'test-org-id',
  stripe_customer_id: 'cus_test123',
  billing_email: 'test@example.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

/**
 * Mock organization member for testing
 */
export const mockOrganizationMember = {
  id: 'member-test-id',
  organization_id: 'test-org-id',
  org_id: 'test-org-id',
  user_id: 'test-user-id',
  role: 'member',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
