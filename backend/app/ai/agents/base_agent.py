from abc import ABC, abstractmethod
from typing import Dict, Any, List

class BaseAgent(ABC):
    @abstractmethod
    async def run(self, user_prompt: str, context: List[Dict[str, str]]) -> Dict[str, Any]:
        """Execute agentic cycle and return response with metadata."""
        pass
