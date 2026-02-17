#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Create a brand-new independent app repository from LiNKdev Starter Kit.

Usage:
  ./scripts/create-app-repo.sh --slug <app-slug> --out <parent-dir> [options]

Required:
  --slug <value>        App slug (kebab-case). Example: habit-hq
  --out <value>         Parent directory where the new repo folder will be created

Optional:
  --name <value>        Friendly app name (stored in bootstrap context)
  --prd <file-path>     Path to PRD markdown file to copy into specify/PRD.md
  --remote <git-url>    Git remote URL to set as origin
  --skip-git            Do not initialize git in the generated repo
  --help                Show this message
EOF
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

APP_SLUG=""
APP_NAME=""
OUT_DIR=""
PRD_PATH=""
REMOTE_URL=""
SKIP_GIT="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --slug)
      APP_SLUG="${2:-}"
      shift 2
      ;;
    --name)
      APP_NAME="${2:-}"
      shift 2
      ;;
    --out)
      OUT_DIR="${2:-}"
      shift 2
      ;;
    --prd)
      PRD_PATH="${2:-}"
      shift 2
      ;;
    --remote)
      REMOTE_URL="${2:-}"
      shift 2
      ;;
    --skip-git)
      SKIP_GIT="true"
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

if [[ -z "${APP_SLUG}" || -z "${OUT_DIR}" ]]; then
  echo "Error: --slug and --out are required." >&2
  usage
  exit 1
fi

if ! [[ "${APP_SLUG}" =~ ^[a-z0-9-]+$ ]]; then
  echo "Error: --slug must be kebab-case (lowercase letters, numbers, hyphens)." >&2
  exit 1
fi

if [[ -z "${APP_NAME}" ]]; then
  APP_NAME="${APP_SLUG}"
fi

if [[ -n "${PRD_PATH}" && ! -f "${PRD_PATH}" ]]; then
  echo "Error: PRD file not found: ${PRD_PATH}" >&2
  exit 1
fi

DEST_DIR="${OUT_DIR%/}/${APP_SLUG}"
if [[ -e "${DEST_DIR}" ]]; then
  echo "Error: destination already exists: ${DEST_DIR}" >&2
  exit 1
fi

mkdir -p "${DEST_DIR}"

rsync -a \
  --exclude ".git" \
  --exclude "node_modules" \
  --exclude ".next" \
  --exclude ".turbo" \
  --exclude "dist" \
  --exclude "coverage" \
  --exclude "playwright-report" \
  --exclude "test-results" \
  --exclude "_worktrees" \
  --exclude ".env.local" \
  --exclude ".env.*.local" \
  "${TEMPLATE_ROOT}/" "${DEST_DIR}/"

mkdir -p "${DEST_DIR}/specify"
if [[ -n "${PRD_PATH}" ]]; then
  cp "${PRD_PATH}" "${DEST_DIR}/specify/PRD.md"
else
  cat > "${DEST_DIR}/specify/PRD.md" <<'EOF'
# Product Requirements Document

Replace this file with your app PRD before asking AI to implement.
EOF
fi

cat > "${DEST_DIR}/specify/APP_BOOTSTRAP_CONTEXT.md" <<EOF
# App Bootstrap Context

- App Name: ${APP_NAME}
- App Slug: ${APP_SLUG}
- Generated From: LiNKdev Starter Kit
- Generated At (UTC): $(date -u +"%Y-%m-%dT%H:%M:%SZ")

## Default Decisions

- Independent product repo: yes
- Independent Supabase project: required
- Stripe account: shared LiNKtrend account (separate products/prices per app)
- Default billing tiers: Free / Pro / Business
- Mobile app: include only when required by PRD
EOF

if [[ "${SKIP_GIT}" == "false" ]]; then
  git -C "${DEST_DIR}" init -b main >/dev/null
  git -C "${DEST_DIR}" add .
  if git config --get user.email >/dev/null && git config --get user.name >/dev/null; then
    git -C "${DEST_DIR}" commit -m "chore: initialize from LiNKdev Starter Kit" >/dev/null
  else
    echo "Info: git user.name/user.email not set; skipped initial commit."
  fi
  if [[ -n "${REMOTE_URL}" ]]; then
    git -C "${DEST_DIR}" remote add origin "${REMOTE_URL}"
  fi
fi

cat <<EOF
✅ App repository generated at:
   ${DEST_DIR}

Next:
1) Open ${DEST_DIR}/specify/PRD.md and confirm PRD content.
2) Run: pnpm install
3) Follow docs/00_OPERATOR_LIBRARY/WORKFLOW_PRD_TO_APP_REPO.md
EOF
