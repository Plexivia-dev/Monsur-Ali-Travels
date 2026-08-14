#!/bin/bash

# ==============================================================================
# Monsur Ali Travels ERP - Production Update Script
# ==============================================================================

set -e

PROJECT_DIR="/opt/monsuralitravels"
cd "$PROJECT_DIR"

echo "🔄 Pulling latest changes from master..."
git fetch origin master
git reset --hard origin/master

echo "🏗️ Rebuilding and restarting containers..."
docker compose -f docker-compose.prod.yml up -d --build

echo "🧹 Cleaning up dangling images..."
docker image prune -f

echo "✅ Update complete! Current status:"
docker compose -f docker-compose.prod.yml ps
