# 🚀 Monsur Ali Travels ERP — Dedicated DEV Server & Environment Documentation

> **Classification:** INTERNAL DEVELOPMENT MASTER REFERENCE  
> **Environment:** Dedicated Isolated Development (`/dev-env/`)  
> **Host Server:** Google Cloud Platform (GCP `mat-server`)  
> **Static IP:** `35.200.130.118` (asia-south1-a Mumbai)  
> **Primary Domain:** `plexivia.online`  
> **Last Updated:** September 12, 2026  

---

## 📌 ১. ওভারভিউ ও প্রেক্ষাপট (Executive Overview)

মনসুর আলী ট্রাভেলস ইআরপি-র প্রোডাকশন (Live) সার্ভারকে সম্পূর্ণ নিরুপদ্রব ও সুরক্ষিত রেখে কোড পরিবর্তন, নতুন ফিচার টেস্টিং এবং প্রিভিউ করার জন্য গুগল ক্লাউড সার্ভারের ভেতরে একটি সম্পূর্ণ **বিচ্ছিন্ন ডেভ পরিবেশ (Isolated DEV Environment)** সক্রিয় রয়েছে।

### মূল বৈশিষ্ঠ্যসমূহ:
1. **জিরো লাইভ ইন্টারফেয়ারেন্স:** লাইভ ফোল্ডার (`/opt/monsuralitravels`), লাইভ ডাটাবেজ (`monsur-ali-travels`), লাইভ পোর্ট (`5092`, `8005`, `8007`, `8006`, `27017`) এবং লাইভ স্টোরেজের সাথে কোনো মিশ্রণ নেই।
2. **আইসোলেটেড ডকার নেটওয়ার্ক:** `monsuralitravels-dev-net` ব্যবহার করে ডেভ সার্ভিসগুলো সম্পূর্ণ পৃথক ব্রিজ নেটওয়ার্কে চলে।
3. **ক্লিন ডাটাবেস:** ডেভ ডাটাবেজ (`monsur-ali-travels-dev`) সম্পূর্ণ ফ্রেশ ও ক্লিন। এতে কোনো ভারী ব্যাকআপ ক্রন বা ক্লাউড স্টোরেজ টাস্ক নেই।
4. **ডেডিকেটেড cPanel:** ডেভেলপারদের জন্য গিট পুল, বিল্ড, লগ মনিটরিং এবং কনটেইনার রিস্টার্টের জন্য ডেডিকেটেড ওয়েব কন্ট্রোল প্যানেল রয়েছে।

---

## 🌐 ২. লাইভ Dev এন্ডপয়েন্ট ও ডোমেন রাউটিং

