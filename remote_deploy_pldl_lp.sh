#!/bin/bash
set -euo pipefail

REMOTE_APP_DIR="$1"
ZIP_FILE="$2"
TS="$3"

BACKUP_DIR="${REMOTE_APP_DIR}_backups"
WORK_DIR="/tmp/pldl_lp_release_${TS}"

echo "[REMOTE] start"
echo "[REMOTE] app dir: ${REMOTE_APP_DIR}"
echo "[REMOTE] zip:     ${ZIP_FILE}"

if [ ! -f "${ZIP_FILE}" ]; then
  echo "[REMOTE][ERROR] zip not found"
  exit 1
fi

mkdir -p "${BACKUP_DIR}"
mkdir -p "${WORK_DIR}"
mkdir -p "${REMOTE_APP_DIR}"

# ---- Backup current release (skip on very first deploy) ----
if [ -d "${REMOTE_APP_DIR}/app" ]; then
  echo "[REMOTE] backup current release"
  tar \
    --exclude='.env' \
    --exclude='storage/*' \
    --exclude='vendor/*' \
    --exclude='node_modules/*' \
    --exclude='database/*.sqlite' \
    -czf "${BACKUP_DIR}/backup_${TS}.tar.gz" \
    -C "${REMOTE_APP_DIR}" .
fi

# ---- Unzip new release ----
echo "[REMOTE] unzip new release"
unzip -oq "${ZIP_FILE}" -d "${WORK_DIR}"

# ---- Replace code directories (vendor / storage / .env / sqlite are preserved) ----
# public/build is part of the deploy, so refresh it cleanly.
if [ -d "${REMOTE_APP_DIR}/public/build" ]; then
  rm -rf "${REMOTE_APP_DIR:?}/public/build"
fi

for d in app bootstrap config public resources routes lang docs; do
  if [ -d "${REMOTE_APP_DIR}/${d}" ]; then
    rm -rf "${REMOTE_APP_DIR:?}/${d}"
  fi
done

for d in app bootstrap config database public resources routes lang docs; do
  if [ -d "${WORK_DIR}/${d}" ]; then
    cp -a "${WORK_DIR}/${d}" "${REMOTE_APP_DIR}/"
  fi
done

# ---- Top-level files ----
for f in .htaccess artisan composer.json composer.lock package.json package-lock.json vite.config.js tailwind.config.js postcss.config.js tsconfig.json README.md; do
  if [ -f "${WORK_DIR}/${f}" ]; then
    cp -f "${WORK_DIR}/${f}" "${REMOTE_APP_DIR}/"
  fi
done

# ---- Ensure storage tree exists (preserved across deploys) ----
mkdir -p "${REMOTE_APP_DIR}/storage/app/public"
mkdir -p "${REMOTE_APP_DIR}/storage/framework/cache/data"
mkdir -p "${REMOTE_APP_DIR}/storage/framework/sessions"
mkdir -p "${REMOTE_APP_DIR}/storage/framework/testing"
mkdir -p "${REMOTE_APP_DIR}/storage/framework/views"
mkdir -p "${REMOTE_APP_DIR}/storage/logs"
mkdir -p "${REMOTE_APP_DIR}/bootstrap/cache"

# Clear stale compiled config / route / view caches
find "${REMOTE_APP_DIR}/bootstrap/cache" -mindepth 1 -maxdepth 1 ! -name '.gitignore' -exec rm -rf {} +

chmod -R 775 "${REMOTE_APP_DIR}/storage" "${REMOTE_APP_DIR}/bootstrap/cache" 2>/dev/null || true

# ---- Cleanup ----
rm -rf "${WORK_DIR}"
rm -f "${ZIP_FILE}"

# Trim old backups (keep last 10)
ls -1t "${BACKUP_DIR}"/backup_*.tar.gz 2>/dev/null | tail -n +11 | xargs -r rm -f

echo "[REMOTE] done"
echo "[REMOTE] backup: ${BACKUP_DIR}/backup_${TS}.tar.gz"
