from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.services.model_service import ModelService
from app.schemas.models import ModelListResponse, ModelSelectRequest, ModelInfo

router = APIRouter(prefix="/models", tags=["Models"])

@router.get("", response_model=ModelListResponse)
async def list_models(db: AsyncSession = Depends(get_db)):
    """List all available models across local Ollama and configured cloud providers."""
    service = ModelService(db)
    return await service.list_models()

@router.post("/select", response_model=ModelInfo)
async def select_model(request: ModelSelectRequest, db: AsyncSession = Depends(get_db)):
    """Set the active default model and provider."""
    service = ModelService(db)
    return await service.select_model(request.model, request.provider)
