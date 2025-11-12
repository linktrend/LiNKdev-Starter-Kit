# Onboarding Profile Step Implementation Plan

## Overview

Create Step 2 of the onboarding flow that presents users with a profile completion form, pre-filling username and contact information from Step 1.

---

## Current State

### Existing Onboarding Flow (5 steps):
1. **Authentication** - Social login, email, or phone
2. **Name** - Simple name field  
3. **Role** - Select user role
4. **Preferences** - Notifications and theme
5. **Welcome** - Completion screen

### What Needs to Change:
- **Replace Step 2** (currently just "Name") with full profile form
- Pre-fill data from Step 1 (email or phone)
- Suggest username based on email/phone

---

## Proposed New Flow

### Step 2: Profile Completion

**Title:** "Complete Your Profile"

**Description:** "Tell us about yourself to personalize your experience"

**Pre-filled Fields:**
1. **Username** - Auto-suggested from:
   - Email: Use part before @ (e.g., `john.doe@example.com` → `johndoe`)
   - Phone: Use last 4-6 digits with prefix (e.g., `5551234567` → `user1234567`)
   - Add check for availability with real-time feedback

2. **Email OR Phone** - Based on Step 1 selection:
   - If user chose email → Email field is pre-filled and read-only
   - If user chose phone → Phone field is pre-filled and read-only
   - The other field remains editable

**Form Sections:**

#### 1. Personal Information (Expanded by default)
- Display Name *
- Username * (pre-filled, editable with availability check)
- Title (Mr., Mrs., Ms., etc.)
- First Name *
- Middle Name
- Last Name *
- Email * (pre-filled if from Step 1, otherwise editable)
- Phone (pre-filled if from Step 1, otherwise editable)
- Address fields (all optional)
  - Apartment/Suite
  - Street Address
  - Street Address 2
  - City
  - State/Region
  - Postal Code
  - Country

#### 2. About (Collapsed by default - Optional)
- Bio
- Education (add/remove entries)
- Work Experience (add/remove entries)

#### 3. Business Information (Collapsed by default - Optional)
- Position
- Company Name
- Business Address (same fields as personal)

**Buttons:**
- **Back** - Return to Step 1
- **Skip** - Go to Step 3 (Role selection)
- **Continue** - Proceed to Step 3 with filled data

**Validation:**
- Required fields: Display Name, Username, First Name, Last Name, Email (or Phone)
- Username must be unique (real-time check)
- Email format validation
- Phone format validation (if provided)

---

## Implementation Steps

### 1. Update useOnboarding Hook

**File:** `/apps/web/src/hooks/useOnboarding.ts`

```typescript
export interface OnboardingData {
  // Step 1 - Authentication
  email?: string;
  phoneNumber?: string;
  phoneCountryCode?: string;
  acceptedTerms?: boolean;
  authMethod?: 'social' | 'email' | 'phone';
  
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
  
  // Step 3 - Role (existing)
  role?: string;
  
  // Step 4 - Preferences (existing)
  notifications?: {
    email?: boolean;
    push?: boolean;
    inapp?: boolean;
  };
  theme?: 'light' | 'dark' | 'system';
}

// Update canGoNext for step 2
case 2:
  return !!(data.username && data.displayName && data.firstName && data.lastName && (data.email || data.phoneNumber));
```

### 2. Update Onboarding Page

**File:** `/apps/web/src/app/[locale]/(auth_forms)/onboarding/page.tsx`

**Changes needed:**

#### A. Track auth method in Step 1
```typescript
// When user selects email
updateData({ email: emailValue, authMethod: 'email' });

// When user selects phone
updateData({ phoneNumber: phoneValue, phoneCountryCode: code, authMethod: 'phone' });

// When user selects social login
updateData({ authMethod: 'social', email: socialEmail });
```

#### B. Generate suggested username
```typescript
const generateUsername = (email?: string, phone?: string) => {
  if (email) {
    // Extract part before @, remove dots, make lowercase
    const username = email.split('@')[0].replace(/\./g, '').toLowerCase();
    return username;
  }
  if (phone) {
    // Use 'user' + last 6-8 digits
    const digits = phone.replace(/\D/g, ''); // Remove non-digits
    return `user${digits.slice(-7)}`;
  }
  return '';
};

// On moving to step 2, suggest username
useEffect(() => {
  if (currentStep === 2 && !data.username) {
    const suggested = generateUsername(data.email, data.phoneNumber);
    updateData({ username: suggested });
  }
}, [currentStep]);
```

