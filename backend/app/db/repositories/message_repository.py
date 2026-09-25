from typing import List, Optional, Dict, Any
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.message import Message

class MessageRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_conversation(self, conversation_id: str, limit: int = 100) -> List[Message]:
        query = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
            .limit(limit)
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_recent_messages(self, conversation_id: str, limit: int = 10) -> List[Message]:
        """Fetch the most recent N messages, sorted chronologically."""
        query = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.desc())
            .limit(limit)
        )
        result = await self.session.execute(query)
        messages = list(result.scalars().all())
        messages.reverse()
        return messages

    async def create(
        self,
        conversation_id: str,
        role: str,
        content: str,
        model: Optional[str] = None,
        token_usage: Optional[Dict[str, Any]] = None,
        citations: Optional[List[Dict[str, Any]]] = None,
        extra_metadata: Optional[Dict[str, Any]] = None,
    ) -> Message:
        msg = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            model=model,
            token_usage=token_usage,
            citations=citations,
            extra_metadata=extra_metadata,
        )
        self.session.add(msg)
        await self.session.commit()
        await self.session.refresh(msg)
        return msg

    async def delete(self, message_id: str) -> bool:
        query = delete(Message).where(Message.id == message_id)
        result = await self.session.execute(query)
        await self.session.commit()
        return result.rowcount > 0
