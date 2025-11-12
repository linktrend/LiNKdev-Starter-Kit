Scope: Update marketing CTAs to route to localized /signup (≤1 hour)

Inputs:
- apps/web/src/components/marketing/PricingPreview.tsx
- apps/web/src/components/marketing/CTASection.tsx
- Locale path helper `useLocalePath`

Plan:
- Change pricing tier CTAs (Free/Pro/Enterprise) to link to buildPath('/signup')
- Update "Get Started Free" CTA to navigate to buildPath('/signup') using Link
- Keep non-signup links (e.g., “View detailed pricing”) unchanged
- Verify locale is preserved

Risks & Assumptions:
- Assumes `/[locale]/signup` route exists
- Assumes these are the only signup-intent CTAs pointing elsewhere
- Minimal user-facing risk; simple link target changes

Script Additions:
- None


