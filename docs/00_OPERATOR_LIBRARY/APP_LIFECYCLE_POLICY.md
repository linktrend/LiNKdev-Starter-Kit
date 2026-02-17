# App Lifecycle Policy (Independent Repos)

This policy defines how improvements in LiNKdev Starter Kit are propagated to existing app repos.

## Golden Rule

No forced auto-sync across app repos.  
Each app repo pulls starter improvements intentionally.

## Update Strategy

1. Maintain starter-kit changes in `main` with clear commit messages.
2. Tag starter releases (example: `starter-v1.2.0`).
3. For each app repo, choose updates by tag/commit range.
4. Apply updates in a dedicated branch.
5. Run app repo verification gates before merge.

## Recommended Sync Method

In app repo:

```bash
git remote add starter-template <LiNKdev-Starter-Kit-URL>
git fetch starter-template --tags
git checkout -b chore/sync-starter-v1.2.0
```

Then cherry-pick relevant commits or copy targeted modules (for example CI, shared security fixes, billing fixes), and validate.

## What Must Be Backported to Existing Apps

- Security fixes
- Payment/billing correctness fixes
- Auth and data integrity fixes
- Critical CI and deployment fixes

## What Is Optional Per App

- UI polish updates
- Non-critical refactors
- Feature modules not used by that app

## Change Log Discipline

Every starter release must include:

- summary of changes
- risk level
- migration steps
- whether app repos must update immediately
