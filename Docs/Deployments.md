# Deployment & VPS Directory

## 🔑 SSH Login Command
```bash
ssh root@144.79.218.241
# or
ssh mat-vps
# or
ssh -i C:\Users\dev\.ssh\id_ed25519_ikramul root@144.79.218.241
```

---

## 1. Monsur Ali Travels Production Host

- **Host IP:** `144.79.218.241`
- **SSH User:** `root`
- **SSH Port:** `22`
- **Project Directory:** `/opt/monsuralitravels`

### Container Architecture
| Container Name | Service | Host Port | Local Dev Port | Routing Domain |
| :--- | :--- | :--- | :--- | :--- |
| **`monsuralitravels-dashboard-admin-live`** | Admin Dashboard SPA | `8007` | `5174` | `https://admin.monsuralitravels.com` |
| **`monsuralitravels-dashboard-live`** | Client Dashboard SPA | `8005` | `5173` | `https://dashboard.monsuralitravels.com` |
| **`monsuralitravels-backend-live`** | Express REST API | `5092` | `5092` | `https://api.monsuralitravels.com` |
| **`monsuralitravels-frontend-live`** | Landing Website | `8006` | `3000` | `https://monsuralitravels.com` |
| **`monsuralitravels-mongodb-live`** | MongoDB 7.0 Engine | `27017` | `27017` | Local / Container Bridge Network |

