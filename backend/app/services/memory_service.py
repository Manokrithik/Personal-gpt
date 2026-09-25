from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.repositories.memory_repository import MemoryRepository
from app.schemas.memory import MemorySchema, MemoryCreate
from app.core.exceptions import NotFoundException

class MemoryService:
    def __init__(self, session: AsyncSession):
        self.repo = MemoryRepository(session)

    async def list_memories(self) -> List[MemorySchema]:
        memories = await self.repo.list_memories()
        return [MemorySchema.model_validate(m) for m in memories]

    async def create_memory(self, data: MemoryCreate) -> MemorySchema:
        mem = await self.repo.create(
            content=data.content,
            memory_type=data.memory_type,
            importance=data.importance,
            source=data.source or "manual",
            extra_metadata=data.extra_metadata,
        )
        return MemorySchema.model_validate(mem)

    async def delete_memory(self, memory_id: str) -> bool:
        deleted = await self.repo.delete(memory_id)
        if not deleted:
            raise NotFoundException("Memory", memory_id)
        return True

    async def clear_all(self) -> int:
        return await self.repo.clear_all()
