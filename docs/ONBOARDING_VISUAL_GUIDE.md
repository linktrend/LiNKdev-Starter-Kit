# Onboarding Flow - Visual Guide

## 4-Step Flow Overview

```
┌────────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐
│   Step 1   │───▶│   Step 2   │───▶│   Step 3   │───▶│   Step 4   │
│   Create   │    │  Complete  │    │Preferences │    │  Welcome   │
│  Account   │    │  Profile   │    │            │    │& Resources │
└────────────┘    └────────────┘    └────────────┘    └────────────┘
     ↑                  │                  │                  │
     │                  │                  │                  │
Social/Email/         [Back]            [Back]          [Get Started]
Phone Options         [Skip]            [Skip]               ↓
                    [Continue]        [Continue]        Dashboard
```

---

## Step 1: Create Account ✅ (Keep Current)

```
╔═══════════════════════════════════════════════╗
║ Step 1 of 4: Create Account                  ║
║ ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░  25%  ║
╠═══════════════════════════════════════════════╣
║                                               ║
║          ✨ Welcome to LiNKdev Starter Kit        ║
║              Create your account              ║
║                                               ║
║  Use your existing information to create an   ║
║  account                                      ║
║                                               ║
║  ┌────────┐  ┌────────┐  ┌────────┐         ║
║  │   G    │  │   🍎   │  │   ⊞    │         ║
║  └────────┘  └────────┘  └────────┘         ║
║                                               ║
║                    OR                         ║
║                                               ║
║  ┌───────────────────────────────────────┐   ║
║  │      Continue with Email              │   ║
║  └───────────────────────────────────────┘   ║
║                                               ║
║  ┌───────────────────────────────────────┐   ║
║  │      Continue with Phone              │   ║
║  └───────────────────────────────────────┘   ║
║                                               ║
║  ☑ Accept Privacy Policy and Terms           ║
║                                               ║
╚═══════════════════════════════════════════════╝
```

**Features:**
- ✅ No back button (first step)
- ✅ No skip button
- ✅ Each option is self-contained button
- ✅ Progress: 1/4 (25%)

---

## Step 2: Complete Profile 📝 (NEW)

```
╔═══════════════════════════════════════════════╗
║ Step 2 of 4: Complete Profile                ║
║ ████████████████████████░░░░░░░░░░░░░░  50%  ║
╠═══════════════════════════════════════════════╣
║                                               ║
║  Personal Information ▲                       ║
║  ┌───────────────────────────────────────┐   ║
║  │ Display Name *     Username *         │   ║
║  │ [John Doe       ] [johndoe    ] ✅    │   ║
║  │                                       │   ║
║  │ Title  First * Middle  Last Name *   │   ║
║  │ [Mr.▼] [John  ] [M.  ] [Doe      ]   │   ║
║  │                                       │   ║
║  │ Email *              Phone            │   ║
║  │ [john@ex.com 🔒]    [+1][555-...  ]  │   ║
║  │                                       │   ║
║  │ ▼ Address (Optional)                 │   ║
║  └───────────────────────────────────────┘   ║
║                                               ║
║  About (Optional) ▼                           ║
║  [Collapsed by default]                       ║
║                                               ║
║  Business Information (Optional) ▼            ║
║  [Collapsed by default]                       ║
║                                               ║
╠═══════════════════════════════════════════════╣
║  [← Back]         [Skip]     [Continue →]    ║
╚═══════════════════════════════════════════════╝
```

**Key Features:**
- ✅ Username auto-suggested from email/phone
- ✅ Email OR phone pre-filled from Step 1
- ✅ Real-time username availability check
- ✅ Collapsible sections (About & Business)
- ✅ Back, Skip, and Continue buttons
- ✅ Progress: 2/4 (50%)

**Pre-filling Examples:**
```
Email signup:     john.doe@example.com
  → Email locked:   [john.doe@example.com 🔒]
  → Username:       johndoe (suggested)

Phone signup:     +1 555-123-4567
  → Phone locked:   [+1][555-123-4567 🔒]
  → Username:       user1234567 (suggested)
```

---

## Step 3: Preferences ⚙️ (ENHANCED)

