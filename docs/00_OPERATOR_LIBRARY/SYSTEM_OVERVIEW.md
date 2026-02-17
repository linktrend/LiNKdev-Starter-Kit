# System Overview (Plain English)

LiNKdev Starter Kit is a reusable engineering baseline for creating SaaS apps quickly.

## What It Includes

- Web app: Next.js + TypeScript
- Mobile app baseline: Expo + React Native
- API layer: tRPC package in `packages/api`
- Auth + DB: Supabase
- Billing: Stripe integration
- Shared UI and config packages
- CI workflow and test suites

## How It Is Intended to Be Used

- The starter repo is the template source.
- Each new product is created as a new independent repository.
- Each product gets its own Supabase project and deployment stack.
- Stripe account is shared, but products/prices are separated by app.

## Billing Defaults

- Free
- Pro
- Business

## Why Independent Repos

- Apps can be sold, sunset, or scaled separately.
- Incidents in one app do not block other apps.
- Deploy, billing, and data ownership are isolated per app.

## Quality Baseline

- Web verification gate (`pnpm verify:web`)
- Mobile verification gate (`pnpm verify:mobile`)
- API unit/integration tests
- Optional E2E gate for release readiness

## Who This Is For

- Non-technical operator running AI-assisted app generation
- Technical engineer taking over delivery from the starter
