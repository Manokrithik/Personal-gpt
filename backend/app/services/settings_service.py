from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.repositories.settings_repository import SettingsRepository
from app.schemas.settings import SettingsUpdate, SystemHealthResponse
from app.core.config import get_settings
from app.ai.providers.registry import get_provider_registry
from app.storage.vector_storage import get_vector_store
import os

from pathlib import Path

def _sync_to_env_file(key: str, value: str):
    """Safely update or add an environment variable in .env files."""
    possible_paths = [
        Path(".env"),
        Path("../.env"),
        Path(__file__).resolve().parents[3] / ".env",
    ]
    for path in possible_paths:
        if path.exists():
            try:
                content = path.read_text(encoding="utf-8")
                lines = content.splitlines()
                found = False
                for i, line in enumerate(lines):
                    stripped = line.strip()
                    if stripped.startswith(f"{key}=") or stripped.startswith(f"{key} ="):
                        lines[i] = f"{key}={value}"
                        found = True
                        break
                if not found:
                    lines.append(f"{key}={value}")
                path.write_text("\n".join(lines) + "\n", encoding="utf-8")
            except Exception:
                pass

class SettingsService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = SettingsRepository(session)
        self.config = get_settings()

    async def get_settings(self) -> Dict[str, Any]:
        db_settings = await self.repo.get_all()
        gemini_key = db_settings.get("gemini_api_key") or self.config.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")
        openai_key = db_settings.get("openai_api_key") or self.config.OPENAI_API_KEY or os.environ.get("OPENAI_API_KEY", "")

        return {
            "app_name": self.config.APP_NAME,
            "app_env": self.config.APP_ENV,
            "llm_provider": db_settings.get("selected_provider", self.config.LLM_PROVIDER),
            "default_model": db_settings.get("selected_model", self.config.DEFAULT_MODEL),
            "temperature": db_settings.get("temperature", 0.7),
            "enable_rag": db_settings.get("enable_rag", self.config.ENABLE_RAG),
            "enable_memory": db_settings.get("enable_memory", self.config.ENABLE_MEMORY),
            "enable_tools": db_settings.get("enable_tools", self.config.ENABLE_TOOLS),
            "enable_agents": db_settings.get("enable_agents", self.config.ENABLE_AGENTS),
            "max_context_tokens": db_settings.get("max_context_tokens", self.config.MAX_CONTEXT_TOKENS),
            "theme": db_settings.get("theme", "dark"),
            "gemini_api_key": gemini_key,
            "openai_api_key": openai_key,
            "has_gemini_key": bool(gemini_key),
            "has_openai_key": bool(openai_key),
        }

    async def update_settings(self, update_data: SettingsUpdate) -> Dict[str, Any]:
        data_dict = update_data.model_dump(exclude_unset=True)
        registry = get_provider_registry()

        for key, val in data_dict.items():
            if val is not None:
                if key == "llm_provider":
                    await self.repo.set("selected_provider", val)
                elif key == "default_model":
                    await self.repo.set("selected_model", val)
                elif key == "gemini_api_key":
                    await self.repo.set("gemini_api_key", val)
                    os.environ["GEMINI_API_KEY"] = val
                    self.config.GEMINI_API_KEY = val
                    gemini_prov = registry.get_provider("gemini")
                    if hasattr(gemini_prov, "api_key"):
                        gemini_prov.api_key = val
                    _sync_to_env_file("GEMINI_API_KEY", val)
                elif key == "openai_api_key":
                    await self.repo.set("openai_api_key", val)
                    os.environ["OPENAI_API_KEY"] = val
                    self.config.OPENAI_API_KEY = val
                    openai_prov = registry.get_provider("openai")
                    if hasattr(openai_prov, "api_key"):
                        openai_prov.api_key = val
                    _sync_to_env_file("OPENAI_API_KEY", val)
                else:
                    await self.repo.set(key, val)

        return await self.get_settings()

    async def check_health(self) -> SystemHealthResponse:
        registry = get_provider_registry()
        active_provider_name = await self.repo.get("selected_provider", self.config.LLM_PROVIDER)

        # Sync API keys to provider registry
        gemini_key = await self.repo.get("gemini_api_key", self.config.GEMINI_API_KEY)
        if gemini_key:
            gemini_prov = registry.get_provider("gemini")
            if hasattr(gemini_prov, "api_key"):
                gemini_prov.api_key = gemini_key

        openai_key = await self.repo.get("openai_api_key", self.config.OPENAI_API_KEY)
        if openai_key:
            openai_prov = registry.get_provider("openai")
            if hasattr(openai_prov, "api_key"):
                openai_prov.api_key = openai_key

        provider = registry.get_provider(active_provider_name)
        llm_status = "online" if await provider.check_health() else "offline"

        upload_dir_exists = os.path.exists(self.config.UPLOAD_DIR)

        return SystemHealthResponse(
            status="healthy",
            backend="online",
            database="connected",
            vector_store="ready",
            llm_provider=f"{active_provider_name} ({llm_status})",
            available_providers=list(registry._providers.keys()),
            active_model=await self.repo.get("selected_model", self.config.DEFAULT_MODEL),
            storage={
                "upload_dir": self.config.UPLOAD_DIR,
                "upload_dir_ready": upload_dir_exists,
            }
        )

