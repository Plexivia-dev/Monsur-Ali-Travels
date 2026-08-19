.PHONY: deploy build-bg build-dash logs status down

deploy:
	git reset --hard origin/live
	git pull origin live
	docker compose -f docker-compose.prod.yml build --no-cache
	docker compose -f docker-compose.prod.yml up -d

build-bg:
	git reset --hard origin/live
	git pull origin live
	docker compose -f docker-compose.prod.yml build --no-cache backend
	docker compose -f docker-compose.prod.yml up -d backend

build-dash:
	git reset --hard origin/live
	git pull origin live
	docker compose -f docker-compose.prod.yml build --no-cache dashboard
	docker compose -f docker-compose.prod.yml up -d dashboard

status:
	docker compose -f docker-compose.prod.yml ps

logs:
	docker compose -f docker-compose.prod.yml logs -f

logs-bg:
	docker compose -f docker-compose.prod.yml logs -f backend

logs-dash:
	docker compose -f docker-compose.prod.yml logs -f dashboard

down:
	docker compose -f docker-compose.prod.yml down
