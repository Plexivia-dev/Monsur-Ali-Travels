# Monsur Ali Travels ERP — Credentials & Access Reference

> ⚠️ **SENSITIVE FILE** — Do NOT commit this file to any public repository.
> This file is for internal AI agent and admin use only.

---

## 1. VPS Server (Production)

| Field       | Value                  |
| :---------- | :--------------------- |
| **IP**      | `144.79.218.241`       |
| **User**    | `root`                 |
| **Port**    | `22`                   |
| **SSH Key** | `C:\Users\mdikr\.ssh\id_ed25519_ikramul` |
| **Project Path** | `/opt/monsuralitravels` |

### SSH Connect Command
```bash
ssh -i C:\Users\mdikr\.ssh\id_ed25519_ikramul root@144.79.218.241
```

### Deploy / Update Production
```bash
ssh -i C:\Users\mdikr\.ssh\id_ed25519_ikramul root@144.79.218.241 "cd /opt/monsuralitravels && chmod +x ./prod-update.sh && ./prod-update.sh"
```

### View Logs
```bash
ssh -i C:\Users\mdikr\.ssh\id_ed25519_ikramul root@144.79.218.241 "cd /opt/monsuralitravels && docker compose -f docker-compose.prod.yml logs -f"
```

### Container Status
```bash
ssh -i C:\Users\mdikr\.ssh\id_ed25519_ikramul root@144.79.218.241 "cd /opt/monsuralitravels && docker compose -f docker-compose.prod.yml ps"
```

---

## 2. cPanel Web Hosting (Email Server)

| Field             | Value                                    |
| :---------------- | :--------------------------------------- |
| **cPanel URL**    | `https://roxy.us.webxlogin.com:2083`     |
| **cPanel User**   | _(আপনার cPanel username)_               |
| **cPanel Pass**   | _(আপনার cPanel password)_               |
| **Server Host**   | `roxy.us.webxlogin.com`                  |

---

## 3. SMTP Email Credentials (Production)

| Field              | Value                        |
| :----------------- | :--------------------------- |
| **Email Address**  | `info@monsuralitravels.com`  |
| **SMTP Host**      | `roxy.us.webxlogin.com`      |
| **SMTP Port**      | `465` (SSL) / `587` (TLS)    |
| **SMTP User**      | `info@monsuralitravels.com`  |
| **SMTP Password**  | `7FPv$F&EcCkDvkd`            |
| **Encryption**     | `SSL`                        |
| **From Name**      | `Monsur Ali Travels`         |

### Backend `.env.production` SMTP Block
```env
SMTP_HOST=roxy.us.webxlogin.com
SMTP_PORT=465
SMTP_ENCRYPTION=SSL
SMTP_USER=info@monsuralitravels.com
SMTP_PASSWORD=7FPv$F&EcCkDvkd
SMTP_FROM_NAME=Monsur Ali Travels
```

---

## 4. MongoDB (Production — Docker Internal)

| Field          | Value                            |
| :------------- | :------------------------------- |
| **Host**       | `mongodb` (Docker internal only) |
| **Port**       | `27017`                          |
| **Auth DB**    | `admin`                          |
| **DB Name**    | `monsur-ali-travels`             |
| **User**       | `admin`                          |
| **Password**   | `MonsurAliSecPass2026!`          |
| **URI**        | `mongodb://admin:MonsurAliSecPass2026!@mongodb:27017/monsur-ali-travels?authSource=admin` |

---

## 5. Cloudflare

| Field         | Value                                |
| :------------ | :----------------------------------- |
| **Domain**    | `monsuralitravels.com`               |
| **Zone ID**   | `96601a82dcaad6ba15891d416e440706`   |
| **NS 1**      | `christian.ns.cloudflare.com`        |
| **NS 2**      | `laila.ns.cloudflare.com`            |

---

## 6. Live URLs

| Service        | URL                                      |
| :------------- | :--------------------------------------- |
| Dashboard      | `https://admin.monsuralitravels.com`     |
| API / Backend  | `https://api.monsuralitravels.com`       |
| Root Site      | `https://monsuralitravels.com`           |

---

## 7. GitHub Repository

| Field    | Value                                          |
| :------- | :--------------------------------------------- |
| **Repo** | `https://github.com/ikram3031/Smart_ERP`       |
| **Live Branch** | `live`                                  |

---

## 8. Quick Reference — Common AI Agent Tasks

### ▶ VPS-এ Build ও Deploy দিতে হলে
```bash
ssh -i C:\Users\mdikr\.ssh\id_ed25519_ikramul root@144.79.218.241 "cd /opt/monsuralitravels && chmod +x ./prod-update.sh && ./prod-update.sh"
```

### ▶ শুধু Backend রিস্টার্ট করতে হলে
```bash
ssh -i C:\Users\mdikr\.ssh\id_ed25519_ikramul root@144.79.218.241 "cd /opt/monsuralitravels && docker compose -f docker-compose.prod.yml restart backend"
```

### ▶ শুধু Dashboard রিস্টার্ট করতে হলে
```bash
ssh -i C:\Users\mdikr\.ssh\id_ed25519_ikramul root@144.79.218.241 "cd /opt/monsuralitravels && docker compose -f docker-compose.prod.yml restart dashboard"
```

### ▶ Backend Logs দেখতে হলে
```bash
ssh -i C:\Users\mdikr\.ssh\id_ed25519_ikramul root@144.79.218.241 "cd /opt/monsuralitravels && docker compose -f docker-compose.prod.yml logs -f backend"
```
