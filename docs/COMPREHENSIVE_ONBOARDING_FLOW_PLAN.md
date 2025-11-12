# Comprehensive Onboarding Flow Plan

**Date:** 2025-11-10  
**Task:** Complete redesign of 4-step onboarding process

---

## Current State vs Target State

### Current Flow (4 steps - from screenshots):
1. **Create Account** - Social login, email, or phone
2. **Profile Details** - Full Name, Company, Role (simple)
3. **Preferences** - Language, Notifications
4. **Welcome** - Success message with "Get Started" button

### Target Flow (4 steps - REVISED):
1. **Create Account** - Social login, email, or phone ✅ (Keep as-is)
2. **Complete Profile** - Full profile form (like user edit profile)
3. **Preferences** - User settings options (comprehensive)
4. **Welcome & Resources** - Help links + Offers (refer a friend, etc.)

---

## Detailed Step-by-Step Plan

## 🎯 Step 1: Create Account (Keep Current Design)

**Title:** "Welcome to LTM Starter Kit"  
**Subtitle:** "Create your account"

**Content:**
- Social login buttons (Google, Apple, Microsoft)
- OR divider
- "Continue with Email" button
- "Continue with Phone" button

**Progress:** 1/4  
**Buttons:** Only "Continue" (integrated into each option)

**No changes needed** - Current implementation is good!

---

## 📝 Step 2: Complete Profile (MAJOR CHANGES)

**Title:** "Complete Your Profile"  
**Subtitle:** "Tell us about yourself to personalize your experience"

**Progress:** 2/4  
**Buttons:** 
- **Back** (left) - Returns to Step 1
- **Skip** (center-left) - Moves to Step 3
- **Continue** (right, primary) - Validates and moves to Step 3

### Content Structure:

#### Section 1: Personal Information (Collapsible, Default: Expanded)

**Pre-filled Fields:**
- **Username** (auto-suggested, editable)
  - From email: `john.doe@example.com` → `johndoe`
  - From phone: `+1 5551234567` → `user1234567`
  - Real-time availability check with visual feedback
- **Email** (pre-filled if auth method was email, read-only)
- **Phone** (pre-filled if auth method was phone, read-only)

**User Input Fields:**
```
┌─────────────────────────────────────────────┐
│ Personal Information ▲                      │
├─────────────────────────────────────────────┤
│ Display Name *    │ Username *              │
│ [John Doe        ]│ [johndoe    ] ✅ Avail. │
│                                             │
│ Title │ First Name *  │ Middle │ Last Name *│
│ [Mr.▼]│ [John        ]│ [M.   ]│ [Doe      ]│
│                                             │
│ Email *                   │ Phone           │
│ [john.doe@example.com   ]│ [+1] [555...  ] │
│ (locked if pre-filled)    │ (locked if pre) │
│                                             │
│ ┌─ Click to add address (Optional) ─┐      │
│ │ Apt/Suite │ Street Address         │      │
│ │ Street Address 2                   │      │
│ │ City │ State │ Zip │ Country       │      │
│ └────────────────────────────────────┘      │
└─────────────────────────────────────────────┘
```

#### Section 2: About (Collapsible, Default: Collapsed, Optional)

