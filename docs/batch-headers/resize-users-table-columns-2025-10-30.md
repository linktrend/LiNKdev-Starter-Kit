### Batch Header: Resize Users Table Columns

- **Scope**: 1–2 hours. Make the Users table columns responsive; constrain Role width, align headers/body visibility, and ensure columns resize when browser resizes.
- **Inputs**:
  - `apps/web/src/app/[locale]/(console)/console/security/page.tsx`
  - shadcn/ui `Table` usage within the file
- **Plan**:
  - Update the Users table to use `table-fixed w-full` so widths distribute predictably.
  - Set explicit widths: narrow `Role`, fixed `Actions` and `Status`, give `Last Login` a reasonable width; leave `User` to grow.
  - Align `hidden md:table-cell` breakpoints between header and body for `Status` and `Last Login`.
  - Add `truncate` to role text and long cells.
  - Verify visually and ensure no lint/type errors.
- **Risks & Assumptions**:
  - Assumes shadcn Table components pass `className` down to `<table>`.
  - Assumes no other CSS overrides conflict with Tailwind classes.
  - Small visual shifts acceptable; no layout regressions expected in other tabs.
- **Script Additions**: None.
