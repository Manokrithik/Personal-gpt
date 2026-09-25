from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.services.settings_service import SettingsService
from app.schemas.settings import SystemHealthResponse

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=SystemHealthResponse)
async def get_system_health(db: AsyncSession = Depends(get_db)):
    """Comprehensive health check across backend, database, vector storage, and active LLM."""
    service = SettingsService(db)
    return await service.check_health()
