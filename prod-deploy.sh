#!/bin/bash

# Monsur Ali Travels Production Deploy Script
# Run this on your VPS

set -e

echo "🚀 Starting Monsur Ali Travels Production Deployment..."

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root${NC}"
   exit 1
fi

PROJECT_DIR="/opt/monsuralitravels"

echo -e "${YELLOW}Step 1: Updating system packages...${NC}"
apt update && apt upgrade -y
apt install -y curl git wget nginx certbot python3-certbot-nginx

echo -e "${YELLOW}Step 2: Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

echo -e "${YELLOW}Step 3: Creating project and upload directories...${NC}"
mkdir -p $PROJECT_DIR
mkdir -p /var/www/uploads
chown -R 1001:1001 /var/www/uploads 2>/dev/null || chmod -R 777 /var/www/uploads
cd $PROJECT_DIR

echo -e "${YELLOW}Step 4: Cloning/Updating repository...${NC}"
if [ -d ".git" ]; then
    git pull origin main
else
    echo "Please clone your repository first: git clone <repo-url> $PROJECT_DIR"
    exit 1
fi

echo -e "${YELLOW}Step 5: Setting up environment...${NC}"
if [ ! -f ".env.prod" ]; then
    echo -e "${RED}ERROR: .env.prod not found!${NC}"
    echo "Create .env.prod with your production secrets"
    exit 1
fi

cp .env.prod .env

echo -e "${YELLOW}Step 6: Building/Pulling images...${NC}"
docker compose -f docker-compose.prod.yml pull || docker compose -f docker-compose.prod.yml build

echo -e "${YELLOW}Step 7: Starting services...${NC}"
docker compose -f docker-compose.prod.yml up -d

echo -e "${YELLOW}Step 8: Verifying services...${NC}"
sleep 5
docker compose -f docker-compose.prod.yml ps

echo -e "${YELLOW}Step 9: Setting up Nginx (manual next step)...${NC}"
echo "Configure Nginx reverse proxy:"
echo "1. Edit: nano /etc/nginx/sites-available/monsuralitravels"
echo "2. Reference: cat DEPLOY.md"
echo "3. Enable: ln -s /etc/nginx/sites-available/monsuralitravels /etc/nginx/sites-enabled/"
echo "4. Test: nginx -t"
echo "5. Start: systemctl start nginx && systemctl enable nginx"
echo "6. SSL: certbot --nginx -d yourdomain.com"

echo -e "${GREEN}✓ Deployment complete!${NC}"
echo ""
echo "Check logs: docker compose -f docker-compose.prod.yml logs -f"
