import json
from typing import List, Dict, Any, AsyncIterator
import httpx
from app.ai.providers.base import BaseLLMProvider
from app.schemas.models import ModelInfo
from app.core.exceptions import LLMProviderException
from app.core.logging import get_logger

logger = get_logger("provider.openai")

class OpenAIProvider(BaseLLMProvider):
    def __init__(self, api_key: str = "", base_url: str = "https://api.openai.com/v1", default_model: str = "gpt-4o-mini"):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.default_model = default_model

    def _headers(self) -> Dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers

    async def check_health(self) -> bool:
        return bool(self.api_key)

    async def list_models(self) -> List[ModelInfo]:
        popular = ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"]
        return [
            ModelInfo(
                id=m,
                name=m,
                provider="openai",
                is_local=False,
                context_length=128000 if "4o" in m else 16384,
                description=f"OpenAI Cloud Model ({m})"
            )
            for m in popular
        ]

    async def generate(self, messages: List[Dict[str, str]], **kwargs) -> str:
        if not self.api_key:
            raise LLMProviderException("OPENAI_API_KEY is not configured.", provider="openai")
        model = kwargs.get("model") or self.default_model
        payload = {
            "model": model,
            "messages": messages,
            "temperature": kwargs.get("temperature", 0.7),
            "stream": False,
        }
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                res = await client.post(f"{self.base_url}/chat/completions", headers=self._headers(), json=payload)
                if res.status_code != 200:
                    raise LLMProviderException(f"OpenAI error {res.status_code}: {res.text}", provider="openai")
                data = res.json()
                return data["choices"][0]["message"]["content"]
        except Exception as e:
            raise LLMProviderException(str(e), provider="openai")

    async def stream(self, messages: List[Dict[str, str]], **kwargs) -> AsyncIterator[str]:
        if not self.api_key:
            raise LLMProviderException("OPENAI_API_KEY is not configured.", provider="openai")
        model = kwargs.get("model") or self.default_model
        payload = {
            "model": model,
            "messages": messages,
            "temperature": kwargs.get("temperature", 0.7),
            "stream": True,
        }
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                async with client.stream("POST", f"{self.base_url}/chat/completions", headers=self._headers(), json=payload) as response:
                    if response.status_code != 200:
                        err = await response.aread()
                        raise LLMProviderException(f"OpenAI error {response.status_code}: {err.decode()}", provider="openai")
                    async for line in response.aiter_lines():
                        if not line or not line.startswith("data: "):
                            continue
                        data_str = line[6:].strip()
                        if data_str == "[DONE]":
                            break
                        try:
                            parsed = json.loads(data_str)
                            delta = parsed.get("choices", [{}])[0].get("delta", {}).get("content", "")
                            if delta:
                                yield delta
                        except json.JSONDecodeError:
                            continue
        except Exception as e:
            raise LLMProviderException(str(e), provider="openai")