```
╔═══════════════════════════════════════════════╗
║ Step 3 of 4: Customize Experience             ║
║ ████████████████████████████████████░  75%    ║
╠═══════════════════════════════════════════════╣
║                                               ║
║  Language & Region                            ║
║  ┌───────────────────────────────────────┐   ║
║  │ Language: [English            ▼]     │   ║
║  │ Timezone: [America/New_York   ▼]     │   ║
║  │ Date:     ○ MM/DD  ● DD/MM  ○ YYYY   │   ║
║  │ Time:     ● 12-hour  ○ 24-hour       │   ║
║  └───────────────────────────────────────┘   ║
║                                               ║
║  Notifications                                ║
║  ┌───────────────────────────────────────┐   ║
║  │ Email Notifications:                  │   ║
║  │ ☑ Product updates                    │   ║
║  │ ☑ Security alerts                    │   ║
║  │ ☐ Marketing emails                   │   ║
║  │                                       │   ║
║  │ Push Notifications:                   │   ║
║  │ ☑ Important updates                  │   ║
║  │ ☐ New features                       │   ║
║  │                                       │   ║
║  │ In-App:                               │   ║
║  │ ☑ System alerts                      │   ║
║  │ ☑ Activity updates                   │   ║
║  └───────────────────────────────────────┘   ║
║                                               ║
║  Appearance                                   ║
║  ┌───────────────────────────────────────┐   ║
║  │ Theme:   ○ Light  ● System  ○ Dark   │   ║
║  │ Density: ● Comfortable  ○ Compact    │   ║
║  └───────────────────────────────────────┘   ║
║                                               ║
║  Privacy & Security                           ║
║  ┌───────────────────────────────────────┐   ║
║  │ ☑ Allow analytics                    │   ║
║  │ ☐ Show profile publicly              │   ║
║  │ ☑ Enable 2FA                         │   ║
║  └───────────────────────────────────────┘   ║
║                                               ║
╠═══════════════════════════════════════════════╣
║  [← Back]         [Skip]     [Continue →]    ║
╚═══════════════════════════════════════════════╝
```

**Key Features:**
- ✅ Comprehensive settings from user settings page
- ✅ All fields optional with sensible defaults
- ✅ Organized into clear sections
- ✅ Back, Skip, and Continue buttons
- ✅ Progress: 3/4 (75%)

---

## Step 4: Welcome & Resources 🎉 (NEW DESIGN)

```
╔═══════════════════════════════════════════════╗
║ Step 4 of 4: Welcome & Resources              ║
║ ████████████████████████████████████████  100%║
╠═══════════════════════════════════════════════╣
║                                               ║
║                    ✨                         ║
║         Welcome to LiNKdev Starter Kit!           ║
║  Your account has been created successfully   ║
║                                               ║
║ ──────────────────────────────────────────── ║
║                                               ║
║  📚 Quick Links & Resources                   ║
║                                               ║
║  🚀 Getting Started Guide                     ║
║     Learn the basics and start your journey   ║
║     [View Guide →]                            ║
║                                               ║
║  📖 Documentation                             ║
║     Explore our comprehensive documentation   ║
║     [Browse Docs →]                           ║
║                                               ║
║  💬 Help Center                               ║
║     Find answers to common questions          ║
║     [Get Help →]                              ║
║                                               ║
║  🎓 Video Tutorials                           ║
║     Watch step-by-step video guides           ║
║     [Watch Videos →]                          ║
║                                               ║
║  👥 Community Forum                           ║
║     Connect with other users                  ║
║     [Join Community →]                        ║
║                                               ║
║ ──────────────────────────────────────────── ║
║                                               ║
║  🎁 Special Offers                            ║
║                                               ║
║  ┌───────────────────────────────────────┐   ║
║  │ 🎯 Refer a Friend                     │   ║
║  │ Share LiNKdev Starter Kit and earn       │   ║
║  │ rewards when they sign up!           │   ║
║  │                                       │   ║
║  │ Your referral link:                  │   ║
║  │ ┌─────────────────────────────────┐  │   ║
║  │ │ https://ltm.app/ref/johndoe  📋 │  │   ║
║  │ └─────────────────────────────────┘  │   ║
║  │                                       │   ║
║  │ [Copy Link] [Share via Email]        │   ║
║  └───────────────────────────────────────┘   ║
║                                               ║
║  ┌───────────────────────────────────────┐   ║
║  │ 💎 Premium Features                   │   ║
║  │ Upgrade to unlock advanced features   │   ║
║  │                                       │   ║
║  │ ✓ Unlimited projects                 │   ║
║  │ ✓ Advanced analytics                 │   ║
║  │ ✓ Priority support                   │   ║
║  │ ✓ Custom integrations                │   ║
║  │                                       │   ║
║  │ Special: 20% off for new users!      │   ║
║  │ [Explore Plans →]                    │   ║
║  └───────────────────────────────────────┘   ║
║                                               ║
║  ┌───────────────────────────────────────┐   ║
║  │ 🎓 Free Onboarding Session            │   ║
║  │ Schedule a 30-min call with our team │   ║
║  │ [Schedule Call →]                    │   ║
║  └───────────────────────────────────────┘   ║
║                                               ║
╠═══════════════════════════════════════════════╣
║                                               ║
║       [Get Started to Dashboard →]            ║
║                                               ║
╚═══════════════════════════════════════════════╝
```

