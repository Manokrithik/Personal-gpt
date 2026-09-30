from typing import Optional
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.services.chat_service import ChatService
from app.schemas.chat import ChatRequest, ChatResponse
from app.api.v1.auth import get_current_user_optional
from app.schemas.auth import UserResponse

router = APIRouter(tags=["Chat"])

@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    user: Optional[UserResponse] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    """Synchronous chat endpoint returning the complete assistant response."""
    service = ChatService(db)
    user_id = user.id if user else None
    return await service.process_chat(request, user_id=user_id)

@router.post("/chat/stream")
async def chat_stream(
    request: ChatRequest,
    user: Optional[UserResponse] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    """Streaming chat endpoint yielding tokens via Server-Sent Events (SSE)."""
    service = ChatService(db)
    user_id = user.id if user else None
    return StreamingResponse(
        service.stream_chat(request, user_id=user_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
