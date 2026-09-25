from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.services.memory_service import MemoryService
from app.schemas.memory import MemorySchema, MemoryCreate

router = APIRouter(prefix="/memory", tags=["Memory"])

@router.get("", response_model=List[MemorySchema])
async def list_memories(db: AsyncSession = Depends(get_db)):
    """List all stored long-term memories."""
    service = MemoryService(db)
    return await service.list_memories()

@router.post("", response_model=MemorySchema, status_code=status.HTTP_201_CREATED)
async def create_memory(data: MemoryCreate, db: AsyncSession = Depends(get_db)):
    """Add a new memory record."""
    service = MemoryService(db)
    return await service.create_memory(data)

@router.delete("/{memory_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_memory(memory_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a specific memory by ID."""
    service = MemoryService(db)
    await service.delete_memory(memory_id)

@router.delete("", status_code=status.HTTP_200_OK)
async def clear_all_memories(db: AsyncSession = Depends(get_db)):
    """Clear all long-term memories."""
    service = MemoryService(db)
    count = await service.clear_all()
    return {"message": f"Successfully cleared {count} memories."}