**Key Features:**
- ✅ Success message with icon
- ✅ Quick Links section (5 helpful resources)
- ✅ Special Offers section:
  - Refer a friend with shareable link
  - Premium upgrade offer (20% off)
  - Free onboarding session
- ✅ Large "Get Started" CTA button
- ✅ No back/skip (final step)
- ✅ Progress: 4/4 (100%)

---

## Progress Bar States

```
Step 1:  ██████░░░░░░░░░░░░░░░░  25%
Step 2:  ████████████░░░░░░░░░░  50%
Step 3:  ██████████████████░░░░  75%
Step 4:  ████████████████████████ 100%
```

---

## Button Layout Specifications

### Step 1 (Create Account):
```
No explicit navigation buttons
Each authentication method is a button
```

### Steps 2 & 3 (Profile & Preferences):
```
┌─────────────────────────────────────────────┐
│                                             │
│  [← Back]         [Skip]     [Continue →]  │
│   (ghost)       (outline)     (primary)    │
│                                             │
└─────────────────────────────────────────────┘

Layout:
- Back: Left aligned, ghost variant
- Skip + Continue: Right aligned, grouped
- Skip: Outline variant
- Continue: Primary variant (prominent)
```

### Step 4 (Welcome):
```
┌─────────────────────────────────────────────┐
│                                             │
│   [Get Started to Dashboard →]             │
│         (primary, large, full-width)       │
│                                             │
└─────────────────────────────────────────────┘

Layout:
- Single large button
- Full width or centered
- Primary variant
- Obvious call-to-action
```

---

## Mobile Responsive Behavior

### Step 1:
```
╔════════════════════╗
║ Step 1 of 4        ║
║ ██████░░░░░░  25%  ║
╠════════════════════╣
║      Welcome       ║
║                    ║
║ ┌────────────────┐ ║
║ │   Google   G   │ ║
║ └────────────────┘ ║
║ ┌────────────────┐ ║
║ │   Apple    🍎  │ ║
║ └────────────────┘ ║
║ ┌────────────────┐ ║
║ │ Microsoft  ⊞   │ ║
║ └────────────────┘ ║
║                    ║
║       OR           ║
║                    ║
║ ┌────────────────┐ ║
║ │Continue w/Email│ ║
║ └────────────────┘ ║
║ ┌────────────────┐ ║
║ │Continue w/Phone│ ║
║ └────────────────┘ ║
╚════════════════════╝
```

### Step 2:
```
╔════════════════════╗
║ Step 2 of 4        ║
║ ████████░░░░  50%  ║
╠════════════════════╣
║ Personal Info ▲    ║
║                    ║
║ Display Name *     ║
║ ┌────────────────┐ ║
║ │ John Doe       │ ║
║ └────────────────┘ ║
║                    ║
║ Username *         ║
║ ┌────────────────┐ ║
║ │ johndoe    ✅  │ ║
║ └────────────────┘ ║
║                    ║
║ First Name *       ║
║ ┌────────────────┐ ║
║ │ John           │ ║
║ └────────────────┘ ║
║                    ║
║ [... more fields]  ║
║                    ║
║ About ▼            ║
║ Business Info ▼    ║
║                    ║
╠════════════════════╣
║ [← Back]           ║
║ [Skip][Continue →] ║
╚════════════════════╝
```

