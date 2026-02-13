# Design Tokens Reference

This document provides a comprehensive reference for the design tokens used throughout the LiNKdev Starter Kit application.

## Overview

Design tokens are the single source of truth for design decisions. They ensure consistency across the application and make it easy to maintain and update the design system.

## Token Categories

### Colors

Our color system is built around semantic naming and theme support (light/dark).

#### Background Colors
- `--color-background`: Main background color
- `--color-foreground`: Main text color

#### Muted Colors
- `--color-muted`: Muted background color
- `--color-muted-foreground`: Muted text color

#### Primary Colors
- `--color-primary`: Primary brand color
- `--color-primary-foreground`: Text color on primary background

#### Secondary Colors
- `--color-secondary`: Secondary brand color
- `--color-secondary-foreground`: Text color on secondary background

#### Status Colors
- `--color-success`: Success state color
- `--color-success-foreground`: Text color on success background
- `--color-warning`: Warning state color
- `--color-warning-foreground`: Text color on warning background
- `--color-danger`: Error/danger state color
- `--color-danger-foreground`: Text color on danger background

#### Interactive Colors
- `--color-border`: Border color
- `--color-ring`: Focus ring color

### Spacing

Our spacing scale follows a consistent 4px base unit:

- `--space-2`: 0.5rem (8px)
- `--space-4`: 1rem (16px)
- `--space-6`: 1.5rem (24px)
- `--space-8`: 2rem (32px)
- `--space-12`: 3rem (48px)
- `--space-16`: 4rem (64px)
- `--space-24`: 6rem (96px)

### Typography

#### Font Families
- `--font-sans`: Inter, system-ui, sans-serif
- `--font-mono`: JetBrains Mono, Menlo, Monaco, monospace

#### Font Sizes
- `--font-size-xs`: 0.75rem (12px)
- `--font-size-sm`: 0.875rem (14px)
- `--font-size-base`: 1rem (16px)
- `--font-size-lg`: 1.125rem (18px)
- `--font-size-xl`: 1.25rem (20px)
- `--font-size-2xl`: 1.5rem (24px)
- `--font-size-3xl`: 1.875rem (30px)

#### Font Weights
- `--font-weight-regular`: 400
- `--font-weight-medium`: 500
- `--font-weight-semibold`: 600

### Border Radius

- `--radius-sm`: 0.25rem (4px)
- `--radius-md`: 0.375rem (6px)
- `--radius-lg`: 0.5rem (8px)
- `--radius-xl`: 0.75rem (12px)
- `--radius-pill`: 9999px

### Shadows

- `--shadow-sm`: Subtle shadow for cards and elevated elements
- `--shadow-md`: Medium shadow for modals and dropdowns
- `--shadow-lg`: Large shadow for major overlays

### Z-Index

- `--z-dropdown`: 1000
- `--z-modal`: 1050
- `--z-toast`: 1100

## Usage

### In CSS
```css
.my-component {
  background-color: hsl(var(--color-background));
  color: hsl(var(--color-foreground));
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}
```

### In Tailwind CSS
```jsx
<div className="bg-background text-foreground p-4 rounded-lg shadow-md">
  Content
</div>
```

### In JavaScript/TypeScript
```typescript
const styles = {
  backgroundColor: 'hsl(var(--color-primary))',
  color: 'hsl(var(--color-primary-foreground))',
  padding: 'var(--space-4)',
  borderRadius: 'var(--radius-lg)'
};
```

## Theme Support

All color tokens have both light and dark variants:

```css
:root {
  --color-background: 0 0% 100%; /* Light theme */
}

.dark {
  --color-background: 240 10% 3.9%; /* Dark theme */
}
```

## Extension Guidelines

### Adding New Tokens

1. **Add to DESIGN_TOKENS.json**: Define the token with light/dark variants
2. **Update tokens.css**: Add CSS custom properties
3. **Update Tailwind config**: Map to Tailwind utilities
4. **Document here**: Add to this reference

### Naming Conventions

- Use kebab-case for token names
- Group related tokens under categories
- Use descriptive names that indicate purpose
- Include theme variants where applicable

### Value Guidelines

- Use consistent units (rem for spacing, px for borders)
- Follow established scale patterns
- Ensure accessibility compliance for color contrast
- Test both light and dark themes

## Migration

When updating tokens:

1. Test all components that use the changed tokens
2. Verify both light and dark themes work correctly
3. Update any hardcoded values to use tokens
4. Run visual regression tests if available

## Examples

### Button Component
```css
.btn {
  background-color: hsl(var(--color-primary));
  color: hsl(var(--color-primary-foreground));
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
}
```

### Card Component
```css
.card {
  background-color: hsl(var(--color-background));
  border: 1px solid hsl(var(--color-border));
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--space-6);
}
```

### Status Badge
```css
.badge-success {
  background-color: hsl(var(--color-success));
  color: hsl(var(--color-success-foreground));
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-pill);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}
```
