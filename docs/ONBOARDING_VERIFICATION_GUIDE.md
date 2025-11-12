# Onboarding Verification Guide

## Quick Start

### 1. Start the Development Server
```bash
cd /Users/carlossalas/Projects/LTM-Starter-Kit/apps/web
pnpm dev
```

### 2. Navigate to Onboarding
Open your browser to:
```
http://localhost:3001/en/onboarding
```

### 3. Test Signup Redirect
Also verify the legacy signup redirects:
```
http://localhost:3001/en/signup
```
Should automatically redirect to `/en/onboarding`

---

## Step-by-Step Verification

### ✅ Step 1: Create Account

#### What to Check:
1. **Header**
   - [ ] "Welcome!" title with Sparkles icon displays
   - [ ] "Let's get you started" subtitle displays

2. **Progress Bar**
   - [ ] Shows "Step 1 of 4: Create Account"
   - [ ] Progress bar shows 25%
   - [ ] Progress bar is blue/primary color

3. **Card Title**
   - [ ] "Create Account" title
   - [ ] "Sign in with your preferred method" description

4. **Social Login Buttons**
   - [ ] Three buttons: Gmail, Apple, Microsoft
   - [ ] Buttons have correct icons
   - [ ] Buttons are clickable
   - [ ] Hover effect works

5. **Email Section**
   - [ ] "OR" divider displays
   - [ ] Email input field
   - [ ] "Continue with Email" button
   - [ ] Button is disabled when email is empty

6. **Phone Section**
   - [ ] "OR" divider displays
   - [ ] Phone input field
   - [ ] "Continue with Phone" button
   - [ ] Button is disabled when phone is empty

7. **Terms Checkbox**
   - [ ] Checkbox displays
   - [ ] "By continuing, you accept..." text
   - [ ] Checkbox must be checked to continue

8. **Functionality**
   - [ ] Clicking social button navigates to Step 2
   - [ ] Entering email + checking terms + clicking Continue navigates to Step 2
   - [ ] Entering phone + checking terms + clicking Continue navigates to Step 2

---

### ✅ Step 2: Complete Profile

#### What to Check:
1. **Progress Bar**
   - [ ] Shows "Step 2 of 4: Complete Profile"
   - [ ] Progress bar shows 50%

2. **Card Title**
   - [ ] "Complete Profile" title
   - [ ] "Tell us about yourself" description

3. **Personal Information Section**
   - [ ] Section title "Personal Information" with chevron
   - [ ] Section is expanded by default
   - [ ] Clicking title collapses/expands section

4. **Username & Display Name**
   - [ ] Username is auto-filled (from email/phone)
   - [ ] Display name input is empty
   - [ ] Username shows availability check (✓ or ✗)
   - [ ] Typing in username triggers availability check

5. **Name Fields**
   - [ ] Title dropdown (Mr., Mrs., Ms., etc.)
   - [ ] First Name input (required)
   - [ ] Middle Name input (optional)
   - [ ] Last Name input (required)

6. **Contact Fields**
   - [ ] Email input
   - [ ] If auth method was email, email is locked (grayed out)
   - [ ] Phone input
   - [ ] If auth method was phone, phone is locked (grayed out)

7. **Address Fields**
   - [ ] "Add address (Optional)" collapsible link
   - [ ] Clicking expands address fields
   - [ ] Apt/Suite, Street Address, City, State, Postal Code, Country

8. **About Section**
   - [ ] Section title "About (Optional)" with chevron
   - [ ] Section is collapsed by default
   - [ ] Clicking title expands section
   - [ ] Bio textarea
   - [ ] Note about adding education/work later

9. **Business Information Section**
   - [ ] Section title "Business Information (Optional)" with chevron
   - [ ] Section is collapsed by default
   - [ ] Position and Company Name fields side-by-side

10. **Navigation Buttons**
    - [ ] Back button (left side)
    - [ ] Skip button (right side)
    - [ ] Continue button (right side)
    - [ ] Continue is disabled until required fields filled