#### C. Add Step 2 JSX (Profile Form)
```tsx
{currentStep === 2 && (
  <div className="space-y-6">
    {/* Personal Information Section */}
    <div className="space-y-4">
      <h4 className="font-medium">Personal Information</h4>
      
      {/* Username and Display Name */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="username">Username *</Label>
          <Input
            id="username"
            value={data.username}
            onChange={(e) => updateData({ username: e.target.value })}
            placeholder="Enter username"
          />
          {/* Add username availability check indicator */}
        </div>
        <div>
          <Label htmlFor="displayName">Display Name *</Label>
          <Input
            id="displayName"
            value={data.displayName}
            onChange={(e) => updateData({ displayName: e.target.value })}
            placeholder="Enter display name"
          />
        </div>
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-4 gap-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Select
            value={data.personalTitle}
            onValueChange={(value) => updateData({ personalTitle: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Title" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Mr.">Mr.</SelectItem>
              <SelectItem value="Mrs.">Mrs.</SelectItem>
              <SelectItem value="Ms.">Ms.</SelectItem>
              <SelectItem value="Dr.">Dr.</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={data.firstName}
            onChange={(e) => updateData({ firstName: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="middleName">Middle Name</Label>
          <Input
            id="middleName"
            value={data.middleName}
            onChange={(e) => updateData({ middleName: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={data.lastName}
            onChange={(e) => updateData({ lastName: e.target.value })}
          />
        </div>
      </div>

      {/* Email and Phone */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => updateData({ email: e.target.value })}
            readOnly={data.authMethod === 'email'}
            className={data.authMethod === 'email' ? 'bg-muted' : ''}
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={data.phoneNumber}
            onChange={(e) => updateData({ phoneNumber: e.target.value })}
            readOnly={data.authMethod === 'phone'}
            className={data.authMethod === 'phone' ? 'bg-muted' : ''}
          />
        </div>
      </div>

      {/* Address fields - Optional, can be collapsible */}
      
    </div>

    {/* About Section - Collapsible */}
    <Collapsible>
      <CollapsibleTrigger className="flex items-center gap-2">
        <ChevronDown className="h-4 w-4" />
        About (Optional)
      </CollapsibleTrigger>
      <CollapsibleContent>
        {/* Bio, Education, Work Experience */}
      </CollapsibleContent>
    </Collapsible>

    {/* Business Information - Collapsible */}
    <Collapsible>
      <CollapsibleTrigger className="flex items-center gap-2">
        <ChevronDown className="h-4 w-4" />
        Business Information (Optional)
      </CollapsibleTrigger>
      <CollapsibleContent>
        {/* Position, Company, Address */}
      </CollapsibleContent>
    </Collapsible>
  </div>
)}
```

### 3. Update Step Titles

```typescript
<CardTitle>
  Step {currentStep}: {
    currentStep === 1 && 'Create Account' ||
    currentStep === 2 && 'Complete Profile' ||
    currentStep === 3 && 'Select Role' ||
    currentStep === 4 && 'Preferences' ||
    currentStep === 5 && 'Welcome'
  }
</CardTitle>
<CardDescription>
  {
    currentStep === 1 && 'Sign in with your preferred method' ||
    currentStep === 2 && 'Tell us about yourself to personalize your experience' ||
    currentStep === 3 && 'What describes you best?' ||
    currentStep === 4 && 'Customize your experience' ||
    currentStep === 5 && 'You\'re all set!'
  }
</CardDescription>
```

---

## Username Suggestion Logic

### Email-based username:
```typescript
function suggestUsernameFromEmail(email: string): string {
  // Extract part before @
  const localPart = email.split('@')[0];
  
  // Remove dots, special chars, convert to lowercase
  const clean = localPart
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
  
  // Limit length
  return clean.slice(0, 20);
}

// Examples:
// john.doe@example.com → johndoe
// sarah_smith123@gmail.com → sarahsmith123
// m.jones@company.co.uk → mjones
```

