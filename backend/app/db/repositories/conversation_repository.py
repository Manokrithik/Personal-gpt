from typing import List, Optional
from sqlalchemy import select, update, delete
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.conversation import Conversation
from datetime import datetime, timezone

class ConversationRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list_all(self, limit: int = 50, offset: int = 0) -> List[Conversation]:
        query = (
            select(Conversation)
            .order_by(Conversation.is_pinned.desc(), Conversation.updated_at.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_by_id(self, conversation_id: str, load_messages: bool = True) -> Optional[Conversation]:
        query = select(Conversation).where(Conversation.id == conversation_id)
        if load_messages:
            query = query.options(selectinload(Conversation.messages))
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def create(self, title: str, model: str, user_id: Optional[str] = None) -> Conversation:
        conv = Conversation(
            title=title,
            model=model,
            user_id=user_id,
        )
        self.session.add(conv)
        await self.session.commit()
        await self.session.refresh(conv)
        return conv

    async def update_title(self, conversation_id: str, title: str) -> Optional[Conversation]:
        query = (
            update(Conversation)
            .where(Conversation.id == conversation_id)
            .values(title=title, updated_at=datetime.now(timezone.utc))
            .returning(Conversation)
        )
        result = await self.session.execute(query)
        await self.session.commit()
        return result.scalar_one_or_none()

    async def toggle_pin(self, conversation_id: str, is_pinned: bool) -> Optional[Conversation]:
        query = (
            update(Conversation)
            .where(Conversation.id == conversation_id)
            .values(is_pinned=is_pinned, updated_at=datetime.now(timezone.utc))
            .returning(Conversation)
        )
        result = await self.session.execute(query)
        await self.session.commit()
        return result.scalar_one_or_none()

    async def touch(self, conversation_id: str):
        query = (
            update(Conversation)
            .where(Conversation.id == conversation_id)
            .values(updated_at=datetime.now(timezone.utc))
        )
        await self.session.execute(query)
        await self.session.commit()

    async def delete(self, conversation_id: str) -> bool:
        query = delete(Conversation).where(Conversation.id == conversation_id)
        result = await self.session.execute(query)
        await self.session.commit()
        return result.rowcount > 0
