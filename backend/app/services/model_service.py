from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.ai.providers.registry import get_provider_registry
from app.db.repositories.settings_repository import SettingsRepository
from app.schemas.models import ModelListResponse, ModelInfo
from app.core.config import get_settings

class ModelService:
    def __init__(self, session: AsyncSession):
        self.settings_repo = SettingsRepository(session)
        self.registry = get_provider_registry()
        self.config = get_settings()

    async def list_models(self) -> ModelListResponse:
        current_model = await self.settings_repo.get("selected_model", self.config.DEFAULT_MODEL)
        current_provider = await self.settings_repo.get("selected_provider", self.config.LLM_PROVIDER)

        all_models = await self.registry.list_all_models()
        # Mark selected
        for m in all_models:
            m.is_selected = (m.id == current_model)

        return ModelListResponse(
            models=all_models,
            current_model=current_model,
            current_provider=current_provider,
        )

    async def select_model(self, model: str, provider: str = None) -> ModelInfo:
        await self.settings_repo.set("selected_model", model)
        if provider:
            await self.settings_repo.set("selected_provider", provider)

        all_models = await self.registry.list_all_models()
        match = next((m for m in all_models if m.id == model), None)
        if not match:
            match = ModelInfo(
                id=model,
                name=model,
                provider=provider or self.config.LLM_PROVIDER,
                is_local=True,
                is_selected=True
            )
        else:
            match.is_selected = True
        return match
