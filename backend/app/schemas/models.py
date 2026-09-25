from typing import List, Optional
from pydantic import BaseModel

class ModelInfo(BaseModel):
    id: str
    name: str
    provider: str  # ollama, openai, gemini, anthropic, mock
    is_local: bool
    context_length: Optional[int] = 4096
    description: Optional[str] = None
    is_selected: bool = False

class ModelListResponse(BaseModel):
    models: List[ModelInfo]
    current_model: str
    current_provider: str

class ModelSelectRequest(BaseModel):
    model: str
    provider: Optional[str] = None