| সার্ভিস | লাইভ ডেভ URL | অভ্যন্তরীণ পোর্ট | লাইভ স্ট্যাটাস | বিবরণ |
| :--- | :--- | :--- | :--- | :--- |
| **⚙️ Dev Ops cPanel** | [https://cpanel.plexivia.online](https://cpanel.plexivia.online) | `8090` | 🟢 Active (200 OK) | 1-Click গিট পুল, বিল্ড ও রিয়েলটাইম টার্মিনাল |
| **👑 Admin Dashboard** | [https://admin.plexivia.online](https://admin.plexivia.online) | `8017` | 🟢 Active (200 OK) | সুপার অ্যাডমিন ও অপারেশনাল প্যানেল |
| **👥 Client Dashboard** | [https://dash.plexivia.online](https://dash.plexivia.online) | `8015` | 🟢 Active (200 OK) | স্টাফ ও ক্লায়েন্ট পোর্টাল |
| **🔌 Backend REST API** | [https://server.plexivia.online](https://server.plexivia.online) | `5093` | 🟢 Active (200 OK) | এক্সপ্রেস ব্যাকএন্ড ও সকেট.আইও |
| **🗄️ MongoDB Dev Engine** | `localhost:27018` | `27018` | 🟢 Active (Isolated) | ডেভ ডেটাবেজ ইঞ্জিন |

> **অতিরিক্ত সাবডোমেন অ্যালিয়াস:**
> - [https://dashboard.plexivia.online](https://dashboard.plexivia.online) ➡️ Client Dashboard (`:8015`)
> - [https://api.plexivia.online](https://api.plexivia.online) ➡️ Backend API (`:5093`)

---

## 🔑 ৩. Dev cPanel লগইন ও ফিচারসমূহ

* **Primary URL:** [https://cpanel.plexivia.online](https://cpanel.plexivia.online)
* **Alternative URL:** [https://admin.plexivia.online/cpanel/](https://admin.plexivia.online/cpanel/)
* **Username:** `developer`
* **Password:** `matOps2026!#deploy`
* **Service:** `mat-ops-panel.service` (Port: `8090`)

### 🛠️ cPanel-এর মূল ফিচার:
1. **1-Click Git Controls:** `dev` ব্রাঞ্চ থেকে সরাসরি Git Pull, Fetch বা Force Sync (`git reset --hard origin/dev && git clean -fd`)।
2. **1-Click Build & Deploy:** Backend, Client Dashboard, অথবা Admin Dashboard আলাদাভাবে বা একসাথে রিবিল্ড ও ডিপ্লয়।
3. **Live Real-time Terminal Logs:** Server-Sent Events (SSE) দ্বারা সার্ভারে রান হওয়া কমান্ডের লাইভ আউটপুট ব্রাউজারে দেখা যায়।
4. **Container Control:** যে কোনো ডেভ কনটেইনার ড্রপডাউন থেকে ইনস্ট্যান্ট রিস্টার্ট।

---

## 📁 ৪. ডিরেক্টরি ও ফাইলসিস্টেম স্ট্রাকচার

```
/dev-env/
├── opt/
│   └── monsuralitravels/        <-- [DEV CODEBASE] (Branch: dev)
│       ├── backend/
│       │   └── .env             <-- Dev Backend Environment Config
│       ├── dashboard/           <-- Vite React Dashboard Source
│       ├── docker-compose.dev.yml
│       ├── nginx-dev.conf       <-- Nginx Reverse Proxy Config
│       ├── dev-setup.sh
│       └── Makefile
└── var/www/
    ├── uploads/                 <-- [DEV UPLOADS] (/dev-env/var/www/uploads)
    └── documents/               <-- [DEV DOCUMENTS] (/dev-env/var/www/documents)
```

---

## 🐳 ৫. Docker Compose কনফিগারেশন (`docker-compose.dev.yml`)

```yaml
name: monsuralitravels-dev

services:
  mongodb-dev:
    image: mongo:7.0
    container_name: monsuralitravels-mongodb-dev
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: devpassword123
      MONGO_INITDB_DATABASE: monsur-ali-travels-dev
    ports:
      - "27018:27017"
    volumes:
      - mongodb-dev-data:/data/db
    networks:
      - monsuralitravels-dev-net

  backend-dev:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: monsuralitravels-backend-dev
    restart: always
    env_file:
      - ./backend/.env
    volumes:
      - /dev-env/var/www/uploads:/app/uploads
      - /dev-env/var/www/uploads:/app/src/uploads
      - /dev-env/var/www/documents:/app/documents
      - /dev-env/var/www/documents:/app/src/documents
    environment:
      NODE_ENV: development
      PORT: 5093
    ports:
      - "5093:5093"
    depends_on:
      - mongodb-dev
    networks:
      - monsuralitravels-dev-net

  dashboard-client-dev:
    build:
      context: ./dashboard
      dockerfile: Dockerfile.client
      args:
        - VITE_API_BASE_URL=https://server.plexivia.online
    container_name: monsuralitravels-dashboard-client-dev
    restart: always
    ports:
      - "8015:80"
    networks:
      - monsuralitravels-dev-net

  dashboard-admin-dev:
    build:
      context: ./dashboard
      dockerfile: Dockerfile.admin
      args:
        - VITE_API_BASE_URL=https://server.plexivia.online
    container_name: monsuralitravels-dashboard-admin-dev
    restart: always
    ports:
      - "8017:80"
    networks:
      - monsuralitravels-dev-net

networks:
  monsuralitravels-dev-net:
    driver: bridge

volumes:
  mongodb-dev-data:
    name: monsuralitravels_mongodb-dev-data
    external: true
```

---

## ✉️ ৬. Dev ইমেইল ও SMTP ক্রেডেনশিয়াল

```env
SMTP_HOST=roxy.us.webxlogin.com
SMTP_PORT=465
SMTP_ENCRYPTION=SSL
SMTP_USER=info@plexivia.com
SMTP_PASSWORD=[REDACTED_FOR_SECURITY]
SMTP_FROM_NAME="Monsur Ali Travels (Dev)"
SMTP_FROM=info@plexivia.com
```

* **Webmail URL:** `https://roxy.us.webxlogin.com:2096`
* **Email User:** `info@plexivia.com`

---

## ⚡ ৭. Dev সিএলআই কমান্ডস (SSH CLI)

সার্ভারে SSH লগইন করে `/dev-env/opt/monsuralitravels` ডিরেক্টরিতে এই কমান্ডগুলো ব্যবহার করা যায়:

```bash
# ১. Dev সার্ভিসগুলোর স্ট্যাটাস দেখা:
docker compose -f docker-compose.dev.yml ps

# ২. Dev কোড পুল ও রিবিল্ড:
git fetch origin dev && git reset --hard origin/dev
docker compose -f docker-compose.dev.yml build --no-cache
docker compose -f docker-compose.dev.yml up -d

# ৩. লাইভ লগস চেক করা:
docker compose -f docker-compose.dev.yml logs -f backend-dev
docker compose -f docker-compose.dev.yml logs -f dashboard-admin-dev
docker compose -f docker-compose.dev.yml logs -f dashboard-client-dev

# ৪. Dev Systemd সার্ভিস রিস্টার্ট:
systemctl restart monsuralitravels-dev.service
systemctl restart mat-ops-panel.service
```