### Phone-based username:
```typescript
function suggestUsernameFromPhone(phone: string, countryCode: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Use last 7-8 digits
  const lastDigits = digits.slice(-7);
  
  // Prefix with 'user'
  return `user${lastDigits}`;
}

// Examples:
// +1 555-123-4567 → user1234567
// +44 20 1234 5678 → user2345678
```

### Social login username:
```typescript
// If email provided by social provider
function suggestUsernameFromSocial(email?: string, name?: string): string {
  if (email) {
    return suggestUsernameFromEmail(email);
  }
  if (name) {
    // Use name, remove spaces
    return name.replace(/\s+/g, '').toLowerCase().slice(0, 20);
  }
  return `user${Date.now().toString().slice(-8)}`;
}
```

---

## UI/UX Considerations

### Visual Indicators
1. **Pre-filled fields** - Show with muted background
2. **Read-only fields** - Display lock icon
3. **Username availability** - Real-time check with icons:
   - ⏳ Checking...
   - ✅ Available
   - ❌ Taken
4. **Optional sections** - Clearly marked "(Optional)"
5. **Collapsible sections** - Start collapsed for About and Business Info

### Progress Indication
- Step indicator shows 2/5
- Back button returns to Step 1
- Skip button available (moves to Step 3)
- Continue button enabled when required fields filled

### Mobile Responsive
- Stack fields vertically on mobile
- Collapsible sections help reduce scroll
- Sticky footer with action buttons

---

## Data Flow

```
Step 1 (Authentication)
  ↓
  Capture: email OR phone + authMethod
  ↓
Step 2 (Profile) - AUTO-FILL:
  - Generate username suggestion
  - Pre-fill email (if authMethod === 'email')
  - Pre-fill phone (if authMethod === 'phone')
  - Mark pre-filled field as read-only
  ↓
  User completes profile
  ↓
Step 3 (Role)
  ↓
Step 4 (Preferences)
  ↓
Step 5 (Welcome)
  ↓
Submit all data to backend
```

---

## Backend Integration (Future)

When ready to persist data:

```typescript
// On final step completion
const onComplete = async () => {
  try {
    // Create user profile
    await api.profile.create.mutate({
      username: data.username,
      displayName: data.displayName,
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      phoneCountryCode: data.phoneCountryCode,
      // ... rest of profile data
      education: data.education,
      workExperience: data.workExperience,
    });
    
    router.push(`/${locale}/dashboard`);
  } catch (error) {
    // Handle error
  }
};
```

---

## Testing Checklist

### Step 1 → Step 2 Transition
- [ ] Email signup pre-fills email field
- [ ] Phone signup pre-fills phone field
- [ ] Social login pre-fills email if available
- [ ] Username is auto-suggested correctly
- [ ] Pre-filled fields are read-only
- [ ] Other field (email/phone) remains editable

### Username Validation
- [ ] Real-time availability checking works
- [ ] Shows checking state
- [ ] Shows available state (green check)
- [ ] Shows taken state (red X)
- [ ] Prevents submission if username taken

### Form Functionality
- [ ] All required fields validated
- [ ] Optional sections can be collapsed/expanded
- [ ] Back button returns to Step 1
- [ ] Skip button moves to Step 3
- [ ] Continue button validates and moves forward
- [ ] Data persists when navigating back/forward

### Responsive Design
- [ ] Layout works on mobile
- [ ] Fields stack properly
- [ ] Buttons accessible
- [ ] Collapsible sections work on touch

---

## Files to Modify

1. `/apps/web/src/hooks/useOnboarding.ts` - Update interface and validation
2. `/apps/web/src/app/[locale]/(auth_forms)/onboarding/page.tsx` - Add Step 2 form
3. *Optional:* Create reusable components for profile sections

---

## Estimated Time

- Hook updates: 30 min
- Step 2 form implementation: 2 hours
- Username suggestion logic: 30 min
- Testing and refinement: 1 hour

**Total: ~4 hours**

---

## Next Steps

1. Update `useOnboarding` hook with new data structure
2. Implement username suggestion functions
3. Add Step 2 form to onboarding page
4. Test flow from Step 1 → Step 2 → Step 3
5. Refine UI/UX based on testing
6. Add backend integration when ready