---

## Color & Style Guide

### Progress Bar:
- **Filled:** `bg-primary` (theme primary color)
- **Unfilled:** `bg-muted` (light gray)
- **Height:** `h-2` (8px)
- **Border radius:** `rounded-full`

### Buttons:
- **Primary (Continue):** `bg-primary text-primary-foreground`
- **Outline (Skip):** `border border-input bg-background`
- **Ghost (Back):** `hover:bg-accent hover:text-accent-foreground`

### Icons:
- **Size:** `h-5 w-5` for inline icons
- **Size:** `h-8 w-8` for main icons (welcome screen)
- **Color:** `text-primary` for brand icons
- **Color:** `text-muted-foreground` for utility icons

### Sections:
- **Expanded:** Arrow up ▲
- **Collapsed:** Arrow down ▼
- **Optional:** Gray text "(Optional)"
- **Locked fields:** 🔒 icon, muted background

---

## Data Pre-filling Examples

### Scenario 1: Email Signup
```
Step 1: User enters: john.doe@example.com

Step 2 Pre-fills:
- Username: johndoe (editable)
- Email: john.doe@example.com (locked 🔒)
- Phone: (empty, editable)
```

### Scenario 2: Phone Signup
```
Step 1: User enters: +1 555-123-4567

Step 2 Pre-fills:
- Username: user1234567 (editable)
- Email: (empty, editable)
- Phone: +1 555-123-4567 (locked 🔒)
```

### Scenario 3: Google Social Login
```
Step 1: User logs in with Google
        System receives: john.doe@gmail.com

Step 2 Pre-fills:
- Username: johndoe (editable)
- Email: john.doe@gmail.com (locked 🔒)
- Phone: (empty, editable)
```

---

## User Flow Diagram

```
START
  │
  ▼
┌─────────────────┐
│   Landing Page  │
│  "Sign Up Now"  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Step 1: Create Account          │
│ - Choose auth method            │
│ - Enter email OR phone          │
│ - Accept terms                  │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Step 2: Complete Profile        │
│ - Auto-suggest username         │
│ - Pre-fill email/phone          │
│ - Enter name details            │
│ - Optional: About & Business    │
│                                 │
│ Options:                        │
│ ← Back to Step 1                │
│ Skip → Step 3                   │
│ Continue → Step 3               │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Step 3: Preferences             │
│ - Set language/timezone         │
│ - Configure notifications       │
│ - Choose theme                  │
│ - Privacy settings              │
│                                 │
│ Options:                        │
│ ← Back to Step 2                │
│ Skip → Step 4                   │
│ Continue → Step 4               │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Step 4: Welcome & Resources     │
│ - Success message               │
│ - Quick links to help           │
│ - Special offers                │
│ - Refer a friend                │
│                                 │
│ [Get Started] → Dashboard       │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────┐
│   Dashboard     │
│   (Main App)    │
└─────────────────┘
```

---

## Skip Behavior

### Step 2 (Profile):
**If skipped:**
- Username: Uses auto-generated suggestion
- Name fields: Extracted from email if possible, otherwise prompts later
- Other fields: Empty (can be filled in profile settings)

### Step 3 (Preferences):
**If skipped:**
- All settings use default values
- Can be changed later in user settings

**Users can always update:**
- Profile → User Settings → Profile
- Preferences → User Settings → Preferences

---

## Success Metrics

Track the following in analytics:

1. **Completion Rate by Step:**
   - % users completing Step 1
   - % users completing Step 2
   - % users completing Step 3
   - % users completing Step 4

2. **Skip Rate:**
   - % users skipping Step 2
   - % users skipping Step 3

3. **Time Spent:**
   - Average time on each step
   - Total onboarding time

4. **Drop-off Points:**
   - Where users abandon onboarding
   - Most common exit point

5. **Feature Engagement (Step 4):**
   - % clicking help links
   - % using referral link
   - % exploring premium features

---

## Accessibility Considerations

- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ Screen reader friendly labels
- ✅ ARIA attributes for progress
- ✅ Clear focus indicators
- ✅ Sufficient color contrast
- ✅ Error messages announced
- ✅ Skip links for each section

