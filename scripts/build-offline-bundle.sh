#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: Docker is required on the build machine." >&2
  exit 1
fi
if ! docker compose version >/dev/null 2>&1; then
  echo "ERROR: Docker Compose v2 is required." >&2
  exit 1
fi
for tool in tar sha256sum; do
  command -v "$tool" >/dev/null 2>&1 || { echo "ERROR: Missing required tool: $tool" >&2; exit 1; }
done

VERSION="${1:-$(git rev-parse --short HEAD 2>/dev/null || date +%Y%m%d%H%M%S)}"
if [[ ! "$VERSION" =~ ^[A-Za-z0-9._-]+$ ]]; then
  echo "ERROR: Version may contain only letters, numbers, dot, underscore, and hyphen." >&2
  exit 1
fi
OUT_DIR="${2:-$ROOT_DIR/dist/offline}"
mkdir -p "$OUT_DIR"
STAGE="$(mktemp -d)"
cleanup() { rm -rf "$STAGE"; }
trap cleanup EXIT

APP_IMAGE="sijph-terintegrasi:offline"
DB_IMAGE="postgres:16-alpine"

echo "Building SIJPH application image..."
docker build --pull -t "$APP_IMAGE" .
echo "Pulling PostgreSQL image for inclusion in the offline bundle..."
docker pull "$DB_IMAGE"
echo "Exporting application and database images..."
docker save -o "$STAGE/images.tar" "$APP_IMAGE" "$DB_IMAGE"

cp compose.yaml "$STAGE/compose.yaml"
cp -R database "$STAGE/database"
mkdir -p "$STAGE/scripts"
cp scripts/install-offline-bundle.sh "$STAGE/scripts/install-offline-bundle.sh"
cp docs/operations/SELF-HOSTED-DEPLOYMENT.md "$STAGE/SELF-HOSTED-DEPLOYMENT.md"
cp docs/operations/OFFLINE-INSTALLER-RUNBOOK.md "$STAGE/OFFLINE-INSTALLER-RUNBOOK.md"
cat > "$STAGE/RELEASE-MANIFEST.txt" <<MANIFEST
Product: SIJPH-TERINTEGRASI
Bundle version: $VERSION
Application image: $APP_IMAGE
Database image: $DB_IMAGE
Build timestamp UTC: $(date -u +%Y-%m-%dT%H:%M:%SZ)
Important: This bundle contains deployment artifacts, not evidence of production acceptance.
MANIFEST

(
  cd "$STAGE"
  sha256sum images.tar compose.yaml RELEASE-MANIFEST.txt SELF-HOSTED-DEPLOYMENT.md OFFLINE-INSTALLER-RUNBOOK.md scripts/install-offline-bundle.sh > SHA256SUMS
  find database -type f -print0 | sort -z | xargs -0 sha256sum >> SHA256SUMS
)
ARCHIVE="$OUT_DIR/sijph-terintegrasi-offline-$VERSION.tar.gz"
tar -czf "$ARCHIVE" -C "$STAGE" .
(
  cd "$OUT_DIR"
  sha256sum "$(basename "$ARCHIVE")" > "$(basename "$ARCHIVE").sha256"
)
echo "Bundle created: $ARCHIVE"
echo "Checksum created: $ARCHIVE.sha256"
echo "Copy both files to the target server and verify the checksum before extraction."
