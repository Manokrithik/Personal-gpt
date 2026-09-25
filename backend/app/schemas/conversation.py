from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from app.schemas.chat import ChatCitation

class MessageSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    conversation_id: str
    role: str
    content: str
    model: Optional[str] = None
    token_usage: Optional[Dict[str, Any]] = None
    citations: Optional[List[ChatCitation]] = None
    extra_metadata: Optional[Dict[str, Any]] = None
    created_at: datetime

class ConversationCreate(BaseModel):
    title: Optional[str] = "New Conversation"
    model: Optional[str] = None

class ConversationUpdate(BaseModel):
    title: Optional[str] = None
    is_pinned: Optional[bool] = None

class ConversationSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    model: str
    is_pinned: bool
    created_at: datetime
    updated_at: datetime
    messages: Optional[List[MessageSchema]] = None
