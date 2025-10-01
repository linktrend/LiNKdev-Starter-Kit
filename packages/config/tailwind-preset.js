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
      colors: mapColors(tokens),
      borderRadius: mapRadius(tokens),
      spacing: mapSpacing(tokens),
      fontFamily: mapFontFamily(tokens),
      boxShadow: mapBoxShadow(tokens),
      zIndex: mapZIndex(tokens),
    },
  },
  plugins: [],
};
