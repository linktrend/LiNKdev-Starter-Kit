# Design System v0

This document outlines the initial design system implementation for LTM Starter Kit, focusing on design tokens and primitive components.

## Overview

Design System v0 provides:
- **Design Tokens**: Single source of truth for design decisions
- **Primitive Components**: Basic UI building blocks
- **Theme Support**: Light/dark mode switching
- **Consistent Styling**: Unified approach across the application

## Design Tokens

### Color System
- **Semantic naming**: Colors are named by purpose, not appearance
- **Theme support**: All colors have light and dark variants
- **Status colors**: Success, warning, danger states
- **Interactive colors**: Border, ring, and focus states

### Spacing Scale
- **4px base unit**: Consistent spacing throughout
- **7 scale steps**: From 8px to 96px
- **Semantic naming**: Space-2, space-4, etc.

### Typography
- **Font families**: Sans (Inter) and mono (JetBrains Mono)
- **Size scale**: 7 sizes from xs to 3xl
- **Weight scale**: Regular, medium, semibold

### Other Tokens
- **Border radius**: 5 sizes from sm to pill
- **Shadows**: 3 elevation levels
- **Z-index**: Layered stacking context

## Primitive Components

### Button
**Variants:**
- `default`: Primary action button
- `secondary`: Secondary action button
- `outline`: Outlined button
- `ghost`: Minimal button
- `destructive`: Dangerous action button

**Sizes:**
- `default`: Standard size
- `sm`: Small size
- `lg`: Large size
- `icon`: Square icon button

**Usage:**
```jsx
<Button variant="primary" size="lg">
  Click me
</Button>
```

### Badge
**Variants:**
- `default`: Primary badge
- `secondary`: Secondary badge
- `success`: Success state
- `warning`: Warning state
- `danger`: Error state
- `outline`: Outlined badge

**Usage:**
```jsx
<Badge variant="success">Active</Badge>
```

### Alert
**Variants:**
- `info`: Informational alert
- `success`: Success message
- `warning`: Warning message
- `danger`: Error message

**Usage:**
```jsx
<Alert variant="success">
  <AlertTitle>Success!</AlertTitle>
  <AlertDescription>Operation completed successfully.</AlertDescription>
</Alert>
```

### Card
**Components:**
- `Card`: Main container
- `CardHeader`: Header section
- `CardTitle`: Title text
- `CardDescription`: Description text
- `CardContent`: Main content
- `CardFooter`: Footer section

**Usage:**
```jsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
</Card>
```

### Input
**Features:**
- Consistent styling with design tokens
- Focus states and accessibility
- Placeholder support
- Disabled states

**Usage:**
```jsx
<Input placeholder="Enter text..." />
```

### Select
**Features:**
- Radix UI based
- Keyboard navigation
- Accessibility compliant
- Customizable styling

**Usage:**
```jsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### Spinner
**Sizes:**
- `sm`: Small spinner
- `md`: Medium spinner (default)
- `lg`: Large spinner
- `xl`: Extra large spinner

**Features:**
- Optional text
- Consistent styling
- Loading states

**Usage:**
```jsx
<Spinner size="lg" text="Loading..." />
```

## Theme System

### Theme Provider
The application uses `next-themes` for theme management:

```jsx
<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  {children}
</ThemeProvider>
```

### Theme Toggle
A simple toggle component for switching themes:

```jsx
<ThemeToggle />
```

### CSS Variables
All design tokens are available as CSS custom properties:

```css
:root {
  --color-background: 0 0% 100%;
  --color-foreground: 240 10% 3.9%;
  /* ... more tokens */
}

.dark {
  --color-background: 240 10% 3.9%;
  --color-foreground: 0 0% 98%;
  /* ... dark variants */
}
```

## Usage Patterns

### Do's
- ✅ Use design tokens for all styling
- ✅ Use primitive components as building blocks
- ✅ Follow semantic naming conventions
- ✅ Test both light and dark themes
- ✅ Use appropriate variants for different states

### Don'ts
- ❌ Don't hardcode colors or spacing values
- ❌ Don't create custom components without using primitives
- ❌ Don't ignore accessibility requirements
- ❌ Don't mix design systems

## Migration Guide

### From Raw HTML
Replace raw HTML elements with primitive components:

```jsx
// Before
<button className="bg-blue-500 text-white px-4 py-2 rounded">
  Click me
</button>

// After
<Button variant="default">
  Click me
</Button>
```

### From Custom Styling
Replace custom CSS with design tokens:

```css
/* Before */
.my-component {
  background-color: #ffffff;
  padding: 16px;
  border-radius: 8px;
}

/* After */
.my-component {
  background-color: hsl(var(--color-background));
  padding: var(--space-4);
  border-radius: var(--radius-lg);
}
```

## Testing

### Component Tests
All primitive components have comprehensive tests:

```bash
npm test tests/ui.primitives.spec.tsx
```

### Token Tests
Design tokens are validated for completeness:

```bash
npm test tests/pages.tokens-wiring.spec.ts
```

## Future Enhancements

### Planned Features
- More primitive components (Table, Dialog, etc.)
- Animation tokens
- Responsive design tokens
- Component composition patterns

### Design Pass
The next phase will include:
- Visual design improvements
- Brand-specific styling
- Advanced component patterns
- Design system documentation site

## Resources

- [Design Tokens Reference](./DESIGN_TOKENS.md)
- [Component Source Code](../apps/web/src/components/ui/)
- [Design Tokens JSON](../apps/web/design/DESIGN_TOKENS.json)
- [Tailwind Configuration](../apps/web/tailwind.config.js)
