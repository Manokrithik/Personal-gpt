import asyncio
from typing import List, Dict, Any, AsyncIterator
from app.ai.providers.base import BaseLLMProvider
from app.schemas.models import ModelInfo

class MockProvider(BaseLLMProvider):
    """Deterministic mock provider for automated tests and offline demonstrations."""

    def __init__(self, default_model: str = "mock-gpt"):
        self.default_model = default_model

    async def check_health(self) -> bool:
        return True

    async def list_models(self) -> List[ModelInfo]:
        return [
            ModelInfo(
                id="mock-gpt",
                name="Mock GPT (Offline Test)",
                provider="mock",
                is_local=True,
                context_length=8192,
                description="Fast in-memory mock model for testing and offline development",
            )
        ]

    async def generate(self, messages: List[Dict[str, str]], **kwargs) -> str:
        last_user = next((m["content"] for m in reversed(messages) if m.get("role") == "user"), "Hello!")
        if "Hello PersonalGPT" in last_user:
            return f"PersonalGPT (Mock): I received your message: '{last_user}'. All systems are operating smoothly."
        from app.ai.providers.offline_engine import OfflineEngine
        return OfflineEngine.generate_response(messages)

    async def stream(self, messages: List[Dict[str, str]], **kwargs) -> AsyncIterator[str]:
        from app.ai.providers.offline_engine import OfflineEngine
        async for token in OfflineEngine.stream_response(messages):
            yield token
