```
ssh -i C:\Users\mdikr\.ssh\id_ed25519_ikramul -o StrictHostKeyChecking=no root@144.79.218.241 "cd /opt/monsuralitravels && git pull origin live && docker compose -f docker-compose.prod.yml build --no-cache dashboard && docker compose -f docker-compose.prod.yml up -d dashboard"
```