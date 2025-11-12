# Batch Header: Enhance User Profile Edit Modal

**Date:** 2025-11-10  
**Scope:** 2 hours  
**Task:** Add collapsible sections and new fields to user profile edit modal

## Inputs
- Current ProfileEditModal component for users
- Requirements for new sections and fields
- LinkedIn-style education and work experience sections

## Requirements

### Changes to Personal Information Section
- Make email and phone number editable (remove readonly/disabled states)
- Add collapsible functionality with arrow icon
- Default state: expanded (not collapsed)

### New Section: About (Collapsible, Optional)
- **Bio** - Text area for user biography
- **Education** - Dynamic list of education entries (like LinkedIn)
  - Institution name
  - Degree/Field of study
  - Start date / End date
  - Add/Remove functionality
- **Work Experience** - Dynamic list of work experience entries (like LinkedIn)
  - Company name
  - Position/Title
  - Start date / End date
  - Description (optional)
  - Add/Remove functionality

### New Section: Business Information (Collapsible, Optional)
- **Position** - Text input
- **Company Name** - Text input (beside Position)
- **Address Fields** (same as Personal Information):
  - Apartment/Suite
  - Street Address
  - Street Address 2
  - City
  - State/Region
  - Postal Code
  - Country

## Plan
1. Add collapsible section component/logic
2. Update Personal Information section to be collapsible
3. Make email and phone editable
4. Create About section with Bio field
5. Add dynamic Education entries with add/remove
6. Add dynamic Work Experience entries with add/remove
7. Create Business Information section with position, company, and address fields
8. Update form state management to handle new fields
9. Test all collapsible sections
10. Verify form submission includes all new fields

## Risks & Assumptions
- **Assumption:** Only the user ProfileEditModal needs changes, not AdminProfileEditModal
- **Assumption:** All new fields are optional (not required)
- **Risk:** Form state management may become complex with dynamic arrays
- **Risk:** Modal height may need scrolling with all sections expanded

## Script Additions
None

## Files to Modify
- `/apps/web/src/components/profile/ProfileEditModal.tsx` - Add new sections and fields

