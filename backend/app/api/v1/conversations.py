from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.services.conversation_service import ConversationService
from app.schemas.conversation import ConversationSchema, ConversationCreate, ConversationUpdate, MessageSchema
from app.api.v1.auth import get_current_user_optional
from app.schemas.auth import UserResponse

router = APIRouter(prefix="/conversations", tags=["Conversations"])

@router.get("", response_model=List[ConversationSchema])
async def list_conversations(
    user: Optional[UserResponse] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all conversations belonging to the authenticated user."""
    user_id = user.id if user else None
    service = ConversationService(db)
    return await service.list_conversations(user_id=user_id)

@router.post("", response_model=ConversationSchema, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    data: ConversationCreate,
    user: Optional[UserResponse] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    """Create a new blank conversation for authenticated user."""
    service = ConversationService(db)
    user_id = user.id if user else None
    return await service.create_conversation(data, user_id=user_id)

@router.get("/{conversation_id}", response_model=ConversationSchema)
async def get_conversation(
    conversation_id: str,
    user: Optional[UserResponse] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve conversation details including message turns."""
    service = ConversationService(db)
    user_id = user.id if user else None
    return await service.get_conversation(conversation_id, user_id=user_id)

@router.patch("/{conversation_id}", response_model=ConversationSchema)
async def update_conversation(
    conversation_id: str,
    data: ConversationUpdate,
    user: Optional[UserResponse] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    """Update title or pinned status of a conversation."""
    service = ConversationService(db)
    user_id = user.id if user else None
    return await service.update_conversation(conversation_id, data, user_id=user_id)

@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: str,
    user: Optional[UserResponse] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    """Delete conversation and all associated messages."""
    service = ConversationService(db)
    user_id = user.id if user else None
    await service.delete_conversation(conversation_id, user_id=user_id)

@router.get("/{conversation_id}/messages", response_model=List[MessageSchema])
async def get_conversation_messages(
    conversation_id: str,
    user: Optional[UserResponse] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all messages belonging to a conversation."""
    service = ConversationService(db)
    user_id = user.id if user else None
    return await service.get_messages(conversation_id, user_id=user_id)
