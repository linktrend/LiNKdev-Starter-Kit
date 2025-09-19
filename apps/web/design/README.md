# Design Tokens

This directory contains the design system tokens that serve as the single source of truth for design decisions across the application.

## Structure

- `DESIGN_TOKENS.json` - The main tokens file containing all design values
- `README.md` - This documentation file

## Token Categories

### Color
- **Semantic colors**: background, foreground, muted, primary, secondary
- **Status colors**: success, warning, danger
- **Interactive colors**: border, ring
- **Theme support**: Each color has light and dark variants

### Radius
- **Border radius values**: sm, md, lg, xl, pill
- **Used for**: buttons, cards, inputs, and other rounded elements

### Shadow
- **Elevation levels**: sm, md, lg
- **Used for**: cards, modals, dropdowns, and depth indication

### Space
- **Spacing scale**: 2, 4, 6, 8, 12, 16, 24
- **Used for**: margins, padding, gaps between elements

### Font
- **Font families**: sans, mono
- **Font sizes**: xs through 3xl
- **Font weights**: regular, medium, semibold

### Z-Index
- **Layer management**: dropdown, modal, toast
- **Used for**: stacking context management

## Extension Rules

### Adding New Tokens
1. Add the token to `DESIGN_TOKENS.json`
2. Update the corresponding CSS variables in `src/styles/tokens.css`
3. Update Tailwind config if needed
4. Document the new token in this README

### Naming Conventions
- Use kebab-case for token names
- Group related tokens under categories
- Use descriptive names that indicate purpose
- Include theme variants (light/dark) where applicable

### Value Guidelines
- Use consistent units (rem for spacing, px for borders, etc.)
- Follow the established scale patterns
- Ensure accessibility compliance for color contrast
- Test both light and dark themes

## Usage

Tokens are automatically loaded into:
- CSS custom properties (CSS variables)
- Tailwind CSS configuration
- TypeScript types (when generated)

## Migration Notes

When updating tokens:
1. Test all components that use the changed tokens
2. Verify both light and dark themes work correctly
3. Update any hardcoded values to use tokens
4. Run visual regression tests if available
