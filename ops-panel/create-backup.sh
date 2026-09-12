#!/bin/bash
set -e

BACKUP_TYPE="${1:-full}"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
DOWNLOAD_DIR="/var/backups/downloads"
mkdir -p "$DOWNLOAD_DIR"

echo "============================================================"
echo "🚀 Starting MAT Backup Generator [Type: ${BACKUP_TYPE}]"
echo "⏰ Timestamp: ${TIMESTAMP}"
echo "============================================================"

if [ "$BACKUP_TYPE" = "db" ]; then
    FILENAME="mat-db-backup-${TIMESTAMP}.gz"
    OUT_FILE="${DOWNLOAD_DIR}/${FILENAME}"
    echo "📦 [1/2] Exporting MongoDB dump from live container..."
    docker exec monsuralitravels-mongodb-live mongodump --archive --gzip -u admin -p MonsurAliSecPass2026! --authenticationDatabase admin > "${OUT_FILE}"
    echo "✅ [2/2] MongoDB dump completed successfully!"
    echo "FILE_READY:${FILENAME}"

elif [ "$BACKUP_TYPE" = "uploads" ]; then
    FILENAME="mat-uploads-backup-${TIMESTAMP}.tar.gz"
    OUT_FILE="${DOWNLOAD_DIR}/${FILENAME}"
    echo "📁 [1/2] Compressing /var/www/uploads and /var/www/documents..."
    tar -czf "${OUT_FILE}" -C /var/www uploads documents
    echo "✅ [2/2] Uploads archive completed successfully!"
    echo "FILE_READY:${FILENAME}"

else
    # Full backup: DB + Uploads + Documents
    FILENAME="mat-full-backup-${TIMESTAMP}.tar.gz"
    OUT_FILE="${DOWNLOAD_DIR}/${FILENAME}"
    STAGE_DIR="/tmp/mat-backup-${TIMESTAMP}"
    mkdir -p "$STAGE_DIR"
    
    echo "🗄️ [1/3] Dumping MongoDB live database..."
    docker exec monsuralitravels-mongodb-live mongodump --archive --gzip -u admin -p MonsurAliSecPass2026! --authenticationDatabase admin > "${STAGE_DIR}/database.gz"
    
    echo "📦 [2/3] Packaging database + uploads + documents into tar.gz..."
    tar -czf "${OUT_FILE}" -C "${STAGE_DIR}" database.gz -C /var/www uploads documents
    rm -rf "${STAGE_DIR}"
    
    echo "✅ [3/3] Full backup created successfully!"
    echo "FILE_READY:${FILENAME}"
fi

echo "------------------------------------------------------------"
ls -lh "${OUT_FILE}"
echo "------------------------------------------------------------"
echo "🎉 Backup ready for download via Ops cPanel."
