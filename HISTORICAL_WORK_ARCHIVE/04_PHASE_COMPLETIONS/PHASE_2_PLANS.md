# Phase 2 Implementation Plans - Historical Work Archive

## Overview

This document consolidates the original implementation plans for Phase 2 of the LTM Starter Kit. These plans guided the development of core user-facing features including authentication, profile management, organization management, API infrastructure, billing, feature gating, and usage tracking.

## Phase 2.1: Auth & Account Setup

### Objectives
- Update database types to match actual schema (41 fields)
- Configure environment variables for auth flows
- Fix TypeScript errors preventing compilation
- Create admin and test user accounts

### Implementation Plan

**1. Database Types Update**
- Expand `users` table type from 11 to 41 fields
- Add profile fields: username, display_name, personal_title, names
- Add contact fields: phone_country_code, phone_number
- Add address fields: personal and business addresses (8 fields each)
- Add business info: company_name, job_title, industry, etc.
- Add about section: bio, education (jsonb), work_experience (jsonb)
- Add system fields: account_type, profile_completed, onboarding_completed

**2. Environment Configuration**
- Add `NEXT_PUBLIC_SITE_URL` for email redirects
- Add Supabase environment variables
- Document all required variables in `.env.example`
- Create setup guide for developers

**3. TypeScript Error Fixes**
- Fix import errors in components
- Add type annotations to remove implicit `any`
- Fix DOM prop issues
- Update type guards for metadata access
- Expand fallback user objects to match schema

**4. Account Creation**
- Create SQL script for admin account
- Create SQL script for test user account
- Document manual account creation process
- Provide credentials for testing

### Success Criteria
- ✅ TypeScript compilation passes (0 errors)
- ✅ All 41 user fields typed correctly
- ✅ Environment variables documented
- ✅ Admin and test accounts documented

---

## Phase 2.2: Profile Management

### Objectives
- Implement profile validation schemas
- Create profile server actions
- Build onboarding flow with username validation
- Create profile view and edit components
- Implement avatar upload

### Implementation Plan

**1. Validation Schemas**
- Create Zod schemas for username, personal info, contact details
- Add address validation (personal and business)
- Create education and work experience array schemas
- Implement onboarding step 2 schema with required fields

**2. Server Actions**
- `checkUsernameAvailability()` - Real-time collision detection
- `completeOnboardingStep2()` - Form submission with validation
- `updateProfile()` - Full profile updates
- `updateAvatarUrl()` - Avatar URL persistence
- `getCurrentUserProfile()` - Fetch user profile

**3. Onboarding Flow**
- Create server component for onboarding page
- Build client form with real-time username checking
- Implement debounced validation (400ms)
- Add visual feedback (checkmark/x icon)
- Redirect completed users to dashboard

**4. Profile Components**
- Create profile view card with JSONB parsing
- Build profile edit modal with dynamic arrays
- Implement education/work experience add/remove
- Add debounce hook for username checking

**5. Avatar Upload**
- Create avatar upload component
- Integrate with Supabase Storage
- Implement image compression and validation
- Add loading states and error handling

### Success Criteria
- ✅ All validation schemas working
- ✅ Real-time username checking functional
- ✅ Onboarding flow completes successfully
- ✅ Profile edit saves all fields correctly
- ✅ Avatar upload works with Supabase Storage

---

## Phase 2.3: Organization Management

### Objectives
- Implement organization CRUD operations
- Create member management system
- Build invite system (email and links)
- Implement organization switching
- Add role-based permissions

### Implementation Plan

**1. Validation Schemas**
- Create organization schema (name, type, slug, description)
- Add update schema (partial updates with avatar_url)
- Implement invite member schema (email and role)
- Create member role update schema
- Add invite link schema with expiry (1-30 days)

**2. Server Actions**
- `createOrganization()` - Create with slug uniqueness check
- `updateOrganization()` - Update with permission checks
- `getUserOrganizations()` - Fetch memberships
- `inviteMember()` - Email-based invitations
- `createInviteLink()` - Shareable invite links
- `removeMember()` - Remove with role checks
- `updateMemberRole()` - Change roles (owner only)
- `leaveOrganization()` - Leave with ownership transfer
- `switchOrganization()` - Switch active org context

**3. Organization Pages**
- Create new organization page
- Build organization overview page
- Create members management page
- Implement settings page

**4. Components**
- Create org form with validation
- Build leave organization button with confirmation
- Implement org switcher dropdown
- Create settings form
- Build invite form
- Create member row with actions

### Success Criteria
- ✅ Organization CRUD operations working
- ✅ Member management with role checks
- ✅ Invite system (email and links) functional
- ✅ Organization switching works
- ✅ All permissions enforced correctly

---

## Phase 2.4: API Routes & Username Checker

### Objectives
- Implement API infrastructure
- Create real-time availability checking
- Build user search and member lookup
- Add rate limiting
- Integrate with UI components

### Implementation Plan

