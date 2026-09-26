# PersonalGPT

<div align="center">

**A Private, Modular, and Extensible Personal AI Assistant Platform**

<p align="center">
  <a href="https://codespaces.new/Manokrithik/Personal-gpt">
    <img src="https://img.shields.io/badge/🚀_CLICK_TO_OPEN_APP-GITHUB_CODESPACES-007ACC?style=for-the-badge&logo=github" alt="Launch App in Codespaces" />
  </a>
  <a href="https://render.com/deploy?repo=https://github.com/Manokrithik/Personal-gpt">
    <img src="https://render.com/images/deploy-to-render-button.svg" alt="Deploy to Render" />
  </a>
</p>

### 📱 [Click Here to Open App (Local Host: http://localhost:8000)](http://localhost:8000)

[![Python 3.11+](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript-61DAFB.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/UI-Tailwind%20CSS-38B2AC.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

*Run local open-weight models (via Ollama) with 100% data privacy and zero API keys, or seamlessly connect cloud LLMs (OpenAI, Gemini, Anthropic) through a unified provider abstraction.*

</div>


---

## Table of Contents
1. [Product Overview](#product-overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Technology Stack](#technology-stack)
4. [Hardware Constraints & Optimization](#hardware-constraints--optimization)
5. [Monorepo Directory Structure](#monorepo-directory-structure)
6. [Quick Start (Local Native Development)](#quick-start-local-native-development)
7. [Running with Docker Compose](#running-with-docker-compose)
8. [AI Subsystems](#ai-subsystems)
   - [LLM Provider Abstraction](#llm-provider-abstraction)
   - [Dual-Tier Memory System](#dual-tier-memory-system)
   - [RAG Knowledge Base](#rag-knowledge-base)
   - [Tool Registry & Controlled Agents](#tool-registry--controlled-agents)
9. [Environment Variables Reference](#environment-variables-reference)
10. [Database Architecture & Migrations](#database-architecture--migrations)
11. [Testing & Verification](#testing--verification)
12. [Backups & Disaster Recovery](#backups--disaster-recovery)
13. [Troubleshooting Guide](#troubleshooting-guide)
14. [Roadmap](#roadmap)

---

## 1. Product Overview

PersonalGPT is designed from the ground up as a private personal AI workstation. Unlike consumer chatbots that store conversations on third-party servers, PersonalGPT stores all conversation histories, user memory profiles, and ingested knowledge documents locally on your machine.

### Key Capabilities
- **Private Conversational AI**: Stream tokens with low latency via Server-Sent Events (SSE).
- **Provider Independence**: Switch between local Ollama models (`llama3.2`, `mistral`, `phi3`, `qwen2.5`) and cloud APIs (`gpt-4o-mini`, `gemini-1.5-flash`, `claude-3-5-sonnet`) without modifying application code.
- **Persistent Conversations**: Complete CRUD for conversation threads with search, pinning, title editing, and full message history.
- **Dual-Tier Memory**:
  - *Short-Term Memory*: Sliding context window with token threshold management to prevent model context overflow.
  - *Long-Term Memory*: Automatic extraction and persistent storage of user preferences, goals, facts, and instructions across sessions.
- **Personal Knowledge Base & RAG**: Upload PDF, TXT, DOCX, Markdown, and CSV files. Chunks are embedded and indexed in vector storage with clickable source citations.
- **Controlled Tool Execution & Agents**: Built-in AST-safe Calculator, Date/Time, and semantic search tools coordinated through an intent-driven agent planner.
- **Modern UI/UX**: Dark and light mode interface built with React 18, TypeScript, Tailwind CSS, and Lucide icons.

---

## 2. High-Level Architecture

```
                    ┌───────────────────────────────────┐
                    │      PersonalGPT UI (Client)      │
                    │   React 18 + Vite + Tailwind CSS  │
                    └─────────────────┬─────────────────┘
                                      │ HTTPS / SSE (EventSource)
                                      ▼
                    ┌───────────────────────────────────┐
                    │          FastAPI Backend          │
                    │       Python 3.11+ / Pydantic      │
                    └─────────────────┬─────────────────┘
                                      │
             ┌────────────────────────┼────────────────────────┐
             │                        │                        │
             ▼                        ▼                        ▼
      ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
      │ Chat Service │         │Memory Service│         │ RAG Pipeline │
      └──────┬───────┘         └──────┬───────┘         └──────┬───────┘
             │                        │                        │
             └────────────────────────┼────────────────────────┘
                                      ▼
                    ┌───────────────────────────────────┐
                    │             AI ENGINE             │
                    │  Provider Registry | Intent Router│
                    │  Prompt Manager   | Safe Tools    │
                    └─────────────────┬─────────────────┘
                                      │
               ┌──────────────────────┼──────────────────────┐
               ▼                      ▼                      ▼
        ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
        │    Ollama    │       │ OpenAI Cloud │       │ Google Gemini│
        │ Local Daemon │       │  Compatible  │       │  Direct API  │
        └──────────────┘       └──────────────┘       └──────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    │             DATA LAYER            │
                    │  SQLite (Dev) / PostgreSQL (Prod) │
                    │  Vector Store / Upload Storage    │
                    └───────────────────────────────────┘
```

---

## 3. Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with CSS Variables design tokens
- **State Management**: Zustand (isolated domain stores)
- **Icons**: Lucide React
- **Streaming**: Native fetch `ReadableStream` with Server-Sent Events

### Backend
- **Framework**: FastAPI (Async ASGI)
- **Validation**: Pydantic v2 & Pydantic Settings
- **ORM & Database**: SQLAlchemy (Async) with SQLite default and PostgreSQL production support
- **Migrations**: Alembic
- **HTTP Client**: HTTPX (Async)
- **Document Extractors**: `pypdf`, `python-docx`, `markdown`, `csv`
- **Testing**: `pytest`, `pytest-asyncio`, `httpx`

---

## 4. Hardware Constraints & Optimization

PersonalGPT is engineered to run comfortably on standard laptops (e.g., AMD Ryzen 7, NVIDIA RTX 3050 4GB VRAM, 16GB RAM):
- **Zero VRAM Spikes**: The RAG pipeline employs a lightweight, deterministic local feature hash vectorizer that executes on CPU without consuming GPU VRAM.
- **Quantized Local Models**: Designed for Ollama 4-bit/8-bit quantized models such as `llama3.2:1b`, `llama3.2:3b`, `qwen2.5:1.5b`, or `phi3:mini`.
- **Sliding Context Limiter**: Conversation contexts are capped to a configurable sliding window to stay strictly within local model context windows.

---

## 5. Monorepo Directory Structure

```text
PersonalGPT/
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore configuration
├── .dockerignore             # Docker build exclusions
├── docker-compose.yml        # Production multi-container compose
├── docker-compose.dev.yml    # Development compose configuration
├── Makefile                  # Task automation recipes
├── README.md                 # Master project documentation
├── run_dev.ps1               # PowerShell one-click development runner
├── start_backend.ps1         # Standalone backend launcher
├── start_frontend.ps1        # Standalone frontend launcher
│
├── docs/                     # Architectural & Engineering Specifications
│   ├── architecture/         # System, AI, Database, and Deployment architecture
│   ├── api/                  # REST API reference documentation
│   ├── development/          # Setup, coding standards, and debugging guides
│   └── decisions/            # Architecture Decision Records (ADRs)
│
├── backend/
│   ├── alembic/              # Database schema migrations
│   ├── tests/
│   │   ├── unit/             # Unit tests (memory, tools, rag, providers)
│   │   └── integration/      # Integration tests (FastAPI endpoints, RAG pipeline)
│   └── app/
│       ├── main.py           # FastAPI entry point & lifespan
│       ├── api/v1/           # Versioned REST endpoints (chat, memory, docs, models)
│       ├── core/             # Configuration, logging, security, exceptions
│       ├── db/               # SQLAlchemy models & repository layer
│       ├── schemas/          # Pydantic request/response schemas
│       ├── services/         # Domain service business logic
│       ├── ai/               # AI Engine (providers, prompts, memory, rag, agents, tools)
│       └── storage/          # Local file and vector storage adapters
│
├── frontend/
│   ├── package.json          # Node dependencies & scripts
│   ├── vite.config.ts        # Vite dev server & backend API proxy
│   ├── tailwind.config.js    # Design tokens & dark mode configuration
│   └── src/
│       ├── main.tsx          # React application root mount
│       ├── App.tsx           # Main workspace layout & navigation
│       ├── components/       # UI components (chat, sidebar, input, citations)
│       ├── pages/            # Views (Chat, Knowledge, Models, Settings, Dashboard)
│       ├── services/         # Centralized API clients
│       ├── store/            # Zustand global domain stores
│       └── types/            # TypeScript domain interfaces
│
├── data/                     # Local data storage (ignored by git)
│   ├── chroma/               # Vector store index
│   ├── uploads/              # Uploaded user knowledge documents
│   └── backups/              # Automated database snapshots
│
└── scripts/
    ├── backup.py             # Backup database and vector store
    ├── healthcheck.py        # System health diagnostics utility
    └── seed.py               # Seed sample conversation and memory
```

---

## 6. Quick Start (Local Native Development)

### Prerequisites
- **Python**: 3.11+
- **Node.js**: 20+ LTS
- Optional: **Ollama** installed from [ollama.ai](https://ollama.ai) for local offline AI.

### Step 1: Clone and Configure Environment
```bash
git clone <repository_url>
cd PersonalGPT

# Copy sample environment configuration
cp .env.example .env
```

### Step 2: Run Unified Full-Stack App (Recommended)
You can run the entire unified application (backend + prebuilt frontend) with a single command:
```bash
python run.py
```
Then navigate to **`http://localhost:8000`** in your browser.
- **Web UI & Chat**: `http://localhost:8000`
- **Swagger API Docs**: `http://localhost:8000/docs`
- **System Health**: `http://localhost:8000/api/v1/health`

### Step 3: Development Mode (Hot-Reloading)
For active development with hot-reloading:

**Windows PowerShell (One-Click):**
```powershell
.\run_dev.ps1
```

**Or run backend and frontend separately:**
- **Backend:**
  ```bash
  cd backend
  python -m venv .venv
  .venv\Scripts\Activate.ps1   # or source .venv/bin/activate
  pip install -r requirements.txt
  uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
  ```
- **Frontend:**
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
  Visit `http://localhost:5173` for the Vite dev server with proxy to backend.

---

## 7. Running with Docker Compose

For a unified containerized deployment with PostgreSQL:

```bash
docker compose up --build -d
```

- Frontend: `http://localhost:80`
- Backend API: `http://localhost:8000`
- Swagger Documentation: `http://localhost:8000/docs`

To stop:
```bash
docker compose down
```

---

## 8. AI Subsystems

### 8.1 LLM Provider Abstraction
PersonalGPT communicates through `BaseLLMProvider`. Providers implement:
- `generate(messages, **kwargs) -> str`
- `stream(messages, **kwargs) -> AsyncIterator[str]`
- `list_models() -> List[ModelInfo]`

Built-in Providers:
- **`OllamaProvider`**: Connects to `http://localhost:11434`. No API keys or account required.
- **`OpenAIProvider`**: Connects to OpenAI compatible REST endpoints.
- **`GeminiProvider`**: Direct Google Gemini API adapter.
- **`MockProvider`**: Offline testing provider for automated CI test suites.

### 8.2 Dual-Tier Memory System
1. **Short-Term Memory**:
   - Maintains a sliding window of recent conversation turns.
   - Truncates context to fit within the model's token budget.
2. **Long-Term Memory**:
   - Detects personal preferences ("I prefer dark mode"), goals ("My goal is to learn Rust"), and instructions ("Always respond in bullet points").
   - Automatically stores extracted memories in the database.
   - Injects relevant memories into the system prompt across conversations.

### 8.3 RAG Knowledge Base
1. **Upload**: Accepts PDF, TXT, MD, DOCX, CSV.
2. **Chunking**: Splits text into overlapping segments preserving sentence boundaries.
3. **Embedding**: Fast local embeddings computed per chunk.
4. **Vector Storage**: Persisted in local vector store.
5. **Retrieval & Citation**: When RAG is active, relevant document excerpts are retrieved and injected into the prompt. The UI displays clickable source files and page numbers.

### 8.4 Tool Registry & Controlled Agents
Supported Tools:
- `calculator`: Evaluates arithmetic expressions safely using AST validation (no `eval()` code injection risk).
- `date_time`: Provides current date, time, and UTC offset.
- `file_search`: Searches uploaded knowledge documents by keyword.
- `knowledge_search`: Performs semantic search over indexed vector chunks.

---

## 9. Environment Variables Reference

| Variable | Description | Default |
|---|---|---|
| `APP_ENV` | Application environment (`development` / `production`) | `development` |
| `BACKEND_PORT` | Port for FastAPI server | `8000` |
| `FRONTEND_PORT` | Port for Vite frontend | `5173` |
| `DATABASE_URL` | SQLAlchemy async connection string | `sqlite+aiosqlite:///./data/personalgpt.db` |
| `LLM_PROVIDER` | Active default provider (`ollama`, `openai`, `gemini`, `mock`) | `ollama` |
| `DEFAULT_MODEL` | Default model name | `llama3.2:1b` |
| `OLLAMA_BASE_URL` | Ollama daemon endpoint | `http://localhost:11434` |
| `OPENAI_API_KEY` | OpenAI API key (cloud mode) | *Optional* |
| `GEMINI_API_KEY` | Google Gemini API key (cloud mode) | *Optional* |
| `MAX_UPLOAD_SIZE_MB` | Maximum allowed file size for RAG uploads | `25` |
| `ENABLE_RAG` | Feature flag: RAG document retrieval | `true` |
| `ENABLE_MEMORY` | Feature flag: User long-term memory | `true` |
| `ENABLE_TOOLS` | Feature flag: Tool execution & Agent planner | `true` |

---

## 10. Database Architecture & Migrations

Alembic handles database schema migrations:

```bash
cd backend
alembic revision --autogenerate -m "create initial tables"
alembic upgrade head
```

---

## 11. Testing & Verification

Run the automated backend test suite (unit + integration):

```bash
cd backend
pytest -v
```

Test Results Summary:
- 20 / 20 tests passing (100% pass rate)
- Health endpoints, conversation CRUD, memory extraction, RAG pipeline, and tool security all verified.

---

## 12. Backups & Disaster Recovery

Run the backup script to create timestamped snapshots of database, vector index, and uploaded documents:

```bash
python scripts/backup.py
```
Snapshots are saved under `data/backups/backup_<timestamp>/`.

---

## 13. Troubleshooting Guide

- **Ollama Connection Refused**:
  Make sure Ollama is running (`ollama serve` or Ollama system tray app). Check `OLLAMA_BASE_URL` in `.env`.
- **Port 8000 or 5173 in use**:
  Update `BACKEND_PORT` or `FRONTEND_PORT` in `.env` and `vite.config.ts`.
- **RAG Chunking Error on Unsupported File**:
  Verify file extension is one of: `.pdf`, `.txt`, `.md`, `.docx`, `.csv`.

---

## 14. Roadmap

- [x] **v0.1**: Core Foundation, Provider Abstraction, Persistent Chats, Streaming SSE, Dual-Tier Memory, RAG Pipeline, Safe Tools, Controlled Agents, and Modern UI.
- [ ] **v0.2**: Conversation auto-summarization for conversations over 50 turns.
- [ ] **v0.3**: Local speech-to-text (Whisper.cpp) voice input.
- [ ] **v0.4**: Local OCR image understanding with quantized vision models.
- [ ] **v0.5**: Web search integration via SearXNG.
- [ ] **v1.0**: Hardened PersonalGPT platform release.
