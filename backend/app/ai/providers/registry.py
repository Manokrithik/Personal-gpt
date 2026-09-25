from typing import Dict, List, Optional
from app.ai.providers.base import BaseLLMProvider
from app.ai.providers.ollama import OllamaProvider
from app.ai.providers.openai import OpenAIProvider
from app.ai.providers.gemini import GeminiProvider
from app.ai.providers.mock import MockProvider
from app.schemas.models import ModelInfo
from app.core.config import get_settings
from app.core.exceptions import LLMProviderException
from app.core.logging import get_logger

logger = get_logger("provider.registry")

class ProviderRegistry:
    def __init__(self):
        self._providers: Dict[str, BaseLLMProvider] = {}
        self._initialize_defaults()

    def _initialize_defaults(self):
        settings = get_settings()

        # Register providers
        self.register("ollama", OllamaProvider(
            base_url=settings.OLLAMA_BASE_URL,
            default_model=settings.OLLAMA_MODEL
        ))

        self.register("openai", OpenAIProvider(
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL,
            default_model=settings.OPENAI_MODEL
        ))

        self.register("gemini", GeminiProvider(
            api_key=settings.GEMINI_API_KEY,
            default_model=settings.GEMINI_MODEL
        ))

        self.register("mock", MockProvider())

    def register(self, name: str, provider: BaseLLMProvider):
        self._providers[name.lower()] = provider
        logger.debug(f"Registered provider: {name}")

    def get_provider(self, name: Optional[str] = None) -> BaseLLMProvider:
        settings = get_settings()
        target = (name or settings.LLM_PROVIDER).lower()

        if target in self._providers:
            return self._providers[target]

        # Fallback to mock if provider not found
        logger.warning(f"Provider '{target}' not found. Falling back to 'mock'.")
        return self._providers["mock"]

    async def list_all_models(self) -> List[ModelInfo]:
        all_models = []
        for name, provider in self._providers.items():
            try:
                models = await provider.list_models()
                all_models.extend(models)
            except Exception as e:
                logger.warning(f"Error querying models from provider '{name}': {e}")
        return all_models

# Singleton instance
_registry = None

def get_provider_registry() -> ProviderRegistry:
    global _registry
    if _registry is None:
        _registry = ProviderRegistry()
    return _registry
