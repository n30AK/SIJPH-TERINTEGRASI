#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

for tool in docker sha256sum openssl; do
  command -v "$tool" >/dev/null 2>&1 || { echo "ERROR: Missing required tool: $tool" >&2; exit 1; }
done
docker compose version >/dev/null 2>&1 || { echo "ERROR: Docker Compose v2 is required." >&2; exit 1; }

if [[ ! -f compose.yaml || ! -f images.tar || ! -f SHA256SUMS ]]; then
  echo "ERROR: Run this script from the extracted SIJPH offline bundle." >&2
  exit 1
fi

echo "Verifying bundle contents..."
sha256sum --check SHA256SUMS

if [[ ! -f .env ]]; then
  echo
  echo "Initial local setup. Leave organization/privacy fields blank only if an administrator will configure them before go-live."
  read -r -p "Nama institusi/pengendali data: " DATA_CONTROLLER_NAME
  read -r -p "Email kontak privasi institusi: " PRIVACY_CONTACT_EMAIL
  if [[ "$DATA_CONTROLLER_NAME" == *'$'* || "$DATA_CONTROLLER_NAME" == *'"'* || "$DATA_CONTROLLER_NAME" == *'\'* || "$DATA_CONTROLLER_NAME" == *$'\n'* ]]; then
    echo "ERROR: Nama institusi contains unsupported characters for this setup flow. Edit .env manually after installation." >&2
    exit 1
  fi
  if [[ "$PRIVACY_CONTACT_EMAIL" == *'$'* || "$PRIVACY_CONTACT_EMAIL" == *'"'* || "$PRIVACY_CONTACT_EMAIL" == *'\'* || "$PRIVACY_CONTACT_EMAIL" == *$'\n'* ]]; then
    echo "ERROR: Privacy email contains unsupported characters." >&2
    exit 1
  fi
  POSTGRES_PASSWORD="$(openssl rand -hex 32)"
  SIJPH_ADMIN_API_KEY="$(openssl rand -hex 32)"
  cat > .env <<ENVVARS
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
SIJPH_ADMIN_API_KEY=$SIJPH_ADMIN_API_KEY
DATA_CONTROLLER_NAME="$DATA_CONTROLLER_NAME"
PRIVACY_CONTACT_EMAIL="$PRIVACY_CONTACT_EMAIL"
PRIVACY_NOTICE_VERSION=2026-10-20-v1
PUBLIC_INTAKE_ENABLED=false
AI_PROVIDER=openai-compatible
AI_API_BASE_URL=https://api.openai.com/v1
AI_API_KEY=
AI_MODEL=
NEXT_PUBLIC_APP_URL=http://localhost:3000
SIJPH_PORT=3000
SIJPH_IMAGE=sijph-terintegrasi:offline
ENVVARS
  chmod 600 .env
else
  echo "Existing .env found; keeping it unchanged."
fi

echo "Loading prebuilt container images (no registry pull required)..."
docker load --input images.tar

echo "Starting SIJPH services..."
docker compose up -d

echo
docker compose ps
echo
echo "Containers have been started; this is not a production acceptance result."
echo "Local URL (on the server): http://127.0.0.1:${SIJPH_PORT:-3000}"
echo "Check app logs: docker compose logs --tail=200 app"
echo "Check readiness: curl -i http://127.0.0.1:${SIJPH_PORT:-3000}/api/ready"
echo "The readiness endpoint may remain blocked until privacy/controller settings and all required migrations/configuration are valid."
echo "Public intake remains disabled. Do not expose port 3000 directly to the internet."
echo "Use a reviewed HTTPS reverse proxy, firewall rules, backup plan, and restore test before production use."
