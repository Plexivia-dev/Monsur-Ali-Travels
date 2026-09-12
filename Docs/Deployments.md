# Deployment & Server Infrastructure Guide

## 🔑 SSH Login Command (Direct Access)
```bash
ssh root@35.200.130.118
# or with explicit key:
ssh -i C:\Users\mdikr\.ssh\id_rsa root@35.200.130.118
# or with alias:
ssh mat-server
```

---

## 1. Monsur Ali Travels Production Host (Google Cloud Live)

- **Provider:** Google Cloud Platform (GCP)
- **Project ID:** `project-9213af41-1469-4afa-b21`
- **Instance Name:** `mat-server`
- **Host IP (Static):** `35.200.130.118`
- **SSH User:** `root`
- **SSH Port:** `22`
- **Region / Zone:** `asia-south1-a` (Mumbai, India)
- **Machine Type:** `e2-standard-2` (8 GB RAM, 80 GB Balanced SSD)
- **OS:** `Ubuntu 24.04.1 LTS (Noble Numbat)`
- **Project Directory:** `/opt/monsuralitravels`
- **GitHub Repository:** `git@github.com:Plexivia-dev/Monsur-Ali-Travels.git` (Branch: `live`)
- **GCS Document Bucket:** `gs://mat-document-storage-9213af41`
- **GCS Backup Bucket:** `gs://mat-backup-storage-9213af41`
- **Snapshot Schedule:** `mat-daily-snapshot` (Daily 03:00 UTC, 14-day retention)

### Production Container Architecture & Live Routing
| Container Name | Service / App | Host Port | Local Dev Port | Routing Domain | SSL Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`monsuralitravels-dashboard-admin-live`** | Admin Dashboard SPA | `8007` | `5174` | `https://admin.monsuralitravels.com` | ✅ Let's Encrypt / Cloudflare SSL |
| **`monsuralitravels-dashboard-live`** | Client Dashboard SPA | `8005` | `5173` | `https://dashboard.monsuralitravels.com` | ✅ Let's Encrypt / Cloudflare SSL |
| **`monsuralitravels-backend-live`** | Express REST API | `5092` | `5092` | `https://api.monsuralitravels.com` | ✅ Let's Encrypt / Cloudflare SSL |
| **`monsuralitravels-frontend-live`** | Landing Website | `8006` | `3000` | `https://monsuralitravels.com` & `www` | ✅ Let's Encrypt / Cloudflare SSL |
| **`monsuralitravels-mongodb-live`** | MongoDB 7.0 Engine | `27017` | `27017` | Local / Container Bridge Network | Internal Docker Net |

---

## 2. Dedicated Development Environment (Google Cloud Dev)

> 📖 **সম্পূর্ণ পৃথক Dev ডকুমেন্টেশন:** [DEV_ENVIRONMENT_AND_CONFIGURATION.md](./DEV_ENVIRONMENT_AND_CONFIGURATION.md)

- **Root Directory:** `/dev-env/opt/monsuralitravels` (Branch: `dev`)
- **Primary Domain:** `plexivia.online`
- **Dev cPanel:** [https://cpanel.plexivia.online](https://cpanel.plexivia.online) (Port: `8090`)
- **Dev Admin Dashboard:** [https://admin.plexivia.online](https://admin.plexivia.online) (Port: `8017`)
- **Dev Client Dashboard:** [https://dash.plexivia.online](https://dash.plexivia.online) (Port: `8015`)
- **Dev Backend API:** [https://server.plexivia.online](https://server.plexivia.online) (Port: `5093`)
- **Dev MongoDB:** `localhost:27018` (Database: `monsur-ali-travels-dev`)
