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
        return f"PersonalGPT (Mock): I received your message: '{last_user}'. All systems are operating smoothly."

    async def stream(self, messages: List[Dict[str, str]], **kwargs) -> AsyncIterator[str]:
        last_user = next((m["content"] for m in reversed(messages) if m.get("role") == "user"), "Hello!")
        response = (
            f"Hello! I am PersonalGPT operating in high-performance mode.\n\n"
            f"You asked: **{last_user}**.\n\n"
            f"I have verified your memory context, RAG knowledge stores, and tool execution registry. "
            f"How can I assist you further today?"
        )
        # Yield in realistic word chunks
        words = response.split(" ")
        for i, word in enumerate(words):
            await asyncio.sleep(0.02)  # Tiny pause to simulate realistic token streaming
            yield word + (" " if i < len(words) - 1 else "")
