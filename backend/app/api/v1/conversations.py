from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.services.conversation_service import ConversationService
from app.schemas.conversation import ConversationSchema, ConversationCreate, ConversationUpdate, MessageSchema

router = APIRouter(prefix="/conversations", tags=["Conversations"])

@router.get("", response_model=List[ConversationSchema])
async def list_conversations(db: AsyncSession = Depends(get_db)):
    """Retrieve all conversations ordered by recent activity."""
    service = ConversationService(db)
    return await service.list_conversations()

@router.post("", response_model=ConversationSchema, status_code=status.HTTP_201_CREATED)
async def create_conversation(data: ConversationCreate, db: AsyncSession = Depends(get_db)):
    """Create a new blank conversation."""
    service = ConversationService(db)
    return await service.create_conversation(data)

@router.get("/{conversation_id}", response_model=ConversationSchema)
async def get_conversation(conversation_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve conversation details including message turns."""
    service = ConversationService(db)
    return await service.get_conversation(conversation_id)

@router.patch("/{conversation_id}", response_model=ConversationSchema)
async def update_conversation(conversation_id: str, data: ConversationUpdate, db: AsyncSession = Depends(get_db)):
    """Update title or pinned status of a conversation."""
    service = ConversationService(db)
    return await service.update_conversation(conversation_id, data)

@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(conversation_id: str, db: AsyncSession = Depends(get_db)):
    """Delete conversation and all associated messages."""
    service = ConversationService(db)
    await service.delete_conversation(conversation_id)

@router.get("/{conversation_id}/messages", response_model=List[MessageSchema])
async def get_conversation_messages(conversation_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve all messages belonging to a conversation."""
    service = ConversationService(db)
    return await service.get_messages(conversation_id)
