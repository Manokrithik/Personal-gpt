from typing import List, Optional, Dict, Any
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.memory import Memory

class MemoryRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list_memories(
        self,
        user_id: Optional[str] = None,
        memory_type: Optional[str] = None,
        limit: int = 50
    ) -> List[Memory]:
        query = select(Memory).order_by(Memory.importance.desc(), Memory.created_at.desc())
        if user_id:
            query = query.where(Memory.user_id == user_id)
        if memory_type:
            query = query.where(Memory.memory_type == memory_type)
        query = query.limit(limit)

        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def create(
        self,
        content: str,
        memory_type: str = "fact",
        importance: float = 0.5,
        source: str = "chat",
        user_id: Optional[str] = None,
        extra_metadata: Optional[Dict[str, Any]] = None,
    ) -> Memory:
        mem = Memory(
            content=content,
            memory_type=memory_type,
            importance=importance,
            source=source,
            user_id=user_id,
            extra_metadata=extra_metadata,
        )
        self.session.add(mem)
        await self.session.commit()
        await self.session.refresh(mem)
        return mem

    async def delete(self, memory_id: str) -> bool:
        query = delete(Memory).where(Memory.id == memory_id)
        result = await self.session.execute(query)
        await self.session.commit()
        return result.rowcount > 0

    async def clear_all(self, user_id: Optional[str] = None) -> int:
        query = delete(Memory)
        if user_id:
            query = query.where(Memory.user_id == user_id)
        result = await self.session.execute(query)
        await self.session.commit()
        return result.rowcount
