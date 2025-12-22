# Support Widget

**Complete guide to the customer support widget implementation**

---

## Table of Contents

1. [Overview](#overview)
2. [Components](#components)
3. [Setup](#setup)
4. [Usage](#usage)
5. [Organization Context](#organization-context)
6. [Integration](#integration)
7. [Customization](#customization)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## Overview

The Customer Support Widget provides a foundation for integrating live chat services like Intercom or Crisp. It includes:

- **Fixed chat bubble** in the bottom-right corner
- **Organization context awareness** for user identification
- **Keyboard accessibility** support
- **Console logging** for debugging
- **Easy integration** with third-party chat services

### Key Features

- Fixed positioning (bottom-right corner)
- Chat bubble icon using Lucide React
- Hover and click animations
- Keyboard accessibility support
- Organization context awareness
- Environment-based enable/disable

---

## Components

### 1. SupportWidget

**File**: `apps/web/src/components/support-widget.tsx`

The main widget component that renders a fixed chat bubble icon.

**Props:**

```typescript
interface SupportWidgetProps {
  orgId?: string | null;  // Organization ID for context logging
  className?: string;      // Additional CSS classes
}
```

**Features:**

- Fixed positioning (bottom-right corner)
- Chat bubble icon using Lucide React
- Hover and click animations
- Keyboard accessibility support
- Console logging for initialization and interactions
- Organization context awareness

**Example:**

```tsx
<SupportWidget orgId="org-123" />
```

### 2. SupportWidgetWrapper

**File**: `apps/web/src/components/support-widget-wrapper.tsx`

Client-side wrapper that extracts organization context from URL and cookies.

**Features:**

- Extracts orgId from URL path (`/org/[orgId]/...`)
- Extracts orgId from search parameters (`?orgId=...`)
- Extracts orgId from cookies (`org_id`)
- Environment variable check for enabling/disabling
- Passes orgId to SupportWidget component

**Example:**

```tsx
<SupportWidgetWrapper />
```

---

## Setup

### Environment Configuration

Add the following to your `.env.local` file to enable the support widget:

```bash
NEXT_PUBLIC_SUPPORT_ENABLED=true
```

The widget will only render when this variable is set to `'true'`.

### Global Integration

The widget is integrated into the global layout (`apps/web/src/app/[locale]/layout.tsx`) and will appear on all pages when enabled.

**Layout Integration:**

```tsx
// app/[locale]/layout.tsx
import { SupportWidgetWrapper } from '@/components/support-widget-wrapper';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <SupportWidgetWrapper />
      </body>
    </html>
  );
}
```

---

## Usage

### Basic Usage

The widget is automatically rendered when:

1. `NEXT_PUBLIC_SUPPORT_ENABLED=true` is set
2. The component is included in the global layout (already done)

### Organization Context

The widget automatically detects organization context from:

1. **URL path parameters** (`/org/[orgId]/...`)
2. **URL search parameters** (`?orgId=...`)
3. **Browser cookies** (`org_id`)

### Console Logging

The widget logs the following messages to the browser console:

- `Support Widget Initialized for Org: [orgId]` - On component initialization
- `Support Widget clicked - would open chat interface` - On click
- `Support Widget activated via keyboard - would open chat interface` - On keyboard activation

---

## Organization Context

### Context Detection

The widget automatically detects organization context using this priority:

1. **URL Path** - `/org/[orgId]/...` routes
2. **Query Parameter** - `?orgId=...` in URL
3. **Cookie** - `org_id` cookie value

**Implementation:**

```typescript
// support-widget-wrapper.tsx
'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SupportWidget } from './support-widget';

export function SupportWidgetWrapper() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    // Check if enabled
    if (process.env.NEXT_PUBLIC_SUPPORT_ENABLED !== 'true') {
      return;
    }

    // Extract orgId from URL path
    const pathMatch = pathname.match(/\/org\/([^\/]+)/);
    if (pathMatch) {
      setOrgId(pathMatch[1]);
      return;
    }

    // Extract orgId from query parameter
    const queryOrgId = searchParams.get('orgId');
    if (queryOrgId) {
      setOrgId(queryOrgId);
      return;
    }

    // Extract orgId from cookie
    const cookies = document.cookie.split(';');
    const orgCookie = cookies.find(c => c.trim().startsWith('org_id='));
    if (orgCookie) {
      const orgIdValue = orgCookie.split('=')[1];
      setOrgId(orgIdValue);
      return;
    }

    setOrgId(null);
  }, [pathname, searchParams]);

  if (process.env.NEXT_PUBLIC_SUPPORT_ENABLED !== 'true') {
    return null;
  }

  return <SupportWidget orgId={orgId} />;
}
```

---

## Integration

### Integrating with Intercom

**Replace console.log with Intercom:**

```tsx
// support-widget.tsx
'use client';

import { useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

declare global {
  interface Window {
    Intercom: any;
  }
}

export function SupportWidget({ orgId }: { orgId?: string | null }) {
  useEffect(() => {
    if (orgId) {
      // Initialize Intercom with org context
      window.Intercom('boot', {
        app_id: process.env.NEXT_PUBLIC_INTERCOM_APP_ID,
        user_id: orgId, // Use orgId for identification
      });

      console.log(`Support Widget Initialized for Org: ${orgId}`);
    }
  }, [orgId]);

  const handleClick = () => {
    window.Intercom('show');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 rounded-full bg-primary p-4 shadow-lg hover:bg-primary/90"
      aria-label="Open support chat"
    >
      <MessageCircle className="h-6 w-6 text-primary-foreground" />
    </button>
  );
}
```

### Integrating with Crisp

**Replace console.log with Crisp:**

```tsx
// support-widget.tsx
'use client';

import { useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

declare global {
  interface Window {
    $crisp: any;
    CRISP_WEBSITE_ID: string;
  }
}

export function SupportWidget({ orgId }: { orgId?: string | null }) {
  useEffect(() => {
    if (orgId && typeof window !== 'undefined') {
      // Initialize Crisp
      window.$crisp = [];
      window.CRISP_WEBSITE_ID = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID!;

      // Set user identifier
      window.$crisp.push(['set', 'user:email', orgId]);

      console.log(`Support Widget Initialized for Org: ${orgId}`);
    }
  }, [orgId]);

  const handleClick = () => {
    window.$crisp.push(['do', 'chat:open']);
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 rounded-full bg-primary p-4 shadow-lg hover:bg-primary/90"
      aria-label="Open support chat"
    >
      <MessageCircle className="h-6 w-6 text-primary-foreground" />
    </button>
  );
}
```

---

## Customization

### Styling

The widget uses Tailwind CSS classes and follows the project's design system:

```tsx
<button
  className="fixed bottom-6 right-6 z-50 rounded-full bg-primary p-4 shadow-lg hover:bg-primary/90 transition-all"
  aria-label="Open support chat"
>
  <MessageCircle className="h-6 w-6 text-primary-foreground" />
</button>
```

**Customize positioning:**

```tsx
// Change position to top-right
className="fixed top-6 right-6 ..."

// Change position to bottom-left
className="fixed bottom-6 left-6 ..."
```

**Customize colors:**

```tsx
// Use custom colors
className="... bg-blue-500 hover:bg-blue-600 ..."
```

### Icon

Replace the icon with a custom one:

```tsx
import { HelpCircle, HeadphonesIcon } from 'lucide-react';

// Use different icon
<HelpCircle className="h-6 w-6 text-primary-foreground" />
```

### Animation

Add custom animations:

```tsx
<button
  className="... animate-bounce hover:animate-none ..."
>
```

---

## Testing

### Unit Tests

Run the unit tests to verify component functionality:

```bash
pnpm test src/test/support-widget.test.tsx
```

**Test Example:**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { SupportWidget } from '@/components/support-widget';

describe('SupportWidget', () => {
  it('renders widget when enabled', () => {
    process.env.NEXT_PUBLIC_SUPPORT_ENABLED = 'true';
    
    render(<SupportWidget orgId="org-123" />);
    
    expect(screen.getByLabelText('Open support chat')).toBeInTheDocument();
  });

  it('logs orgId on initialization', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    
    render(<SupportWidget orgId="org-123" />);
    
    expect(consoleSpy).toHaveBeenCalledWith('Support Widget Initialized for Org: org-123');
  });

  it('handles click event', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    
    render(<SupportWidget orgId="org-123" />);
    
    const button = screen.getByLabelText('Open support chat');
    fireEvent.click(button);
    
    expect(consoleSpy).toHaveBeenCalledWith('Support Widget clicked - would open chat interface');
  });
});
```

### Manual Testing

1. Set `NEXT_PUBLIC_SUPPORT_ENABLED=true` in your environment
2. Start the development server: `pnpm dev`
3. Navigate to any page with organization context (e.g., `/org/[orgId]/dashboard`)
4. Verify the chat bubble icon appears in the bottom-right corner
5. Check browser console for initialization messages
6. Test click and keyboard interactions

### Verification Script

Use the verification script to test functionality:

```javascript
// In browser console
function verifySupportWidget() {
  const widget = document.querySelector('[aria-label="Open support chat"]');
  
  if (!widget) {
    console.error('Support widget not found');
    return;
  }
  
  console.log('✓ Support widget found');
  console.log('✓ Widget is visible:', widget.offsetParent !== null);
  console.log('✓ Widget position:', widget.style.position);
  
  // Test click
  widget.click();
  console.log('✓ Click event triggered');
}
```

---

## Troubleshooting

### Issue: Widget not appearing

**Check:**
1. `NEXT_PUBLIC_SUPPORT_ENABLED=true` is set?
2. Component included in layout?
3. No CSS conflicts hiding the widget?

**Debug:**

```typescript
// Check environment variable
console.log('Support enabled:', process.env.NEXT_PUBLIC_SUPPORT_ENABLED);

// Check if component renders
const widget = document.querySelector('[aria-label="Open support chat"]');
console.log('Widget found:', !!widget);
```

### Issue: Organization context not detected

**Check:**
1. URL contains orgId?
2. Cookie `org_id` is set?
3. Query parameter `orgId` is present?

**Debug:**

```typescript
// Check URL
console.log('Pathname:', window.location.pathname);
console.log('Search params:', window.location.search);

// Check cookie
console.log('Cookies:', document.cookie);

// Check orgId prop
console.log('OrgId prop:', orgId);
```

### Issue: Click not working

**Check:**
1. Event handler attached?
2. No z-index conflicts?
3. No overlay blocking clicks?

**Debug:**

```typescript
// Test click handler
const widget = document.querySelector('[aria-label="Open support chat"]');
widget.addEventListener('click', () => {
  console.log('Click handler fired');
});
```

---

## Future Enhancements

### Planned Features

1. **Chat Modal** - Add modal interface when widget is clicked
2. **Real-time Features** - Integrate with Supabase Realtime
3. **Chat History** - Store and display chat history
4. **File Uploads** - Support file attachments
5. **Typing Indicators** - Show when support is typing
6. **Unread Badge** - Display unread message count

### Integration Ideas

- **Intercom** - Full-featured customer support platform
- **Crisp** - Lightweight chat solution
- **Zendesk** - Enterprise support solution
- **Custom Solution** - Build your own using Supabase Realtime

---

## Related Documentation

- **Organizations:** [ORGANIZATIONS.md](./ORGANIZATIONS.md)
- **Development Guide:** [../03_DEVELOPMENT/DEVELOPMENT_GUIDE.md](../03_DEVELOPMENT/DEVELOPMENT_GUIDE.md)

---

**Last Updated:** 2025-01-27
