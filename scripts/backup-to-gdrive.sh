#!/usr/bin/env bash

# ==============================================================================
# Monsur Ali Travels MongoDB Daily Google Drive Backup Script
# Location: /opt/dev/scripts/backup-to-gdrive.sh
# ==============================================================================

set -e

# Load environment variables if .env exists
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

if [ -f "$PROJECT_ROOT/.env" ]; then
    export $(grep -v '^#' "$PROJECT_ROOT/.env" | xargs)
fi

# Configurations (Fallback to defaults for /opt/dev dev environment)
DB_USER="${MONGO_INITDB_ROOT_USERNAME:-admin}"
DB_PASS="${MONGO_INITDB_ROOT_PASSWORD:-11223345}"
DB_NAME="${MONGO_INITDB_DATABASE:-perfume-store}"
RCLONE_REMOTE="${RCLONE_REMOTE:-gdrive:Monsur Ali Travels_DB_Backups}"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_ROOT/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"

# Primary container name for /opt/dev is monsuralitravels-mongodb-dev
CONTAINER_NAME="${MONGODB_CONTAINER_NAME:-monsuralitravels-mongodb-dev}"

# Auto-detect running mongo container if default container is not active
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    if docker ps --format '{{.Names}}' | grep -q "^monsuralitravels-mongodb-dev$"; then
        CONTAINER_NAME="monsuralitravels-mongodb-dev"
    elif docker ps --format '{{.Names}}' | grep -q "^monsuralitravels-mongodb-live$"; then
        CONTAINER_NAME="monsuralitravels-mongodb-live"
    elif docker ps --format '{{.Names}}' | grep -q "mongodb"; then
        CONTAINER_NAME=$(docker ps --format '{{.Names}}' | grep "mongodb" | head -n 1)
    fi
fi

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILENAME="monsuralitravels_db_${DB_NAME}_${TIMESTAMP}.gz"
BACKUP_FILEPATH="${BACKUP_DIR}/${BACKUP_FILENAME}"

echo "[$(date +'%Y-%m-%d %H:%M:%S')] 🚀 Starting database backup..."
echo "  Container : ${CONTAINER_NAME}"
echo "  Database  : ${DB_NAME}"
echo "  Destination Archive: ${BACKUP_FILEPATH}"

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

# 1. Take MongoDB dump via docker exec and compress to archive
if docker exec "${CONTAINER_NAME}" mongodump --username "${DB_USER}" --password "${DB_PASS}" --authenticationDatabase admin --db "${DB_NAME}" --archive --gzip > "${BACKUP_FILEPATH}"; then
    FILE_SIZE=$(du -h "${BACKUP_FILEPATH}" | cut -f1)
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ✅ Database dump created successfully (${FILE_SIZE})."
else
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ❌ Failed to create database dump!" >&2
    rm -f "${BACKUP_FILEPATH}"
    exit 1
fi

# 2. Upload to Google Drive using rclone
if command -v rclone &> /dev/null; then
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] 📤 Uploading to Google Drive (${RCLONE_REMOTE})..."
    if rclone copy "${BACKUP_FILEPATH}" "${RCLONE_REMOTE}" --stats-one-line; then
        echo "[$(date +'%Y-%m-%d %H:%M:%S')] ✅ Uploaded to Google Drive successfully!"
    else
        echo "[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️ Rclone upload failed! Check rclone configuration." >&2
    fi
else
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️ rclone is not installed. Skipping Google Drive upload."
fi

# 3. Clean up local backups older than RETENTION_DAYS
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 🧹 Cleaning local backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -type f -name "monsuralitravels_db_*.gz" -mtime +${RETENTION_DAYS} -delete

echo "[$(date +'%Y-%m-%d %H:%M:%S')] 🎉 Backup process completed successfully!"
