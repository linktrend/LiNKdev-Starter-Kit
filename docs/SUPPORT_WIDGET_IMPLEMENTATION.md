# Customer Support Widget Implementation

## Overview

This document describes the implementation of a Customer Support Widget boilerplate that provides a foundation for integrating live chat services like Intercom or Crisp.

## Components

### 1. SupportWidget (`src/components/support-widget.tsx`)

The main widget component that renders a fixed chat bubble icon in the bottom-right corner of the screen.

**Features:**
- Fixed positioning (bottom-right corner)
- Chat bubble icon using Lucide React
- Hover and click animations
- Keyboard accessibility support
- Console logging for initialization and interactions
- Organization context awareness

**Props:**
- `orgId?: string | null` - Organization ID for context logging
- `className?: string` - Additional CSS classes

### 2. SupportWidgetWrapper (`src/components/support-widget-wrapper.tsx`)

Client-side wrapper that extracts organization context from URL and cookies.

**Features:**
- Extracts orgId from URL path (`/org/[orgId]/...`)
- Extracts orgId from search parameters (`?orgId=...`)
- Extracts orgId from cookies (`org_id`)
- Environment variable check for enabling/disabling
- Passes orgId to SupportWidget component

### 3. Global Integration

The widget is integrated into the global layout (`src/app/[locale]/layout.tsx`) and will appear on all pages when enabled.

## Environment Configuration

### Environment Variable

Add the following to your `.env.local` file to enable the support widget:

```bash
NEXT_PUBLIC_SUPPORT_ENABLED=true
```

The widget will only render when this variable is set to `'true'`.

## Usage

### Basic Usage

The widget is automatically rendered when:
1. `NEXT_PUBLIC_SUPPORT_ENABLED=true` is set
2. The component is included in the global layout (already done)

### Organization Context

The widget automatically detects organization context from:
1. URL path parameters (`/org/[orgId]/...`)
2. URL search parameters (`?orgId=...`)
3. Browser cookies (`org_id`)

### Console Logging

The widget logs the following messages to the browser console:
- `Support Widget Initialized for Org: [orgId]` - On component initialization
- `Support Widget clicked - would open chat interface` - On click
- `Support Widget activated via keyboard - would open chat interface` - On keyboard activation

## Testing

### Unit Tests

Run the unit tests to verify component functionality:

```bash
pnpm test src/test/support-widget.test.tsx
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
import { verifySupportWidget } from '@/test/support-widget-verification';
verifySupportWidget();
```

## Future Integration

This boilerplate is designed to be easily extended with real third-party chat services:

1. **Replace console.log calls** with actual chat service initialization
2. **Add chat modal/interface** when the widget is clicked
3. **Integrate with organization context** for user identification
4. **Add real-time features** using the existing Supabase setup

## Styling

The widget uses Tailwind CSS classes and follows the project's design system:
- Primary color scheme
- Hover and active states
- Responsive design
- Accessibility features

## Accessibility

The widget includes:
- ARIA labels for screen readers
- Keyboard navigation support
- Focus management
- Semantic HTML structure

## Type Safety

All components are fully typed with TypeScript and pass the project's type checking:

```bash
pnpm typecheck
```
