## Batch Header

- **Scope**: Implement tabbed Configuration screen with 6 tabs and nested Application tabs; simplify sidebar to only Configuration. Target 1–2 hours.
- **Inputs**:
  - `apps/web/src/app/[locale]/(console)/console/config/page.tsx`
  - `apps/web/src/components/ui/tabs.tsx`
  - `apps/web/src/components/navigation/ConsoleSidebar.tsx`
  - `apps/web/src/app/[locale]/(console)/console/layout.tsx`
- **Plan**:
  - Update top-level Configuration tabs: Application, Environment, System, External API, Automations, Integrations.
  - Ensure default selection is Application and add nested tabs: Settings, Feature Flags, Jobs/Queue, Deployment.
  - Adjust TabList classes to match layout requirements.
  - Rename label/value from "External API & Keys" to "External API".
  - Simplify sidebar to only show a single Configuration entry (no child links).
  - Update screen name mapping for new External API label.
- **Risks & Assumptions**:
  - Assumption: Configuration content is already implemented within `config/page.tsx` and can remain as a single tabbed screen.
  - Risk: Removing other sidebar links is desired globally; this may reduce discoverability of other console areas. Proceeding per instruction.
- **Script Additions**: None.


