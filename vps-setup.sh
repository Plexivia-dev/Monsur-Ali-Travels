#!/bin/bash

# ==============================================================================
# Monsur Ali Travels ERP - Automated Fresh VPS Setup & Deployment Script
# Target Host: 144.79.218.241 (Ubuntu 22.04 / 24.04 LTS)
# ==============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}  🚀 Monsur Ali Travels ERP - VPS Setup & Deployment  ${NC}"
echo -e "${BLUE}======================================================${NC}"

# 1. Check Root Privileges
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ Error: This script must be run as root.${NC}"
   exit 1
fi

PROJECT_DIR="/opt/monsuralitravels"
UPLOADS_DIR="/var/www/uploads"
REPO_URL="https://github.com/ikram3031/Monsur-Ali-Travels.git"

# 2. System Update & Essential Packages
echo -e "\n${YELLOW}Step 1/8: Updating package repository & installing essential packages...${NC}"
apt update -y && apt upgrade -y
apt install -y curl wget git ufw htop jq unzip nginx certbot python3-certbot-nginx ca-certificates gnupg

# 3. Docker Installation
echo -e "\n${YELLOW}Step 2/8: Installing Docker Engine & Docker Compose...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm -f get-docker.sh
    systemctl enable docker
    systemctl start docker
    echo -e "${GREEN}✓ Docker installed successfully.${NC}"
else
    echo -e "${GREEN}✓ Docker is already installed.${NC}"
fi

# 4. Firewall Configuration (UFW)
echo -e "\n${YELLOW}Step 3/8: Configuring UFW Firewall...${NC}"
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP Nginx'
ufw allow 443/tcp comment 'HTTPS Nginx'
ufw --force enable
echo -e "${GREEN}✓ UFW rules enabled (Ports 22, 80, 443 open).${NC}"

# 5. Project Directory & Repository Clone/Pull
echo -e "\n${YELLOW}Step 4/8: Setting up project repository...${NC}"
mkdir -p "$UPLOADS_DIR"
mkdir -p "/var/www/html/documents"
mkdir -p "/var/www/documents"
chmod -R 777 "$UPLOADS_DIR"
chmod -R 777 "/var/www/html/documents"
chmod -R 777 "/var/www/documents"

if [ -d "$PROJECT_DIR/.git" ]; then
    echo "Existing repository found at $PROJECT_DIR, pulling latest changes..."
    cd "$PROJECT_DIR"
    git fetch origin live
    git reset --hard origin/live
else
    echo "Cloning repository from $REPO_URL..."
    mkdir -p "$PROJECT_DIR"
    git clone -b live "$REPO_URL" "$PROJECT_DIR"
    cd "$PROJECT_DIR"
fi

# 6. Environment Configuration
echo -e "\n${YELLOW}Step 5/8: Preparing environment files...${NC}"
if [ ! -f "$PROJECT_DIR/backend/.env" ]; then
    if [ -f "$PROJECT_DIR/backend/.env.production" ]; then
        cp "$PROJECT_DIR/backend/.env.production" "$PROJECT_DIR/backend/.env"
        echo -e "${GREEN}✓ Created backend/.env from .env.production.${NC}"
    elif [ -f "$PROJECT_DIR/backend/example.env.example" ]; then
        cp "$PROJECT_DIR/backend/example.env.example" "$PROJECT_DIR/backend/.env"
        echo -e "${GREEN}✓ Created backend/.env from template.${NC}"
    fi
else
    echo -e "${GREEN}✓ backend/.env already exists.${NC}"
fi

# 7. Nginx Reverse Proxy Setup
echo -e "\n${YELLOW}Step 6/8: Configuring Nginx reverse proxy...${NC}"
cp "$PROJECT_DIR/nginx-prod.conf" /etc/nginx/sites-available/monsuralitravels
ln -sf /etc/nginx/sites-available/monsuralitravels /etc/nginx/sites-enabled/monsuralitravels
rm -f /etc/nginx/sites-enabled/default

if nginx -t; then
    systemctl restart nginx
    systemctl enable nginx
    echo -e "${GREEN}✓ Nginx configured and restarted successfully.${NC}"
else
    echo -e "${RED}❌ Nginx syntax check failed! Check /etc/nginx/sites-available/monsuralitravels${NC}"
fi

# 8. Systemd Service Registration
echo -e "\n${YELLOW}Step 7/8: Registering systemd auto-restart service...${NC}"
cp "$PROJECT_DIR/monsuralitravels.service" /etc/systemd/system/monsuralitravels.service
systemctl daemon-reload
systemctl enable monsuralitravels.service
echo -e "${GREEN}✓ monsuralitravels.service enabled on boot.${NC}"

# 9. Docker Compose Build & Launch
echo -e "\n${YELLOW}Step 8/8: Building and starting Docker containers...${NC}"
cd "$PROJECT_DIR"
docker compose -f docker-compose.prod.yml down --remove-orphans || true
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d

echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}  🎉 Monsur Ali Travels ERP Setup Successfully Completed!  ${NC}"
echo -e "${GREEN}======================================================${NC}"
echo ""
echo "Container Status:"
docker compose -f docker-compose.prod.yml ps
echo ""
echo -e "${BLUE}Next Steps for SSL Certificates:${NC}"
echo "Run certbot to generate free HTTPS certificates for your domains:"
echo -e "  ${YELLOW}certbot --nginx -d admin.monsuralitravels.com -d api.monsuralitravels.com -d dashboard.monsuralitravels.com -d server.monsuralitravels.com -d service.monsuralitravels.com -d monsuralitravels.com -d www.monsuralitravels.com${NC}"
echo ""
echo -e "${BLUE}Useful Management Commands:${NC}"
echo "  - View logs:    cd /opt/monsuralitravels && make logs"
echo "  - Update app:   cd /opt/monsuralitravels && make deploy"
echo "  - Check status: cd /opt/monsuralitravels && make status"
echo "  - Restart:      systemctl restart monsuralitravels.service"
echo ""