**1. API Infrastructure**
- Create API type definitions (ApiResponse, PaginatedResponse)
- Build API client utility with error handling
- Implement custom ApiError class
- Create pre-configured endpoint methods

**2. Rate Limiting**
- Implement in-memory rate limiter
- Create strict limiter (10 req/min) for availability checks
- Create default limiter (60 req/min) for general use
- Add IP-based tracking with cleanup
- Include Retry-After header in 429 responses

**3. API Endpoints**
- `/api/check-username` - Username availability with suggestions
- `/api/check-slug` - Slug availability with suggestions
- `/api/users/search` - User search (authenticated)
- `/api/organizations/[orgId]/members` - Member lookup (authenticated)

**4. UI Integration**
- Update onboarding form with real-time username validation
- Add slug validation to org creation form
- Integrate user search
- Add member lookup to member management

### Success Criteria
- ✅ All API endpoints working
- ✅ Rate limiting prevents abuse
- ✅ Real-time validation functional
- ✅ UI integration complete

---

## Phase 2.5: Billing & Stripe Integration

### Objectives
- Integrate Stripe SDK
- Implement billing server actions
- Create billing UI components
- Add webhook handling
- Configure environment variables

### Implementation Plan

**1. Stripe SDK Setup**
- Install Stripe packages (stripe, @stripe/stripe-js)
- Create server-side Stripe client
- Implement client-side loadStripe singleton
- Configure environment variables
- Create billing types

**2. Server Actions**
- `createOrgStripeCustomer()` - Create/retrieve customer
- `createSubscriptionCheckout()` - Start checkout
- `createBillingPortal()` - Access portal
- `getOrgSubscription()` - Fetch subscription

**3. Billing UI**
- Create billing dashboard container
- Build current plan card
- Implement plan comparison component
- Add billing history placeholder

**4. Webhook Handler**
- Implement signature verification
- Add idempotent event processing
- Handle subscription lifecycle events
- Create database migration for webhook fields

### Success Criteria
- ✅ Stripe SDK integrated
- ✅ Billing actions working
- ✅ UI displays plans and subscriptions
- ✅ Webhooks process events correctly

---

## Phase 2.6: Feature Gating

### Objectives
- Implement feature flag system
- Create plan-based feature gating
- Build usage limit enforcement
- Integrate with billing system

### Implementation Plan

**1. Feature Flag System**
- Create feature flag configuration
- Implement feature check functions
- Add plan-based feature mapping
- Build feature gate components

**2. Usage Limits**
- Define limits per plan
- Implement limit checking
- Add enforcement logic
- Create upgrade prompts

**3. Integration**
- Connect with billing system
- Add feature checks to protected routes
- Implement usage tracking
- Create limit exceeded UI

### Success Criteria
- ✅ Feature flags working
- ✅ Plan-based gating enforced
- ✅ Usage limits respected
- ✅ Upgrade prompts functional

---

## Phase 2.7: Usage Tracking Dashboard

### Objectives
- Implement usage event tracking
- Create analytics dashboard
- Build usage limit monitoring
- Integrate with feature gating

### Implementation Plan

**1. Usage Tracking**
- Create usage event schema
- Implement event recording
- Add event aggregation
- Build usage queries

**2. Analytics Dashboard**
- Create dashboard layout
- Build usage charts
- Implement limit indicators
- Add historical views

**3. Monitoring**
- Add real-time usage updates
- Implement limit warnings
- Create usage reports
- Build export functionality

### Success Criteria
- ✅ Usage events tracked
- ✅ Dashboard displays analytics
- ✅ Limits monitored
- ✅ Reports generated

---

## Common Patterns Across Phases

### Validation Strategy
- Use Zod for all input validation
- Validate on client and server
- Provide clear error messages
- Include example values

### Server Actions Pattern
- Use `requireAuth()` for authentication
- Check permissions before mutations
- Return `{ success, data?, error? }` format
- Revalidate caches after mutations
- Handle offline mode gracefully

### Component Architecture
- Server components for data fetching
- Client components for interactivity
- Separate view and edit components
- Use loading states and skeletons
- Implement error boundaries

### Error Handling
- Catch all errors in try-catch blocks
- Log errors for debugging
- Return user-friendly messages
- Include actionable guidance
- Never expose sensitive data

### Testing Strategy
- Write unit tests for server actions
- Create integration tests for flows
- Add E2E tests for critical paths
- Use realistic test data
- Mock external services

## Related Documentation

- [PHASE_2_SUMMARIES.md](./PHASE_2_SUMMARIES.md) - Completion summaries
- Individual phase implementation docs in `docs/phase-2-*.md`

## Conclusion

These implementation plans guided the successful completion of Phase 2, transforming the LTM Starter Kit into a functional SaaS platform. The consistent patterns and thorough planning enabled efficient development and high-quality implementation.

**Status**: ✅ All Phases Completed  
**Documentation Date**: 2024-2025
