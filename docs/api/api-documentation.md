# PersonalGPT API Documentation

Base URI: `/api/v1`

## Health & System
- `GET /health`
  - Returns backend, database, vector store, and LLM provider statuses.

## Chat & Streaming
- `POST /chat`
  - Non-streaming chat request.
  - Body: `{"conversation_id": "optional-uuid", "message": "string", "model": "string", "use_rag": true, "use_memory": true}`
- `POST /chat/stream`
  - Server-Sent Events (SSE) streaming chat endpoint.
  - Yields token deltas: `data: {"delta": "token", "done": false}`
  - Emits final metadata: `data: {"done": true, "message_id": "...", "citations": [...]}`

## Conversations
- `GET /conversations` - List all conversations (ordered by last active).
- `POST /conversations` - Create a new conversation.
- `GET /conversations/{id}` - Retrieve conversation with full message history.
- `PATCH /conversations/{id}` - Update conversation title or pinned status.
- `DELETE /conversations/{id}` - Delete conversation and associated messages.

## Knowledge & Documents (RAG)
- `POST /documents/upload` - Upload file (`multipart/form-data`) [PDF, TXT, MD, DOCX, CSV].
- `GET /documents` - List uploaded documents and ingestion status (`processing`, `ready`, `failed`).
- `GET /documents/{id}` - Get document details and chunk counts.
- `DELETE /documents/{id}` - Delete document and purge vector embeddings.
- `POST /search` - Semantic search across indexed knowledge chunks.

## Memory
- `GET /memory` - List extracted user memories.
- `POST /memory` - Add explicit long-term memory entry.
- `DELETE /memory/{id}` - Delete a stored memory.

## Models & Settings
- `GET /models` - List detected local Ollama models and configured cloud models.
- `GET /settings` - Fetch current application and AI settings.
- `PATCH /settings` - Update configuration parameters (temperature, provider, context limits).
