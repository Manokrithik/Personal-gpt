from typing import List, Dict, Any, AsyncIterator
import httpx
from app.ai.providers.base import BaseLLMProvider
from app.schemas.models import ModelInfo
from app.core.exceptions import LLMProviderException
from app.core.logging import get_logger

logger = get_logger("provider.gemini")

class GeminiProvider(BaseLLMProvider):
    def __init__(self, api_key: str = "", default_model: str = "gemini-3.6-flash"):
        self.api_key = api_key
        self.default_model = default_model

    async def check_health(self) -> bool:
        return bool(self.api_key)

    async def list_models(self) -> List[ModelInfo]:
        return [
            ModelInfo(
                id="gemini-3.6-flash",
                name="gemini-3.6-flash",
                provider="gemini",
                is_local=False,
                context_length=1000000,
                description="Google Gemini 3.6 Flash (High speed, multimodal, state-of-the-art)"
            ),
            ModelInfo(
                id="gemini-flash-latest",
                name="gemini-flash-latest",
                provider="gemini",
                is_local=False,
                context_length=1000000,
                description="Google Gemini Flash Latest"
            ),
            ModelInfo(
                id="gemini-3.7-flash",
                name="gemini-3.7-flash",
                provider="gemini",
                is_local=False,
                context_length=1000000,
                description="Google Gemini 3.7 Flash"
            ),
            ModelInfo(
                id="gemini-2.5-pro",
                name="gemini-2.5-pro",
                provider="gemini",
                is_local=False,
                context_length=2000000,
                description="Google Gemini 2.5 Pro (Complex reasoning)"
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
        # Sanitize model name: ensure valid modern Gemini model
        if not raw_model or not raw_model.lower().startswith("gemini") or "1.5" in raw_model:
            model = self.default_model
        else:
            model = raw_model

        candidates_to_try = []
        for m in [model, "gemini-3.6-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"]:
            if m and m not in candidates_to_try:
                candidates_to_try.append(m)

        payload = {
            "contents": self._convert_messages(messages),
            "generationConfig": {
                "temperature": kwargs.get("temperature", 0.7),
            }
        }

        try:
            async with httpx.AsyncClient(timeout=45.0) as client:

                for candidate_model in candidates_to_try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{candidate_model}:generateContent?key={self.api_key}"
                    res = await client.post(url, json=payload)
                    if res.status_code == 200:
                        data = res.json()
                        candidates = data.get("candidates", [])
                        if candidates and "content" in candidates[0]:
                            parts = candidates[0]["content"].get("parts", [])
                            if parts and "text" in parts[0]:
                                return parts[0]["text"]

                    logger.warning(f"Gemini model {candidate_model} returned HTTP {res.status_code}. Trying next model...")

                logger.warning(f"All Gemini models returned non-200. Falling back to OfflineEngine.")
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
