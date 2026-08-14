# Deployment & VPS Directory

## 1. Monsur Ali Travels Production Host

- **Host IP:** `144.79.218.241`
- **SSH User:** `root`
- **SSH Port:** `22`

### Container Architecture
| Container Name | Service | Host Port | Routing |
| :--- | :--- | :--- | :--- |
| **`monsuralitravels-backend-live`** | Express API | `5092` | `https://server.monsuralitravelsbd.com` |
| **`monsuralitravels-dashboard-live`** | Vite Dashboard SPA | `8005` | `https://dashboard.monsuralitravelsbd.com` |
| **`monsuralitravels-mongodb-live`** | MongoDB | `27017` | Local / Container Network |
