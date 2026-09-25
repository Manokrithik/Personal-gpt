# Deployment Architecture

## 1. Local Native Deployment (Zero-Docker)
PersonalGPT is designed to run directly on Windows, macOS, or Linux using standard Python and Node.js runtimes:
- **Database**: Embedded SQLite via `aiosqlite`.
- **Vector Store**: ChromaDB embedded / In-Memory vector store.
- **LLM**: Local Ollama instance listening on port `11434`.
- **Backend**: Uvicorn ASGI server on `http://localhost:8000`.
- **Frontend**: Vite dev server on `http://localhost:5173`.

## 2. Containerized Deployment (Docker Compose)
For unified production-like setups, Docker Compose orchestrates three interconnected containers:
1. `personalgpt-frontend`: Multi-stage Alpine Nginx container serving compiled static assets.
2. `personalgpt-backend`: Python 3.11-slim container running FastAPI and workers.
3. `personalgpt-db`: PostgreSQL 16 Alpine container with persistent named volumes.
4. Host Ollama Gateway: Configured via `host.docker.internal` to utilize host GPU acceleration without requiring NVIDIA Container Toolkit inside Docker.
