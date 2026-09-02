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
| **SSH Key** | `~/.ssh/id_rsa` (`C:\Users\mdikr\.ssh\id_rsa`) |
| **Project Path** | `/opt/monsuralitravels` |

### SSH Connect Command
Direct access:
```bash
ssh root@144.79.218.241
```

Explicit key command:
```bash
ssh -i C:\Users\mdikr\.ssh\id_rsa root@144.79.218.241
```

### Deploy / Update Production
```bash
ssh mat-vps "cd /opt/monsuralitravels && make deploy"
```

### View Logs
```bash
ssh mat-vps "cd /opt/monsuralitravels && make logs"
```

### Container Status
```bash
ssh mat-vps "cd /opt/monsuralitravels && make status"
```

---

## 2. cPanel Web Hosting (Email Server)

| Field             | Value                                    |
| :---------------- | :--------------------------------------- |
| **cPanel URL**    | `https://aberi.us.svlogins.com:2083`     |
| **cPanel User**   | _(আপনার cPanel username)_               |
| **cPanel Pass**   | _(আপনার cPanel password)_               |
| **Server Host**   | `aberi.us.svlogins.com`                  |

---

## 3. SMTP Email Credentials (Production)

| Field              | Value                        |
| :----------------- | :--------------------------- |
| **Email Address**  | `info@monsuralitravels.com`  |
| **SMTP Host**      | `aberi.us.svlogins.com`      |
| **SMTP Port**      | `587` (TLS)                  |
| **SMTP User**      | `info@monsuralitravels.com`  |
| **SMTP Password**  | `[REDACTED_FOR_SECURITY]`    |
| **Encryption**     | `TLS`                        |
| **From Name**      | `Monsur Ali Travels`         |

### Backend `.env.production` SMTP Block
```env
SMTP_HOST=aberi.us.svlogins.com
SMTP_PORT=587
SMTP_ENCRYPTION=TLS
SMTP_USER=info@monsuralitravels.com
SMTP_PASSWORD=[REDACTED_FOR_SECURITY]
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
| **Password**   | `[REDACTED_FOR_SECURITY]`          |
| **URI**        | `mongodb://admin:[REDACTED_FOR_SECURITY]@mongodb:27017/monsur-ali-travels?authSource=admin` |

---

## 5. Cloudflare

| Field         | Value                                |
| :------------ | :----------------------------------- |
| **Domain**    | `monsuralitravels.com`               |
| **Zone ID**   | `96601a82dcaad6ba15891d416e440706`   |
| **Account ID**| `f9c0c34851099dfb743390a7a0086321`   |
| **API Token** | `[REDACTED_FOR_SECURITY]`            |
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
| **Repo** | `https://github.com/Plexivia-dev/Monsur-Ali-Travels.git`       |
| **Live Branch** | `live`                                  |

---

## 8. Quick Reference — Common Maintenance Tasks

### ▶ VPS-এ Build ও Deploy দিতে হলে
```bash
ssh -i C:\Users\mdikr\.ssh\id_rsa root@144.79.218.241 "cd /opt/monsuralitravels && make deploy"
```

### ▶ শুধু Backend রিস্টার্ট করতে হলে
```bash
ssh -i C:\Users\mdikr\.ssh\id_rsa root@144.79.218.241 "cd /opt/monsuralitravels && make restart-bg"
```

### ▶ Backend Logs দেখতে হলে
```bash
ssh -i C:\Users\mdikr\.ssh\id_rsa root@144.79.218.241 "cd /opt/monsuralitravels && make logs-bg"
```