```
┌─────────────────────────────────────────────┐
│ About (Optional) ▼                          │
├─────────────────────────────────────────────┤
│ Bio                                         │
│ ┌─────────────────────────────────────────┐ │
│ │ Tell us about yourself...               │ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Education              [+ Add Education]    │
│ ┌─────────────────────────────────────┐    │
│ │ Education 1                    [🗑️] │    │
│ │ Institution: [Stanford Univ.     ]  │    │
│ │ Degree: [BS Computer Science     ]  │    │
│ │ Start: [2015] End: [2019]           │    │
│ └─────────────────────────────────────┘    │
│                                             │
│ Work Experience        [+ Add Experience]   │
│ ┌─────────────────────────────────────┐    │
│ │ Experience 1                   [🗑️] │    │
│ │ Position: [Designer] Company: [Co] │    │
│ │ Start: [2019] End: [2021]          │    │
│ │ Description: [...]                  │    │
│ └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

#### Section 3: Business Information (Collapsible, Default: Collapsed, Optional)

```
┌─────────────────────────────────────────────┐
│ Business Information (Optional) ▼           │
├─────────────────────────────────────────────┤
│ Position          │ Company Name            │
│ [Sr. Designer    ]│ [Tech Corp            ] │
│                                             │
│ Business Address (Optional)                 │
│ Apt/Suite │ Street Address                  │
│ Street Address 2                            │
│ City │ State │ Zip │ Country                │
└─────────────────────────────────────────────┘
```

**Validation:**
- Required: Username, Display Name, First Name, Last Name, Email OR Phone
- Username must be unique (real-time check)
- All other fields optional

---

## ⚙️ Step 3: Preferences (ENHANCED)

**Title:** "Customize Your Experience"  
**Subtitle:** "Set your preferences (all optional)"

**Progress:** 3/4  
**Buttons:**
- **Back** (left) - Returns to Step 2
- **Skip** (center-left) - Moves to Step 4
- **Continue** (right, primary) - Saves and moves to Step 4

### Content Structure:

#### All User Settings Options (matching dashboard/settings)

```
┌─────────────────────────────────────────────┐
│ Language & Region                           │
├─────────────────────────────────────────────┤
│ Preferred Language                          │
│ [English                            ▼]     │
│                                             │
│ Timezone                                    │
│ [America/New_York (EST)             ▼]     │
│                                             │
│ Date Format                                 │
│ ○ MM/DD/YYYY  ○ DD/MM/YYYY  ○ YYYY-MM-DD  │
│                                             │
│ Time Format                                 │
│ ○ 12-hour (AM/PM)  ○ 24-hour              │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Notifications                               │
├─────────────────────────────────────────────┤
│ Email Notifications                         │
│ ☑ Product updates and announcements        │
│ ☑ Security alerts                          │
│ ☐ Marketing emails                         │
│ ☐ Weekly digest                            │
│                                             │
│ Push Notifications                          │
│ ☑ Important updates                        │
│ ☐ New features                             │
│ ☐ Tips and recommendations                 │
│                                             │
│ In-App Notifications                       │
│ ☑ System alerts                            │
│ ☑ Activity updates                         │
│ ☐ Suggestions                              │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Appearance                                  │
├─────────────────────────────────────────────┤
│ Theme                                       │
│ ○ Light  ● System  ○ Dark                  │
│                                             │
│ Display Density                            │
│ ○ Comfortable  ● Compact  ○ Spacious       │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Privacy & Security                          │
├─────────────────────────────────────────────┤
│ ☑ Allow analytics to improve experience    │
│ ☐ Show my profile to other users          │
│ ☑ Enable two-factor authentication         │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Communication Preferences                   │
├─────────────────────────────────────────────┤
│ How would you like us to contact you?      │
│ ☑ Email                                    │
│ ☐ SMS                                      │
│ ☑ In-app messages                          │
└─────────────────────────────────────────────┘
```

**Key Features:**
- All settings optional (reasonable defaults set)
- Organized into clear sections
- Visual icons for each section
- Toggle switches for boolean options
- Dropdown for select options
- Radio buttons for exclusive choices

---

## 🎉 Step 4: Welcome & Resources (NEW DESIGN)

**Title:** "Welcome to LTM Starter Kit!"  
**Subtitle:** "Your account has been created successfully"

**Progress:** 4/4  
**Buttons:**
- **Get Started** (large, primary) - Navigates to dashboard

### Content Structure:

```
┌─────────────────────────────────────────────┐
│             ✨                              │
│     Welcome to LTM Starter Kit!            │
│  Your account has been created successfully │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  📚 Quick Links & Resources                │
│  ─────────────────────────────────────────  │
│                                             │
│  🚀 Getting Started Guide                  │
│  Learn the basics and start your journey   │
│  [View Guide →]                            │
│                                             │
│  📖 Documentation                          │
│  Explore our comprehensive documentation   │
│  [Browse Docs →]                           │
│                                             │
│  💬 Help Center                            │
│  Find answers to common questions          │
│  [Get Help →]                              │
│                                             │
│  🎓 Video Tutorials                        │
│  Watch step-by-step video guides          │
│  [Watch Videos →]                          │
│                                             │
│  👥 Community Forum                        │
│  Connect with other users                  │
│  [Join Community →]                        │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  🎁 Special Offers                         │
│  ─────────────────────────────────────────  │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 🎯 Refer a Friend                   │   │
│  │ Share LTM Starter Kit and earn     │   │
│  │ rewards when they sign up!         │   │
│  │                                     │   │
│  │ Your referral link:                │   │
│  │ ┌───────────────────────────────┐  │   │
│  │ │ https://ltm.app/ref/johndoe  📋│  │   │
│  │ └───────────────────────────────┘  │   │
│  │                                     │   │
│  │ [Copy Link] [Share via Email]      │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 💎 Premium Features                 │   │
│  │ Upgrade to unlock advanced features│   │
│  │                                     │   │
│  │ ✓ Unlimited projects               │   │
│  │ ✓ Advanced analytics               │   │
│  │ ✓ Priority support                 │   │
│  │ ✓ Custom integrations              │   │
│  │                                     │   │
│  │ Special: 20% off for new users!    │   │
│  │ [Explore Plans →]                  │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 🎓 Free Onboarding Session          │   │
│  │ Schedule a 30-minute call with our │   │
│  │ team to get personalized guidance  │   │
│  │                                     │   │
│  │ [Schedule Call →]                  │   │
│  └─────────────────────────────────────┘   │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│         [Get Started to Dashboard]         │
│                                             │
└─────────────────────────────────────────────┘
```

**Key Features:**
- Success icon and congratulatory message
- Quick links section with helpful resources
- Special offers section with:
  - Refer a friend (with shareable link)
  - Premium upgrade offer
  - Free onboarding session
- Large primary CTA to dashboard

---

## 📊 Progress Bar Component

**Specification:**

```tsx
┌─────────────────────────────────────────────┐
│  Step 1 of 4: Create Account               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
└─────────────────────────────────────────────┘
```

**Design:**
- Shows "Step X of 4: [Step Name]"
- Progress bar with filled portion in primary color
- Unfilled portion in muted color
- Appears at top of every card (Steps 1-4)
- Smooth animation when transitioning

**Implementation:**
```tsx
<div className="mb-6">
  <div className="flex items-center justify-between mb-2">
    <span className="text-sm font-medium text-muted-foreground">
      Step {currentStep} of 4: {stepTitle}
    </span>
    <span className="text-sm text-muted-foreground">
      {Math.round((currentStep / 4) * 100)}%
    </span>
  </div>
  <div className="w-full bg-muted rounded-full h-2">
    <div 
      className="bg-primary h-2 rounded-full transition-all duration-300"
      style={{ width: `${(currentStep / 4) * 100}%` }}
    />
  </div>
