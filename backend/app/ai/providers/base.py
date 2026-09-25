from abc import ABC, abstractmethod
from typing import List, Dict, Any, AsyncIterator
from app.schemas.models import ModelInfo

class BaseLLMProvider(ABC):
    """Abstract base class for all LLM inference providers."""

    @abstractmethod
    async def generate(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """Non-streaming generation returning the complete text answer."""
        pass

    @abstractmethod
    async def stream(self, messages: List[Dict[str, str]], **kwargs) -> AsyncIterator[str]:
        """Streaming token generation yielding partial string deltas."""
        pass

    @abstractmethod
    async def list_models(self) -> List[ModelInfo]:
        """Fetch available models for this provider."""
        pass

    @abstractmethod
    async def check_health(self) -> bool:
        """Check if provider is online and accessible."""
        pass
