#!/bin/bash

# Quick deployment update script
# Use this to pull latest code and restart services

cd /opt/monsuralitravels

echo "🔄 Pulling latest changes..."
git pull origin main

echo "📦 Pulling latest images..."
docker-compose -f docker-compose.prod.yml pull

echo "🚀 Restarting services..."
docker-compose -f docker-compose.prod.yml up -d

echo "✓ Deployment complete!"
echo ""
echo "Checking service status..."
docker-compose -f docker-compose.prod.yml ps
