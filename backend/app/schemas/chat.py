from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ChatCitation(BaseModel):
    document_id: str
    filename: str
    chunk_index: int
    content: str
    page: Optional[int] = None
    similarity_score: Optional[float] = None
    url: Optional[str] = None

class ChatRequest(BaseModel):
    conversation_id: Optional[str] = None
    message: Optional[str] = Field(default="", min_length=0)
    image_data: Optional[str] = None
    image_mime_type: Optional[str] = "image/jpeg"
    model: Optional[str] = None
    provider: Optional[str] = None
    use_rag: bool = True
    use_memory: bool = True
    use_tools: bool = True
    temperature: Optional[float] = Field(default=0.7, ge=0.0, le=2.0)


class ChatResponse(BaseModel):
    conversation_id: str
    message_id: str
    role: str = "assistant"
    content: str
    model: str
    citations: Optional[List[ChatCitation]] = None
    tool_calls: Optional[List[Dict[str, Any]]] = None
    token_usage: Optional[Dict[str, Any]] = None

class StreamChunk(BaseModel):
    delta: str = ""
    done: bool = False
    conversation_id: Optional[str] = None
    message_id: Optional[str] = None
    citations: Optional[List[ChatCitation]] = None
    tool_calls: Optional[List[Dict[str, Any]]] = None
