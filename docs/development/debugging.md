# Debugging Guide

## 1. Backend Diagnostics
- Check health status endpoint:
  ```bash
  curl http://localhost:8000/api/v1/health
  ```
- Inspect OpenAPI documentation:
  Visit `http://localhost:8000/docs` in your browser.
- Logging levels can be adjusted in `.env`:
  ```env
  LOG_LEVEL=DEBUG
  ```

## 2. Common Issues & Solutions
- **Ollama Connection Refused**:
  Ensure Ollama is running (`ollama serve` or Ollama tray app). Verify `OLLAMA_BASE_URL` matches your host or Docker gateway.
- **RAG Chunking Failures**:
  Verify document format is supported (.pdf, .txt, .md, .docx, .csv) and file size is within `MAX_UPLOAD_SIZE_MB`.
- **Database Lock on Windows (SQLite)**:
  Use WAL mode (automatically enabled in `app/db/database.py`).
