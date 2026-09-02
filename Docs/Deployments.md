# Deployment & VPS Directory

## 🔑 SSH Login Command
```bash
ssh root@144.79.218.241
# or with explicit key:
ssh -i C:\Users\mdikr\.ssh\id_rsa root@144.79.218.241
```

---

## 1. Monsur Ali Travels Production Host

- **Host IP:** `144.79.218.241`
- **SSH User:** `root`
- **SSH Port:** `22`
- **OS:** `Ubuntu 24.04.3 LTS (Noble Numbat)`
- **Project Directory:** `/opt/monsuralitravels`
- **GitHub Repository:** `git@github.com:Plexivia-dev/Monsur-Ali-Travels.git` (Branch: `live`)

### Container Architecture & Live Routing
| Container Name | Service / App | Host Port | Local Dev Port | Routing Domain | SSL Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`monsuralitravels-dashboard-admin-live`** | Admin Dashboard SPA | `8007` | `5174` | `https://admin.monsuralitravels.com` | ✅ Let's Encrypt / Cloudflare SSL |
| **`monsuralitravels-dashboard-live`** | Client Dashboard SPA | `8005` | `5173` | `https://dashboard.monsuralitravels.com` | ✅ Let's Encrypt / Cloudflare SSL |
| **`monsuralitravels-backend-live`** | Express REST API | `5092` | `5092` | `https://api.monsuralitravels.com` | ✅ Let's Encrypt / Cloudflare SSL |
| **`monsuralitravels-frontend-live`** | Landing Website | `8006` | `3000` | `https://monsuralitravels.com` & `www` | ✅ Let's Encrypt / Cloudflare SSL |
| **`monsuralitravels-mongodb-live`** | MongoDB 7.0 Engine | `27017` | `27017` | Local / Container Bridge Network | Internal Docker Net |

