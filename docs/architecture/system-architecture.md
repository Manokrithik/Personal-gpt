# PersonalGPT — System Architecture

## 1. Executive Overview

PersonalGPT is an enterprise-grade, privacy-first personal AI assistant built for local and hybrid execution. It enables users to run local open-weight models (via Ollama) without internet dependency or telemetry, while seamlessly supporting cloud inference providers (OpenAI, Gemini, Anthropic) through an abstracted interface.

```
+-----------------------------------------------------------+
|                        Client Layer                       |
|          React 18 + TypeScript + Vite + Tailwind CSS      |
+-----------------------------+-----------------------------+
                              | HTTPS / SSE (EventSource)
                              v
+-----------------------------------------------------------+
|                      FastAPI Backend                      |
|  +-----------------------------------------------------+  |
|  |                 Routing & Validation                |  |
|  +---------------------------+-------------------------+  |
|                              v                            |
|  +-----------------------------------------------------+  |
|  |                    Service Layer                    |  |
|  |  ChatService | MemoryService | DocumentService      |  |
|  +---------------------------+-------------------------+  |
|                              v                            |
|  +-----------------------------------------------------+  |
|  |                 AI Engine & Orchestrator            |  |
|  |  LLMRouter | PromptManager | AgentManager | Tools   |  |
|  +---------------------------+-------------------------+  |
+------------------------------+----------------------------+
       |                       |                       |
       v                       v                       v
+---------------+      +---------------+      +---------------+
|  Data Layer   |      |  AI Adapters  |      | Vector Store  |
| PostgreSQL /  |      | Ollama Local  |      | ChromaDB /    |
| SQLite Async  |      | OpenAI/Cloud  |      | In-Memory     |
+---------------+      +---------------+      +---------------+
```

## 2. Key Subsystems

### 2.1 API & Service Layer
- **FastAPI**: Provides asynchronous RESTful APIs and Server-Sent Events (SSE) for streaming response tokens.
- **Pydantic v2**: Enforces data validation and typed serialization at domain boundaries.
- **SQLAlchemy (Async)**: Unifies database access across SQLite (zero-config local dev) and PostgreSQL (production).

### 2.2 AI Engine Layer
- **Provider Abstraction (`BaseLLMProvider`)**: Decouples business logic from model APIs.
- **Context Manager**: Enforces token budgets and conversation sliding windows.
- **Memory Subsystem**: Dual-tier architecture managing short-term conversation context and long-term user preferences/facts.
- **RAG Subsystem**: Document ingestion, chunking, embedding generation, vector indexing, and source-attributed retrieval.
- **Tool & Agent Manager**: Safe tool execution registry (Calculator, File Search, Knowledge Search, DateTime) orchestrated through a controlled intent router.