</div>
```

---

## 🔧 Technical Implementation

### 1. Update useOnboarding Hook

**File:** `/apps/web/src/hooks/useOnboarding.ts`

```typescript
export interface OnboardingData {
  // Step 1 - Authentication
  authMethod?: 'social' | 'email' | 'phone';
  email?: string;
  phoneNumber?: string;
  phoneCountryCode?: string;
  acceptedTerms?: boolean;
  socialProvider?: string;
  
  // Step 2 - Profile
  username?: string;
  displayName?: string;
  personalTitle?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  personalAptSuite?: string;
  personalStreetAddress1?: string;
  personalStreetAddress2?: string;
  personalCity?: string;
  personalState?: string;
  personalPostalCode?: string;
  personalCountry?: string;
  bio?: string;
  education?: EducationEntry[];
  workExperience?: WorkExperienceEntry[];
  businessPosition?: string;
  businessCompany?: string;
  businessAptSuite?: string;
  businessStreetAddress1?: string;
  businessStreetAddress2?: string;
  businessCity?: string;
  businessState?: string;
  businessPostalCode?: string;
  businessCountry?: string;
  
  // Step 3 - Preferences
  language?: string;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: '12h' | '24h';
  emailNotifications?: {
    productUpdates?: boolean;
    securityAlerts?: boolean;
    marketing?: boolean;
    weeklyDigest?: boolean;
  };
  pushNotifications?: {
    importantUpdates?: boolean;
    newFeatures?: boolean;
    recommendations?: boolean;
  };
  inAppNotifications?: {
    systemAlerts?: boolean;
    activityUpdates?: boolean;
    suggestions?: boolean;
  };
  theme?: 'light' | 'dark' | 'system';
  displayDensity?: 'comfortable' | 'compact' | 'spacious';
  allowAnalytics?: boolean;
  showProfile?: boolean;
  enableTwoFactor?: boolean;
  contactPreferences?: {
    email?: boolean;
    sms?: boolean;
    inApp?: boolean;
  };
}

