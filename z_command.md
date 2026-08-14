# Dev Deployment Documentation

## Server login

```
ssh root@144.79.218.126
```

### Go to root

```
cd /opt/dev
```

### .env to server
```
scp E:/AAAAA/backend .env root@144.79.218.126:/opt/dev/backend/.env
```

### Single app deploy example

```
docker compose up -d --no-deps --build backend
```

```
docker compose up -d --no-deps --build frontend
```

```
docker compose up -d --no-deps --build dashboard
```

### All rerdeploy

```
make deploy
```

## 1. Project Directory Structure

Project root: `/opt/dev`

```text
/opt/dev
├── docker-compose.dev.yml   # Docker services configuration
├── .env                     # Global environment variables
├── uploads/                 # Static files and uploaded images (host path)
├── backend/                 # Express / Node.js backend service
│   ├── src/
│   │   ├── config/env.js    # Port set to 5092
│   │   └── server.js        # Entry point (fallback port 5092)
│   └── Dockerfile
├── frontend/                # React / Vite frontend application
│   ├── package.json         # Dev/prod scripts targeting port 8001
│   └── Dockerfile           # ARG VITE_API_URL=https://server.monsuralitravelsbd.com
└── dash/                    # Next.js admin dashboard
    ├── package.json         # Scripts targeting port 8005
    └── Dockerfile           # ARG NEXT_PUBLIC_API_BASE_URL=https://server.monsuralitravelsbd.com
```

## 2. Service and Port Allocation

| Service   | Container Name           | Internal Port | Public Port   | Purpose                                |
| --------- | ------------------------ | ------------- | ------------- | -------------------------------------- |
| Backend   | `monsuralitravels-backend-dev`   | 5092          | 0.0.0.0:5092  | Express API and static uploads handler |
| Frontend  | `monsuralitravels-frontend-dev`  | 8001          | 0.0.0.0:8001  | User client application                |
| Dashboard | `monsuralitravels-dashboard-dev` | 8005          | 0.0.0.0:8005  | Admin dashboard                        |
| Database  | `monsuralitravels-mongodb-dev`   | 27017         | 0.0.0.0:27017 | MongoDB database engine                |

## 3. Uploads and Storage Synchronization

- Physical location on VPS: `/opt/dev/uploads`
- Docker container location: `/app/uploads` inside the backend container
- Uploads are synchronized through Docker volume mapping so that any file saved by the backend is available directly on the host server.

This setup is useful for:

- storing uploaded images
- keeping files persistent across container restarts
- accessing files directly from the VPS filesystem

## 4. Static Asset and API Request Flow

```text
[Browser Client]
       │
       ├──► Frontend Page -> https://monsuralitravelsbd.com
       ├──► Admin Dashboard -> https://dashboard.monsuralitravelsbd.com
       │
       ├──► API Requests -> https://server.monsuralitravelsbd.com/api/...
       └──► Image Assets -> https://server.monsuralitravelsbd.com/uploads/<image_name.jpg>
```

## 5. Key Commands

```bash
# Pull latest code from GitHub and reset to the remote master branch
cd /opt/dev && git fetch origin master && git reset --hard origin/master

# Rebuild and start containers from scratch
docker compose -f docker-compose.dev.yml build --no-cache && docker compose -f docker-compose.dev.yml up -d

# Check running containers
docker ps
```

## 7. MongoDB User Collection Drop & Super Admin Setup

```bash
# Drop users collection in MongoDB container
docker exec -it monsuralitravels-mongodb-dev mongosh -u admin -p 11223345 --authenticationDatabase admin --eval "db.getSiblingDB('perfume-store').users.drop()"

# Re-create / update Super Admin user
docker exec -it monsuralitravels-backend-dev node scripts/create-super-admin.js
```
