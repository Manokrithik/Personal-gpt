from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class SettingsUpdate(BaseModel):
    llm_provider: Optional[str] = None
    default_model: Optional[str] = None
    temperature: Optional[float] = None
    enable_rag: Optional[bool] = None
    enable_memory: Optional[bool] = None
    enable_tools: Optional[bool] = None
    enable_agents: Optional[bool] = None
    max_context_tokens: Optional[int] = None
    theme: Optional[str] = None  # dark, light, system

class SystemHealthResponse(BaseModel):
    status: str
    backend: str
    database: str
    vector_store: str
    llm_provider: str
    available_providers: List[str]
    active_model: str
    storage: Dict[str, Any]
