from typing import List, Dict, Any, AsyncIterator
import httpx
from app.ai.providers.base import BaseLLMProvider
from app.schemas.models import ModelInfo
from app.core.exceptions import LLMProviderException
from app.core.logging import get_logger

logger = get_logger("provider.gemini")

class GeminiProvider(BaseLLMProvider):
    def __init__(self, api_key: str = "", default_model: str = "gemini-1.5-flash"):
        self.api_key = api_key
        self.default_model = default_model

    async def check_health(self) -> bool:
        return bool(self.api_key)

    async def list_models(self) -> List[ModelInfo]:
        return [
            ModelInfo(
                id="gemini-1.5-flash",
                name="gemini-1.5-flash",
                provider="gemini",
                is_local=False,
                context_length=1000000,
                description="Google Gemini 1.5 Flash (High speed, multimodal)"
            ),
            ModelInfo(
                id="gemini-1.5-pro",
                name="gemini-1.5-pro",
                provider="gemini",
                is_local=False,
                context_length=2000000,
                description="Google Gemini 1.5 Pro (Complex reasoning)"
            ),
        ]

    def _convert_messages(self, messages: List[Dict[str, str]]):
        contents = []
        for msg in messages:
            role = "user" if msg["role"] in ["user", "system"] else "model"
            contents.append({
                "role": role,
                "parts": [{"text": msg["content"]}]
            })
        return contents

    async def generate(self, messages: List[Dict[str, str]], **kwargs) -> str:
        if not self.api_key:
            raise LLMProviderException("GEMINI_API_KEY is not configured.", provider="gemini")
        model = kwargs.get("model") or self.default_model
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.api_key}"
        payload = {
            "contents": self._convert_messages(messages),
            "generationConfig": {
                "temperature": kwargs.get("temperature", 0.7),
            }
        }
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code != 200:
                    raise LLMProviderException(f"Gemini error {res.status_code}: {res.text}", provider="gemini")
                data = res.json()
                return data["candidates"][0]["content"]["parts"][0]["text"]
        except Exception as e:
            raise LLMProviderException(str(e), provider="gemini")

    async def stream(self, messages: List[Dict[str, str]], **kwargs) -> AsyncIterator[str]:
        # Simple streaming fallback over generation for API consistency
        full_text = await self.generate(messages, **kwargs)
        # Yield in tokens/words to simulate stream
        words = full_text.split(" ")
        for i, word in enumerate(words):
            yield word + (" " if i < len(words) - 1 else "")
