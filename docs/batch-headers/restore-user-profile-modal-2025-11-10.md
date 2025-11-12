# Batch Header: Restore User Profile Edit Modal

**Date:** 2025-11-10  
**Scope:** 1 hour  
**Task:** Separate admin and user profile edit modals to restore original user functionality

## Inputs
- Current ProfileEditModal component with admin-specific validation
- Dashboard profile page at `/dashboard/profile`
- Console profile page at `/console/profile`
- App profile page at `/(app)/profile`

## Problem
The ProfileEditModal component was modified to include admin-specific validation (requiring usernames to end with `.admin`). This validation is now incorrectly applied to regular user profile edits, breaking the user experience.

## Plan
1. Create a new `AdminProfileEditModal` component with admin-specific validation (`.admin` suffix requirement)
2. Restore the original `ProfileEditModal` to be user-friendly (remove `.admin` requirement)
3. Update the console profile page to use `AdminProfileEditModal`
4. Ensure dashboard and app profile pages use the standard `ProfileEditModal`
5. Test both modals work correctly

## Risks & Assumptions
- **Assumption:** The original user form should NOT require `.admin` suffix
- **Assumption:** Admin users need the `.admin` suffix validation
- **Risk:** May need to verify all profile page locations are updated correctly

## Script Additions
None

## Files to Modify
- `/apps/web/src/components/profile/ProfileEditModal.tsx` - Restore to user version
- `/apps/web/src/components/profile/AdminProfileEditModal.tsx` - New file for admin version
- `/apps/web/src/app/[locale]/(console)/console/profile/page.tsx` - Update import

