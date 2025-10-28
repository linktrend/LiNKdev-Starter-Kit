# Modal Theme Fix - Light/Dark Mode Support

## Summary
Fixed all modals across the application to properly support both light and dark themes by removing hardcoded `text-white` classes and replacing them with theme-aware Tailwind classes.

## Changes Made

### 1. Global CSS Updates
**File:** `apps/web/src/styles/globals.css`

Updated the `.modal-bg` utility class to include foreground color:
```css
.modal-bg {
  background-color: hsl(var(--card));
  color: hsl(var(--card-foreground));  /* Added this line */
  opacity: 1;
}
```

This ensures all modals automatically inherit the correct text color for their theme.

### 2. Modal Container Updates
**Affected:** 25 modal files

Removed `text-white` from all modal container divs:
- **Before:** `className="... modal-bg text-white"`
- **After:** `className="... modal-bg"`

### 3. Text Color Replacements
Replaced all hardcoded `text-white` instances with theme-aware classes:

| Old Class | New Class | Usage |
|-----------|-----------|-------|
| `text-white` | `text-foreground` | Primary text |
| `text-white` | `text-muted-foreground` | Secondary/muted text |
| `text-white` | `text-card-foreground` | Text on card backgrounds |
| `text-white` | `text-primary-foreground` | Text on primary backgrounds |
| `text-white/70` | `text-muted-foreground/70` | Semi-transparent text |

### 4. Interactive Element Updates
- **Close Buttons:** `text-white hover:text-white` → `text-muted-foreground hover:text-foreground`
- **Icons:** `text-white` → `text-foreground` or `text-muted-foreground`
- **Input/Select Elements:** `bg-background text-white` → `bg-background text-foreground`
- **Placeholder Text:** `placeholder:text-white` → `placeholder:text-muted-foreground`

### 5. Hardcoded Color Cleanup
Replaced hardcoded color values with theme variables:
- `text-[#1a1f5c]` → `text-primary`
- `bg-[#1a1f5c]` → `bg-primary`
- `border-[#1a1f5c]` → `border-primary`
- `bg-white text-white` → `bg-background text-foreground`

## Files Modified

### Settings Modals (15 files)
- `APIKeysModal.tsx`
- `AppearanceModal.tsx`
- `BiometricLoginModal.tsx`
- `DataSettingsModal.tsx`
- `Edit2FAModal.tsx`
- `EditPasswordModal.tsx`
- `ImportExportModal.tsx`
- `IntegrationsModal.tsx`
- `LocaleSettingsModal.tsx`
- `ManageBillingModal.tsx`
- `ManagePermissionsModal.tsx`
- `NotificationPreferencesModal.tsx`
- `PrivacySettingsModal.tsx`
- `SessionsActivityModal.tsx`
- `TwoFactorModal.tsx`
- `UpgradeModal.tsx`
- `UsageDashboardModal.tsx`

### Help Modals (7 files)
- `FeatureRequestModal.tsx`
- `LiveChatModal.tsx`
- `ReleaseNotesModal.tsx`
- `ReportBugModal.tsx`
- `ScheduleCallModal.tsx`
- `SubmitTicketModal.tsx`
- `UserSurveyModal.tsx`

### Generic Modals (2 files)
- `LogoutConfirmModal.tsx`
- `SwitchAccountModal.tsx`

### CSS Files (1 file)
- `globals.css`

## Testing Recommendations

1. **Visual Testing:**
   - Toggle between light and dark themes in Settings → Appearance
   - Open each modal in both themes
   - Verify text is readable with proper contrast
   - Check that all interactive elements (buttons, inputs) are visible

2. **Key Areas to Test:**
   - Billing & Plans modal (has complex pricing cards)
   - Appearance modal (has theme selector)
   - Schedule Call modal (has date/time pickers)
   - Import/Export modal (has tabs)
   - Password modals (have visibility toggles)

3. **Browser Testing:**
   - Test in Chrome, Firefox, Safari
   - Test on mobile viewport sizes

## Benefits

1. **Consistency:** All modals now follow the same theme system
2. **Maintainability:** Future modals will automatically work with both themes
3. **Accessibility:** Proper contrast ratios in both light and dark modes
4. **User Experience:** No more invisible text in light mode

## Notes

- No TypeScript errors introduced
- No breaking changes to functionality
- All changes are purely visual/styling
- Backwards compatible with existing theme switching logic

