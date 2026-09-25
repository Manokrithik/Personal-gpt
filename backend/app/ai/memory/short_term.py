from typing import List, Dict
from app.db.models.message import Message

class ShortTermContextManager:
    """Manages short-term conversation sliding window to fit model context limits."""

    def __init__(self, max_tokens: int = 4096, message_limit: int = 10):
        self.max_tokens = max_tokens
        self.message_limit = message_limit

    def estimate_tokens(self, text: str) -> int:
        """Heuristic estimation: approx 4 characters per token."""
        return max(1, len(text) // 4)

    def select_context_messages(self, messages: List[Message]) -> List[Dict[str, str]]:
        """Select the most recent messages fitting within message_limit and max_tokens."""
        # Slice to message_limit first
        candidate_messages = messages[-self.message_limit:] if len(messages) > self.message_limit else messages
        
        selected: List[Dict[str, str]] = []
        running_tokens = 0
        
        # Traverse in reverse to prioritize latest turns
        for msg in reversed(candidate_messages):
            est = self.estimate_tokens(msg.content)
            if running_tokens + est > self.max_tokens:
                break
            selected.append({"role": msg.role, "content": msg.content})
            running_tokens += est

        selected.reverse()
        return selected
