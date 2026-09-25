# Changelog

All notable changes to PersonalGPT will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-09-25

### Added
- **Core Architecture**: Modular multi-tier monorepo structure with FastAPI backend and React 18 + Vite + Tailwind CSS frontend.
- **Provider Abstraction**: Pluggable `BaseLLMProvider` supporting Ollama (local), OpenAI, Gemini, and Mock providers with SSE streaming.
- **Persistent Conversations**: Full CRUD for conversations, messages, search, title editing, pin/favorite, and deletion.
- **Memory System**: Dual-tier memory (Short-term context manager with sliding window & Long-term memory extraction, persistence, and filtering).
- **RAG Engine**: Document processing pipeline supporting PDF, TXT, MD, DOCX, CSV with chunking, metadata indexing, vector similarity retrieval, and in-chat source citations.
- **Tool System**: Extensible tool execution engine with built-in Calculator, File Search, Knowledge Search, and DateTime tools.
- **Controlled Agent**: ReAct-style agent orchestrator with planning, tool invocation, observation, and final synthesis.
- **UI/UX**: ChatGPT-quality dark/light mode interface with Lucide iconography, progressive token rendering, source citations viewer, and settings controls.
- **DevOps**: Docker, Docker Compose, Makefile, and GitHub Actions CI pipelines.
