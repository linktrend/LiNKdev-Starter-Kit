#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Run release readiness gates for LiNKdev Starter Kit.

Usage:
  ./scripts/release-readiness.sh [--with-e2e]

Options:
  --with-e2e   Run web Playwright suite (requires valid Supabase env vars)
  --help       Show this message
EOF
}

WITH_E2E="false"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --with-e2e)
      WITH_E2E="true"
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -f "apps/web/.env.local" ]]; then
  echo "==> Loading apps/web/.env.local"
  # shellcheck disable=SC1091
  set -a && source "apps/web/.env.local" && set +a
fi

echo "==> Web verify"
pnpm verify:web

echo "==> Mobile verify"
pnpm verify:mobile

echo "==> API unit tests (isolated from web env)"
(
  unset NEXT_PUBLIC_SUPABASE_URL SUPABASE_URL
  export TEMPLATE_OFFLINE=1
  pnpm --filter @starter/api test:unit
)

echo "==> API integration tests (isolated from web env)"
(
  unset NEXT_PUBLIC_SUPABASE_URL SUPABASE_URL
  export TEMPLATE_OFFLINE=1
  pnpm --filter @starter/api test:integration
)

echo "==> Web production build"
pnpm --filter ./apps/web build

echo "==> Environment check (web)"
pnpm --filter ./apps/web env:check

if [[ "${WITH_E2E}" == "true" ]]; then
  echo "==> E2E tests"
  pnpm --filter ./apps/web e2e
else
  echo "==> E2E tests skipped (use --with-e2e to include)"
fi

echo "✅ Release readiness checks completed."
