.PHONY: dev dev-api dev-web test test-api test-web build seed migrate clean

dev:
	pnpm dev:all

dev-api:
	cd apps/api && .venv/bin/uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

dev-web:
	pnpm --filter @aabhushan/web dev

seed:
	cd apps/api && PYTHONPATH=. .venv/bin/python -m app.seeds.seed

test: test-api test-web

test-api:
	cd apps/api && PYTHONPATH=. .venv/bin/pytest

test-web:
	pnpm --filter @aabhushan/web build

build:
	pnpm build

clean:
	rm -rf apps/web/.next apps/web/node_modules node_modules apps/api/.venv

