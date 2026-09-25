from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.repositories.settings_repository import SettingsRepository
from app.schemas.settings import SettingsUpdate, SystemHealthResponse
from app.core.config import get_settings
from app.ai.providers.registry import get_provider_registry
from app.storage.vector_storage import get_vector_store
import os

class SettingsService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = SettingsRepository(session)
        self.config = get_settings()

    async def get_settings(self) -> Dict[str, Any]:
        db_settings = await self.repo.get_all()
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
        }

    async def update_settings(self, update_data: SettingsUpdate) -> Dict[str, Any]:
        data_dict = update_data.model_dump(exclude_unset=True)
        for key, val in data_dict.items():
            if val is not None:
                if key == "llm_provider":
                    await self.repo.set("selected_provider", val)
                elif key == "default_model":
                    await self.repo.set("selected_model", val)
                else:
                    await self.repo.set(key, val)
        return await self.get_settings()

    async def check_health(self) -> SystemHealthResponse:
        registry = get_provider_registry()
        active_provider_name = await self.repo.get("selected_provider", self.config.LLM_PROVIDER)
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
