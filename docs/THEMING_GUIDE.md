# Theming Guide 🎨

This guide explains how to customize the appearance of both the web and mobile applications in the LTM Starter Kit monorepo.

## Overview

The theming system is built on a centralized design token architecture that ensures consistency across platforms:

- **Web App**: Next.js with Tailwind CSS + shadcn/ui components
- **Mobile App**: React Native with Expo + NativeWind
- **Shared Design Tokens**: Centralized configuration in `packages/config/`

## Quick Start

To change the theme colors, edit the design tokens file:

```bash
# Edit the central design tokens
code design/DESIGN_TOKENS.json
```

The changes will automatically apply to both web and mobile applications.

## Architecture

### 1. Design Tokens (`design/DESIGN_TOKENS.json`)

This is the **single source of truth** for all design decisions:

```json
{
  "color": {
    "background": {
      "light": "0 0% 100%",
      "dark": "240 10% 3.9%"
    },
    "primary": {
      "light": "240 5.9% 10%",
      "dark": "0 0% 98%"
    }
    // ... more colors
  },
  "radius": {
    "sm": "0.25rem",
    "md": "0.375rem",
    "lg": "0.5rem"
  },
  "space": {
    "2": "0.5rem",
    "4": "1rem",
    "6": "1.5rem"
  }
}
```

### 2. Tailwind Preset (`packages/config/tailwind-preset.js`)

Maps design tokens to Tailwind CSS classes:

```javascript
// Automatically generates Tailwind classes from design tokens
const mapColors = (t) => {
  // Maps nested color objects to CSS variables
  flattened[key] = `hsl(var(--${key}))`;
};
```

### 3. CSS Variables (`apps/web/src/styles/`)

Web-specific CSS variables that reference design tokens:

```css
:root {
  --background: 0 0% 100%;
  --primary: 240 5.9% 10%;
  --success: 142 76% 36%;
  /* ... more variables */
}

.dark {
  --background: 240 10% 3.9%;
  --primary: 0 0% 98%;
  /* ... dark theme variables */
}
```

## Customizing Colors

### Method 1: Edit Design Tokens (Recommended)

1. Open `design/DESIGN_TOKENS.json`
2. Modify the color values in HSL format
3. Restart the development server

```json
{
  "color": {
    "primary": {
      "light": "220 100% 50%",  // Blue
      "dark": "220 100% 70%"
    },
    "success": {
      "light": "120 100% 40%",  // Green
      "dark": "120 100% 60%"
    }
  }
}
```

### Method 2: Direct CSS Variables

For quick changes, edit `apps/web/src/styles/globals.css`:

```css
:root {
  --primary: 220 100% 50%;  /* Your custom color */
  --success: 120 100% 40%;
}
```

## Available Color Tokens

### Core Colors
- `background` - Main background color
- `foreground` - Primary text color
- `primary` - Brand primary color
- `secondary` - Secondary UI color
- `muted` - Muted background/text
- `border` - Border color
- `ring` - Focus ring color

### Semantic Colors
- `success` - Success states (green)
- `warning` - Warning states (yellow/orange)
- `danger` - Error/destructive states (red)

### Usage in Components

All components use these tokens automatically:

```tsx
// ✅ Correct - uses design tokens
<Button className="bg-primary text-primary-foreground">
  Click me
</Button>

// ❌ Wrong - hard-coded colors
<Button className="bg-blue-500 text-white">
  Click me
</Button>
```

## Customizing Spacing

Edit the `space` section in `design/DESIGN_TOKENS.json`:

```json
{
  "space": {
    "2": "0.5rem",   // 8px
    "4": "1rem",     // 16px
    "6": "1.5rem",   // 24px
    "8": "2rem",     // 32px
    "12": "3rem",    // 48px
    "16": "4rem",    // 64px
    "24": "6rem"     // 96px
  }
}
```

## Customizing Typography

Modify the `font` section:

```json
{
  "font": {
    "sans": ["Inter", "system-ui", "sans-serif"],
    "mono": ["JetBrains Mono", "Menlo", "Monaco", "monospace"],
    "size": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "base": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem"
    },
    "weight": {
      "regular": "400",
      "medium": "500",
      "semibold": "600"
    }
  }
}
```

## Customizing Border Radius

```json
{
  "radius": {
    "sm": "0.25rem",   // 4px
    "md": "0.375rem",  // 6px
    "lg": "0.5rem",    // 8px
    "xl": "0.75rem",   // 12px
    "pill": "9999px"   // Fully rounded
  }
}
```

## Mobile App Theming

The mobile app automatically inherits the same design tokens through the shared configuration. The `apps/mobile/tailwind.config.js` uses the same preset:

```javascript
module.exports = {
  presets: [require('@starter/config/tailwind-preset')],
  // ... rest of config
};
```

## Dark Mode

Dark mode is automatically handled through CSS variables. The design tokens include both light and dark values:

```json
{
  "color": {
    "background": {
      "light": "0 0% 100%",      // White
      "dark": "240 10% 3.9%"     // Dark gray
    }
  }
}
```

## Component Library

All UI components are exported from `@starter/ui` and use the design tokens:

```tsx
import { Button, Card, Input, Form } from '@starter/ui';

// These components automatically use your theme
<Button variant="primary">Submit</Button>
<Card className="p-4">Content</Card>
```

## Best Practices

### ✅ Do
- Always use design tokens for colors, spacing, and typography
- Import components from `@starter/ui`
- Test both light and dark modes
- Use semantic color names (primary, success, danger)

### ❌ Don't
- Use hard-coded colors like `bg-blue-500`
- Import components directly from `@/components/ui/`
- Mix different theming approaches
- Ignore accessibility contrast ratios

## Troubleshooting

### Colors Not Updating
1. Check that you're editing the correct file (`design/DESIGN_TOKENS.json`)
2. Restart the development server
3. Clear browser cache
4. Verify CSS variables are being generated correctly

### Mobile App Not Theming
1. Ensure `apps/mobile/tailwind.config.js` uses the preset
2. Check that NativeWind is properly configured
3. Restart the Expo development server

### Build Errors
1. Run `pnpm run type-check` to check for TypeScript errors
2. Run `pnpm run lint` to check for linting issues
3. Ensure all imports use `@starter/ui`

## Advanced Customization

### Custom CSS Variables

For platform-specific customizations, add variables to the appropriate CSS file:

```css
/* apps/web/src/styles/globals.css */
:root {
  --custom-gradient: linear-gradient(45deg, var(--primary), var(--secondary));
}
```

### Custom Tailwind Classes

Add custom utilities in the Tailwind config:

```javascript
// packages/config/tailwind-preset.js
module.exports = {
  theme: {
    extend: {
      // Your custom extensions
    }
  }
};
```

## Verification

After making theme changes:

1. **Web App**: `pnpm run dev` and check both light/dark modes
2. **Mobile App**: `pnpm run mobile:start` and test on device/simulator
3. **Build Test**: `pnpm run build` to ensure no errors
4. **Type Check**: `pnpm run type-check` for TypeScript validation

## Support

For questions or issues with theming:

1. Check this guide first
2. Review the design tokens file
3. Check component implementations in `packages/ui/`
4. Verify Tailwind configuration

---

**Remember**: The design tokens file is the single source of truth. All theme changes should start there for consistency across platforms.
