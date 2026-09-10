#!/usr/bin/env bash
# Apply committed Prisma migrations to the production database.
# Uses PRODUCTION_DATABASE_URL from the environment or apps/api/.env.
#
# Never run `prisma migrate dev` against production.
# Prefer letting Render apply migrations on deploy (startCommand).
# Use this only when you intentionally need to migrate prod from your machine.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

read_env_value() {
  local key="$1"
  local file="$2"
  if [ ! -f "$file" ]; then
    return 0
  fi
  local line
  line="$(grep -E "^${key}=" "$file" | tail -n1 || true)"
  if [ -z "$line" ]; then
    return 0
  fi
  local value="${line#*=}"
  value="${value%$'\r'}"
  if [[ "$value" == \"*\" ]]; then
    value="${value:1:${#value}-2}"
  elif [[ "$value" == \'*\' ]]; then
    value="${value:1:${#value}-2}"
  fi
  printf '%s' "$value"
}

PROD_URL="${PRODUCTION_DATABASE_URL:-}"
if [ -z "$PROD_URL" ]; then
  PROD_URL="$(read_env_value PRODUCTION_DATABASE_URL .env)"
fi

if [ -z "$PROD_URL" ]; then
  echo "PRODUCTION_DATABASE_URL is not set."
  echo "Add it to apps/api/.env (gitignored) or export it in your shell."
  exit 1
fi

if [[ "$PROD_URL" == *"localhost"* ]] || [[ "$PROD_URL" == *"127.0.0.1"* ]]; then
  echo "Refusing to run: PRODUCTION_DATABASE_URL points at a local host."
  exit 1
fi

echo "Migration status (production):"
DATABASE_URL="$PROD_URL" npx prisma migrate status

echo
echo "Applying pending migrations to production..."
DATABASE_URL="$PROD_URL" npx prisma migrate deploy

echo
echo "Done. Production schema is up to date with committed migrations."
