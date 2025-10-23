let tokens = {};
try { tokens = require("../../design/DESIGN_TOKENS.json"); } catch {}

const mapColors = (t) => {
  const colors = t?.color ?? t?.colors ?? {};
  // Handle nested color structure and flatten it for Tailwind
  const flattened = {};
  Object.entries(colors).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      // Handle nested objects like { light: "...", dark: "..." }
      if (value.light && value.dark) {
        // Use CSS variables for themeable colors
        flattened[key] = `hsl(var(--${key}))`;
        flattened[`${key}-foreground`] = `hsl(var(--${key}-foreground))`;
      } else {
        // Handle other nested structures
        flattened[key] = value;
      }
    } else {
      flattened[key] = value;
    }
  });
  return flattened;
};
const mapRadius = (t) => t?.radius ?? {};
const mapSpacing = (t) => t?.space ?? t?.spacing ?? {};
const mapFontFamily = (t) => {
  const f = t?.font ?? t?.fontFamily ?? {};
  // Tailwind expects arrays for font families
  const toArray = (v) => (Array.isArray(v) ? v : (typeof v === "string" ? [v] : v));
  return Object.fromEntries(Object.entries(f).map(([k, v]) => [k, toArray(v)]));
};
const mapBoxShadow = (t) => t?.shadow ?? {};
const mapZIndex = (t) => t?.z ?? {};

module.exports = {
  darkMode: ["class"],
  theme: {
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
    extend: {
      colors: {
        ...mapColors(tokens),
        // Liquid Glass background colors
        'glass-light': 'rgba(255, 255, 255, 0.25)',
        'glass-light-hover': 'rgba(255, 255, 255, 0.40)',
        'glass-dark': 'rgba(0, 0, 0, 0.25)',
        'glass-dark-hover': 'rgba(0, 0, 0, 0.40)',
        // Liquid Glass border colors
        'glass-border-light': 'rgba(255, 255, 255, 0.40)',
        'glass-border-dark': 'rgba(255, 255, 255, 0.20)',
      },
      borderRadius: mapRadius(tokens),
      spacing: mapSpacing(tokens),
      fontFamily: mapFontFamily(tokens),
      boxShadow: {
        ...mapBoxShadow(tokens),
        // Liquid Glass shadow utilities
        'glass-subtle': '0 32px 80px rgba(0,0,0,0.3), 0 16px 64px rgba(255,255,255,0.2), inset 0 3px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(255,255,255,0.3)',
        'glass-subtle-dark': '0 32px 80px rgba(0,0,0,0.5), 0 16px 64px rgba(255,255,255,0.1), inset 0 3px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(255,255,255,0.15)',
      },
      backdropBlur: {
        'md-soft': '20px',
        'glass': '40px',
      },
      zIndex: mapZIndex(tokens),
    },
  },
  plugins: [],
};
