#!/bin/bash

# ==============================================================================
# Monsur Ali Travels ERP - Automated Dedicated DEV Environment Setup Script
# Target Directory: /opt/monsuralitravels-dev
# Instances: Client Dashboard (:8015), Admin Dashboard (:8017), Backend (:5093)
# Zero interference with Live production (/opt/monsuralitravels)
# ==============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}======================================================${NC}"
echo -e "${CYAN}  🚀 Monsur Ali Travels ERP - DEV Server Setup        ${NC}"
echo -e "${CYAN}  (Isolated from Live / Independent 3 Instances)      ${NC}"
echo -e "${CYAN}======================================================${NC}"

# 1. Check Root Privileges
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ Error: This script must be run as root.${NC}"
   exit 1
fi

TARGET_BRANCH="${1:-master}"
DEV_PROJECT_DIR="/dev-env/opt/monsuralitravels"
DEV_UPLOADS_DIR="/dev-env/var/www/uploads"
DEV_DOCS_DIR="/dev-env/var/www/documents"
REPO_URL="git@github.com:Plexivia-dev/Monsur-Ali-Travels.git"

echo -e "\n${BLUE}Target Git Branch:${NC} ${YELLOW}$TARGET_BRANCH${NC}"
echo -e "${BLUE}Target Dev Directory:${NC} ${YELLOW}$DEV_PROJECT_DIR${NC}"

# 2. System Packages & Docker Verification
echo -e "\n${YELLOW}Step 1/7: Verifying Docker and system dependencies...${NC}"
if ! command -v docker &> /dev/null; then
    echo "Docker not found, installing..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm -f get-docker.sh
    systemctl enable docker
    systemctl start docker
fi
echo -e "${GREEN}✓ Docker is ready.${NC}"

# 3. Firewall Configuration for Dev Ports
echo -e "\n${YELLOW}Step 2/7: Configuring firewall rules for Dev ports...${NC}"
if command -v ufw &> /dev/null; then
    ufw allow 5093/tcp comment 'Backend Dev API'
    ufw allow 8015/tcp comment 'Client Dashboard Dev'
    ufw allow 8017/tcp comment 'Admin Dashboard Dev'
    ufw allow 27018/tcp comment 'MongoDB Dev (Optional External)'
    echo -e "${GREEN}✓ UFW rules configured (Ports 5093, 8015, 8017 allowed).${NC}"
fi

# 4. Storage Directories Isolation
echo -e "\n${YELLOW}Step 3/7: Creating isolated storage directories...${NC}"
mkdir -p "$DEV_UPLOADS_DIR"
mkdir -p "$DEV_DOCS_DIR"
chmod -R 777 "$DEV_UPLOADS_DIR"
chmod -R 777 "$DEV_DOCS_DIR"
echo -e "${GREEN}✓ Dev storage created at $DEV_UPLOADS_DIR and $DEV_DOCS_DIR.${NC}"

# 5. Git Clone / Pull to Isolated Folder
echo -e "\n${YELLOW}Step 4/7: Setting up isolated codebase in $DEV_PROJECT_DIR...${NC}"
if [ -d "$DEV_PROJECT_DIR/.git" ]; then
    echo "Existing repository found in $DEV_PROJECT_DIR, fetching branch $TARGET_BRANCH..."
    cd "$DEV_PROJECT_DIR"
    git fetch origin "$TARGET_BRANCH"
    git checkout "$TARGET_BRANCH"
    git reset --hard "origin/$TARGET_BRANCH"
else
    echo "Cloning repository from $REPO_URL (branch: $TARGET_BRANCH)..."
    mkdir -p "$DEV_PROJECT_DIR"
    git clone -b "$TARGET_BRANCH" "$REPO_URL" "$DEV_PROJECT_DIR" || {
        echo "Could not clone directly with SSH, attempting clone from current local directory if exists..."
        if [ -d "/opt/monsuralitravels" ]; then
            git clone /opt/monsuralitravels "$DEV_PROJECT_DIR"
            cd "$DEV_PROJECT_DIR"
            git checkout -B "$TARGET_BRANCH" || true
        fi
    }
    cd "$DEV_PROJECT_DIR"
fi
echo -e "${GREEN}✓ Repository configured in $DEV_PROJECT_DIR.${NC}"

