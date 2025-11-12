# Documentation

All architecture notes, design briefs, runbooks, and feature specs live in this `docs/` directory. When adding new informational files, place them here (or in a subfolder such as `docs/web/` or `docs/batch-headers/`) rather than scattering README files throughout package folders. Package-level READMEs can remain when required for publishing, but the canonical references should always be stored in `docs/`.

## Structure

- `docs/web/` – Web-app specific notes (moved from `apps/web/README.md`).
- `docs/batch-headers/` – Historical change summaries.
- `docs/dev/`, `docs/usage/`, etc. – Topic-specific guides.

## Updating existing docs

If you find a README or `.md` file outside this directory that is not strictly required for package distribution, move it here and update any references accordingly.
