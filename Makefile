.PHONY: deploy build-bg build-client build-admin build-front logs status down

deploy:
	git reset --hard HEAD
	git clean -fd
	git fetch origin live
	git reset --hard origin/live
	docker compose -f docker-compose.prod.yml build --no-cache
	docker compose -f docker-compose.prod.yml up -d

build-bg:
	git reset --hard HEAD
	git clean -fd
	git fetch origin live
	git reset --hard origin/live
	docker compose -f docker-compose.prod.yml build --no-cache backend
	docker compose -f docker-compose.prod.yml up -d backend

build-client:
	git reset --hard HEAD
	git clean -fd
	git fetch origin live
	git reset --hard origin/live
	docker compose -f docker-compose.prod.yml build --no-cache dashboard
	docker compose -f docker-compose.prod.yml up -d dashboard

build-admin:
	git reset --hard HEAD
	git clean -fd
	git fetch origin live
	git reset --hard origin/live
	docker compose -f docker-compose.prod.yml build --no-cache dashboard-admin
	docker compose -f docker-compose.prod.yml up -d dashboard-admin

build-front:
	git reset --hard HEAD
	git clean -fd
	git fetch origin live
	git reset --hard origin/live
	docker compose -f docker-compose.prod.yml build --no-cache frontend
	docker compose -f docker-compose.prod.yml up -d frontend

status:
	docker compose -f docker-compose.prod.yml ps

logs:
	docker compose -f docker-compose.prod.yml logs -f

logs-bg:
	docker compose -f docker-compose.prod.yml logs -f backend

logs-client:
	docker compose -f docker-compose.prod.yml logs -f dashboard

logs-admin:
	docker compose -f docker-compose.prod.yml logs -f dashboard-admin

logs-front:
	docker compose -f docker-compose.prod.yml logs -f frontend

down:
	docker compose -f docker-compose.prod.yml down
