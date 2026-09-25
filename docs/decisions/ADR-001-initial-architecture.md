# ADR-001: Architecture Selection & Modularity

## Status
Accepted

## Context
PersonalGPT must function as a modular, extensible personal AI assistant on modern developer hardware (such as laptops with 4-8GB VRAM and 16GB RAM) without requiring paid cloud API keys or mandatory container virtualization, while scaling to multi-container PostgreSQL and cloud APIs when required.

## Decision
1. **FastAPI & Async SQLAlchemy**: Adopt FastAPI for its native async runtime, OpenAPI self-documentation, and Server-Sent Events (SSE) streaming. Adopt SQLAlchemy async with automatic SQLite/PostgreSQL switching.
2. **Provider & Vector Abstraction**: Implement `BaseLLMProvider` and `BaseVectorStore` interfaces. This allows switching between Ollama, OpenAI, Gemini, ChromaDB, and In-Memory stores through single `.env` flags without changing core application logic.
3. **Dual-Tier Memory**: Implement short-term sliding window context in conversation sessions and asynchronous long-term memory extraction for cross-conversation user personalization.
4. **Pure React + TypeScript + Tailwind CSS**: Build a clean, modern UI inspired by top AI assistants with Lucide iconography, progressive token rendering, dark/light mode, and zero third-party telemetry.
