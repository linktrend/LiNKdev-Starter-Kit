# Design System

**Complete guide to the LiNKdev Starter Kit design system**

---

## Table of Contents

1. [Overview](#overview)
2. [Design Tokens](#design-tokens)
3. [Color System](#color-system)
4. [Typography](#typography)
5. [Spacing](#spacing)
6. [Components](#components)
7. [Theming](#theming)
8. [Usage Guidelines](#usage-guidelines)

---

## Overview

The LiNKdev Starter Kit design system provides a consistent, scalable approach to building user interfaces across web and mobile platforms.

### Key Principles

1. **Token-based** - Single source of truth for design decisions
2. **Theme-aware** - Built-in light/dark mode support
3. **Semantic naming** - Colors and tokens named by purpose, not appearance
4. **Component-driven** - Reusable UI primitives
5. **Type-safe** - Full TypeScript support

### Architecture

```
design/DESIGN_TOKENS.json          # Source of truth
    ↓
packages/config/tailwind-preset    # Tailwind configuration
    ↓
packages/ui/                       # UI components
    ↓
apps/web/                          # Web application
apps/mobile/                       # Mobile application
```

---

## Design Tokens

Design tokens are stored in `design/DESIGN_TOKENS.json` and automatically mapped to:
- CSS variables (web)
- Tailwind classes (web)
- Theme objects (mobile)

### Token Structure

```json
{
  "color": {
    "background": { "light": "0 0% 100%", "dark": "240 10% 3.9%" },
    "foreground": { "light": "240 10% 3.9%", "dark": "0 0% 98%" },
    "primary": { "light": "240 5.9% 10%", "dark": "0 0% 98%" }
  },
  "space": {
    "2": "0.5rem",
    "4": "1rem",
    "6": "1.5rem"
  },
  "radius": {
    "sm": "0.25rem",
    "md": "0.375rem",
    "lg": "0.5rem"
  }
}
```

---

## Color System

### Semantic Colors

Colors are named by their purpose, not their appearance:

| Token | Purpose | Light Mode | Dark Mode |
|-------|---------|------------|-----------|
| `background` | Main background | White | Dark gray |
| `foreground` | Main text | Black | White |
| `primary` | Primary actions | Brand color | Brand color |
| `secondary` | Secondary actions | Gray | Gray |
| `muted` | Subtle backgrounds | Light gray | Dark gray |
| `accent` | Accent elements | Accent color | Accent color |
| `destructive` | Dangerous actions | Red | Red |

### Status Colors

| Token | Purpose |
|-------|---------|
| `success` | Success states |
| `warning` | Warning states |
| `danger` | Error states |
| `info` | Informational states |

### Interactive Colors

| Token | Purpose |
|-------|---------|
| `border` | Border color |
| `input` | Input border color |
| `ring` | Focus ring color |

### Color Format

Colors use HSL format without the `hsl()` wrapper:

```css
/* Design token */
"primary": { "light": "240 5.9% 10%" }

/* CSS variable */
--primary: 240 5.9% 10%;

/* Usage */
color: hsl(var(--primary));
```

### Usage

```tsx
// ✅ GOOD: Use semantic color classes
<div className="bg-primary text-primary-foreground">

// ✅ GOOD: Use design tokens
<div className="bg-background text-foreground">

// ❌ BAD: Never use raw hex colors
<div className="bg-[#3b82f6]">
```

---

## Typography

### Font Families

```json
{
  "font": {
    "sans": "Inter, system-ui, sans-serif",
    "mono": "JetBrains Mono, Menlo, Monaco, monospace"
  }
}
```

### Font Sizes

| Token | Size | Usage |
|-------|------|-------|
| `xs` | 0.75rem (12px) | Small labels, captions |
| `sm` | 0.875rem (14px) | Secondary text |
| `base` | 1rem (16px) | Body text |
| `lg` | 1.125rem (18px) | Large body text |
| `xl` | 1.25rem (20px) | Small headings |
| `2xl` | 1.5rem (24px) | Medium headings |
| `3xl` | 1.875rem (30px) | Large headings |

### Font Weights

| Token | Weight | Usage |
|-------|--------|-------|
| `regular` | 400 | Body text |
| `medium` | 500 | Emphasis |
| `semibold` | 600 | Headings, buttons |

### Usage

```tsx
<h1 className="text-3xl font-semibold">Heading</h1>
<p className="text-base font-regular">Body text</p>
<span className="text-sm text-muted-foreground">Caption</span>
```

---

## Spacing

### Spacing Scale

Based on 4px increments:

| Token | Size | Usage |
|-------|------|-------|
| `space-2` | 0.5rem (8px) | Tight spacing |
| `space-4` | 1rem (16px) | Default spacing |
| `space-6` | 1.5rem (24px) | Medium spacing |
| `space-8` | 2rem (32px) | Large spacing |
| `space-12` | 3rem (48px) | Extra large spacing |
| `space-16` | 4rem (64px) | Section spacing |
| `space-24` | 6rem (96px) | Major section spacing |

### Usage

```tsx
<div className="p-4">        {/* Padding: 16px */}
<div className="m-6">        {/* Margin: 24px */}
<div className="gap-2">      {/* Gap: 8px */}
<div className="space-y-4">  {/* Vertical spacing: 16px */}
```

---

## Components

### Button

**Variants:**
- `default` - Primary action button
- `secondary` - Secondary action button
- `outline` - Outlined button
- `ghost` - Minimal button
- `destructive` - Dangerous action button
- `link` - Link-styled button

**Sizes:**
- `default` - Standard size
- `sm` - Small size
- `lg` - Large size
- `icon` - Square icon button

**Usage:**
```tsx
import { Button } from '@starter/ui';

<Button variant="default" size="lg">
  Click me
</Button>

<Button variant="destructive" size="sm">
  Delete
</Button>
```

### Badge

**Variants:**
- `default` - Primary badge
- `secondary` - Secondary badge
- `success` - Success state
- `warning` - Warning state
- `danger` - Error state
- `outline` - Outlined badge

**Usage:**
```tsx
import { Badge } from '@starter/ui';

<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
```

### Card

**Components:**
- `Card` - Main container
- `CardHeader` - Header section
- `CardTitle` - Title text
- `CardDescription` - Description text
- `CardContent` - Main content
- `CardFooter` - Footer section

**Usage:**
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@starter/ui';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
</Card>
```

### Alert

**Variants:**
- `default` - Default alert
- `success` - Success message
- `warning` - Warning message
- `destructive` - Error message

**Usage:**
```tsx
import { Alert, AlertTitle, AlertDescription } from '@starter/ui';

<Alert variant="success">
  <AlertTitle>Success!</AlertTitle>
  <AlertDescription>
    Operation completed successfully.
  </AlertDescription>
</Alert>
```

### Dialog

**Components:**
- `Dialog` - Root component
- `DialogTrigger` - Trigger button
- `DialogContent` - Content container
- `DialogHeader` - Header section
- `DialogTitle` - Title text
- `DialogDescription` - Description text
- `DialogFooter` - Footer section

**Usage:**
```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@starter/ui';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    <p>Dialog content</p>
    <DialogFooter>
      <Button>Close</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Form Components

**Input:**
```tsx
import { Input } from '@starter/ui';

<Input type="email" placeholder="Email" />
```

**Textarea:**
```tsx
import { Textarea } from '@starter/ui';

<Textarea placeholder="Enter your message" />
```

**Select:**
```tsx
import { Select, SelectTrigger, SelectContent, SelectItem } from '@starter/ui';

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
    <SelectItem value="2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

**Checkbox:**
```tsx
import { Checkbox } from '@starter/ui';

<Checkbox id="terms" />
<label htmlFor="terms">Accept terms</label>
```

**Radio Group:**
```tsx
import { RadioGroup, RadioGroupItem } from '@starter/ui';

<RadioGroup defaultValue="option1">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option1" id="option1" />
    <label htmlFor="option1">Option 1</label>
  </div>
</RadioGroup>
```

### Available Components

Full list of components in `packages/ui/`:

- **Layout:** Card, Separator, Tabs
- **Forms:** Input, Textarea, Select, Checkbox, Radio, Switch
- **Buttons:** Button, Toggle
- **Feedback:** Alert, Toast, Badge, Progress
- **Overlays:** Dialog, Sheet, Popover, Dropdown Menu
- **Navigation:** Tabs, Breadcrumb
- **Data Display:** Table, Avatar, Tooltip
- **Typography:** Heading, Text, Label

---

## Theming

### Light/Dark Mode

The design system includes built-in light and dark themes.

**Switching Themes:**
```tsx
import { useTheme } from 'next-themes';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <Button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </Button>
  );
}
```

### Custom Themes

**1. Edit Design Tokens:**

```json
// design/DESIGN_TOKENS.json
{
  "color": {
    "primary": {
      "light": "220 100% 50%",  // Custom blue
      "dark": "220 100% 70%"
    }
  }
}
```

**2. Update CSS Variables:**

```css
/* apps/web/src/styles/globals.css */
:root {
  --primary: 220 100% 50%;
}

.dark {
  --primary: 220 100% 70%;
}
```

**3. Restart Dev Server:**

```bash
pnpm --filter ./apps/web dev
```

---

## Usage Guidelines

### Do's

✅ **Use semantic color names**
```tsx
<div className="bg-primary text-primary-foreground">
```

✅ **Use design tokens for spacing**
```tsx
<div className="p-4 gap-2">
```

✅ **Import components from @starter/ui**
```tsx
import { Button } from '@starter/ui';
```

✅ **Use consistent border radius**
```tsx
<div className="rounded-md">
```

✅ **Follow typography scale**
```tsx
<h1 className="text-3xl font-semibold">
```

### Don'ts

❌ **Never use raw hex colors**
```tsx
<div className="bg-[#3b82f6]">  // BAD
```

❌ **Never import Radix UI directly**
```tsx
import { Button } from '@radix-ui/react-button';  // BAD
```

❌ **Never use arbitrary spacing values**
```tsx
<div className="p-[13px]">  // BAD
```

❌ **Never use arbitrary font sizes**
```tsx
<div className="text-[17px]">  // BAD
```

❌ **Never skip semantic naming**
```tsx
<div className="bg-blue-500">  // BAD
```

### ESLint Enforcement

The design system is enforced by ESLint rules:

```json
{
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": ["@radix-ui/*"]
      }
    ]
  }
}
```

---

## Border Radius

| Token | Size | Usage |
|-------|------|-------|
| `radius-sm` | 0.25rem (4px) | Small elements |
| `radius-md` | 0.375rem (6px) | Default |
| `radius-lg` | 0.5rem (8px) | Cards, dialogs |
| `radius-xl` | 0.75rem (12px) | Large elements |
| `radius-pill` | 9999px | Pills, badges |

**Usage:**
```tsx
<div className="rounded-md">     {/* 6px */}
<div className="rounded-lg">     {/* 8px */}
<div className="rounded-full">   {/* Pill */}
```

---

## Shadows

| Token | Usage |
|-------|-------|
| `shadow-sm` | Subtle elevation (cards) |
| `shadow-md` | Medium elevation (dropdowns) |
| `shadow-lg` | High elevation (modals) |

**Usage:**
```tsx
<div className="shadow-sm">  {/* Subtle shadow */}
<div className="shadow-md">  {/* Medium shadow */}
<div className="shadow-lg">  {/* Large shadow */}
```

---

## Z-Index

| Token | Value | Usage |
|-------|-------|-------|
| `z-dropdown` | 1000 | Dropdown menus |
| `z-modal` | 1050 | Modal dialogs |
| `z-toast` | 1100 | Toast notifications |

---

## Responsive Design

### Breakpoints

```tsx
// Tailwind breakpoints
sm: 640px   // Small devices
md: 768px   // Medium devices
lg: 1024px  // Large devices
xl: 1280px  // Extra large devices
2xl: 1536px // 2X large devices
```

### Usage

```tsx
<div className="p-4 md:p-6 lg:p-8">
  {/* 16px on mobile, 24px on tablet, 32px on desktop */}
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* 1 column on mobile, 2 on tablet, 3 on desktop */}
</div>
```

---

## Accessibility

### Color Contrast

All color combinations meet WCAG AA standards:
- Normal text: 4.5:1 contrast ratio
- Large text: 3:1 contrast ratio

### Focus States

All interactive elements have visible focus states:

```tsx
<Button className="focus:ring-2 focus:ring-ring focus:ring-offset-2">
  Click me
</Button>
```

### Semantic HTML

Use semantic HTML elements:

```tsx
// ✅ GOOD
<button>Click me</button>

// ❌ BAD
<div onClick={...}>Click me</div>
```

---

## Next Steps

- **Project Structure:** [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
- **Architecture:** [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Development Guide:** [../03_DEVELOPMENT/DEVELOPMENT_GUIDE.md](../03_DEVELOPMENT/DEVELOPMENT_GUIDE.md)
- **Component Documentation:** `packages/ui/README.md`

---

**Last Updated:** 2025-12-22