11. **Functionality**
    - [ ] Back button returns to Step 1
    - [ ] Skip button goes to Step 3
    - [ ] Continue button (when enabled) goes to Step 3

---

### ✅ Step 3: Set Preferences

#### What to Check:
1. **Progress Bar**
   - [ ] Shows "Step 3 of 4: Set Preferences"
   - [ ] Progress bar shows 75%

2. **Card Title**
   - [ ] "Set Preferences" title
   - [ ] "Customize your experience" description

3. **Language & Region Section**
   - [ ] Section title with chevron
   - [ ] Section is expanded by default
   - [ ] Language dropdown (7 languages)
   - [ ] Timezone dropdown
   - [ ] Date format dropdown (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD)
   - [ ] Time format dropdown (12h, 24h)

4. **Notifications Section**
   - [ ] Section title with chevron
   - [ ] Section is collapsed by default
   - [ ] Email Notifications subsection
     - [ ] Product Updates switch
     - [ ] Security Alerts switch
     - [ ] Marketing switch
   - [ ] Push Notifications subsection
     - [ ] Important Updates switch
     - [ ] New Features switch

5. **Appearance Section**
   - [ ] Section title with chevron
   - [ ] Section is collapsed by default
   - [ ] Theme dropdown (Light, Dark, System)
   - [ ] Display Density dropdown (Comfortable, Compact, Spacious)

6. **Privacy & Security Section**
   - [ ] Section title with chevron
   - [ ] Section is collapsed by default
   - [ ] Allow Analytics switch
   - [ ] Show Profile switch

7. **Navigation Buttons**
   - [ ] Back button (left side)
   - [ ] Skip button (right side)
   - [ ] Continue button (right side)
   - [ ] All buttons are enabled (no required fields)

8. **Functionality**
   - [ ] All switches toggle correctly
   - [ ] All dropdowns update state
   - [ ] Back button returns to Step 2
   - [ ] Skip button goes to Step 4
   - [ ] Continue button goes to Step 4

---

### ✅ Step 4: Welcome

#### What to Check:
1. **Progress Bar**
   - [ ] Shows "Step 4 of 4: Welcome"
   - [ ] Progress bar shows 100%

2. **Card Title**
   - [ ] "Welcome" title
   - [ ] "You're all set!" description

3. **Welcome Message**
   - [ ] Personalized greeting with user's name
   - [ ] "You're all set!" message
   - [ ] Emoji displays

4. **Quick Links Card**
   - [ ] Card title "Quick Links" with icon
   - [ ] 5 resource links:
     - [ ] Getting Started Guide
     - [ ] Video Tutorials
     - [ ] Documentation
     - [ ] Community Forum
     - [ ] Support Center
   - [ ] Each link has icon, title, description, and arrow
   - [ ] Hover effect works

5. **Special Offers Card**
   - [ ] Card title "Special Offers" with icon
   - [ ] 3 offers:
     - [ ] Refer a Friend (with badge "Earn $10")
     - [ ] Premium Trial (with badge "20% OFF")
     - [ ] Free Onboarding Call (with badge "Limited")
   - [ ] Each offer has icon, title, description, and badge

6. **Refer a Friend**
   - [ ] Referral link input (read-only)
   - [ ] Copy button
   - [ ] Clicking Copy changes to "Copied" with checkmark
   - [ ] Link is copied to clipboard

7. **Other Offers**
   - [ ] "Claim Discount" button for Premium Trial
   - [ ] "Schedule Now" button for Onboarding Call

8. **Navigation Buttons**
   - [ ] Back button (left side)
   - [ ] "Get Started" button (right side, larger)

9. **Functionality**
   - [ ] Back button returns to Step 3
   - [ ] Get Started navigates to `/en/dashboard`

---

## Mobile Responsiveness

### Test on Mobile/Small Screen (< 768px)
1. **Step 1**
   - [ ] Social buttons stack vertically or wrap
   - [ ] Form inputs are full width
   - [ ] Text is readable

2. **Step 2**
   - [ ] Name fields stack vertically
   - [ ] Email/Phone fields stack vertically
   - [ ] Navigation buttons stack or wrap