export function useOnboarding(): UseOnboardingReturn {
  const totalSteps = 4; // Changed from 5 to 4

  const canGoNext = useCallback(() => {
    switch (currentStep) {
      case 1:
        // Must have auth method and accepted terms
        return !!(data.authMethod && data.acceptedTerms && (data.email || data.phoneNumber));
      case 2:
        // Must have required profile fields
        return !!(
          data.username && 
          data.displayName && 
          data.firstName && 
          data.lastName && 
          (data.email || data.phoneNumber)
        );
      case 3:
        // Preferences are optional, always allow next
        return true;
      case 4:
        // Final step, always allow
        return true;
      default:
        return false;
    }
  }, [currentStep, data]);
  
  // ... rest of hook implementation
}
```

### 2. Username Generation Functions

```typescript
// Add to onboarding page or utils
export function generateUsername(
  email?: string, 
  phone?: string, 
  name?: string
): string {
  if (email) {
    // Extract part before @, remove special chars
    const localPart = email.split('@')[0];
    return localPart
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase()
      .slice(0, 20);
  }
  
  if (phone) {
    // Use last 7-8 digits
    const digits = phone.replace(/\D/g, '');
    return `user${digits.slice(-7)}`;
  }
  
  if (name) {
    // Use name, remove spaces
    return name
      .replace(/\s+/g, '')
      .toLowerCase()
      .slice(0, 20);
  }
  
  // Fallback: random
  return `user${Date.now().toString().slice(-8)}`;
}

