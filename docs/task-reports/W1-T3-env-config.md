# W1-T3 Environment Configuration Briefing

## Completed work
- Audited environment usage across `apps/web`, `packages/api`, Supabase config, and MCP servers; consolidated every variable into a single `.env.example` with grouped comments and placeholders.
- Added strict Zod validation in `apps/web/src/lib/env.ts`, re-exported via `apps/web/src/env.ts`, and expanded typings in `apps/web/src/env.d.ts` to cover all referenced variables (client and server).
- Documented setup in `README.md` (quick steps) and detailed guide at `apps/web/docs/ENVIRONMENT_SETUP.md`.

## Validation status
- Validation runs on import and fails fast when required values are missing.
- Supabase keys are required unless `TEMPLATE_OFFLINE=1`.
- Stripe secrets, publishable keys, webhook secret, and plan price IDs are required unless `BILLING_OFFLINE=1` (or `TEMPLATE_OFFLINE=1`).
- `RESEND_API_KEY` is required in production.

## Variables that need real values
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (and optional OAuth/SMS vars if used).
- Stripe: secret/publishable keys, webhook secret, price IDs (`STRIPE_PRO_MONTHLY_PRICE_ID`, `STRIPE_PRO_YEARLY_PRICE_ID`, `STRIPE_ENTERPRISE_MONTHLY_PRICE_ID`, `STRIPE_ENTERPRISE_YEARLY_PRICE_ID`, `STRIPE_PRO_MONTHLY_PLAN_ID`, optional helper price IDs).
- Resend: `RESEND_API_KEY` (plus your verified sender domain configuration).
- Automation/Cron: `N8N_WEBHOOK_URL`, `N8N_WEBHOOK_SECRET`, `CRON_SECRET`.
- Observability/analytics: PostHog key/host, Sentry DSN/environment if enabled.
- Storage/rate limits: adjust `FILES_BUCKET`, `STORAGE_*`, `RATE_LIMIT_*` if different from defaults.

## Docs added
- `.env.example` updated with descriptions and placeholders for every referenced variable.
- `apps/web/src/lib/env.ts` + `apps/web/src/env.d.ts` for validation and typing.
- README env setup section and `apps/web/docs/ENVIRONMENT_SETUP.md` detailed guide.
