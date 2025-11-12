# Batch Header: Onboarding Profile Step (Step 2)

**Date:** 2025-11-10  
**Scope:** 1.5 hours  
**Task:** Create profile completion step for signup/onboarding flow

## Inputs
- Existing onboarding page with step 1 (authentication)
- ProfileEditModal component with complete form
- Need to extract form into reusable component

## Requirements

### Step 2 of Onboarding: Profile Creation
- Present user with profile form (same as edit profile form)
- Pre-fill username (suggested based on email/phone or social login)
- Pre-fill email OR phone (based on what user selected in step 1)
- All sections from ProfileEditModal:
  - Personal Information (with pre-filled data)
  - About (optional)
  - Business Information (optional)
- Allow user to complete or skip

## Plan
1. Create `ProfileForm` component (extracted from ProfileEditModal)
2. Make ProfileForm reusable with props for:
   - Initial data
   - Read-only fields
   - Submit handler
   - Mode (onboarding vs edit)
3. Update ProfileEditModal to use ProfileForm component
4. Update onboarding page step 2 to use ProfileForm
5. Add logic to suggest username from email/phone
6. Pre-fill email or phone based on step 1 selection
7. Update step flow and titles

## Risks & Assumptions
- **Assumption:** User can skip profile completion and complete later
- **Assumption:** Only email OR phone is pre-filled (not both)
- **Assumption:** Username suggestion: take part before @ for email, or phone number
- **Risk:** Need to maintain state between onboarding steps

## Script Additions
None

## Files to Create/Modify
- `/apps/web/src/components/profile/ProfileForm.tsx` - New reusable form component
- `/apps/web/src/components/profile/ProfileEditModal.tsx` - Refactor to use ProfileForm
- `/apps/web/src/app/[locale]/(auth_forms)/onboarding/page.tsx` - Add profile step

