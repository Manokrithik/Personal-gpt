from typing import List, Dict, Any, Optional
from app.ai.memory.short_term import ShortTermContextManager
from app.ai.memory.long_term import LongTermMemoryManager
from app.db.repositories.memory_repository import MemoryRepository
from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger("memory.manager")

class MemoryManager:
    def __init__(self, memory_repo: MemoryRepository):
        settings = get_settings()
        self.memory_repo = memory_repo
        self.short_term = ShortTermContextManager(
            max_tokens=settings.MAX_CONTEXT_TOKENS,
            message_limit=settings.SHORT_TERM_MESSAGE_LIMIT
        )
        self.long_term = LongTermMemoryManager()

    async def get_relevant_memories(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Retrieve highest importance memories for injection into system prompt."""
        memories = await self.memory_repo.list_memories(limit=limit)
        return [
            {
                "id": m.id,
                "content": m.content,
                "memory_type": m.memory_type,
                "importance": m.importance,
            }
            for m in memories
        ]

    async def maybe_extract_and_save(self, user_message: str):
        """Asynchronously evaluate and record potential long-term memory."""
        candidate = self.long_term.extract_candidate(user_message)
        if not candidate:
            return

        existing = await self.memory_repo.list_memories(limit=50)
        if self.long_term.is_duplicate(candidate["content"], existing):
            logger.debug(f"Skipping duplicate memory: {candidate['content']}")
            return

        saved = await self.memory_repo.create(
            content=candidate["content"],
            memory_type=candidate["memory_type"],
            importance=candidate["importance"],
            source=candidate["source"],
        )
        logger.info(f"Learned new memory: {saved.content} ({saved.memory_type})")
