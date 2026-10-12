#!/usr/bin/env bash
#
# Export the whole Sanity dataset (documents + uploaded images/files) to a
# single timestamped .tar.gz.
#
# This is the only copy of the site's *content* that lives outside Sanity.
# The git repo holds schemas and code; it does not hold a word of the copy
# you type into /studio.
#
# Usage:
#   ./scripts/backup-sanity.sh                 # -> backups/
#   ./scripts/backup-sanity.sh /path/to/dir    # -> somewhere else
#
# Needs SANITY_API_TOKEN with at least Viewer rights, plus the project id and
# dataset. Reads .env.local automatically when it's there.

set -euo pipefail

cd "$(dirname "$0")/.."

if [ -f .env.local ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env.local
  set +a
fi

PROJECT_ID="${NEXT_PUBLIC_SANITY_PROJECT_ID:-${SANITY_PROJECT_ID:-v84q7t2g}}"
DATASET="${NEXT_PUBLIC_SANITY_DATASET:-${SANITY_DATASET:-production}}"
OUT_DIR="${1:-backups}"

if [ -z "${SANITY_API_TOKEN:-}" ]; then
  echo "error: SANITY_API_TOKEN is not set." >&2
  echo "Create one at https://sanity.io/manage -> API -> Tokens (Viewer is enough)." >&2
  exit 1
fi

mkdir -p "$OUT_DIR"
STAMP="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
OUT_FILE="$OUT_DIR/sanity-${DATASET}-${STAMP}.tar.gz"

# The CLI only runs `dataset` commands inside a real project: it needs
# sanity.cli.ts (at the repo root) AND `sanity` resolvable in node_modules.
# A standalone `npx --yes sanity@x` copy fails with "not available outside of
# a Sanity project context".
if [ ! -x node_modules/.bin/sanity ]; then
  echo "error: sanity CLI not found in node_modules." >&2
  echo "Run 'npm install' (or 'npm ci') first." >&2
  exit 1
fi

echo "Exporting Sanity project $PROJECT_ID / dataset $DATASET ..."

# --asset-concurrency keeps us well under Sanity's rate limits on the free plan.
# projectId/dataset come from sanity.cli.ts, which reads the same env vars.
SANITY_AUTH_TOKEN="$SANITY_API_TOKEN" node_modules/.bin/sanity dataset export "$DATASET" "$OUT_FILE" \
  --asset-concurrency 4

echo
echo "Wrote $OUT_FILE ($(du -h "$OUT_FILE" | cut -f1))"
echo
echo "To restore into a fresh dataset:"
echo "  SANITY_AUTH_TOKEN=<editor-token> node_modules/.bin/sanity dataset import \\"
echo "    $OUT_FILE <target-dataset> --replace"
