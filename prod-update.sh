#!/bin/bash

# Production Update Script
# Use on VPS to pull latest code and restart

set -e

cd /opt/monsuralitravels

echo "🔄 Pulling latest changes..."
git pull origin main

echo "📦 Building images..."
docker compose -f docker-compose.prod.yml build --pull

echo "🔄 Restarting services..."
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d

echo "✓ Update complete!"
echo ""
docker compose -f docker-compose.prod.yml ps
echo ""
echo "View logs: docker compose -f docker-compose.prod.yml logs -f"
