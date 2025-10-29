# Batch Header: Console Navigation Structure Update

## Scope
Update console navigation sidebar and routing to match new hierarchical structure with collapsible Configuration section.

## Inputs
- `apps/web/src/components/navigation/ConsoleSidebar.tsx` - Current sidebar structure
- `apps/web/src/app/[locale]/(console)/console/layout.tsx` - Route detection logic
- Target routing structure provided in requirements

## Plan
1. Update `ConsoleSidebar` component:
   - Reorder main navigation items: Overview, Health Checks, Database, Errors & Logs, Reports, Security & Access, Configuration
   - Add collapsible/expandable Configuration section with sub-items
   - Configure sub-items: Application (with sub-tabs), Environment, System, External API & Keys, Automations, Integrations
   - Handle active/expanded states for parent items
   - Maintain collapse/expand state in component state
   - Update icons as needed from lucide-react

2. Update `layout.tsx` `getScreenName` function:
   - Add mappings for all new routes
   - Handle nested config routes (application/settings, application/feature-flags, etc.)
   - Handle reports and security routes

3. Test navigation:
   - Verify active state highlighting
   - Test Configuration expand/collapse
   - Verify all route transitions work

## Risks & Assumptions
- Assumes all route pages will be created separately
- Assumes Configuration should auto-expand when on any config sub-route
- Configuration defaults to Application > Settings when navigating to /console/config
- Icons available in lucide-react for all new sections

## Script Additions
None required.

