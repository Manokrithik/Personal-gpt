from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class DocumentChunkSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    chunk_index: int
    content: str
    embedding_reference: Optional[str] = None
    extra_metadata: Optional[Dict[str, Any]] = None

class DocumentSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    filename: str
    file_type: str
    file_size: int
    status: str
    error_message: Optional[str] = None
    chunks_count: Optional[int] = 0
    created_at: datetime
    updated_at: Optional[datetime] = None

class DocumentSearchRequest(BaseModel):
    query: str
    top_k: int = 4
    document_ids: Optional[List[str]] = None

class DocumentSearchResult(BaseModel):
    document_id: str
    filename: str
    chunk_index: int
    content: str
    score: float
    metadata: Optional[Dict[str, Any]] = None
