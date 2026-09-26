from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
import os

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    APP_NAME: str = "PersonalGPT"
    APP_ENV: str = "development"
    DEBUG: bool = True

    # Network / Host
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000
    FRONTEND_PORT: int = 5173
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:80",
    ]

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./data/personalgpt.db"

    # AI / LLM Configuration
    LLM_PROVIDER: str = "ollama"  # ollama, openai, gemini, anthropic, mock
    DEFAULT_MODEL: str = "llama3.2:1b"

    @property
    def effective_default_model(self) -> str:
        if self.LLM_PROVIDER == "gemini" and (not self.DEFAULT_MODEL or self.DEFAULT_MODEL in ["llama3.2:1b", "gemini-1.5-flash"]):
            return "gemini-3.6-flash"
        return self.DEFAULT_MODEL

    # Ollama Local
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2:1b"

    # Cloud Providers
    OPENAI_API_KEY: str = ""
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"
    OPENAI_MODEL: str = "gpt-4o-mini"

    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.6-flash"

    ANTHROPIC_API_KEY: str = ""
    ANTHROPIC_MODEL: str = "claude-3-5-sonnet-20241022"

    # Vector Storage
    VECTOR_STORE: str = "chroma"  # chroma or memory
    CHROMA_PERSIST_DIRECTORY: str = "./data/chroma"
    EMBEDDING_PROVIDER: str = "local"
    LOCAL_EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    # Uploads & Processing
    UPLOAD_DIR: str = "./data/uploads"
    MAX_UPLOAD_SIZE_MB: int = 25
    ALLOWED_EXTENSIONS: List[str] = ["pdf", "txt", "md", "docx", "csv"]
    CHUNK_SIZE: int = 600
    CHUNK_OVERLAP: int = 100

    # Feature Flags
    ENABLE_RAG: bool = True
    ENABLE_MEMORY: bool = True
    ENABLE_TOOLS: bool = True
    ENABLE_AGENTS: bool = True
    ENABLE_VOICE: bool = False

    # Context & Token management
    MAX_CONTEXT_TOKENS: int = 4096
    SHORT_TERM_MESSAGE_LIMIT: int = 10
    MEMORY_EXTRACTION_THRESHOLD: int = 3

    # Logging
    LOG_LEVEL: str = "INFO"

@lru_cache
def get_settings() -> Settings:
    return Settings()
