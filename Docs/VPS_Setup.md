# Monsur Ali Travels ERP - VPS & Cloudflare Configuration Guide

## 🔑 SSH Login Command (Direct Access)

Run this command directly in your Windows Terminal / PowerShell to log in to the VPS:

```bash
ssh root@144.79.218.241
# or
ssh mat-vps
# or
ssh -i C:\Users\dev\.ssh\id_ed25519_ikramul root@144.79.218.241
```

---

## 1. VPS Server Specifications

- **Host / IP Address:** `144.79.218.241`
- **SSH Port:** `22`
- **User:** `root`
- **OS:** Ubuntu 22.04 / 24.04 LTS
- **Live Path:** `/opt/monsuralitravels`
- **Uploads Storage:** `/var/www/uploads`
- **Documents Storage:** `/var/www/documents`
- **SSH Key Path:** `~/.ssh/id_ed25519_ikramul` (`C:\Users\dev\.ssh\id_ed25519_ikramul`)

---

## 2. Production Container & Port Architecture

| Container Name | Service / App | Host Port | Local Dev Port | Routing Domain |
| :--- | :--- | :--- | :--- | :--- |
| **`monsuralitravels-dashboard-admin-live`** | Admin Dashboard SPA (`dashboard/admin`) | **`8007`** | `5174` | `https://admin.monsuralitravels.com` |
| **`monsuralitravels-dashboard-live`** | Client Dashboard SPA (`dashboard/client`) | **`8005`** | `5173` | `https://dashboard.monsuralitravels.com` |
| **`monsuralitravels-backend-live`** | Express REST API (`backend`) | **`5092`** | `5092` | `https://api.monsuralitravels.com` |
| **`monsuralitravels-frontend-live`** | Landing Website (`frontend`) | **`8006`** | `3000` | `https://monsuralitravels.com` |
| **`monsuralitravels-mongodb-live`** | MongoDB 7.0 Engine | **`27017`** | `27017` | Local / Docker Bridge Network |

---

## 3. Cloudflare DNS & Domain Integration

- **Primary Domain:** `monsuralitravels.com`
- **Cloudflare Zone ID:** `96601a82dcaad6ba15891d416e440706`
- **Cloudflare Account ID:** `f9c0c34851099dfb743390a7a0086321`

### Assigned Cloudflare Nameservers
1. `christian.ns.cloudflare.com`
2. `laila.ns.cloudflare.com`

### Configured DNS Records (Target IP: `144.79.218.241`)

| Type  | Record Name | Target IP | Description |
| :---- | :--- | :--- | :--- |
| **A** | `admin` (`admin.monsuralitravels.com`) | `144.79.218.241` | Standalone Admin Dashboard SPA |
| **A** | `dashboard` (`dashboard.monsuralitravels.com`) | `144.79.218.241` | Client ERP Main Dashboard SPA |
| **A** | `api` (`api.monsuralitravels.com`) | `144.79.218.241` | Primary Backend REST API |
| **A** | `@` (`monsuralitravels.com`) | `144.79.218.241` | Root Domain / Landing Website |
| **A** | `www` (`www.monsuralitravels.com`) | `144.79.218.241` | WWW Subdomain |
| **A** | `server` (`server.monsuralitravels.com`) | `144.79.218.241` | Server Alias |
| **A** | `service` (`service.monsuralitravels.com`) | `144.79.218.241` | Service Alias |

---

## 4. 1-Command Automated Fresh VPS Provisioning

Run this command directly in your VPS terminal:

```bash
curl -fsSL https://raw.githubusercontent.com/ikram3031/Monsur-Ali-Travels/live/vps-setup.sh | bash
```

---

## 5. Free SSL Certificate Command (Certbot)

```bash
certbot --nginx -d admin.monsuralitravels.com -d api.monsuralitravels.com -d dashboard.monsuralitravels.com -d server.monsuralitravels.com -d service.monsuralitravels.com -d monsuralitravels.com -d www.monsuralitravels.com
```

---

## 6. Daily Maintenance & Useful Commands (Makefile)

Inside `/opt/monsuralitravels`:

```bash
# 1. Full Deploy (Clean + Pull live + Rebuild all + Start)
make deploy

# 2. Rebuild & Restart Individual Services
make build-client   # Client Dashboard (8005)
make build-admin    # Admin Dashboard (8007)
make build-bg       # Backend API (5092)
make build-front    # Frontend Landing (8006)

# 3. View Logs
make logs           # All services
make logs-bg        # Backend logs
make logs-client    # Client Dashboard logs
make logs-admin     # Admin Dashboard logs
make logs-front     # Frontend logs

# 4. Status & Management
make status         # Container status (docker compose ps)
make down           # Stop and remove containers
```

