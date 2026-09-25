# Development Setup Guide

## Prerequisites
- **Python**: 3.11+
- **Node.js**: 18+ or 20+ LTS
- **Git**
- Optional: **Ollama** (`https://ollama.ai`) for local models

## Fast Local Start

### 1. Configure Environment
```bash
cp .env.example .env
```

### 2. Backend Setup
```bash
cd backend
python -m venv .venv

# Windows Powershell
.venv\Scripts\Activate.ps1

# Linux / macOS
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to start chatting!
