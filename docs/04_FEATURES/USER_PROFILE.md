# User Profile

**Complete guide to user profile management and editing**

---

## Table of Contents

1. [Overview](#overview)
2. [Profile Structure](#profile-structure)
3. [Profile Modal](#profile-modal)
4. [Sections](#sections)
5. [Data Fields](#data-fields)
6. [Implementation](#implementation)
7. [Access Points](#access-points)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The User Profile system provides comprehensive profile management with three collapsible sections for managing personal, professional, and business information. The enhanced profile modal features:

- **Three collapsible sections** - Personal Information, About, Business Information
- **Rich functionality** - Education, work experience, bio, addresses
- **Editable fields** - Email and phone are now editable
- **Dynamic arrays** - Add/remove education and work experience entries
- **LinkedIn-style** - Professional profile sections

### Key Features

- Personal information with editable email and phone
- About section with bio, education, and work experience
- Business information with company details
- Collapsible sections for better UX
- Form validation and error handling
- Success notifications

---

## Profile Structure

### Modal Layout

```
┌─────────────────────────────────────────────────────────┐
│  Edit Profile                                        [X] │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ▼ Personal Information                                  │
│  ├─ Display Name  │ Username      │ [Status]            │
│  ├─ Title │ First Name │ Middle │ Last Name             │
│  ├─ Email (editable) │ Phone (editable)                 │
│  ├─ Apt/Suite │ Street Address                          │
│  ├─ Street Address 2                                     │
│  └─ City │ State │ Postal │ Country                     │
│                                                           │
│  ▼ About                                                 │
│  ├─ Bio (textarea)                                       │
│  ├─ Education                          [+ Add Education] │
│  │  ┌────────────────────────────────────────────┐      │
│  │  │ Education 1                          [🗑️]  │      │
│  │  │ Institution: _______________________       │      │
│  │  │ Degree: ____________________________       │      │
│  │  │ Start: _______ │ End: _______              │      │
│  │  └────────────────────────────────────────────┘      │
│  └─ Work Experience                [+ Add Experience]    │
│     ┌────────────────────────────────────────────┐      │
│     │ Experience 1                         [🗑️]  │      │
│     │ Position: _________ │ Company: _________   │      │
│     │ Start: _______ │ End: _______              │      │
│     │ Description: _________________________     │      │
│     └────────────────────────────────────────────┘      │
│                                                           │
│  ▼ Business Information                                  │
│  ├─ Position │ Company Name                             │
│  ├─ Apt/Suite │ Street Address                          │
│  ├─ Street Address 2                                     │
│  └─ City │ State │ Postal │ Country                     │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                              [Cancel]  [Save Changes]    │
└─────────────────────────────────────────────────────────┘
```

---

## Profile Modal

### Component Structure

**File**: `apps/web/src/components/onboarding/Step2CompleteProfile.tsx`

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const [personalExpanded, setPersonalExpanded] = useState(true);
  const [aboutExpanded, setAboutExpanded] = useState(true);
  const [businessExpanded, setBusinessExpanded] = useState(true);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        {/* Personal Information Section */}
        <CollapsibleSection
          title="Personal Information"
          expanded={personalExpanded}
          onToggle={() => setPersonalExpanded(!personalExpanded)}
        >
          {/* Personal fields */}
        </CollapsibleSection>

        {/* About Section */}
        <CollapsibleSection
          title="About"
          expanded={aboutExpanded}
          onToggle={() => setAboutExpanded(!aboutExpanded)}
        >
          {/* About fields */}
        </CollapsibleSection>

        {/* Business Information Section */}
        <CollapsibleSection
          title="Business Information"
          expanded={businessExpanded}
          onToggle={() => setBusinessExpanded(!businessExpanded)}
        >
          {/* Business fields */}
        </CollapsibleSection>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Sections

### 1. Personal Information

**Default State:** Expanded ✅

**Key Changes:**
- ✅ **Email is now editable** (was readonly)
- ✅ **Phone number is now editable** (was disabled)
- ✅ Click header to collapse/expand

**Fields:**
- Display Name * (required)
- Username * (required) - with availability checker
- Title (dropdown)
- First Name * (required)
- Middle Name
- Last Name * (required)
- Email * (required, editable)
- Phone Country Code (editable dropdown)
- Phone Number (editable)
- Apartment/Suite
- Street Address
- Street Address 2
- City
- State/Region
- Postal Code
- Country (dropdown)

**Implementation:**

```tsx
<CollapsibleSection title="Personal Information" expanded={personalExpanded}>
  <div className="grid grid-cols-2 gap-4">
    <Input label="Display Name" required />
    <Input label="Username" required />
    <Select label="Title" options={['Mr.', 'Mrs.', 'Ms.', 'Dr.']} />
    <Input label="First Name" required />
    <Input label="Middle Name" />
    <Input label="Last Name" required />
    <Input label="Email" type="email" required editable />
    <div className="flex gap-2">
      <Select label="Country Code" options={countryCodes} />
      <Input label="Phone Number" editable />
    </div>
    {/* Address fields */}
  </div>
</CollapsibleSection>
```

### 2. About

**Default State:** Expanded ✅  
**All fields optional**

#### Bio

```tsx
<Textarea
  label="Bio"
  placeholder="Tell us about yourself..."
  rows={4}
  value={bio}
  onChange={(e) => setBio(e.target.value)}
/>
```

#### Education (LinkedIn-style)

**Features:**
- Add multiple education entries
- Remove entries (minimum 1 must remain)
- Each entry is a card with light background

**Entry Fields:**
- Institution
- Degree
- Start Date
- End Date

**Implementation:**

```tsx
<div className="space-y-4">
  {education.map((edu, index) => (
    <Card key={edu.id} className="p-4 bg-muted/30">
      <div className="flex justify-between items-start mb-4">
        <h4 className="font-semibold">Education {index + 1}</h4>
        {education.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeEducation(edu.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Input label="Institution" value={edu.institution} />
      <Input label="Degree" value={edu.degree} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Start Date" value={edu.startDate} />
        <Input label="End Date" value={edu.endDate} />
      </div>
    </Card>
  ))}
  <Button onClick={addEducation} variant="outline">
    <Plus className="h-4 w-4 mr-2" />
    Add Education
  </Button>
</div>
```

#### Work Experience (LinkedIn-style)

**Features:**
- Add multiple work experience entries
- Remove entries (minimum 1 must remain)
- Each entry is a card with light background

**Entry Fields:**
- Company
- Position
- Start Date
- End Date
- Description

**Implementation:**

```tsx
<div className="space-y-4">
  {workExperience.map((exp, index) => (
    <Card key={exp.id} className="p-4 bg-muted/30">
      <div className="flex justify-between items-start mb-4">
        <h4 className="font-semibold">Experience {index + 1}</h4>
        {workExperience.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeWorkExperience(exp.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Position" value={exp.position} />
        <Input label="Company" value={exp.company} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Start Date" value={exp.startDate} />
        <Input label="End Date" value={exp.endDate} />
      </div>
      <Textarea
        label="Description"
        value={exp.description}
        rows={3}
      />
    </Card>
  ))}
  <Button onClick={addWorkExperience} variant="outline">
    <Plus className="h-4 w-4 mr-2" />
    Add Experience
  </Button>
</div>
```

### 3. Business Information

**Default State:** Expanded ✅  
**All fields optional**

**Fields:**
- Position (e.g., "Senior Product Designer")
- Company Name (beside Position)
- Apartment/Suite
- Street Address
- Street Address 2
- City
- State/Region
- Postal Code
- Country (dropdown)

**Implementation:**

```tsx
<CollapsibleSection title="Business Information" expanded={businessExpanded}>
  <div className="grid grid-cols-2 gap-4">
    <Input label="Position" />
    <Input label="Company Name" />
    <Input label="Apartment/Suite" />
    <Input label="Street Address" />
    <Input label="Street Address 2" />
    <div className="grid grid-cols-4 gap-4">
      <Input label="City" />
      <Input label="State" />
      <Input label="Postal Code" />
      <Select label="Country" options={countries} />
    </div>
  </div>
</CollapsibleSection>
```

---

## Data Fields

### Form Data Structure

```typescript
interface ProfileData {
  // Personal Information
  username: string;
  displayName: string;
  personalTitle: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;  // ✅ Now editable
  phoneCountryCode: string;  // ✅ Now editable
  phoneNumber: string;  // ✅ Now editable
  personalAptSuite?: string;
  personalStreetAddress1?: string;
  personalStreetAddress2?: string;
  personalCity?: string;
  personalState?: string;
  personalPostalCode?: string;
  personalCountry?: string;
  
  // About - Bio
  bio?: string;
  
  // About - Education (array)
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    startDate: string;
    endDate: string;
  }>;
  
  // About - Work Experience (array)
  workExperience: Array<{
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description?: string;
  }>;
  
  // Business Information
  businessPosition?: string;
  businessCompany?: string;
  businessAptSuite?: string;
  businessStreetAddress1?: string;
  businessStreetAddress2?: string;
  businessCity?: string;
  businessState?: string;
  businessPostalCode?: string;
  businessCountry?: string;
}
```

---

## Implementation

### Saving Profile Data

```typescript
async function handleSave() {
  try {
    const profileData: ProfileData = {
      username,
      displayName,
      email,  // ✅ Now editable
      phoneCountryCode,  // ✅ Now editable
      phoneNumber,  // ✅ Now editable
      // ... other fields
      education,
      workExperience,
      // ... business fields
    };

    // Update profile via API
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      throw new Error('Failed to save profile');
    }

    // Show success notification
    toast.success('Profile updated successfully');
    
    // Close modal
    onClose();
  } catch (error) {
    toast.error('Failed to save profile');
    console.error(error);
  }
}
```

### Server Action

```typescript
// app/actions/profile.ts
'use server';

import { requireAuth } from '@/lib/auth/server';
import { createServerClient } from '@/lib/supabase/server';

export async function updateProfile(data: ProfileData) {
  const user = await requireAuth();
  const supabase = createServerClient();

  const { error } = await supabase
    .from('users')
    .update({
      username: data.username,
      display_name: data.displayName,
      email: data.email,  // ✅ Now editable
      phone_country_code: data.phoneCountryCode,  // ✅ Now editable
      phone_number: data.phoneNumber,  // ✅ Now editable
      personal_title: data.personalTitle,
      first_name: data.firstName,
      middle_name: data.middleName,
      last_name: data.lastName,
      bio: data.bio,
      education: data.education,
      work_experience: data.workExperience,
      business_position: data.businessPosition,
      business_company: data.businessCompany,
      // ... address fields
    })
    .eq('id', user.id);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}
```

---

## Access Points

### Where to Find This Modal

1. **Dashboard Profile:** `http://localhost:3001/en/dashboard/profile`
   - Click "Edit Profile" button

2. **App Profile:** `http://localhost:3001/en/profile`
   - Click "Edit Profile" button

3. **Settings Account:** `http://localhost:3001/en/settings/account`
   - Click profile edit option

**Note:** Admin console at `/console/profile` uses a different modal (`AdminProfileEditModal`) which was NOT modified.

---

## Troubleshooting

### Issue: Email/Phone not editable

**Check:**
1. Fields have `editable` prop set?
2. No `readonly` or `disabled` attributes?
3. Form state management correct?

**Debug:**

```tsx
// Check if field is editable
<Input
  label="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  editable  // ✅ Ensure this prop is set
/>
```

### Issue: Education/Work Experience not saving

**Check:**
1. Array state management correct?
2. IDs assigned to entries?
3. Server action handles arrays?

**Debug:**

```typescript
// Check array structure
console.log('Education:', education);
console.log('Work Experience:', workExperience);

// Ensure IDs are present
education.forEach((edu, index) => {
  if (!edu.id) {
    edu.id = `edu-${index}`;
  }
});
```

### Issue: Collapsible sections not working

**Check:**
1. State management correct?
2. Toggle handlers attached?
3. Chevron icon updates?

**Debug:**

```tsx
// Check state
console.log('Personal expanded:', personalExpanded);
console.log('About expanded:', aboutExpanded);
console.log('Business expanded:', businessExpanded);

// Test toggle
<button onClick={() => {
  console.log('Toggle clicked');
  setPersonalExpanded(!personalExpanded);
}}>
  Toggle
</button>
```

---

## Related Documentation

- **Authentication:** [AUTHENTICATION.md](./AUTHENTICATION.md)
- **Development Guide:** [../03_DEVELOPMENT/DEVELOPMENT_GUIDE.md](../03_DEVELOPMENT/DEVELOPMENT_GUIDE.md)

---

**Last Updated:** 2025-01-27
