from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.repositories.conversation_repository import ConversationRepository
from app.db.repositories.message_repository import MessageRepository
from app.schemas.conversation import ConversationSchema, ConversationCreate, ConversationUpdate, MessageSchema
from app.core.exceptions import NotFoundException
from app.core.config import get_settings

class ConversationService:
    def __init__(self, session: AsyncSession):
        self.conv_repo = ConversationRepository(session)
        self.msg_repo = MessageRepository(session)
        self.settings = get_settings()

    async def list_conversations(self, user_id: Optional[str] = None) -> List[ConversationSchema]:
        if not user_id:
            convs = await self.conv_repo.list_all()
        else:
            convs = await self.conv_repo.list_by_user(user_id=user_id)
        return [ConversationSchema.model_validate(c) for c in convs]

    async def get_conversation(self, conversation_id: str, user_id: Optional[str] = None) -> ConversationSchema:
        conv = await self.conv_repo.get_by_id(conversation_id, load_messages=True)
        if not conv:
            raise NotFoundException("Conversation", conversation_id)
        if conv.user_id and user_id and conv.user_id != user_id:
            raise NotFoundException("Conversation", conversation_id)
        return ConversationSchema.model_validate(conv)

    async def create_conversation(self, data: ConversationCreate, user_id: Optional[str] = None) -> ConversationSchema:
        model = data.model or self.settings.DEFAULT_MODEL
        title = data.title or "New Conversation"
        conv = await self.conv_repo.create(title=title, model=model, user_id=user_id)
        return ConversationSchema.model_validate(conv)

    async def update_conversation(self, conversation_id: str, data: ConversationUpdate, user_id: Optional[str] = None) -> ConversationSchema:
        conv = await self.conv_repo.get_by_id(conversation_id, load_messages=False)
        if not conv:
            raise NotFoundException("Conversation", conversation_id)
        if conv.user_id and user_id and conv.user_id != user_id:
            raise NotFoundException("Conversation", conversation_id)
        
        if data.title is not None:
            conv = await self.conv_repo.update_title(conversation_id, data.title)
        if data.is_pinned is not None:
            conv = await self.conv_repo.toggle_pin(conversation_id, data.is_pinned)
            
        return ConversationSchema.model_validate(conv)

    async def delete_conversation(self, conversation_id: str, user_id: Optional[str] = None) -> bool:
        conv = await self.conv_repo.get_by_id(conversation_id, load_messages=False)
        if not conv:
            raise NotFoundException("Conversation", conversation_id)
        if conv.user_id and user_id and conv.user_id != user_id:
            raise NotFoundException("Conversation", conversation_id)
        return await self.conv_repo.delete(conversation_id)

    async def get_messages(self, conversation_id: str, user_id: Optional[str] = None) -> List[MessageSchema]:
        conv = await self.conv_repo.get_by_id(conversation_id, load_messages=False)
        if not conv:
            raise NotFoundException("Conversation", conversation_id)
        if conv.user_id and user_id and conv.user_id != user_id:
            raise NotFoundException("Conversation", conversation_id)
        msgs = await self.msg_repo.get_by_conversation(conversation_id)
        return [MessageSchema.model_validate(m) for m in msgs]
