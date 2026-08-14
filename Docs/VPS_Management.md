# Monsur Ali Travels ERP - VPS Server & Deployment Guide

## 1. VPS Server Information

- **Host / IP Address:** `144.79.218.241`
- **SSH Port:** `22`
- **User:** `root`
- **OS:** Ubuntu 22.04 / 24.04 LTS
- **Live Path:** `/opt/monsuralitravels`
- **Uploads Storage:** `/var/www/uploads`

---

## 2. 1-Command Automated Bootstrap on Fresh VPS

When logging into the VPS for the first time as `root`, run this single command to automatically install Docker, Docker Compose, Nginx, UFW firewall, clone the repository, register systemd auto-restart, and launch all containers:

```bash
curl -fsSL https://raw.githubusercontent.com/ikram3031/Smart_ERP/master/vps-setup.sh | bash
```

*Or manually via Git:*
```bash
# 1. SSH into the VPS
ssh -p 22 root@144.79.218.241

# 2. Clone repository
mkdir -p /opt/monsuralitravels
git clone -b master https://github.com/ikram3031/Smart_ERP.git /opt/monsuralitravels
cd /opt/monsuralitravels

# 3. Run Setup
chmod +x vps-setup.sh prod-update.sh
./vps-setup.sh
```

---

## 3. Production Container & Port Architecture

| Container Name | Service | Host Port | Container Port | Routing Domain |
| :--- | :--- | :--- | :--- | :--- |
| **`monsuralitravels-dashboard-live`** | React/Vite SPA Dashboard | `8005` | `80` (Nginx) | `https://dashboard.monsuralitravelsbd.com` |
| **`monsuralitravels-backend-live`** | Express API | `5092` | `5092` | `https://server.monsuralitravelsbd.com` |
| **`monsuralitravels-mongodb-live`** | MongoDB Engine | `27017` | `27017` | Internal Network |

---

## 4. Free SSL Certificate Setup (Certbot)

After pointing DNS records (A Record $\rightarrow$ `144.79.218.241`) for your domains, generate free automated Let's Encrypt SSL certificates:

```bash
certbot --nginx -d dashboard.monsuralitravelsbd.com -d server.monsuralitravelsbd.com -d service.monsuralitravelsbd.com
```

Certbot will automatically update `/etc/nginx/sites-available/monsuralitravels` with HTTPS redirection and reload Nginx.

---

## 5. Ongoing Maintenance Commands

### Pull Latest Code & Deploy Updates
```bash
cd /opt/monsuralitravels
./prod-update.sh
```

### Inspect Container Logs
```bash
# All services
cd /opt/monsuralitravels
docker compose -f docker-compose.prod.yml logs -f

# Backend API logs only
docker compose -f docker-compose.prod.yml logs -f backend

# Dashboard logs only
docker compose -f docker-compose.prod.yml logs -f dashboard
```

### Manage Systemd Service
The systemd unit `monsuralitravels.service` ensures all containers start automatically whenever the VPS boots or reboots:
```bash
systemctl status monsuralitravels.service
systemctl restart monsuralitravels.service
```
