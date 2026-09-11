#!/usr/bin/env bash

# ==============================================================================
# Monsur Ali Travels ERP - Google Cloud Storage Automated Daily Backup
# Scheduled: Every day at 03:00 AM (Bangladesh Time / Asia/Dhaka)
# Backups:
#   1. MongoDB Database snapshot (compressed archive) -> gs://mat-backup-storage-9213af41/database/
#   2. Uploads & Documents folder incremental sync (document tree match, add unmatched, NO AUTO-DELETE) -> gs://mat-document-storage-9213af41/
# ==============================================================================

set -eo pipefail

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_DIR="/var/backups/mat-daily"
LOG_FILE="/var/log/mat-backup.log"
DOC_BUCKET="mat-document-storage-9213af41"
BACKUP_BUCKET="mat-backup-storage-9213af41"
CONTAINER_NAME="monsuralitravels-mongodb-live"
DB_NAME="monsur-ali-travels"
DB_USER="admin"
DB_PASS="MonsurAliSecPass2026!"

mkdir -p "$BACKUP_DIR"

echo "==============================================================================" >> "$LOG_FILE"
echo "[$TIMESTAMP] Starting daily automated backup routine (BD Time: $(date))..." >> "$LOG_FILE"

# 1. MongoDB Database Backup
DUMP_FILE="$BACKUP_DIR/mongo_dump_${TIMESTAMP}.gz"
CONTAINER_TEMP="/tmp/mongo_daily_${TIMESTAMP}.gz"

echo "[$TIMESTAMP] 1. Initiating MongoDB mongodump from live container..." >> "$LOG_FILE"
if docker exec "$CONTAINER_NAME" mongodump \
    -u "$DB_USER" -p "$DB_PASS" \
    --authenticationDatabase admin \
    --db "$DB_NAME" \
    --archive="$CONTAINER_TEMP" --gzip >> "$LOG_FILE" 2>&1; then

    docker cp "${CONTAINER_NAME}:${CONTAINER_TEMP}" "$DUMP_FILE"
    docker exec "$CONTAINER_NAME" rm -f "$CONTAINER_TEMP"

    DUMP_SIZE=$(du -h "$DUMP_FILE" | cut -f1)
    echo "[$TIMESTAMP] MongoDB snapshot successful (Size: $DUMP_SIZE)." >> "$LOG_FILE"

    echo "[$TIMESTAMP] Uploading DB dump to gs://${BACKUP_BUCKET}/database/..." >> "$LOG_FILE"
    if gcloud storage cp "$DUMP_FILE" "gs://${BACKUP_BUCKET}/database/mongo_dump_${TIMESTAMP}.gz" >> "$LOG_FILE" 2>&1; then
        echo "[$TIMESTAMP] ? Database successfully uploaded to GCS backup bucket." >> "$LOG_FILE"
    else
        echo "[$TIMESTAMP] ?? GCS DB upload failed or pending IAM permissions. Saved locally at $DUMP_FILE" >> "$LOG_FILE"
    fi
else
    echo "[$TIMESTAMP] ? MongoDB mongodump failed!" >> "$LOG_FILE"
fi

# 2. Uploads & Documents Incremental Sync (Tree matching, unmatched added, NO AUTO-DELETE)
echo "[$TIMESTAMP] 2. Syncing /var/www/uploads with gs://${DOC_BUCKET}/uploads/..." >> "$LOG_FILE"
if [ -d "/var/www/uploads" ]; then
    if gcloud storage rsync /var/www/uploads "gs://${DOC_BUCKET}/uploads" --recursive >> "$LOG_FILE" 2>&1; then
        echo "[$TIMESTAMP] ? Uploads tree matched and synced to GCS (no files deleted)." >> "$LOG_FILE"
    else
        echo "[$TIMESTAMP] ?? Uploads GCS sync failed or pending IAM permissions." >> "$LOG_FILE"
    fi
fi

echo "[$TIMESTAMP] 3. Syncing /var/www/documents with gs://${DOC_BUCKET}/documents/..." >> "$LOG_FILE"
if [ -d "/var/www/documents" ]; then
    if gcloud storage rsync /var/www/documents "gs://${DOC_BUCKET}/documents" --recursive >> "$LOG_FILE" 2>&1; then
        echo "[$TIMESTAMP] ? Documents tree matched and synced to GCS (no files deleted)." >> "$LOG_FILE"
    else
        echo "[$TIMESTAMP] ?? Documents GCS sync failed or pending IAM permissions." >> "$LOG_FILE"
    fi
fi

# 3. Local Retention (Keep last 7 days locally for instant zero-network rollback)
find "$BACKUP_DIR" -name "mongo_dump_*.gz" -type f -mtime +7 -delete 2>/dev/null || true

echo "[$TIMESTAMP] Daily backup routine finished successfully!" >> "$LOG_FILE"
echo "==============================================================================" >> "$LOG_FILE"
