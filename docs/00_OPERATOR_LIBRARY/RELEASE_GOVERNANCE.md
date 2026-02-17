# Release Governance Checklist

This checklist defines when the starter is safe to generate new apps from.

## Command Gate (Must Pass)

Run from starter root:

```bash
./scripts/release-readiness.sh
```

Includes:
- `pnpm verify:web`
- `pnpm verify:mobile`
- `pnpm --filter @starter/api test:unit`
- `pnpm --filter @starter/api test:integration`
- `pnpm --filter ./apps/web build`
- `pnpm --filter ./apps/web env:check`

If release env is ready, also run:

```bash
./scripts/release-readiness.sh --with-e2e
```

## Manual Gate (Must Be Confirmed)

- Migration review complete (`apps/web/supabase/migrations`)
- No breaking env-var changes without docs update
- Smoke deploy completed (web at minimum)
- Rollback tested to last known good commit/tag
- Documentation in `docs/00_OPERATOR_LIBRARY` updated for any workflow changes

## CI Gate (Must Pass on `main`)

- Typecheck/lint job
- Unit tests
- Integration tests
- E2E tests (when secrets are configured)
- Coverage job
- Mobile verify job

## Release Decision

Release is approved only when all required command, manual, and CI gates pass.
