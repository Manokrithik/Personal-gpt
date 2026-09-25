from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

class MemoryCreate(BaseModel):
    content: str = Field(..., min_length=2)
    memory_type: str = Field(default="fact")
    importance: float = Field(default=0.5, ge=0.0, le=1.0)
    source: Optional[str] = "manual"
    extra_metadata: Optional[Dict[str, Any]] = None

class MemorySchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    content: str
    memory_type: str
    importance: float
    source: str
    extra_metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
