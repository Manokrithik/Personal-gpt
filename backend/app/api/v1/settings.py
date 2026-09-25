from typing import Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.services.settings_service import SettingsService
from app.schemas.settings import SettingsUpdate

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("")
async def get_settings(db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    """Retrieve current application configuration and AI preferences."""
    service = SettingsService(db)
    return await service.get_settings()

@router.patch("")
async def update_settings(data: SettingsUpdate, db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    """Update application settings and parameters."""
    service = SettingsService(db)
    return await service.update_settings(data)
