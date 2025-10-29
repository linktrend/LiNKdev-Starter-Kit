# Batch Header: Base UI Switch & CheckCircle2 Consistency Update

**Date**: 2025-01-27  
**Scope**: 30-45 minutes target  
**Status**: In Progress

## Inputs
- Task: Update Switch component to use green/red colors by default
- Reference files:
  - `apps/web/src/components/ui/switch.tsx`
  - `apps/web/src/components/console/ConsoleFlagsPage.tsx` (pattern reference)
  - `apps/web/src/app/[locale]/(console)/console/database/page.tsx` (design pattern)
  - CheckCircle2 usage across protected screens

## Plan
1. ✅ Update Switch component base colors (green ON, red OFF)
2. ✅ Verify CheckCircle2 icon usage consistency
3. ✅ Verify Card, Button, Badge components for consistency
4. ✅ Document CheckCircle2 pattern
5. ✅ Run type-check and lint

## Risks & Assumptions
- **Risk**: Existing switches may rely on current zinc colors
  - **Mitigation**: Check ConsoleFlagsPage.tsx already uses green/red, so this aligns with expectations
- **Assumption**: All CheckCircle2 icons should use standard sizes (h-4 w-4 or h-5 w-5) and green colors (text-green-500 or text-green-600)
- **Assumption**: No breaking changes needed - only styling updates

## Script Additions
None - cosmetic styling changes only