export async function checkUsernameAvailability(
  username: string
): Promise<boolean> {
  // TODO: Implement actual API call
  // For now, mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock: usernames starting with 'john' are taken
      resolve(!username.toLowerCase().startsWith('john'));
    }, 500);
  });
}
```

### 3. Update Onboarding Page Structure

**File:** `/apps/web/src/app/[locale]/(auth_forms)/onboarding/page.tsx`

```typescript
export default function OnboardingPage({ params: { locale } }: OnboardingPageProps) {
  const router = useRouter();
  const {
    currentStep,
    totalSteps,
    data,
    updateData,
    nextStep,
    prevStep,
    canGoNext,
    isLoading,
  } = useOnboarding();

  // Generate username when moving to step 2
  useEffect(() => {
    if (currentStep === 2 && !data.username) {
      const suggested = generateUsername(data.email, data.phoneNumber);
      updateData({ username: suggested });
    }
  }, [currentStep, data.email, data.phoneNumber, data.username, updateData]);

  const stepTitles = [
    'Create Account',
    'Complete Profile',
    'Customize Experience',
    'Welcome & Resources'
  ];

  const onFinish = async () => {
    // Save all onboarding data to backend
    try {
      // await api.onboarding.complete.mutate(data);
      router.push(`/${locale}/dashboard`);
    } catch (error) {
      console.error('Onboarding completion failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-2xl">
        {/* Header (only show for steps 1-3) */}
        {currentStep < 4 && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">
                {currentStep === 1 ? 'Welcome!' : stepTitles[currentStep - 1]}
              </h1>
            </div>
            <p className="text-muted-foreground">
              {currentStep === 1 && "Let's get you started"}
              {currentStep === 2 && "Tell us about yourself"}
              {currentStep === 3 && "Set your preferences"}
            </p>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Step {currentStep} of {totalSteps}: {stepTitles[currentStep - 1]}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round((currentStep / totalSteps) * 100)}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <Card>
          {/* Step Content */}
          <CardContent className="p-6">
            {/* Step 1: Create Account */}
            {currentStep === 1 && (
              <Step1CreateAccount 
                data={data}
                updateData={updateData}
                onNext={nextStep}
              />
            )}

            {/* Step 2: Complete Profile */}
            {currentStep === 2 && (
              <Step2CompleteProfile
                data={data}
                updateData={updateData}
                onNext={nextStep}
                onBack={prevStep}
                onSkip={nextStep}
              />
            )}

            {/* Step 3: Preferences */}
            {currentStep === 3 && (
              <Step3Preferences
                data={data}
                updateData={updateData}
                onNext={nextStep}
                onBack={prevStep}
                onSkip={nextStep}
              />
            )}

            {/* Step 4: Welcome & Resources */}
            {currentStep === 4 && (
              <Step4Welcome
                data={data}
                onFinish={onFinish}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

---

## 🎨 Button Layout Specification

### Steps 2 & 3 (Profile and Preferences):

```
┌─────────────────────────────────────────────┐
│  [← Back]         [Skip]     [Continue →]  │
└─────────────────────────────────────────────┘
```

**CSS/Tailwind:**
```tsx
<div className="flex items-center justify-between pt-6 border-t">
  <Button
    variant="ghost"
    onClick={onBack}
  >
    <ArrowLeft className="mr-2 h-4 w-4" />
    Back
  </Button>

  <div className="flex gap-3">
    <Button
      variant="outline"
      onClick={onSkip}
    >
      Skip
    </Button>
    <Button
      onClick={onNext}
      disabled={!canGoNext()}
    >
      Continue
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  </div>
</div>
```

### Step 1 (Create Account):
- No explicit buttons (each option is a button)
- Social login buttons
- "Continue with Email" button
- "Continue with Phone" button

### Step 4 (Welcome):
- Single large "Get Started" button
- Takes full width or centered

---

## 📦 Component Structure

```
/apps/web/src/app/[locale]/(auth_forms)/onboarding/
├── page.tsx (main orchestrator)
├── components/
│   ├── Step1CreateAccount.tsx
│   ├── Step2CompleteProfile.tsx
│   ├── Step3Preferences.tsx
│   ├── Step4Welcome.tsx
│   └── ProgressBar.tsx
```

---

## ✅ Validation Rules

### Step 1:
- Must select an auth method
- If email: valid email format
- If phone: valid phone format and country code
- Must accept terms

### Step 2:
- Username: required, 3-20 chars, unique
- Display Name: required
- First Name: required
- Last Name: required
- Email OR Phone: required (one pre-filled from Step 1)
- All other fields: optional

### Step 3:
- All fields optional
- Defaults provided for all settings

### Step 4:
- No validation (informational)

---

## 🔄 Data Flow

```
Step 1: Capture auth method + email/phone
   ↓
   Auto-generate username suggestion
   ↓
Step 2: Complete profile (username editable with check)
   ↓
Step 3: Set preferences (all optional)
   ↓
Step 4: Show resources and offers
   ↓
Submit to backend & redirect to dashboard
```

---

## 📱 Responsive Design

### Mobile (<768px):
- Single column layout
- Stack all form fields vertically
- Full-width buttons
- Collapsible sections default to collapsed
- Progress bar remains at top

### Tablet (768px-1024px):
- 2-column grid for form fields where appropriate
- Side-by-side buttons

### Desktop (>1024px):
- Optimal spacing
- Max width container (2xl)
- Multi-column grids for dense information

---

## 🎯 Success Criteria

- [ ] 4-step flow implemented
- [ ] Progress bar shows on all steps
- [ ] Step 1: Current design maintained
- [ ] Step 2: Full profile form with pre-filling
- [ ] Step 2: Username auto-suggested and checked
- [ ] Step 2: Email/phone pre-filled based on auth method
- [ ] Step 3: Comprehensive preferences (all from settings)
- [ ] Step 4: Resources section with links
- [ ] Step 4: Offers section (refer a friend, upgrade, etc.)
- [ ] Back/Skip/Continue buttons on steps 2-3
- [ ] All validations working
- [ ] Data persists across steps
- [ ] Mobile responsive
- [ ] Smooth transitions

---

## ⏱️ Estimated Implementation Time

| Task | Time |
|------|------|
| Update useOnboarding hook | 1 hour |
| Step 1 (minimal changes) | 0.5 hours |
| Step 2 - Complete Profile | 3 hours |
| Step 3 - Comprehensive Preferences | 2 hours |
| Step 4 - Welcome & Resources | 2 hours |
| Progress bar component | 0.5 hours |
| Button layouts & navigation | 1 hour |
| Testing & refinement | 2 hours |
| **TOTAL** | **12 hours** |

---

## 📋 Implementation Checklist

### Phase 1: Foundation (2 hours)
- [ ] Update `useOnboarding` hook with new data structure
- [ ] Update total steps from 5 to 4
- [ ] Add username generation functions
- [ ] Create progress bar component
- [ ] Update navigation logic

### Phase 2: Step 2 - Profile (3 hours)
- [ ] Create Step2CompleteProfile component
- [ ] Implement personal information section
- [ ] Add collapsible About section
- [ ] Add collapsible Business Info section
- [ ] Implement username availability check
- [ ] Add pre-filling logic for email/phone
- [ ] Add Back/Skip/Continue buttons

### Phase 3: Step 3 - Preferences (2 hours)
- [ ] Create Step3Preferences component
- [ ] Add language & region settings
- [ ] Add notification preferences (email, push, in-app)
- [ ] Add appearance settings (theme, density)
- [ ] Add privacy & security settings
- [ ] Add communication preferences
- [ ] Add Back/Skip/Continue buttons

### Phase 4: Step 4 - Welcome (2 hours)
- [ ] Create Step4Welcome component
- [ ] Add success message with icon
- [ ] Create Quick Links section
  - [ ] Getting Started Guide link
  - [ ] Documentation link
  - [ ] Help Center link
  - [ ] Video Tutorials link
  - [ ] Community Forum link
- [ ] Create Special Offers section
  - [ ] Refer a friend card with shareable link
  - [ ] Premium upgrade offer card
  - [ ] Free onboarding session card
- [ ] Add "Get Started" button

### Phase 5: Integration & Testing (3 hours)
- [ ] Wire up all steps in main onboarding page
- [ ] Test step transitions
- [ ] Test data persistence
- [ ] Test validation on each step
- [ ] Test Back/Skip/Continue functionality
- [ ] Test mobile responsive design
- [ ] Test username generation from different auth methods
- [ ] Test pre-filling based on auth method
- [ ] Fix any bugs or issues

---

## 🚀 Next Steps

1. Review and approve this comprehensive plan
2. Begin implementation starting with Phase 1
3. Iterative development and testing for each step
4. User testing and feedback gathering
5. Refinement based on feedback
6. Production deployment

---

## 📝 Notes

- All optional sections should clearly indicate "(Optional)"
- Pre-filled fields should have visual indication (muted background or lock icon)
- Progress bar should animate smoothly between steps
- All default values should be sensible
- Skip functionality should be clearly available but not too prominent
- Final welcome screen should make users excited to start using the app

