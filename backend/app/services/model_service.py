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
        default_model = "personalgpt-pro"
        current_model = await self.settings_repo.get("selected_model", default_model)
        current_provider = await self.settings_repo.get("selected_provider", self.config.LLM_PROVIDER)

        # Permanent guard: If OpenAI has no API key configured, prevent it from being active default
        openai_key = await self.settings_repo.get("openai_api_key") or self.config.OPENAI_API_KEY
        if current_provider == "openai" and not openai_key:
            current_model = "personalgpt-pro"
            current_provider = "gemini"
            await self.settings_repo.set("selected_model", current_model)
            await self.settings_repo.set("selected_provider", current_provider)

        all_models = await self.registry.list_all_models()
        # Sort so configured/gemini models appear at the top
        all_models.sort(key=lambda m: 0 if m.provider == "gemini" else (1 if m.is_local else 2))

        # Mark selected
        for m in all_models:
            m.is_selected = (m.id == current_model and m.provider == current_provider)

        return ModelListResponse(
            models=all_models,
            current_model=current_model,
            current_provider=current_provider,
        )

    async def select_model(self, model: str, provider: str = None) -> ModelInfo:
        await self.settings_repo.set("selected_model", model)
        all_models = await self.registry.list_all_models()
        match = next((m for m in all_models if m.id == model), None)
        effective_provider = provider or (match.provider if match else self.config.LLM_PROVIDER)
        await self.settings_repo.set("selected_provider", effective_provider)

        if not match:
            match = ModelInfo(
                id=model,
                name=model,
                provider=effective_provider,
                is_local=True,
                is_selected=True
            )
        else:
            match.provider = effective_provider
            match.is_selected = True
        return match
