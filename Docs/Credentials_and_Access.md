# Monsur Ali Travels ERP — Credentials & Access Reference

> ⚠️ **SENSITIVE FILE** — Do NOT commit this file to any public repository.
> This file is for internal AI agent and admin use only.

---

## 1. Google Cloud Production Server (Live)

| Field       | Value                  |
| :---------- | :--------------------- |
| **Provider**| Google Cloud Platform (GCP) |
| **Project ID** | `project-9213af41-1469-4afa-b21` |
| **Instance Name** | `mat-server` |
| **IP (Static)** | `35.200.130.118` |
| **User**    | `root`                 |
| **Port**    | `22`                   |
| **Region / Zone** | `asia-south1-a` (Mumbai, ~35ms) |
| **Machine Type** | `e2-standard-2` (8 GB RAM, 80 GB Balanced SSD) |
| **SSH Key** | `~/.ssh/id_rsa` (`C:\Users\mdikr\.ssh\id_rsa`) |
| **Project Path** | `/opt/monsuralitravels` |
| **GCS Documents** | `gs://mat-document-storage-9213af41` |
| **GCS Backups** | `gs://mat-backup-storage-9213af41` |
| **Snapshot Policy** | `mat-daily-snapshot` (Daily at 03:00 UTC, 14-day retention) |

### SSH Connect Command
Direct access:
```bash
ssh root@35.200.130.118
# or with explicit key:
ssh -i C:\Users\mdikr\.ssh\id_rsa root@35.200.130.118
# or with configured alias:
ssh mat-server
```

### Deploy / Update Live Production
```bash
ssh mat-server "cd /opt/monsuralitravels && make deploy"
```

### View Live Logs
```bash
ssh mat-server "cd /opt/monsuralitravels && make logs"
```

### Container Status
```bash
ssh mat-server "cd /opt/monsuralitravels && make status"
```

---

## 1.1. Previous VPS Server (Backup Standby)

| Field       | Value                  |
| :---------- | :--------------------- |
| **IP**      | `144.79.218.241`       |
| **User**    | `root`                 |
| **Port**    | `22`                   |
| **SSH Shortcut** | `ssh mat-old-vps` |
| **Project Path** | `/opt/monsuralitravels` |

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

## 3.1. SMTP Email Credentials (Development — Plexivia)

| Field              | Value                                    |
| :----------------- | :--------------------------------------- |
| **Email Address**  | `info@plexivia.com`                      |
| **SMTP Host**      | `roxy.us.webxlogin.com`                  |
| **SMTP Port**      | `465` (SSL) / `587` (TLS)                |
| **SMTP User**      | `info@plexivia.com`                      |
| **SMTP Password**  | `[REDACTED_FOR_SECURITY]`                |
| **Encryption**     | `SSL`                                    |
| **From Name**      | `Monsur Ali Travels (Dev)`               |
| **Webmail URL**    | `https://roxy.us.webxlogin.com:2096/...` |
| **Reference File** | `G:\My Drive\MAT\DEV_EMAIL_CREDENTIALS_AND_CONFIG.md` |

### Backend DEV `.env` SMTP Block (`/dev-env/opt/monsuralitravels/backend/.env`)
```env
SMTP_HOST=roxy.us.webxlogin.com
SMTP_PORT=465
SMTP_ENCRYPTION=SSL
SMTP_USER=info@plexivia.com
SMTP_PASSWORD=[REDACTED_FOR_SECURITY]
SMTP_FROM_NAME=Monsur Ali Travels (Dev)
SMTP_FROM=info@plexivia.com
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
