# Batch Header: Configuration Tabs Update

**Date**: 2025-01-27  
**Scope**: 2-3 hour target  
**Status**: In Progress

## Inputs
- Task: Update Configuration tabs to match new structure and design patterns
- Reference files:
  - `apps/web/src/app/[locale]/(console)/console/database/page.tsx` (design pattern)
  - `apps/web/src/app/[locale]/(console)/console/errors/page.tsx` (design pattern)
  - `apps/web/src/components/console/ConsoleFlagsPage.tsx` (design pattern)
  - `apps/web/src/app/[locale]/(console)/console/config/page.tsx` (existing structure)

## Plan
1. Update Configuration main page tab structure
   - Rename "API & Keys" to "External API & Keys"
   - Add "Integrations" tab
   - Update tab navigation
2. Update Application > Settings tab to match protected screen design
3. Update Application > Deployment tab to match protected screen design
4. Update Environment tab to match protected screen design
5. Update System tab to match protected screen design
6. Create External API & Keys tab with sub-sections (API Keys, Webhooks Outbound)
7. Create Automations tab with sub-sections (Workflow Status, Execution History, Webhooks Inbound)
8. Create Integrations tab with proper structure
9. Ensure all tabs use consistent spacing (space-y-4 sm:space-y-6 lg:space-y-8)
10. Verify Switch components use green/red colors (already in base component)

## Risks & Assumptions
- **Risk**: Large file size may make refactoring complex
  - **Mitigation**: Make incremental changes, preserve existing functionality
- **Assumption**: All tabs should follow database/errors page design patterns
- **Assumption**: Switches already have green/red colors by default (confirmed)
- **Assumption**: Feature Flags and Jobs/Queue tabs are protected and should not be modified

## Script Additions
None - UI updates only

