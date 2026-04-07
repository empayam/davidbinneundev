#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
APP_NAME="${APP_NAME:-davidbinneundev}"
CONTAINER_NAME="${CONTAINER_NAME:-davidbinneundev}"
DATA_ROOT="${DATA_ROOT:-/var/lib/davidbinneundev}"
SECRET_PREFIX="${SECRET_PREFIX:-davidbinneundev}"

if ! command -v gcloud >/dev/null 2>&1; then
  echo "gcloud is required on the target VM."
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required on the target VM."
  exit 1
fi

read_secret() {
  local secret_name="$1"
  gcloud secrets versions access latest --secret="$secret_name" 2>/dev/null || true
}

mkdir -p "$DATA_ROOT/data" "$DATA_ROOT/uploads"

cat > "$REPO_DIR/.env" <<EOF
APP_SESSION_SECRET=$(read_secret "${SECRET_PREFIX}-app-session-secret")
SMTP_HOST=$(read_secret "${SECRET_PREFIX}-smtp-host")
SMTP_PORT=$(read_secret "${SECRET_PREFIX}-smtp-port")
SMTP_USER=$(read_secret "${SECRET_PREFIX}-smtp-user")
SMTP_PASS=$(read_secret "${SECRET_PREFIX}-smtp-pass")
EMAIL_FROM=$(read_secret "${SECRET_PREFIX}-email-from")
EOF

cd "$REPO_DIR"

docker build -t "$APP_NAME" .

if docker ps -aq --format '{{.Names}}' | grep -qx "$CONTAINER_NAME"; then
  docker rm -f "$CONTAINER_NAME"
fi

docker run -d \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  -p 80:8080 \
  --env-file "$REPO_DIR/.env" \
  -v "$DATA_ROOT/data:/app/data" \
  -v "$DATA_ROOT/uploads:/app/uploads" \
  "$APP_NAME"

echo "Deployment complete."
echo "The app should now be reachable on port 80."
