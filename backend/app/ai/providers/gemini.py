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
            logger.warning("GEMINI_API_KEY is not configured. Falling back to OfflineEngine.")
            from app.ai.providers.offline_engine import OfflineEngine
            return OfflineEngine.generate_response(messages)

        raw_model = kwargs.get("model") or self.default_model
        # Sanitize model name: ensure valid Gemini model
        model = self.default_model if not raw_model or not raw_model.lower().startswith("gemini") else raw_model

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
                if res.status_code == 200:
                    data = res.json()
                    return data["candidates"][0]["content"]["parts"][0]["text"]

                # If requested model had an issue, fallback to gemini-1.5-flash
                if model != "gemini-1.5-flash":
                    logger.warning(f"Model {model} returned status {res.status_code}. Retrying with gemini-1.5-flash...")
                    fallback_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
                    res2 = await client.post(fallback_url, json=payload)
                    if res2.status_code == 200:
                        data2 = res2.json()
                        return data2["candidates"][0]["content"]["parts"][0]["text"]

                logger.warning(f"Gemini API returned {res.status_code}: {res.text}. Falling back to OfflineEngine.")
                from app.ai.providers.offline_engine import OfflineEngine
                return OfflineEngine.generate_response(messages)
        except Exception as e:
            logger.warning(f"Gemini provider exception: {e}. Falling back to OfflineEngine.")
            from app.ai.providers.offline_engine import OfflineEngine
            return OfflineEngine.generate_response(messages)

    async def stream(self, messages: List[Dict[str, str]], **kwargs) -> AsyncIterator[str]:
        try:
            full_text = await self.generate(messages, **kwargs)
            words = full_text.split(" ")
            for i, word in enumerate(words):
                yield word + (" " if i < len(words) - 1 else "")
        except Exception as e:
            logger.warning(f"Gemini stream error: {e}. Falling back to OfflineEngine stream.")
            from app.ai.providers.offline_engine import OfflineEngine
            async for token in OfflineEngine.stream_response(messages):
                yield token