# 6. Environment Configuration
echo -e "\n${YELLOW}Step 5/7: Configuring Dev environment (.env)...${NC}"
if [ ! -f "$DEV_PROJECT_DIR/backend/.env" ]; then
    if [ -f "$DEV_PROJECT_DIR/backend/.env.dev" ]; then
        cp "$DEV_PROJECT_DIR/backend/.env.dev" "$DEV_PROJECT_DIR/backend/.env"
        echo -e "${GREEN}✓ Created backend/.env from .env.dev template.${NC}"
    elif [ -f "$DEV_PROJECT_DIR/backend/.env.dev.example" ]; then
        cp "$DEV_PROJECT_DIR/backend/.env.dev.example" "$DEV_PROJECT_DIR/backend/.env"
        echo -e "${GREEN}✓ Created backend/.env from .env.dev.example template.${NC}"
    elif [ -f "$DEV_PROJECT_DIR/backend/.env.production" ]; then
        cp "$DEV_PROJECT_DIR/backend/.env.production" "$DEV_PROJECT_DIR/backend/.env"
        sed -i 's/PORT=5092/PORT=5093/g' "$DEV_PROJECT_DIR/backend/.env"
        sed -i 's/mongodb:27017\/monsur-ali-travels/mongodb-dev:27017\/monsur-ali-travels-dev/g' "$DEV_PROJECT_DIR/backend/.env"
        echo -e "${GREEN}✓ Adapted backend/.env from production template with Dev ports.${NC}"
    fi
else
    echo -e "${GREEN}✓ backend/.env already exists in $DEV_PROJECT_DIR.${NC}"
fi

# 7. Systemd Service Registration for Dev
echo -e "\n${YELLOW}Step 6/7: Registering monsuralitravels-dev.service systemd unit...${NC}"
if [ -f "$DEV_PROJECT_DIR/monsuralitravels-dev.service" ]; then
    cp "$DEV_PROJECT_DIR/monsuralitravels-dev.service" /etc/systemd/system/monsuralitravels-dev.service
    systemctl daemon-reload
    systemctl enable monsuralitravels-dev.service
    echo -e "${GREEN}✓ monsuralitravels-dev.service enabled on system boot.${NC}"
fi

# 8. Nginx Reverse Proxy Configuration for Dev
echo -e "\n${YELLOW}Step 7/8: Configuring Nginx Reverse Proxy for plexivia.online...${NC}"
if [ -f "$DEV_PROJECT_DIR/nginx-dev.conf" ]; then
    cp "$DEV_PROJECT_DIR/nginx-dev.conf" /etc/nginx/sites-available/monsuralitravels-dev
    ln -sf /etc/nginx/sites-available/monsuralitravels-dev /etc/nginx/sites-enabled/monsuralitravels-dev
    if nginx -t; then
        systemctl reload nginx
        echo -e "${GREEN}✓ Nginx dev reverse proxy configured and reloaded.${NC}"
    else
        echo -e "${RED}❌ Nginx syntax check failed for monsuralitravels-dev.${NC}"
    fi
fi

# 9. Build & Start Docker Services
echo -e "\n${YELLOW}Step 8/8: Building and launching Dev Docker containers...${NC}"
cd "$DEV_PROJECT_DIR"
docker compose -f docker-compose.dev.yml down --remove-orphans || true
docker compose -f docker-compose.dev.yml build --no-cache
docker compose -f docker-compose.dev.yml up -d

# 10. SSL Certificate Setup via Certbot (Optional/Automatic)
if command -v certbot &> /dev/null; then
    echo -e "\n${YELLOW}Setting up Let's Encrypt SSL certificates for *.plexivia.online...${NC}"
    certbot --nginx -d admin.plexivia.online -d dash.plexivia.online -d server.plexivia.online --non-interactive --agree-tos --register-unsafely-without-email || echo "SSL setup can be run manually later."
fi

echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}  🎉 Dev Server Setup Completed Successfully!         ${NC}"
echo -e "${GREEN}======================================================${NC}"
echo ""
echo -e "${CYAN}Container Status:${NC}"
docker compose -f docker-compose.dev.yml ps
echo ""

PUBLIC_IP=$(curl -s https://api.ipify.org || hostname -I | awk '{print $1}')
echo -e "${BLUE}Dev Server Access Endpoints:${NC}"
echo -e "  - 👑 ${YELLOW}Admin Dashboard:${NC}    https://admin.plexivia.online  (Direct: http://${PUBLIC_IP}:8017)"
echo -e "  - 👥 ${YELLOW}Client Dashboard:${NC}   https://dash.plexivia.online   (Direct: http://${PUBLIC_IP}:8015)"
echo -e "  - 🔌 ${YELLOW}Backend API:${NC}        https://server.plexivia.online (Direct: http://${PUBLIC_IP}:5093)"
echo ""
echo -e "${BLUE}Useful Dev Commands:${NC}"
echo -e "  - Status:  cd $DEV_PROJECT_DIR && docker compose -f docker-compose.dev.yml ps"
echo -e "  - Logs:    cd $DEV_PROJECT_DIR && docker compose -f docker-compose.dev.yml logs -f"
echo -e "  - Restart: systemctl restart monsuralitravels-dev.service"
echo -e "  - Stop:    cd $DEV_PROJECT_DIR && docker compose -f docker-compose.dev.yml down"
echo ""
