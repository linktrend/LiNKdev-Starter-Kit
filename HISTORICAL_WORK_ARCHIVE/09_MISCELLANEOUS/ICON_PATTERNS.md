# Icon Patterns - CheckCircle2 Usage

**Archive Date:** December 22, 2025  
**Original Documentation:** Ongoing  
**Status:** Active Pattern - In Use

---

## Overview

The `CheckCircle2` icon from `lucide-react` is used consistently across the application to indicate success, completion, or positive status. This document establishes the standard pattern for its usage.

---

## Standard Pattern

### Icon Import
```tsx
import { CheckCircle2 } from 'lucide-react';
```

---

## Standard Sizes

Use one of these standard sizes:

### Small (Inline)
- **Class:** `h-4 w-4`
- **Usage:** Inline icons, buttons, and table cells
- **Example:** Status indicators in tables, button icons

### Medium (Headers)
- **Class:** `h-5 w-5`
- **Usage:** Card headers and larger status indicators
- **Example:** Section headers, card titles

---

## Standard Colors

Use one of these standard colors:

### Primary Success
- **Class:** `text-green-500`
- **Usage:** Standard success color (most common)
- **Example:** Completed tasks, successful operations

### Emphasized Success
- **Class:** `text-green-600`
- **Usage:** Slightly darker green for emphasis
- **Example:** Important success states, primary actions

---

## Usage Examples

### Inline Status Icon
```tsx
<CheckCircle2 className="h-4 w-4 text-green-500" />
```

**Use Case:** Table cell status indicator, inline success message

### Card Header Status
```tsx
<CheckCircle2 className="h-5 w-5 text-green-600" />
```

**Use Case:** Section header with status, card title indicator

### Conditional Status Display
```tsx
{status === 'completed' ? (
  <CheckCircle2 className="h-4 w-4 text-green-500" />
) : (
  <XCircle className="h-4 w-4 text-red-500" />
)}
```

**Use Case:** Toggle between success and error states

### With Text Label
```tsx
<div className="flex items-center gap-2">
  <CheckCircle2 className="h-4 w-4 text-green-500" />
  <span>Completed</span>
</div>
```

**Use Case:** Status label with icon

### In Button
```tsx
<Button>
  <CheckCircle2 className="h-4 w-4 mr-2" />
  Mark Complete
</Button>
```

**Use Case:** Action button with success icon

---

## Usage Locations

This pattern is consistently used in:

### Console Pages
- **Database Page:** Table RLS status indicators
- **Jobs/Queue Page:** Job status indicators
- **Health Checks Page:** Service health status
- **Config Page:** Build and environment status
- **Reports Page:** Report completion status

### Dashboard Pages
- Task completion indicators
- Success notifications
- Status badges
- Confirmation messages

### Components
- Table cells
- Status badges
- Notification toasts
- Success modals
- Confirmation dialogs

---

## Complementary Icons

### Negative States
For negative or error states, use `XCircle` with red colors:

```tsx
<XCircle className="h-4 w-4 text-red-500" />
<XCircle className="h-4 w-4 text-red-600" />
```

### Warning States
For warning states, use `AlertCircle` with yellow colors:

```tsx
<AlertCircle className="h-4 w-4 text-yellow-500" />
<AlertCircle className="h-4 w-4 text-yellow-600" />
```

### Info States
For informational states, use `Info` with blue colors:

```tsx
<Info className="h-4 w-4 text-blue-500" />
<Info className="h-4 w-4 text-blue-600" />
```

---

## Best Practices

### Do's ✅
- Always pair with appropriate sizing classes
- Use consistent color classes across similar contexts
- Maintain icon-text alignment with flex containers
- Use semantic HTML when wrapping icons
- Consider accessibility with aria-labels when needed

### Don'ts ❌
- Don't use arbitrary sizes (stick to h-4/w-4 or h-5/w-5)
- Don't use colors without explicit classes (avoid inheriting from parent)
- Don't mix icon sizes in the same context
- Don't use CheckCircle2 for negative states
- Don't forget to import from lucide-react

---

## Accessibility Considerations

### Screen Readers
When the icon conveys important information, add an aria-label:

```tsx
<CheckCircle2 
  className="h-4 w-4 text-green-500" 
  aria-label="Completed"
/>
```

### Decorative Icons
When the icon is purely decorative (text already conveys meaning):

```tsx
<CheckCircle2 
  className="h-4 w-4 text-green-500" 
  aria-hidden="true"
/>
```

### Focus States
When icons are interactive, ensure proper focus states:

```tsx
<button className="focus:ring-2 focus:ring-green-500">
  <CheckCircle2 className="h-4 w-4 text-green-500" />
</button>
```

---

## Migration Notes

### From Old Patterns
If you encounter icons without explicit colors:

**Before:**
```tsx
<CheckCircle2 className="h-4 w-4" />
```

**After:**
```tsx
<CheckCircle2 className="h-4 w-4 text-green-500" />
```

### From Other Check Icons
If you encounter other check icon variants:

**Before:**
```tsx
<Check className="h-4 w-4" />
<CheckCircle className="h-4 w-4" />
```

**After:**
```tsx
<CheckCircle2 className="h-4 w-4 text-green-500" />
```

---

## Related Patterns

### Badge with Icon
When using CheckCircle2 in badges, follow badge preset patterns:

```tsx
<Badge variant="success">
  <CheckCircle2 className="h-3 w-3 mr-1" />
  Active
</Badge>
```

### Status Indicator Component
For reusable status indicators:

```tsx
const StatusIndicator = ({ status }: { status: 'success' | 'error' | 'warning' }) => {
  const icons = {
    success: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    error: <XCircle className="h-4 w-4 text-red-500" />,
    warning: <AlertCircle className="h-4 w-4 text-yellow-500" />,
  };
  
  return icons[status];
};
```

---

## Testing Checklist

When implementing CheckCircle2 icons:

- [ ] Icon size is either h-4/w-4 or h-5/w-5
- [ ] Color class is explicitly set (text-green-500 or text-green-600)
- [ ] Icon is properly aligned with adjacent text
- [ ] Accessibility attributes added when needed
- [ ] Consistent with other icons in the same context
- [ ] Responsive behavior tested on mobile
- [ ] Dark mode appearance verified
- [ ] Focus states work for interactive icons

---

## Conclusion

The CheckCircle2 icon pattern provides a consistent, accessible, and visually appealing way to indicate success states across the application. By following these guidelines, we ensure a cohesive user experience and maintainable codebase.

**Status:** ✅ ACTIVE PATTERN  
**Adoption:** Widely used across application  
**Maintenance:** Ongoing

---

**Archive Note:** This pattern documentation remains active and is referenced during development. The CheckCircle2 pattern is a core part of the application's design system.
