import json
from typing import List, Dict, Any, AsyncIterator
import httpx
from app.ai.providers.base import BaseLLMProvider
from app.schemas.models import ModelInfo
from app.core.exceptions import LLMProviderException
from app.core.logging import get_logger

logger = get_logger("provider.ollama")

class OllamaProvider(BaseLLMProvider):
    def __init__(self, base_url: str = "http://localhost:11434", default_model: str = "llama3.2:1b"):
        self.base_url = base_url.rstrip("/")
        self.default_model = default_model

    async def check_health(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                return res.status_code == 200
        except Exception:
            return False

    async def list_models(self) -> List[ModelInfo]:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                if res.status_code == 200:
                    data = res.json()
                    models = []
                    for item in data.get("models", []):
                        name = item.get("name", "")
                        models.append(
                            ModelInfo(
                                id=name,
                                name=name,
                                provider="ollama",
                                is_local=True,
                                context_length=item.get("details", {}).get("parameter_size", 4096),
                                description=f"Ollama local model ({item.get('details', {}).get('format', 'gguf')})",
                            )
                        )
                    return models
        except Exception as e:
            logger.warning(f"Could not connect to Ollama on {self.base_url}: {e}")
        
        # Fallback default local model placeholder if Ollama is not yet started
        return [
            ModelInfo(
                id=self.default_model,
                name=self.default_model,
                provider="ollama",
                is_local=True,
                context_length=4096,
                description="Ollama default model (pending server connection)",
            )
        ]

    async def generate(self, messages: List[Dict[str, str]], **kwargs) -> str:
        model = kwargs.get("model") or self.default_model
        payload = {
            "model": model,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": kwargs.get("temperature", 0.7)
            }
        }
        try:
            timeout_cfg = httpx.Timeout(60.0, connect=3.0)
            async with httpx.AsyncClient(timeout=timeout_cfg) as client:
                res = await client.post(f"{self.base_url}/api/chat", json=payload)
                if res.status_code != 200:
                    raise LLMProviderException(f"Ollama returned {res.status_code}: {res.text}", provider="ollama")
                data = res.json()
                return data.get("message", {}).get("content", "")
        except (httpx.ConnectError, httpx.ConnectTimeout, httpx.TimeoutException, httpx.NetworkError):
            from app.ai.providers.offline_engine import OfflineEngine
            resp = OfflineEngine.generate_response(messages)
            return (
                f"{resp}\n\n"
                f"---\n"
                f"> 💡 *Operating on PersonalGPT Built-in Offline Engine. "
                f"To connect live local models like Llama 3.2, launch Ollama (`ollama serve`) or configure API keys in Settings.*"
            )
        except Exception as e:
            raise LLMProviderException(str(e), provider="ollama")

    async def stream(self, messages: List[Dict[str, str]], **kwargs) -> AsyncIterator[str]:
        model = kwargs.get("model") or self.default_model
        payload = {
            "model": model,
            "messages": messages,
            "stream": True,
            "options": {
                "temperature": kwargs.get("temperature", 0.7)
            }
        }
        try:
            timeout_cfg = httpx.Timeout(120.0, connect=3.0)
            async with httpx.AsyncClient(timeout=timeout_cfg) as client:
                async with client.stream("POST", f"{self.base_url}/api/chat", json=payload) as response:
                    if response.status_code != 200:
                        err = await response.aread()
                        raise LLMProviderException(f"Ollama returned status {response.status_code}: {err.decode()}", provider="ollama")
                    async for line in response.aiter_lines():
                        if not line:
                            continue
                        try:
                            chunk = json.loads(line)
                            content = chunk.get("message", {}).get("content", "")
                            if content:
                                yield content
                            if chunk.get("done", False):
                                break
                        except json.JSONDecodeError:
                            continue
        except (httpx.ConnectError, httpx.ConnectTimeout, httpx.TimeoutException, httpx.NetworkError):
            from app.ai.providers.offline_engine import OfflineEngine
            async for token in OfflineEngine.stream_response(messages):
                yield token
        except Exception as e:
            raise LLMProviderException(str(e), provider="ollama")