3. **Step 3**
   - [ ] Language/Timezone fields stack vertically
   - [ ] Switches are easy to tap
   - [ ] Collapsible sections work

4. **Step 4**
   - [ ] Quick links stack vertically
   - [ ] Offers stack vertically
   - [ ] Referral link input is responsive

---

## Browser Compatibility

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## Accessibility

1. **Keyboard Navigation**
   - [ ] Tab through all interactive elements
   - [ ] Enter/Space activates buttons
   - [ ] Focus indicators visible

2. **Screen Reader**
   - [ ] All buttons have proper labels
   - [ ] Form inputs have labels
   - [ ] Error messages are announced

3. **Color Contrast**
   - [ ] Text is readable on all backgrounds
   - [ ] Disabled states are distinguishable

---

## Error Scenarios

### Step 1
- [ ] Try to continue without email/phone → Button disabled
- [ ] Try to continue without accepting terms → Button disabled

### Step 2
- [ ] Try to continue without required fields → Button disabled
- [ ] Enter username that starts with "john" or "test" → Shows "Username not available"

### Step 3
- [ ] All fields optional → Continue always enabled

### Step 4
- [ ] Click Copy button multiple times → Works correctly

---

## Console Checks

Open browser DevTools Console and verify:
- [ ] No JavaScript errors
- [ ] No React warnings
- [ ] No 404 errors for resources

---

## TypeScript Checks

Run TypeScript compiler:
```bash
cd apps/web
npx tsc --noEmit
```
- [ ] No TypeScript errors

---

## Linter Checks

Run ESLint:
```bash
cd apps/web
pnpm lint
```
- [ ] No linting errors

---

## Build Check

Verify production build works:
```bash
cd apps/web
pnpm build
```
- [ ] Build completes successfully
- [ ] No build errors

---

## Data Persistence Check

1. Fill out Step 2 completely
2. Navigate to Step 3
3. Click Back to Step 2
4. Verify all data is still there
5. Navigate forward to Step 4
6. Click Back multiple times
7. Verify data persists throughout navigation

---

## Edge Cases

### Username Generation
- [ ] Test with email: `john.doe@example.com` → username: `johndoe`
- [ ] Test with phone: `+1 (555) 123-4567` → username: `user1234567`
- [ ] Test with social login → username generated from mock email

### Pre-filling
- [ ] Sign up with email → Step 2 email is locked
- [ ] Sign up with phone → Step 2 phone is locked
- [ ] Sign up with social → Step 2 email is locked with social provider email

### Collapsible Sections
- [ ] Collapse all sections in Step 2 → Still can submit
- [ ] Expand all sections → All fields visible
- [ ] Collapse/expand multiple times → No glitches

---

## Performance

1. **Initial Load**
   - [ ] Page loads in < 2 seconds
   - [ ] No layout shift

2. **Navigation**
   - [ ] Step transitions are smooth
   - [ ] No lag when typing

3. **Username Check**
   - [ ] Debounced (doesn't check on every keystroke)
   - [ ] Shows loading state

---

## Final Checklist

- [ ] All 4 steps render correctly
- [ ] Progress bar updates correctly
- [ ] All navigation buttons work
- [ ] All form inputs work
- [ ] All collapsible sections work
- [ ] Mobile responsive
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] No linter warnings
- [ ] Build succeeds
- [ ] Data persists during navigation
- [ ] Redirects work (signup → onboarding)
- [ ] Final "Get Started" navigates to dashboard

---

## Sign-Off

**Tested By:** _______________
**Date:** _______________
**Status:** ⬜ PASS | ⬜ FAIL
**Notes:**

---

## Issues Found

| Issue | Severity | Step | Description | Status |
|-------|----------|------|-------------|--------|
| 1     |          |      |             |        |
| 2     |          |      |             |        |
| 3     |          |      |             |        |

---

## Next Steps After Verification

1. ✅ Fix any issues found
2. ✅ Backend integration
3. ✅ User acceptance testing
4. ✅ Deploy to staging
5. ✅ Production deployment

