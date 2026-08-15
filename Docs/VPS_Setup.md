# Monsur Ali Travels ERP - VPS & Cloudflare Configuration

## 1. VPS Server Specifications

- **Host / IP Address:** `144.79.218.241`
- **SSH Port:** `22`
- **User:** `root`
- **OS:** Ubuntu 22.04 / 24.04 LTS
- **Live Path:** `/opt/monsuralitravels`
- **Uploads Storage:** `/var/www/uploads`

---

## 2. Cloudflare DNS & Domain Integration

- **Primary Domain:** `monsuralitravels.com`
- **Cloudflare API Token:** _(Stored securely in Cloudflare account dashboard)_
- **Cloudflare Zone ID:** `96601a82dcaad6ba15891d416e440706`

### Assigned Cloudflare Nameservers

Point these 2 NameServers in your Domain Registrar (where you purchased `monsuralitravels.com`):

1. `christian.ns.cloudflare.com`
2. `laila.ns.cloudflare.com`

### Configured DNS Records (All Auto-Assigned to `144.79.218.241`)

| Type  | Record Name                                    | Target IP        | Description                     |
| :---- | :--------------------------------------------- | :--------------- | :------------------------------ |
| **A** | `admin` (`admin.monsuralitravels.com`)         | `144.79.218.241` | Primary ERP Admin Dashboard SPA |
| **A** | `api` (`api.monsuralitravels.com`)             | `144.79.218.241` | Primary Backend REST API        |
| **A** | `@` (`monsuralitravels.com`)                   | `144.79.218.241` | Root Domain                     |
| **A** | `dashboard` (`dashboard.monsuralitravels.com`) | `144.79.218.241` | Dashboard Alias                 |
| **A** | `server` (`server.monsuralitravels.com`)       | `144.79.218.241` | Server Alias                    |
| **A** | `service` (`service.monsuralitravels.com`)     | `144.79.218.241` | Service Alias                   |
| **A** | `www` (`www.monsuralitravels.com`)             | `144.79.218.241` | WWW Subdomain                   |

---

## 3. 1-Command Automated Fresh VPS Provisioning

Run this command directly in your VPS terminal (`ssh -p 22 root@144.79.218.241`):

```bash
curl -fsSL https://raw.githubusercontent.com/ikram3031/Smart_ERP/master/vps-setup.sh | bash
```

---

## 4. Production Container & Port Architecture

| Container Name                        | Service             | Host Port | Routing Domain                       |
| :------------------------------------ | :------------------ | :-------- | :----------------------------------- |
| **`monsuralitravels-dashboard-live`** | Vite SPA Dashboard  | `8005`    | `https://admin.monsuralitravels.com` |
| **`monsuralitravels-backend-live`**   | Express Node.js API | `5092`    | `https://api.monsuralitravels.com`   |
| **`monsuralitravels-mongodb-live`**   | MongoDB Engine      | `27017`   | Local / Internal Bridge Network      |

---

## 5. Free SSL Certificate Command (Certbot)

```bash
certbot --nginx -d admin.monsuralitravels.com -d api.monsuralitravels.com -d dashboard.monsuralitravels.com -d server.monsuralitravels.com -d service.monsuralitravels.com -d monsuralitravels.com -d www.monsuralitravels.com
```

---

## 6. Maintenance Commands

```bash
# Pull and deploy latest code
cd /opt/monsuralitravels && ./prod-update.sh

# View live container logs
docker compose -f docker-compose.prod.yml logs -f
```
