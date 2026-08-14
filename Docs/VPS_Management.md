# Monsur Ali Travels ERP - VPS Server & Deployment Specification

## 1. Primary VPS Server Information

- **IP / Address:** `144.79.218.241`
- **SSH Port:** `22`
- **User:** `root`

---

## 2. Project & Repository Configuration

- **Project Name:** Monsur Ali Travels ERP
- **Repository URL:** `https://github.com/ikram3031/Smart_ERP.git`
- **Default Branch:** `master`
- **VPS Codebase Path:** `/opt/monsuralitravels/`
- **VPS Uploads Directory:** `/var/www/uploads/`

---

## 3. Container & Port Architecture

| Service / Container | Role | Host Port | Internal Port | Environment File |
| :--- | :--- | :--- | :--- | :--- |
| **`monsuralitravels-backend-live`** | Node.js / Express API | `5092` | `5092` | `/opt/monsuralitravels/configs/backend.env` |
| **`monsuralitravels-dashboard-live`** | React / Vite SPA Dashboard | `3000` / `8005` | `80` | `/opt/monsuralitravels/configs/dashboard.env` |
| **`monsuralitravels-mongodb-live`** | MongoDB Engine | `27017` | `27017` | Direct Internal Access |

---

## 4. SSH Quick Access Command

```bash
ssh -p 22 root@144.79.218.241
```
