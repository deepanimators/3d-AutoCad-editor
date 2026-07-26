#!/usr/bin/env bash
# Run after `vercel link` to push all required env vars to Vercel (production + preview)
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$SCRIPT_DIR/apps/editor/.env.local"
VERCEL_DIR="$SCRIPT_DIR/apps/editor"

push_var() {
  local KEY=$1
  local VALUE
  VALUE=$(grep "^${KEY}=" "$ENV_FILE" | head -1 | cut -d= -f2-)
  if [ -z "$VALUE" ]; then
    echo "SKIP (empty): $KEY"
    return
  fi
  echo "Pushing: $KEY"
  printf '%s' "$VALUE" | vercel env add "$KEY" production --force --cwd "$VERCEL_DIR" 2>&1 | tail -1
  printf '%s' "$VALUE" | vercel env add "$KEY" preview --force --cwd "$VERCEL_DIR" 2>&1 | tail -1
}

VARS=(
  DATABASE_URL
  NEXT_PUBLIC_FIREBASE_API_KEY
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  NEXT_PUBLIC_FIREBASE_PROJECT_ID
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  NEXT_PUBLIC_FIREBASE_APP_ID
  FIREBASE_PROJECT_ID
  FIREBASE_CLIENT_EMAIL
  FIREBASE_PRIVATE_KEY
)

for VAR in "${VARS[@]}"; do
  push_var "$VAR"
done

echo "Done. Run: vercel --prod to redeploy."
