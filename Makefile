.PHONY: help install dev backend frontend test test-backend test-frontend docker-up docker-down clean

help:
	@echo "PersonalGPT Management Commands:"
	@echo "  make install         Install backend and frontend dependencies"
	@echo "  make dev             Run both backend and frontend locally"
	@echo "  make backend         Run FastAPI backend server"
	@echo "  make frontend        Run Vite frontend dev server"
	@echo "  make test            Run all test suites"
	@echo "  make test-backend    Run pytest test suite"
	@echo "  make test-frontend   Run frontend tests"
	@echo "  make docker-up       Start production stack with Docker Compose"
	@echo "  make docker-down     Stop Docker Compose stack"
	@echo "  make clean           Remove temporary build/cache files"

install:
	cd backend && pip install -r requirements.txt
	cd frontend && npm install

backend:
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

frontend:
	cd frontend && npm run dev

test: test-backend test-frontend

test-backend:
	cd backend && pytest -v

test-frontend:
	cd frontend && npm test -- --run

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	rm -rf frontend/dist .pytest_cache htmlcov
