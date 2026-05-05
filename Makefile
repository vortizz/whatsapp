# Development

up:
	docker compose up -d --wait

up-build:
	docker compose up -d --wait --build

down:
	docker compose down

down-v:
	docker compose down -v

logs:
	docker compose logs -f

restart:
	docker compose down && docker compose up -d --wait

# Testing

test-up:
	docker compose --env-file .env.test up -d --wait

test-down:
	docker compose down

test-backend-unit:
	cd backend && npm run test

test-backend-e2e:
	cd backend && npm run test:e2e

test-backend-all: test-backend-unit test-backend-e2e

test-frontend-unit:
	cd fe && npm run test:run

test-frontend-e2e:
	docker compose --env-file .env.test up -d --wait && cd fe && npm run test:e2e

test-frontend-all: test-frontend-unit test-frontend-e2e

test-all: test-backend-all test-frontend-all

# Database

db-reset:
	docker compose down -v && docker compose up -d --wait

db-test-reset:
	docker compose --env-file .env.test down -v && docker compose --env-file .env.test up -d --wait